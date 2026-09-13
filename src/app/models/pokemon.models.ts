export interface PokemonCard {
  id: number;
  name: string;
  imageUrl: string;
  formattedId: string;
}

export interface PokemonStat {
  name: string;
  value: number;
}

export interface PokemonDetailModel {
  id: number;
  name: string;
  imageUrl: string;
  types: string[];
  heightMeters: number;
  weightKg: number;
  abilities: string[];
  stats: PokemonStat[];
  formattedId: string;
}

export interface PokemonBreeding {
  speciesLabel: string;
  flavorText: string | null;
  eggGroups: string[];
  hatchSteps: number;
  growthRate: string;
  habitat: string | null;
}

export interface TypeDefenseEntry {
  name: string;
  multiplier: number;
}

export interface EvolutionStep {
  id: number;
  name: string;
  imageUrl: string;
}