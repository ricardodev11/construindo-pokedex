import { Routes } from '@angular/router';
import { Pokedex } from './pages/pokedex/pokedex';

export const routes: Routes = [
  { path: '', component: Pokedex },
  {
    path: 'pokemon/:id',
    loadComponent: () =>
      import('./pages/pokemon-detail/pokemon-detail').then(
        (m) => m.PokemonDetail,
      ),
  },
];