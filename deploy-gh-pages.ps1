param(
  [Parameter(Mandatory = $true)]
  [string]$RepoSlug,
  [Parameter(Mandatory = $false)]
  [string]$Remote = 'origin'
)

$ErrorActionPreference = 'Stop'

$repo = git rev-parse --show-toplevel
if (-not $repo) {
  throw 'Nao esta dentro de um repositorio git.'
}

Push-Location $repo
try {
  git checkout main

  Write-Host '==> Build do Angular com base-href para GitHub Pages'
  npm ci | Out-Null
  ng build "--base-href=/$RepoSlug/"

  $browser = 'dist/pokedex-interativa/browser'
  if (-not (Test-Path $browser)) {
    throw "Build nao gerou a pasta esperada em: $browser"
  }

  $tempStatic = Join-Path $env:TEMP 'pokedex-gh-static'
  Remove-Item -Recurse -Force $tempStatic -ErrorAction SilentlyContinue
  New-Item -ItemType Directory -Force $tempStatic | Out-Null
  Copy-Item -Recurse -Force "$browser/*" $tempStatic

  Write-Host '==> Criando branch gh-pages apenas com os arquivos estaticos na raiz'
  git branch -D gh-pages 2>$null | Out-Null
  git checkout --orphan gh-pages
  Get-ChildItem -Force | Where-Object { $_.Name -ne '.git' } | Remove-Item -Recurse -Force
  Copy-Item -Recurse -Force "$tempStatic/*" .
  Remove-Item -Recurse -Force $tempStatic, 'dist' -ErrorAction SilentlyContinue

  @'
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Pokédex</title>
<script>
  if (location.pathname !== '/TROCA_SLUG/' &&
      location.pathname !== '/TROCA_SLUG/index.html') {
    window.location.replace('/TROCA_SLUG/');
  }
</script>
</head>
<body>Redirecionando para a Pokédex...</body>
</html>
'@ -replace 'TROCA_SLUG', $RepoSlug | Set-Content -Path '404.html' -Encoding utf8

  git add -A
  git commit -m "deploy: GitHub Pages build de $RepoSlug"

  Write-Host "==> Enviando para $Remote (gh-pages)"
  git push -f $Remote gh-pages

  Write-Host "Feito. Site: https://<usuario>.github.io/$RepoSlug/"
}
finally {
  git checkout main 2>$null | Out-Null
  Pop-Location
}