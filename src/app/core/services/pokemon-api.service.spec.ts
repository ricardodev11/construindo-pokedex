import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PokemonApiService } from './pokemon-api.service';
import { PokemonListResponse } from '../../models/pokemon-api.models';

describe('PokemonApiService', () => {
  let service: PokemonApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PokemonApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('getPokemonList monta GET com limit e offset', () => {
    const expectedUrl = 'https://pokeapi.co/api/v2/pokemon?limit=12&offset=36';

    service.getPokemonList(12, 36).subscribe((response: PokemonListResponse) => {
      expect(response.count).toBe(2);
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush({
      count: 2,
      next: null,
      previous: null,
      results: [],
    } as PokemonListResponse);
  });

  it('getPokemonByIdOrName monta GET com o nome ou id', () => {
    const expectedUrl = 'https://pokeapi.co/api/v2/pokemon/pikachu';

    service.getPokemonByIdOrName('pikachu').subscribe((detail) => {
      expect(detail.id).toBe(25);
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ id: 25, name: 'pikachu' } as never);
  });

  it('getPokemonSpecies monta GET do endpoint de espécie', () => {
    const expectedUrl = 'https://pokeapi.co/api/v2/pokemon-species/1';

    service.getPokemonSpecies(1).subscribe((species) => {
      expect(species.name).toBe('bulbasaur');
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ name: 'bulbasaur' } as never);
  });

  it('getTypeDamageRelations monta GET do tipo com relações de dano', () => {
    const expectedUrl = 'https://pokeapi.co/api/v2/type/grass';

    service.getTypeDamageRelations('grass').subscribe((detail) => {
      expect(detail.damage_relations.double_damage_from).toHaveLength(1);
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush({
      damage_relations: {
        double_damage_from: [{ name: 'fire', url: 'x' }],
        half_damage_from: [],
        no_damage_from: [],
      },
      pokemon: [],
    } as never);
  });

  it('getEvolutionChain monta GET da cadeia de evolução', () => {
    const expectedUrl = 'https://pokeapi.co/api/v2/evolution-chain/3';

    service.getEvolutionChain(3).subscribe((chain) => {
      expect(chain.chain.species.name).toBe('venusaur');
    });

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 3,
      chain: {
        is_baby: false,
        species: { name: 'venusaur', url: 'u' },
        evolves_to: [],
      },
    } as never);
  });
});