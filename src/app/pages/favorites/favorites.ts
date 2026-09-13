import { Component, inject } from '@angular/core';
import { PokemonCardComponent } from '../../components/pokemon-card/pokemon-card';
import { FavoritesService } from '../../core/services/favorites.service';
import { PokemonCard } from '../../models/pokemon.models';

@Component({
  imports: [PokemonCardComponent],
  selector: 'app-favorites',
  styleUrl: './favorites.scss',
  templateUrl: './favorites.html',
})
export class Favorites {
  protected readonly favorites = inject(FavoritesService);

  constructor() {
    document.title = 'Pokédex · Favoritos';
  }

  toggleFavorite(card: PokemonCard): void {
    this.favorites.toggle(card);
  }
}