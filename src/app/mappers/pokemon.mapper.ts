import { NamedApiResource, PokemonDetail } from '../models/pokemon-api.models';
import { PokemonCard, PokemonDetailModel } from '../models/pokemon.models';

const spriteBaseUrl =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';

export function extractIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  if (!match) {
    throw new Error(`Não foi possível extrair o ID da URL: ${url}`);
  }
  return Number(match[1]);
}

export function toPokemonCard(resource: NamedApiResource): PokemonCard {
  const id = extractIdFromUrl(resource.url);
  return {
    id,
    name: resource.name,
    imageUrl: `${spriteBaseUrl}${id}.png`,
  };
}

export function toPokemonCardFromDetail(detail: PokemonDetail): PokemonCard {
  return {
    id: detail.id,
    name: detail.name,
    imageUrl: detail.sprites.front_default ?? '',
  };
}

export function toPokemonDetailModel(
  detail: PokemonDetail,
): PokemonDetailModel {
  return {
    id: detail.id,
    name: detail.name,
    imageUrl: detail.sprites.other['official-artwork'].front_default ?? '',
    types: detail.types.map((t) => t.type.name),
    heightMeters: detail.height / 10,
    weightKg: detail.weight / 10,
    abilities: detail.abilities.map((a) => a.ability.name),
    stats: detail.stats.map((s) => ({
      name: s.stat.name,
      value: s.base_stat,
    })),
    formattedId: String(detail.id).padStart(4, '0'),
  };
}