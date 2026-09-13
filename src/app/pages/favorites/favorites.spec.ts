import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Favorites } from './favorites';
import { FavoritesService } from '../../core/services/favorites.service';
import { PokemonCard } from '../../models/pokemon.models';

describe('Favorites', () => {
  let component: Favorites;
  let fixture: ComponentFixture<Favorites>;
  let service: FavoritesService;

  const card: PokemonCard = {
    id: 25,
    name: 'pikachu',
    imageUrl: 'p.png',
    formattedId: '0025',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Favorites],
      providers: [provideRouter([])],
    }).compileComponents();

    service = TestBed.inject(FavoritesService);
    service.favorites.set([card]);

    fixture = TestBed.createComponent(Favorites);
    component = fixture.componentInstance;
  });

  it('lista os Pokémon favoritados', () => {
    fixture.detectChanges();

    expect(service.favorites()).toHaveLength(1);

    const link: HTMLAnchorElement | null =
      fixture.nativeElement.querySelector('.pokemon-card');

    expect(link?.getAttribute('href')).toBe('/pokemon/25');
    expect(link?.textContent).toContain('pikachu');
  });

  it('mostra o estado vazio quando não há favoritos', () => {
    service.favorites.set([]);
    fixture.detectChanges();

    const emptyBox: HTMLElement | null =
      fixture.nativeElement.querySelector('.favorites__empty');

    expect(emptyBox).not.toBeNull();
    expect(emptyBox?.textContent).toContain('Nenhum Pokémon favoritado');
  });

  it('desfavoritar remove o Pokémon da lista', () => {
    fixture.detectChanges();
    component.toggleFavorite(card);

    expect(service.favorites()).toEqual([]);
  });
});