import {
  extractIdFromUrl,
  toEvolutionPath,
  toPokemonBreeding,
  toPokemonCard,
  toPokemonCardFromDetail,
  toPokemonDetailModel,
  toTypeDefense,
} from './pokemon.mapper';
import {
  NamedApiResource,
  PokemonDetail,
  PokemonEvolution,
} from '../models/pokemon-api.models';

const listItem: NamedApiResource = {
  name: 'bulbasaur',
  url: 'https://pokeapi.co/api/v2/pokemon/1/',
};

describe('mapper de Pokémon', () => {
  it('extrai o ID da URL da lista', () => {
    expect(extractIdFromUrl(listItem.url)).toBe(1);
  });

  it('toPokemonCard deriva a artwork e o número formatado pelo ID', () => {
    expect(toPokemonCard(listItem)).toEqual({
      id: 1,
      name: 'bulbasaur',
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      formattedId: '0001',
    });
  });

  it('toPokemonCardFromDetail usa a artwork do detalhe', () => {
    const detail = {
      id: 25,
      name: 'pikachu',
      sprites: {
        front_default: 'http://img.example/front.png',
        other: {
          'official-artwork': { front_default: 'http://img.example/art.png' },
        },
      },
      types: [],
    } as unknown as PokemonDetail;

    expect(toPokemonCardFromDetail(detail)).toEqual({
      id: 25,
      name: 'pikachu',
      imageUrl: 'http://img.example/art.png',
      formattedId: '0025',
    });
  });

  it('Dado height=4 e weight=60, UI recebe 0.4m e 6kg', () => {
    const detail = {
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
      types: [
        { slot: 1, type: { name: 'electric' } },
      ],
      abilities: [
        { is_hidden: false, slot: 1, ability: { name: 'static' } },
      ],
      stats: [
        { base_stat: 35, effort: 0, stat: { name: 'hp' } },
      ],
    };

    const model = toPokemonDetailModel(detail);

    expect(model.heightMeters).toBe(0.4);
    expect(model.weightKg).toBe(6);
    expect(model.types).toEqual(['electric']);
    expect(model.abilities).toEqual(['static']);
    expect(model.stats).toEqual([{ name: 'hp', value: 35 }]);
    expect(model.imageUrl).toBe('http://img.example/art.png');
    expect(model.formattedId).toBe('0025');
  });

  it('toPokemonBreeding mapeia grupos, passos, habitat e gênero em inglês', () => {
    const species = {
      name: 'bulbasaur',
      egg_groups: [
        { name: 'monster', url: 'u1' },
        { name: 'grass', url: 'u2' },
      ],
      hatch_counter: 20,
      growth_rate: { name: 'medium-slow', url: 'u3' },
      habitat: { name: 'grassland', url: 'u4' },
      genera: [
        { genus: 'Semente Pokémon', language: { name: 'pt-BR', url: 'u5' } },
        { genus: 'Seed Pokémon', language: { name: 'en', url: 'u5' } },
      ],
      flavor_text_entries: [
        {
          flavor_text: 'A strange seed was\nplanted on its back.',
          language: { name: 'en', url: 'u5' },
        },
      ],
    };

    const model = toPokemonBreeding(species);

    expect(model.speciesLabel).toBe('Seed Pokémon');
    expect(model.flavorText).toBe('A strange seed was planted on its back.');
    expect(model.eggGroups).toEqual(['monster', 'grass']);
    expect(model.hatchSteps).toBe(5100);
    expect(model.growthRate).toBe('medium-slow');
    expect(model.habitat).toBe('grassland');
  });

  it('toPokemonBreeding usa o nome como fallback quando não há gênero em inglês', () => {
    const species = {
      name: 'mew',
      egg_groups: [],
      hatch_counter: 0,
      growth_rate: { name: 'slow', url: 'u3' },
      habitat: null,
      genera: [{ genus: 'New Species Pokémon', language: { name: 'ja', url: 'u5' } }],
      flavor_text_entries: [],
    };

    const model = toPokemonBreeding(species);

    expect(model.speciesLabel).toBe('mew');
    expect(model.eggGroups).toEqual([]);
    expect(model.habitat).toBeNull();
  });

  it('toTypeDefense combina multiplicadores de vários tipos defensores', () => {
    const relations = toTypeDefense([
      {
        double_damage_from: [
          { name: 'fire', url: 'u' },
          { name: 'flying', url: 'u' },
        ],
        half_damage_from: [
          { name: 'grass', url: 'u' },
          { name: 'water', url: 'u' },
        ],
        no_damage_from: [],
      },
      {
        double_damage_from: [{ name: 'fire', url: 'u' }],
        half_damage_from: [{ name: 'fighting', url: 'u' }],
        no_damage_from: [{ name: 'ground', url: 'u' }],
      },
    ]);

    expect(relations).toEqual([
      { name: 'fighting', multiplier: 0.5 },
      { name: 'fire', multiplier: 4 },
      { name: 'flying', multiplier: 2 },
      { name: 'grass', multiplier: 0.5 },
      { name: 'ground', multiplier: 0 },
      { name: 'water', multiplier: 0.5 },
    ]);
  });

  it('toTypeDefense ignora relações vazias', () => {
    expect(toTypeDefense([])).toEqual([]);
  });

  it('toEvolutionPath extrai a sequência de evolução na primeira linha', () => {
    const evolution = {
      id: 1,
      chain: {
        is_baby: true,
        species: { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon-species/1/' },
        evolves_to: [
          {
            is_baby: false,
            species: { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon-species/2/' },
            evolves_to: [
              {
                is_baby: false,
                species: { name: 'venusaur', url: 'https://pokeapi.co/api/v2/pokemon-species/3/' },
                evolves_to: [],
              },
            ],
          },
        ],
      },
    } satisfies PokemonEvolution;

    const steps = toEvolutionPath(evolution);

    expect(steps).toEqual([
      {
        id: 1,
        name: 'bulbasaur',
        imageUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      },
      {
        id: 2,
        name: 'ivysaur',
        imageUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png',
      },
      {
        id: 3,
        name: 'venusaur',
        imageUrl:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
      },
    ]);
  });
});