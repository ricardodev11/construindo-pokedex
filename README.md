# Pokédex Interativa — Angular 22 + PokéAPI

Pokédex mobile-first usando a [PokéAPI](https://pokeapi.co) pública:
Home (grid, busca com debounce, chips de tipo combináveis), Detalhe com
hero por tipo primário e tabs (Sobre / Status / Evolução), e Favoritos
persistidos em `localStorage`.

## Rodar local

```bash
npm install
ng serve
# http://localhost:4200
```

## Testes

```bash
ng test --watch=false
```

36 testes: mappers, serviço, Home (filtros/dedupe/busca), Detalhe (tabs/404),
Favoritos (localStorage), card e casca do app.

## Deploy no GitHub Pages

Pré-requisitos: repositorio no GitHub apontado como remote `origin` e
navegador de autenticação/Git Credential Manager habilitado para push.

```powershell
.\deploy-gh-pages.ps1 -RepoSlug "construindo-pokedex"
```

O script builda com `--base-href=/construindo-pokedex/` e faz push forçado
da pasta `dist` na branch `gh-pages`. Em seguida, nas configurações do
repositorio no GitHub: Settings > Pages > Source: **Deploy from a branch**,
branch **gh-pages**.

## Estrutura

- `src/app/pages/home` — listagem, busca (debounce 300ms p/ número), chips de tipo
- `src/app/pages/pokemon-detail` — hero + tabs + cadeia de evolução
- `src/app/pages/favorites` — favoritos persistidos
- `src/app/components/pokemon-card` — card reutilizável com coração
- `src/app/components/bottom-nav` — navegação inferior fixa
- `src/app/core/services` — `PokemonApiService` (API) e `FavoritesService` (localStorage)
- `src/app/mappers` — DTO → View Model (cards, detalhe, reprodução, evolução)