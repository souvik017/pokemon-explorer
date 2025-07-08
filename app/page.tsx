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

  // Memoized filtered results
  const displayedPokemon = useMemo(() => {
    if (searchTerm) {
      // Convert search results to DisplayPokemon format
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

  // Initialize data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Preload essential data (includes popular Pokemon caching)
      const allPokemon = await preloadEssentialData();
      setAllPokemonList(allPokemon);

      // Load first batch of detailed Pokemon
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

  // Optimized load more with batch fetching
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

      // Batch fetch with concurrency control
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

  // Optimized search with debouncing and caching
  const handleSearch = useCallback(async (query: string) => {
    setSearchTerm(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      
      // Use optimized search function with built-in debouncing
      const results = await searchPokemon(query, allPokemonList, SEARCH_LIMIT);
      setSearchResults(results);
      
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [allPokemonList]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
  }, []);

  // Cache statistics for debugging
  const cacheStats = useMemo(() => getCacheStats(), [pokemonList.length, searchResults.length]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 bg-red-500/10 backdrop-blur-md rounded-3xl border border-red-500/20 max-w-md">
          <div className="text-6xl mb-6 animate-bounce">💥</div>
          <h3 className="text-2xl font-bold text-red-400 mb-4">Oops! Something went wrong</h3>
          <p className="text-red-300 text-lg mb-6">{error}</p>
          <button
            onClick={loadInitialData}
            className="group px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
          >
            <span className="mr-2">🔄</span>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative text-center">
        {/* Floating background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-8 right-1/4 w-24 h-24 bg-red-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-2000"></div>
        </div>

        <div className="relative">
          {/* Main Title */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-red-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Discover Pokemon
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full mx-auto mb-6"></div>
          </div>

          {/* Description */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 max-w-3xl mx-auto mb-8">
            <p className="text-white/90 text-lg leading-relaxed">
              Embark on an epic journey through the world of Pokemon! 
              <span className="font-semibold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent"> Search</span> for your favorites and discover their unique 
              <span className="font-semibold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> abilities</span>, 
              <span className="font-semibold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"> types</span>, and 
              <span className="font-semibold bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent"> stats</span>.
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 group">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-white mb-1">{allPokemonList.length}</div>
              <div className="text-white/70">Total Pokemon</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 group">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-white mb-1">{pokemonList.length}</div>
              <div className="text-white/70">Pokemon Loaded</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 group">
              <div className="text-3xl mb-2">🔍</div>
              <div className="text-2xl font-bold text-white mb-1">{displayedPokemon.length}</div>
              <div className="text-white/70">Results Found</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-300 group">
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-2xl font-bold text-white mb-1">{cacheStats.pokemon}</div>
              <div className="text-white/70">Cached Pokemon</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="relative">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <span className="text-3xl">🔍</span>
              Find Your Pokemon
            </h2>
            <p className="text-white/70">Lightning-fast search through all {allPokemonList.length} Pokemon</p>
          </div>
          <SearchBar onSearch={handleSearch} />
          
          {/* Search Results Indicator */}
          {searchTerm && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                <span className="text-white/80">Searching for:</span>
                <span className="font-semibold text-white bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  "{searchTerm}"
                </span>
                <span className="text-white/60">•</span>
                <span className="text-white/80">{displayedPokemon.length} results</span>
                {searching && (
                  <>
                    <span className="text-white/60">•</span>
                    <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"></div>
                  </>
                )}
                <button
                  onClick={clearSearch}
                  className="ml-2 text-white/60 hover:text-white transition-colors"
                  title="Clear search"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pokemon List Section */}
      <div className="relative">
        {loading && (
          <div className="text-center py-16">
            <div className="relative inline-block">
              <div className="w-20 h-20 border-4 border-gradient-to-r from-yellow-400 to-red-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-16 h-16 border-4 border-gradient-to-r from-blue-500 to-purple-500 border-b-transparent rounded-full animate-spin animate-reverse"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-purple-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <p className="text-white/80 mt-6 text-lg">Loading amazing Pokemon...</p>
          </div>
        )}

        {!loading && (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-3xl">🎮</span>
                {searchTerm ? 'Search Results' : 'Pokemon Collection'}
              </h2>
              <div className="flex items-center gap-4">
                {searchTerm && (
                  <div className="text-sm text-white/60 bg-white/10 px-3 py-1 rounded-full">
                    Fast Search Active
                  </div>
                )}
                <div className="flex items-center gap-2 text-white/60">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Optimized</span>
                </div>
              </div>
            </div>
            
            <PokemonList pokemonList={displayedPokemon} loading={loading} />
            
            {/* Load More Button */}
            {!searchTerm && hasMore && !loading && (
              <div className="text-center mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loadingMore ? (
                    <>
                      <div className="inline-block w-5 h-5 border-2 border-white/60 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Loading More...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">⬇️</span>
                      Load More Pokemon
                    </>
                  )}
                </button>
                <p className="text-white/60 text-sm mt-2">
                  Showing {pokemonList.length} of {allPokemonList.length} Pokemon
                </p>
              </div>
            )}
          </div>
        )}

        {/* No Results State */}
        {!loading && displayedPokemon.length === 0 && allPokemonList.length > 0 && (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 max-w-md mx-auto">
              <div className="text-6xl mb-6 animate-bounce">🤔</div>
              <h3 className="text-2xl font-bold text-white mb-4">No Pokemon Found</h3>
              <p className="text-white/70 text-lg mb-6">
                We couldn't find any Pokemon matching "{searchTerm}". Try a different search term!
              </p>
              <button
                onClick={clearSearch}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-semibold"
              >
                <span className="mr-2">🔄</span>
                Show All Pokemon
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}