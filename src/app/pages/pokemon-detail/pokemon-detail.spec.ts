import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PokemonDetail } from './pokemon-detail';
import { PokemonDetail as PokemonDetailDto } from '../../models/pokemon-api.models';

const detailFixture = {
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
  abilities: [{ is_hidden: false, slot: 1, ability: { name: 'static' } }],
  stats: [{ base_stat: 35, effort: 0, stat: { name: 'hp' } }],
} as PokemonDetailDto;

const speciesFixture = {
  name: 'pikachu',
  egg_groups: [],
  hatch_counter: 0,
  growth_rate: { name: 'medium-fast', url: 'u' },
  habitat: null,
  genera: [],
  flavor_text_entries: [],
};

const chainFixture = {
  id: 25,
  chain: {
    is_baby: false,
    species: {
      name: 'pikachu',
      url: 'https://pokeapi.co/api/v2/pokemon-species/25/',
    },
    evolves_to: [],
  },
};

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

  it('carrega detalhe, espécie e evolução a partir do id', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/25');
    expect(req.request.method).toBe('GET');
    req.flush(detailFixture);

    const speciesReq = httpMock.expectOne(
      'https://pokeapi.co/api/v2/pokemon-species/25',
    );
    speciesReq.flush(speciesFixture);

    const chainReq = httpMock.expectOne(
      'https://pokeapi.co/api/v2/evolution-chain/25',
    );
    chainReq.flush(chainFixture);

    expect(component.pokemon()).not.toBeNull();
    expect(component.pokemon()?.name).toBe('pikachu');
    expect(component.pokemon()?.heightMeters).toBe(0.4);
    expect(component.breeding()).not.toBeNull();
    expect(component.evolution()).toHaveLength(1);
  });

  it('alterna entre as abas de informação', () => {
    fixture.detectChanges();

    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/25').flush(detailFixture);
    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon-species/25').flush(speciesFixture);
    httpMock.expectOne('https://pokeapi.co/api/v2/evolution-chain/25').flush(chainFixture);

    component.activeTab.set('status');
    fixture.detectChanges();

    const statusPanel: HTMLElement | null =
      fixture.nativeElement.querySelector('.stat-list');

    expect(statusPanel).not.toBeNull();
    expect(statusPanel?.textContent).toContain('hp');
    expect(statusPanel?.textContent).toContain('35');
  });

  it('marca como não encontrado quando a API responde 404', () => {
    fixture.detectChanges();

    httpMock
      .expectOne('https://pokeapi.co/api/v2/pokemon-species/25')
      .flush(speciesFixture);
    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/25').flush(
      { message: 'Not Found' },
      { status: 404, statusText: 'Not Found' },
    );

    expect(component.isNotFound()).toBe(true);
  });

  it('botão de voltar usa o histórico do navegador', () => {
    fixture.detectChanges();

    httpMock.expectOne('https://pokeapi.co/api/v2/pokemon/25').flush(detailFixture);
    httpMock
      .expectOne('https://pokeapi.co/api/v2/pokemon-species/25')
      .flush(speciesFixture);
    httpMock.expectOne('https://pokeapi.co/api/v2/evolution-chain/25').flush(chainFixture);
    fixture.detectChanges();

    const location = TestBed.inject(Location);
    const backSpy = vi.spyOn(location, 'back');

    const backButton: HTMLButtonElement | null =
      fixture.nativeElement.querySelector('.hero__back');
    expect(backButton).not.toBeNull();
    backButton?.click();

    expect(backSpy).toHaveBeenCalled();
  });
});