export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
    };
  }[];
  abilities: {
    is_hidden: boolean;
    slot: number;
    ability: {
      name: string;
    };
  }[];
  stats: {
    base_stat: number;
    effort: number;
    stat: {
      name: string;
    };
  }[];
}

export interface PokemonTypeDetail {
  pokemon: {
    pokemon: NamedApiResource;
  }[];
}

export interface PokemonSpecies {
  name: string;
  egg_groups: NamedApiResource[];
  hatch_counter: number;
  growth_rate: NamedApiResource;
  habitat: NamedApiResource | null;
  genera: {
    genus: string;
    language: NamedApiResource;
  }[];
  flavor_text_entries: {
    flavor_text: string;
    language: NamedApiResource;
  }[];
}

export interface TypeDamageRelations {
  double_damage_from: NamedApiResource[];
  half_damage_from: NamedApiResource[];
  no_damage_from: NamedApiResource[];
}

export interface PokemonTypeDetailFull {
  damage_relations: TypeDamageRelations;
  pokemon: {
    pokemon: NamedApiResource;
  }[];
}

export interface PokemonEvolution {
  id: number;
  chain: PokemonChain;
}

export interface PokemonChain {
  is_baby: boolean;
  species: NamedApiResource;
  evolves_to: PokemonChain[];
}