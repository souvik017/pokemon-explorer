'use client';

import PokemonCard from './PokemonCard';
import { DisplayPokemon } from '../types/pokemon';

interface PokemonListProps {
  pokemonList: DisplayPokemon[];
  loading: boolean;
  lastElementRef?: (node: HTMLDivElement) => void;
}

export default function PokemonList({
  pokemonList,
  loading,
  lastElementRef,
}: PokemonListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!pokemonList || pokemonList.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">No Pokémon found</h3>
        <p className="text-gray-600 text-sm sm:text-base">Try adjusting your search terms</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 md:px-8">
      {/* Header */}
    
      {/* Responsive Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {pokemonList.map((pokemon, index) => (
          <div
            key={pokemon.id}
            ref={index === pokemonList.length - 1 ? lastElementRef : null}
            className="transform transition-transform duration-200 hover:scale-[1.03]"
          >
            <PokemonCard pokemon={pokemon} />
          </div>
        ))}
      </div>
    </div>
  );
}
