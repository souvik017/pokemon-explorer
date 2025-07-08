'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PokemonTypes } from '../types/pokemon';

interface PokemonCardProps {
  pokemon: {
    id?: number;
    name: string;
    image?: string | null;
    types?: string[];
    url?: string; // For list view (e.g. /pokemon/25/)
  };
}

export default function PokemonCard({ pokemon }: PokemonCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const pokemonId =
    pokemon.url?.split('/')[6] || pokemon.id?.toString() || '000';

  // Get primary type for accent color
  const primaryType = pokemon.types?.[0] || 'normal';
  
  // Subtle type colors - more muted and professional
  const typeColors: Record<string, string> = {
    normal: 'bg-slate-500',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-500',
    grass: 'bg-green-500',
    ice: 'bg-cyan-500',
    fighting: 'bg-orange-600',
    poison: 'bg-purple-500',
    ground: 'bg-amber-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-yellow-700',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-700',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-400',
  };

  const accentColor = typeColors[primaryType] || typeColors.normal;

  const handleClick = () => {
    setIsLoading(true);
  };

  return (
    <Link href={`/pokemon/${pokemonId}`} onClick={handleClick}>
      <div className="group relative bg-white/5 backdrop-blur-md rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 transform hover:scale-[1.02] cursor-pointer overflow-hidden shadow-md hover:shadow-lg">
        
        {/* Subtle accent line */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 ${accentColor} opacity-60`} />
        
        <div className="relative p-5">
          <div className="flex flex-col items-center">
            {/* Pokemon ID Badge */}
            <div className="absolute top-3 right-3 bg-black/20 backdrop-blur-sm rounded-md px-2 py-1">
              <span className="text-xs font-medium text-white/70">
                #{pokemonId.toString().padStart(3, '0')}
              </span>
            </div>

            {/* Pokemon Image Container */}
            <div className="relative mb-4">
              <div className="w-28 h-28 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 flex items-center justify-center transition-all duration-300 group-hover:bg-white/10">
                {pokemon.image ? (
                  <img
                    src={pokemon.image}
                    alt={pokemon.name}
                    className="w-24 h-24 object-contain drop-shadow-sm transition-all duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center">
                    <div className="text-white/40 text-2xl">⚪</div>
                  </div>
                )}
                
                {/* Loading overlay */}
                {isLoading && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Pokemon Name */}
            <h3 className="text-base font-semibold text-white capitalize mb-3 transition-colors duration-300 text-center">
              {pokemon.name}
            </h3>

            {/* Type Badges */}
            {pokemon.types && (
              <div className="flex gap-1.5 flex-wrap justify-center">
                {pokemon.types.map((type) => (
                  <div
                    key={type}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium text-white ${
                      typeColors[type] || typeColors.normal
                    } shadow-sm opacity-80 hover:opacity-100 transition-opacity duration-200`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </div>
                ))}
              </div>
            )}

            {/* Subtle hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          </div>
        </div>

        {/* Minimal hover effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>
      </div>
    </Link>
  );
}