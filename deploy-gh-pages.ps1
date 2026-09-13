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
  npm ci
  ng build "--base-href=/$RepoSlug/"

  $dist = 'dist/pokedex-interativa'
  if (-not (Test-Path $dist)) {
    throw "Build nao gerou a pasta esperada: $dist"
  }

  Write-Host '==> Criando branch gh-pages com os arquivos estaticos'
  git checkout --orphan gh-pages
  git rm -rf --cached . | Out-Null

  Copy-Item -Recurse -Force "$dist/*" .

  Remove-Item -Recurse -Force $dist

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