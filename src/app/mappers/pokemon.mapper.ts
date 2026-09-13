import {
  NamedApiResource,
  PokemonChain,
  PokemonDetail,
  PokemonEvolution,
  PokemonSpecies,
  TypeDamageRelations,
} from '../models/pokemon-api.models';
import {
  EvolutionStep,
  PokemonBreeding,
  PokemonCard,
  PokemonDetailModel,
  TypeDefenseEntry,
} from '../models/pokemon.models';

export const artworkBaseUrl =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/';

function extractIdFromSpeciesUrl(url: string): number {
  const match = url.match(/\/(\d+)\/?$/);
  if (!match) {
    throw new Error(`Não foi possível extrair o ID da URL: ${url}`);
  }
  return Number(match[1]);
}

export function extractIdFromUrl(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\/?$/);
  if (!match) {
    throw new Error(`Não foi possível extrair o ID da URL: ${url}`);
  }
  return Number(match[1]);
}

function formatId(id: number): string {
  return String(id).padStart(4, '0');
}

export function toPokemonCard(resource: NamedApiResource): PokemonCard {
  const id = extractIdFromUrl(resource.url);
  return {
    id,
    name: resource.name,
    imageUrl: `${artworkBaseUrl}${id}.png`,
    formattedId: formatId(id),
  };
}

export function toPokemonCardFromDetail(detail: PokemonDetail): PokemonCard {
  return {
    id: detail.id,
    name: detail.name,
    imageUrl: detail.sprites.other['official-artwork'].front_default ?? '',
    formattedId: formatId(detail.id),
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

export function toPokemonBreeding(species: PokemonSpecies): PokemonBreeding {
  const englishGenus =
    species.genera.find((genus) => genus.language.name === 'en')?.genus ??
    species.name;

  const englishFlavor =
    species.flavor_text_entries?.find((entry) => entry.language.name === 'en')
      ?.flavor_text ?? null;

  return {
    speciesLabel: englishGenus,
    flavorText: englishFlavor?.replace(/[\n\f]/g, ' ') ?? null,
    eggGroups: species.egg_groups.map((group) => group.name),
    hatchSteps: species.hatch_counter * 255,
    growthRate: species.growth_rate.name,
    habitat: species.habitat?.name ?? null,
  };
}

export function toTypeDefense(
  relations: TypeDamageRelations[],
): TypeDefenseEntry[] {
  const multipliers = new Map<string, number>();

  for (const type of relations) {
    for (const resource of type.double_damage_from) {
      multipliers.set(resource.name, (multipliers.get(resource.name) ?? 1) * 2);
    }
    for (const resource of type.half_damage_from) {
      multipliers.set(resource.name, (multipliers.get(resource.name) ?? 1) * 0.5);
    }
    for (const resource of type.no_damage_from) {
      multipliers.set(resource.name, (multipliers.get(resource.name) ?? 1) * 0);
    }
  }

  return [...multipliers.entries()]
    .map(([name, multiplier]) => ({ name, multiplier }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function toEvolutionPath(evolution: PokemonEvolution): EvolutionStep[] {
  const steps: EvolutionStep[] = [];
  let current: PokemonChain | null | undefined = evolution.chain;

  while (current) {
    const id = extractIdFromSpeciesUrl(current.species.url);
    steps.push({
      id,
      name: current.species.name,
      imageUrl: `${artworkBaseUrl}${id}.png`,
    });
    current = current.evolves_to?.[0];
  }

  return steps;
}