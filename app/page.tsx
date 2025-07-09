'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import PokemonList from '../components/PokemonList';
import { 
  preloadEssentialData, 
  searchPokemon, 
  batchFetchPokemon,
  PokemonListItem,
  PokemonSummary,
  getCacheStats 
} from '../lib/pokemonApi';
import { formatPokemonData, FormattedPokemon, DisplayPokemon } from '../types/pokemon';

export default function HomePage() {
  const [allPokemonList, setAllPokemonList] = useState<PokemonListItem[]>([]);
  const [pokemonList, setPokemonList] = useState<DisplayPokemon[]>([]);
  const [searchResults, setSearchResults] = useState<PokemonSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const ITEMS_PER_PAGE = 20;
  const SEARCH_LIMIT = 20;

  const displayedPokemon = useMemo(() => {
    if (searchTerm) {
      return searchResults.map(pokemon => ({
        id: pokemon.id,
        name: pokemon.name,
        url: pokemon.url,
        image: pokemon.sprite || null,
        types: pokemon.types || [],
        height: 0,
        weight: 0,
        abilities: [],
        stats: [],
        moves: [],
      }));
    }
    return pokemonList;
  }, [searchTerm, searchResults, pokemonList]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const allPokemon = await preloadEssentialData();
      setAllPokemonList(allPokemon);

      const firstBatch = allPokemon.slice(0, ITEMS_PER_PAGE);
      const detailedPokemon = await batchFetchPokemon(firstBatch, 8);

      const formattedPokemon: DisplayPokemon[] = detailedPokemon.map(pokemon => {
        const listItem = firstBatch.find(p => p.name === pokemon.name);
        const formatted: FormattedPokemon = formatPokemonData(pokemon);
        return {
          ...listItem!,
          ...formatted,
          id: pokemon.id,
        };
      });

      setPokemonList(formattedPokemon);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('Failed to load Pokemon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || searchTerm) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;

      const nextBatch = allPokemonList.slice(startIndex, endIndex);

      if (nextBatch.length === 0) {
        setHasMore(false);
        return;
      }

      const detailedPokemon = await batchFetchPokemon(nextBatch, 8);

      const formattedPokemon: DisplayPokemon[] = detailedPokemon.map(pokemon => {
        const listItem = nextBatch.find(p => p.name === pokemon.name);
        const formatted: FormattedPokemon = formatPokemonData(pokemon);
        return {
          ...listItem!,
          ...formatted,
          id: pokemon.id,
        };
      });

      setPokemonList(prev => [...prev, ...formattedPokemon]);
      setCurrentPage(nextPage);

      if (endIndex >= allPokemonList.length) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load more Pokemon:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, searchTerm, currentPage, allPokemonList]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchTerm(query);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const results = await searchPokemon(query, allPokemonList, SEARCH_LIMIT);
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [allPokemonList]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  const cacheStats = useMemo(() => getCacheStats(), [pokemonList.length, searchResults.length]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center p-6 sm:p-8 bg-red-500/10 backdrop-blur-md rounded-3xl border border-red-500/20 w-full max-w-md">
          <div className="text-6xl mb-6 animate-bounce">💥</div>
          <h3 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong</h3>
          <p className="text-red-300 text-lg mb-6">{error}</p>
          <button
            onClick={loadInitialData}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold w-full sm:w-auto"
          >
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 sm:px-6 lg:px-24 py-8 space-y-12">
      {/* Hero Section */}
      <div className="relative text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-24 sm:w-32 h-24 sm:h-32 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-8 right-1/4 w-20 sm:w-24 h-20 sm:h-24 bg-red-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/3 w-28 sm:w-40 h-28 sm:h-40 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
            Discover Pokemon
          </h1>
          <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full mx-auto mb-6"></div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6 md:p-8 max-w-[95%] sm:max-w-xl md:max-w-3xl mx-auto mb-8 text-white/90 text-base sm:text-lg leading-relaxed">
            Embark on an epic journey through the world of Pokemon!
            <span className="font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> Search</span> for your favorites and discover their unique
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> abilities</span>,
            <span className="font-semibold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"> types</span>, and
            <span className="font-semibold bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent"> stats</span>.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-[95%] sm:max-w-4xl mx-auto mb-8">
            <StatCard icon="📊" title="Total Pokemon" value={allPokemonList.length} />
            <StatCard icon="⚡" title="Pokemon Loaded" value={pokemonList.length} />
            <StatCard icon="🔍" title="Results Found" value={displayedPokemon.length} />
            <StatCard icon="⚡" title="Cached Pokemon" value={cacheStats.pokemon} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-4 sm:p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center justify-center gap-3">
            <span className="text-2xl sm:text-3xl">🔍</span>
            Find Your Pokemon
          </h2>
          <p className="text-white/70 text-sm sm:text-base">Lightning-fast search through all {allPokemonList.length} Pokemon</p>
        </div>
        <SearchBar onSearch={handleSearch} />

        {searchTerm && (
          <div className="mt-4 text-center text-sm sm:text-base">
            <div className="inline-flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <span className="text-white/80">Searching for:</span>
              <span className="font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                "{searchTerm}"
              </span>
              <span className="text-white/60">•</span>
              <span className="text-white/80">{displayedPokemon.length} results</span>
              {searching && <LoadingSpinner />}
              <button
                onClick={clearSearch}
                className="ml-2 text-white/60 hover:text-white"
                title="Clear search"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pokemon List */}
      <div className="relative">
        {loading ? (
          <div className="text-center py-16">
            <LoadingSpinner />
            <p className="text-white/80 mt-6 text-lg">Loading amazing Pokemon...</p>
          </div>
        ) : (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between mb-6 gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">🎮</span>
                {searchTerm ? 'Search Results' : 'Pokemon Collection'}
              </h2>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                {searchTerm && <span className="bg-white/10 px-3 py-1 rounded-full">Fast Search Active</span>}
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Optimized</span>
              </div>
            </div>

            <PokemonList pokemonList={displayedPokemon} loading={loading} />

            {!searchTerm && hasMore && (
              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? 'Loading More...' : '⬇️ Load More Pokemon'}
                </button>
                <p className="text-white/60 text-sm mt-2">
                  Showing {pokemonList.length} of {allPokemonList.length} Pokemon
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {!loading && displayedPokemon.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 sm:p-8 max-w-md mx-auto">
            <div className="text-6xl mb-6 animate-bounce">🤔</div>
            <h3 className="text-2xl font-bold text-white mb-4">No Pokemon Found</h3>
            <p className="text-white/70 text-lg mb-6">
              We couldn't find any Pokemon matching "{searchTerm}". Try a different search term!
            </p>
            <button
              onClick={clearSearch}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold"
            >
              🔄 Show All Pokemon
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Extra: Reusable StatCard Component
function StatCard({ icon, title, value }: { icon: string, title: string, value: number }) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-4 sm:p-6 hover:bg-white/20 transition-all duration-300">
      <div className="text-2xl sm:text-3xl mb-2">{icon}</div>
      <div className="text-xl sm:text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-white/70 text-sm">{title}</div>
    </div>
  );
}

// Extra: Loading Spinner
function LoadingSpinner() {
  return (
    <div className="relative inline-block">
      <div className="w-12 h-12 border-4 border-white/40 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
