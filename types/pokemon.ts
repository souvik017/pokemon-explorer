export const PokemonTypes: Record<string, string> = {
 normal: 'from-gray-400 to-gray-600',
    fire: 'from-red-500 to-orange-600',
    water: 'from-blue-500 to-cyan-600',
    electric: 'from-yellow-400 to-amber-500',
    grass: 'from-green-500 to-emerald-600',
    ice: 'from-cyan-400 to-blue-500',
    fighting: 'from-red-700 to-orange-700',
    poison: 'from-purple-500 to-pink-600',
    ground: 'from-yellow-600 to-amber-700',
    flying: 'from-indigo-400 to-sky-500',
    psychic: 'from-pink-500 to-purple-600',
    bug: 'from-green-600 to-lime-600',
    rock: 'from-yellow-700 to-amber-800',
    ghost: 'from-purple-700 to-indigo-800',
    dragon: 'from-indigo-600 to-purple-700',
    dark: 'from-gray-800 to-black',
    steel: 'from-gray-500 to-slate-600',
    fairy: 'from-pink-400 to-rose-500',
};

export interface RawPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other: {
      [key: string]: {
        front_default: string;
      };
    };
  };
  types: Array<{
    type: {
      name: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
  stats: Array<{
    stat: {
      name: string;
    };
    base_stat: number;
  }>;
  moves: Array<{
    move: {
      name: string;
    };
  }>;
}

export interface FormattedPokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  height: number;
  weight: number;
  abilities: string[];
  stats: {
    name: string;
    value: number;
  }[];
  moves: string[];
}

export type DisplayPokemon = Omit<FormattedPokemon, 'id' | 'image' | 'types'> & {
  id: number;
  image: string | null;
  types: string[];
};

export const formatPokemonData = (pokemon: RawPokemon): FormattedPokemon => ({
  id: pokemon.id,
  name: pokemon.name,
  image:
    pokemon.sprites.other['official-artwork']?.front_default ||
    pokemon.sprites.front_default,
  types: pokemon.types.map((type) => type.type.name),
  height: pokemon.height,
  weight: pokemon.weight,
  abilities: pokemon.abilities.map((a) => a.ability.name),
  stats: pokemon.stats.map((stat) => ({
    name: stat.stat.name,
    value: stat.base_stat,
  })),
  moves: pokemon.moves.slice(0, 10).map((move) => move.move.name),
});
