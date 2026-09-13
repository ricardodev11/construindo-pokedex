import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Pokedex } from './pokedex';

describe('Pokedex', () => {
  let component: Pokedex;
  let fixture: ComponentFixture<Pokedex>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pokedex],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Pokedex);
    component = fixture.componentInstance;

    Object.defineProperty(window, 'scrollTo', { value: () => {}, writable: true });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create e carregar a primeira página', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(
      'https://pokeapi.co/api/v2/pokemon?limit=55&offset=0',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      count: 1351,
      next: null,
      previous: null,
      results: [
        { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
      ],
    });

    httpMock.expectOne('https://pokeapi.co/api/v2/type').flush({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    expect(component).toBeTruthy();
    expect(component.pokemons()).toHaveLength(1);
    expect(component.pokemons()[0].name).toBe('bulbasaur');
  });

  it('carrega a lista de tipos para o filtro', () => {
    fixture.detectChanges();

    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=55&offset=0')
      .flush({
        count: 1351,
        next: null,
        previous: null,
        results: [],
      });

    const typeReq = httpMock.expectOne('https://pokeapi.co/api/v2/type');
    expect(typeReq.request.method).toBe('GET');
    typeReq.flush({
      count: 1,
      next: null,
      previous: null,
      results: [{ name: 'fire', url: 'https://pokeapi.co/api/v2/type/10/' }],
    });

    expect(component.types()).toHaveLength(1);
    expect(component.types()[0].name).toBe('fire');
  });

  it('próxima página carrega fora do modo filtro sem dupla paginação', () => {
    fixture.detectChanges();
    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon?limit=55&offset=0')
      .flush({
        count: 1351,
        next: null,
        previous: null,
        results: [{ name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' }],
      });
    httpMock.expectOne('https://pokeapi.co/api/v2/type').flush({
      count: 0,
      next: null,
      previous: null,
      results: [],
    });

    component.nextPage();

    const nextReq = httpMock.expectOne(
      'https://pokeapi.co/api/v2/pokemon?limit=55&offset=55',
    );
    expect(nextReq.request.method).toBe('GET');
    nextReq.flush({
      count: 1351,
      next: null,
      previous: null,
      results: [{ name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' }],
    });

    expect(component.pageNumber()).toBe(2);
    expect(component.shownCards()).toHaveLength(1);
    expect(component.shownCards()[0].name).toBe('charmander');
  });
});