import { TestBed } from '@angular/core/testing';
import { FavoritesService } from './favorites.service';
import { PokemonCard } from '../../models/pokemon.models';

const card: PokemonCard = {
  id: 1,
  name: 'bulbasaur',
  imageUrl: 'x.png',
  formattedId: '0001',
};

describe('FavoritesService', () => {
  let service: FavoritesService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(FavoritesService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('adiciona um Pokémon aos favoritos', () => {
    service.toggle(card);

    expect(service.favorites()).toEqual([card]);
    expect(service.isFavorite(1)).toBe(true);
  });

  it('remove um Pokémon já favoritado', () => {
    service.toggle(card);
    service.toggle(card);

    expect(service.favorites()).toEqual([]);
    expect(service.isFavorite(1)).toBe(false);
  });

  it('persiste os favoritos no localStorage', () => {
    service.toggle(card);

    const persisted = JSON.parse(
      localStorage.getItem('pokedex:favorites') ?? '[]',
    ) as PokemonCard[];

    expect(persisted).toContainEqual(card);
  });
});