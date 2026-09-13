import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PokemonDetail } from './pokemon-detail';
import { PokemonDetail as PokemonDetailDto } from '../../models/pokemon-api.models';

describe('PokemonDetail', () => {
  let component: PokemonDetail;
  let fixture: ComponentFixture<PokemonDetail>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PokemonDetail);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '25');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('carrega o detalhe do Pokémon a partir do id', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(
      'https://pokeapi.co/api/v2/pokemon/25',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      id: 25,
      name: 'pikachu',
      height: 4,
      weight: 60,
      sprites: {
        front_default: 'http://img.example/front.png',
        other: {
          'official-artwork': { front_default: 'http://img.example/art.png' },
        },
      },
      types: [{ slot: 1, type: { name: 'electric' } }],
      abilities: [
        { is_hidden: false, slot: 1, ability: { name: 'static' } },
      ],
      stats: [{ base_stat: 35, effort: 0, stat: { name: 'hp' } }],
    } as PokemonDetailDto);

    expect(component.pokemon()).not.toBeNull();
    expect(component.pokemon()?.name).toBe('pikachu');
    expect(component.pokemon()?.heightMeters).toBe(0.4);
  });

  it('marca como não encontrado quando a API responde 404', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne(
      'https://pokeapi.co/api/v2/pokemon/25',
    );
    req.flush(
      { message: 'Not Found' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(component.isNotFound()).toBe(true);
  });
});