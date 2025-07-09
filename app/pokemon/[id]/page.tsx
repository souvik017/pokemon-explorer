'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPokemonDetails } from '../../../lib/pokemonApi';
import { formatPokemonData, FormattedPokemon, PokemonTypes } from '../../../types/pokemon';
import { NextPage } from 'next';

interface PokemonDetailPageProps {
  params: {
    id: string;
  };
}

const PokemonDetailPage: NextPage<PokemonDetailPageProps> = ({ params }) => {
  const [pokemon, setPokemon] = useState<FormattedPokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPokemonDetails();
  }, [params.id]);

  const loadPokemonDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPokemonDetails(params.id);
      setPokemon(formatPokemonData(data));
    } catch (err) {
      setError('Failed to load Pokémon details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gradient-to-r from-purple-500 to-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-2 left-2 w-16 h-16 border-4 border-gradient-to-r from-yellow-400 to-red-500 border-b-transparent rounded-full animate-spin animate-reverse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !pokemon) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-500/20 p-8 max-w-md mx-auto">
          <div className="text-6xl mb-4">😵</div>
          <p className="text-red-400 text-lg mb-6">{error || 'Pokemon not found'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 group"
          >
            <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span>
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const getTypeGradient = (type: string) => {
    const gradients = {
      fire: 'from-red-500 to-orange-500',
      water: 'from-blue-500 to-cyan-500',
      grass: 'from-green-500 to-emerald-500',
      electric: 'from-yellow-400 to-yellow-600',
      psychic: 'from-pink-500 to-purple-500',
      ice: 'from-cyan-400 to-blue-400',
      dragon: 'from-purple-600 to-indigo-600',
      dark: 'from-gray-800 to-black',
      fairy: 'from-pink-400 to-rose-400',
      fighting: 'from-red-600 to-red-800',
      poison: 'from-purple-500 to-violet-600',
      ground: 'from-yellow-600 to-orange-600',
      flying: 'from-blue-400 to-purple-400',
      bug: 'from-green-400 to-lime-500',
      rock: 'from-yellow-800 to-orange-800',
      ghost: 'from-purple-600 to-gray-600',
      steel: 'from-gray-500 to-gray-600',
      normal: 'from-gray-400 to-gray-500',
    };
    return gradients[type as keyof typeof gradients] || 'from-gray-400 to-gray-500';
  };

  const getStatColor = (statName: string) => {
    const colors = {
      hp: 'bg-gradient-to-r from-red-500 to-red-600',
      attack: 'bg-gradient-to-r from-orange-500 to-orange-600',
      defense: 'bg-gradient-to-r from-blue-500 to-blue-600',
      'special-attack': 'bg-gradient-to-r from-purple-500 to-purple-600',
      'special-defense': 'bg-gradient-to-r from-green-500 to-green-600',
      speed: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    };
    return colors[statName as keyof typeof colors] || 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  return (
    <div className="px-4 py-8 max-w-7xl mx-auto">
      {/* Back Button */}
      <Link 
        href="/" 
        className="group inline-flex items-center text-white/80 hover:text-white mb-8 transition-all duration-300"
      >
        <div className="mr-2 p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </div>
        <span className="font-medium">Back to Pokemon List</span>
      </Link>

      {/* Main Content */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header with Pokemon Image */}
        <div className="relative bg-gradient-to-br from-white/20 to-white/5 p-8 md:p-12">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            {/* Pokemon Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-6 border border-white/30 group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={pokemon.image} 
                  alt={pokemon.name} 
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Pokemon Info */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white capitalize">
                  {pokemon.name}
                </h1>
                <span className="text-2xl text-white/60 font-mono">
                  #{pokemon.id.toString().padStart(3, '0')}
                </span>
              </div>
              
              {/* Types */}
              <div className="flex gap-3 justify-center md:justify-start mb-6">
                {pokemon.types.map((type) => (
                  <div
                    key={type}
                    className={`px-4 py-2 rounded-xl text-white font-semibold text-sm bg-gradient-to-r ${getTypeGradient(type)} shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
                  >
                    {type}
                  </div>
                ))}
              </div>

              {/* Basic Stats */}
              <div className="grid grid-cols-2 gap-6 max-w-xs mx-auto md:mx-0">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-white/70 text-sm">Height</div>
                  <div className="text-2xl font-bold text-white">{pokemon.height / 10}m</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-white/70 text-sm">Weight</div>
                  <div className="text-2xl font-bold text-white">{pokemon.weight / 10}kg</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="p-8 md:p-12 space-y-10">
          {/* Abilities */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              Abilities
            </h2>
            <div className="flex flex-wrap gap-3">
              {pokemon.abilities.map((ability) => (
                <div
                  key={ability}
                  className="px-4 py-2 bg-green-500/20 backdrop-blur-sm text-green-400 rounded-xl border border-green-500/30 capitalize hover:bg-green-500/30 transition-colors duration-300"
                >
                  {ability.replace('-', ' ')}
                </div>
              ))}
            </div>
          </div>

          {/* Base Stats */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              Base Stats
            </h2>
            <div className="grid gap-4">
              {pokemon.stats.map((stat) => (
                <div key={stat.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-white/80 capitalize font-medium">
                      {stat.name.replace('-', ' ')}
                    </span>
                    <span className="text-white font-bold text-lg">{stat.value}</span>
                  </div>
                  <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getStatColor(stat.name)} transition-all duration-1000 ease-out shadow-lg`}
                      style={{ width: `${Math.min((stat.value / 150) * 100, 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Moves */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </div>
              Sample Moves
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {pokemon.moves.map((move, index) => (
                <div
                  key={move}
                  className="group px-4 py-3 bg-white/10 backdrop-blur-sm text-white/90 rounded-xl border border-white/20 capitalize hover:bg-white/20 hover:scale-105 transition-all duration-300 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{move.replace('-', ' ')}</span>
                    <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:bg-pink-500 transition-colors duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PokemonDetailPage;