import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Compare } from './compare';

const detail = (id: number, name: string) => ({
  id,
  name,
  sprites: {
    front_default: `f${id}.png`,
    other: { 'official-artwork': { front_default: `art${id}.png` } },
  },
  height: 10,
  weight: 10,
  abilities: [],
  types: [{ slot: 1, type: { name: 'electric' } }],
  stats: [{ base_stat: 40, effort: 0, stat: { name: 'hp' } }],
});

describe('Compare', () => {
  let component: Compare;
  let fixture: ComponentFixture<Compare>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Compare],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Compare);
    component = fixture.componentInstance;
    fixture.detectChanges();
    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=2000&offset=0').flush({
      count: 4,
      next: null,
      previous: null,
      results: [
        { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
        { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      ],
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('carrega o catálogo de sugestões ao iniciar', () => {
    expect(component.suggestionsB).toBeDefined();
  });

  it('sugere nomes a partir do catálogo após 3 letras', () => {
    component.updateQuery('A', 'char');
    fixture.detectChanges();

    expect(component.suggestionsA()).toContain('charizard');
  });

  it('não sugere com menos de 3 letras', () => {
    component.updateQuery('B', 'ch');
    fixture.detectChanges();

    expect(component.suggestionsB()).toEqual([]);
  });

  it('busca um Pokémon, mostra no slot e monta a comparação', () => {
    component.updateQuery('A', 'pikachu');
    component.search('A');
    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/pikachu').flush(detail(25, 'pikachu'));

    expect(component.slotA().pokemon?.name).toBe('pikachu');
    expect(component.slotA().loading).toBe(false);

    component.updateQuery('B', 'charizard');
    component.search('B');
    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/charizard').flush(detail(6, 'charizard'));
    fixture.detectChanges();

    expect(component.slotB().pokemon?.name).toBe('charizard');
    expect(component.comparison()?.a.name).toBe('pikachu');
    expect(component.comparison()?.b.name).toBe('charizard');
  });

  it('marca como não encontrado quando a API responde 404', () => {
    component.updateQuery('A', 'mewtwo');
    component.search('A');
    httpMock
      .expectOne('https://pokeapi.co/api/v2/pokemon/mewtwo')
      .flush(null, { status: 404, statusText: 'Not Found' });

    expect(component.slotA().notFound).toBe(true);
    expect(component.slotA().error).toBe(false);
  });

  it('limpa um slot', () => {
    component.updateQuery('A', 'bulbasaur');
    component.search('A');
    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/bulbasaur').flush(detail(1, 'bulbasaur'));

    component.clear('A');

    expect(component.slotA().pokemon).toBeNull();
    expect(component.slotA().query).toBe('');
  });
});