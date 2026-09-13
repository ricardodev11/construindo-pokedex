import {
  extractIdFromUrl,
  toPokemonCard,
  toPokemonCardFromDetail,
  toPokemonDetailModel,
} from './pokemon.mapper';
import { NamedApiResource, PokemonDetail } from '../models/pokemon-api.models';

const listItem: NamedApiResource = {
  name: 'bulbasaur',
  url: 'https://pokeapi.co/api/v2/pokemon/1/',
};

describe('mapper de Pokémon', () => {
  it('extrai o ID da URL da lista', () => {
    expect(extractIdFromUrl(listItem.url)).toBe(1);
  });

  it('toPokemonCard deriva a sprite pelo ID', () => {
    expect(toPokemonCard(listItem)).toEqual({
      id: 1,
      name: 'bulbasaur',
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png',
    });
  });

  it('toPokemonCardFromDetail usa a sprite do detalhe', () => {
    const detail = {
      id: 25,
      name: 'pikachu',
      sprites: { front_default: 'http://img.example/front.png' },
      types: [],
    } as unknown as PokemonDetail;

    expect(toPokemonCardFromDetail(detail)).toEqual({
      id: 25,
      name: 'pikachu',
      imageUrl: 'http://img.example/front.png',
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
});