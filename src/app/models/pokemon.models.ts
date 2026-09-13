export interface PokemonCard {
  id: number;
  name: string;
  imageUrl: string;
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