import { Injectable, signal } from '@angular/core';
import { PokemonCard } from '../../models/pokemon.models';

const STORAGE_KEY = 'pokedex:favorites';

function loadFromStorage(): PokemonCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PokemonCard[]) : [];
  } catch {
    return [];
  }
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  readonly favorites = signal<PokemonCard[]>(loadFromStorage());

  isFavorite(id: number): boolean {
    return this.favorites().some((pokemon) => pokemon.id === id);
  }

  toggle(card: PokemonCard): void {
    const current = this.favorites();
    const updated = this.isFavorite(card.id)
      ? current.filter((pokemon) => pokemon.id !== card.id)
      : [...current, card];
    this.favorites.set(updated);
    this.persist(updated);
  }

  private persist(list: PokemonCard[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Storage indisponível (ex.: modo privado); favoritos só em memória.
    }
  }
}