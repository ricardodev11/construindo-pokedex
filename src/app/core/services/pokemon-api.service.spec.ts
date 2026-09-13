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
});