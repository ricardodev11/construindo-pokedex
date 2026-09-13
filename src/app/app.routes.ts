import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', component: Home, title: 'Pokédex' },
  {
    path: 'compare',
    loadComponent: () =>
      import('./pages/compare/compare').then((m) => m.Compare),
    title: 'Comparar',
  },
  {
    path: 'favorites',
    loadComponent: () =>
      import('./pages/favorites/favorites').then((m) => m.Favorites),
    title: 'Favoritos',
  },
  {
    path: 'pokemon/:id',
    loadComponent: () =>
      import('./pages/pokemon-detail/pokemon-detail').then(
        (m) => m.PokemonDetail,
      ),
  },
];