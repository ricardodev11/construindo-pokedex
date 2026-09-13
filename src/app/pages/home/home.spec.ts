import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Home } from './home';
import { FavoritesService } from '../../core/services/favorites.service';

const generateItems = (count: number, start = 1) =>
  Array.from({ length: count }, (_, index) => ({
    name: `pokemon-${start + index}`,
    url: `https://pokeapi.co/api/v2/pokemon/${start + index}/`,
  }));

describe('Home', () => {
  let component: Home;
  let fixture: ComponentFixture<Home>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Home);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  const flushInitial = () => {
    fixture.detectChanges();
    const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type');
    typeReq.flush({
      count: 20,
      next: null,
      previous: null,
      results: [
        { name: 'fire', url: 'u-fire' },
        { name: 'unknown', url: 'u-unknown' },
        { name: 'shadow', url: 'u-shadow' },
      ],
    });
    const listReq = httpMock.expectOne(
      'https://pokeapi.co/api/v2/pokemon?limit=20&offset=0',
    );
    listReq.flush({
      count: 2,
      next: null,
      previous: null,
      results: generateItems(2),
    });
  };

  it('carrega a primeira página e renderiza os cards', () => {
    flushInitial();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(false);
    expect(component.filteredCards().length).toBe(2);
    expect(component.allPokemons()[0].formattedId).toBe('0001');

    const links = fixture.nativeElement.querySelectorAll('.pokemon-card');
    expect(links.length).toBe(2);
  });

  it('exclui os tipos desconhecidos (unknown/shadow) dos chips', () => {
    flushInitial();
    fixture.detectChanges();

    expect(component.types().map((type) => type.name)).toEqual(['fire']);
  });

  it('filtra pela lista completa do tipo sem depender do que carregou', () => {
    flushInitial();
    fixture.detectChanges();

    component.toggleType('fire');
    httpMock.expectOne('https://pokeapi.co/api/v2/type/fire').flush({
      pokemon: [
        {
          pokemon: { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
        },
        {
          pokemon: { name: 'arceus', url: 'https://pokeapi.co/api/v2/pokemon/493/' },
        },
      ],
    });

    expect(component.selectedTypes()).toEqual(['fire']);
    expect(component.filteredCards().map((card) => card.id)).toEqual([4, 493]);

    component.toggleType('fire');
    fixture.detectChanges();

    expect(component.selectedTypes()).toEqual([]);
    expect(component.filteredCards().length).toBe(2);
  });

  it('aumenta a quantidade exibida com Carregar mais no modo filtro', () => {
    flushInitial();
    fixture.detectChanges();

    component.toggleType('fire');
    httpMock.expectOne('https://pokeapi.co/api/v2/type/fire').flush({
      pokemon: [
        { pokemon: { name: 'a', url: 'https://pokeapi.co/api/v2/pokemon/4/' } },
        { pokemon: { name: 'b', url: 'https://pokeapi.co/api/v2/pokemon/5/' } },
        { pokemon: { name: 'c', url: 'https://pokeapi.co/api/v2/pokemon/6/' } },
      ],
    });

    component.visibleCount.set(2);
    expect(component.filteredCards()).toHaveLength(2);
    expect(component.hasMore()).toBe(true);
    component.loadMore();
    expect(component.filteredCards()).toHaveLength(3);
    expect(component.hasMore()).toBe(false);
  });

  it('não duplica Pokémon ao carregar mais páginas', async () => {
    fixture.detectChanges();
    httpMock.expectOne('https://pokeapi.co/api/v2/type').flush({
      count: 20,
      next: null,
      previous: null,
      results: [],
    });
    httpMock
      .expectOne('https://pokeapi.co/api/v2/pokemon?limit=20&offset=0')
      .flush({
        count: 40,
        next: null,
        previous: null,
        results: generateItems(20),
      });
    fixture.detectChanges();

    component.loadMore();
    httpMock
      .expectOne('https://pokeapi.co/api/v2/pokemon?limit=20&offset=20')
      .flush({
        count: 40,
        next: null,
        previous: null,
        results: [...generateItems(5), ...generateItems(15, 21)],
      });
    await Promise.resolve();

    const ids = component.allPokemons().map((card) => card.id);
    expect(ids.length).toBe(35);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('busca por número consulta a API após o debounce e insere o card', async () => {
    vi.useFakeTimers();
    try {
      flushInitial();
      fixture.detectChanges();

      component.searchQuery.set('4');
      await vi.advanceTimersByTimeAsync(300);

      const searchReq = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/4');
      searchReq.flush({
        id: 4,
        name: 'charmander',
        sprites: {
          front_default: 'f.png',
          other: { 'official-artwork': { front_default: 'art.png' } },
        },
        types: [],
        abilities: [],
      });

      expect(component.allPokemons()[0].name).toBe('charmander');
      expect(component.filteredCards()[0].name).toBe('charmander');
    } finally {
      vi.useRealTimers();
    }
  });

  it('mostra estado vazio com busca que não encontra nada', () => {
    flushInitial();
    fixture.detectChanges();

    component.searchQuery.set('mewtwo');
    fixture.detectChanges();

    expect(component.filteredCards()).toHaveLength(0);

    const stateBox: HTMLElement | null =
      fixture.nativeElement.querySelector('.state-message');
    expect(stateBox?.textContent).toContain('Nenhum Pokémon encontrado');
  });

  it('favorita e desfavorita um Pokémon do card', () => {
    flushInitial();
    fixture.detectChanges();

    const favorites = TestBed.inject(FavoritesService);

    component.toggleFavorite(component.allPokemons()[0]);
    expect(favorites.isFavorite(1)).toBe(true);

    component.toggleFavorite(component.allPokemons()[0]);
    expect(favorites.isFavorite(1)).toBe(false);
  });
});