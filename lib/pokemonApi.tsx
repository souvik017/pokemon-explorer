import axios from 'axios';
import type { RawPokemon } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

class LRUCache<T> {
  private cache = new Map<string, T>();
  private maxSize: number;

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Enhanced interfaces
export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonSummary {
  id: number;
  name: string;
  url: string;
  sprite?: string;
  types?: string[];
}

// Global caches
const pokemonCache = new LRUCache<RawPokemon>(300);
const summaryCache = new LRUCache<PokemonSummary>(1000);
const listCache = new LRUCache<PokemonListItem[]>(10);

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>();

// Debounced search
let searchTimeout: NodeJS.Timeout;

// Configure axios with better defaults
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    if (!config.retry) config.retry = 0;
    
    if (config.retry < 3 && error.response?.status >= 500) {
      config.retry++;
      const delay = Math.pow(2, config.retry) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(config);
    }
    
    return Promise.reject(error);
  }
);

// 1. Fetch Pokémon list with caching
export const fetchPokemonList = async (limit: number = 1010): Promise<PokemonListItem[]> => {
  const cacheKey = `list_${limit}`;
  
  // Check cache first
  if (listCache.has(cacheKey)) {
    return listCache.get(cacheKey)!;
  }

  // Check for pending request
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = (async () => {
    try {
      const response = await apiClient.get<{ results: PokemonListItem[] }>(
        `/pokemon?limit=${limit}`
      );
      const results = response.data.results;
      listCache.set(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error fetching Pokémon list:', error);
      throw error;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, request);
  return request;
};

// 2. Fetch detailed Pokémon with caching
export const fetchPokemonDetails = async (nameOrId: string | number): Promise<RawPokemon> => {
  const cacheKey = `pokemon_${nameOrId}`;
  
  // Check cache first
  if (pokemonCache.has(cacheKey)) {
    return pokemonCache.get(cacheKey)!;
  }

  // Check for pending request
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = (async () => {
    try {
      const response = await apiClient.get<RawPokemon>(`/pokemon/${nameOrId}`);
      const pokemon = response.data;
      pokemonCache.set(cacheKey, pokemon);
      return pokemon;
    } catch (error) {
      console.error('Error fetching Pokémon details:', error);
      throw error;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, request);
  return request;
};

// 3. Fetch Pokémon from URL with caching
export const fetchPokemonFromUrl = async (url: string): Promise<RawPokemon> => {
  const cacheKey = `url_${url}`;
  
  // Check cache first
  if (pokemonCache.has(cacheKey)) {
    return pokemonCache.get(cacheKey)!;
  }

  // Check for pending request
  if (pendingRequests.has(cacheKey)) {
    return pendingRequests.get(cacheKey);
  }

  const request = (async () => {
    try {
      const response = await apiClient.get<RawPokemon>(url);
      const pokemon = response.data;
      pokemonCache.set(cacheKey, pokemon);
      return pokemon;
    } catch (error) {
      console.error('Error fetching Pokémon from URL:', error);
      throw error;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, request);
  return request;
};

// 4. Batch fetch with concurrency control
export const batchFetchPokemon = async (
  items: PokemonListItem[],
  concurrency: number = 10
): Promise<RawPokemon[]> => {
  const results: RawPokemon[] = [];
  const promises: Promise<void>[] = [];
  
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchPromise = Promise.all(
      batch.map(item => fetchPokemonFromUrl(item.url))
    ).then(batchResults => {
      results.push(...batchResults);
    });
    
    promises.push(batchPromise);
  }
  
  await Promise.all(promises);
  return results.sort((a, b) => a.id - b.id);
};

// 5. Optimized search with debouncing
export const searchPokemon = async (
  query: string,
  allPokemon: PokemonListItem[],
  maxResults: number = 20
): Promise<PokemonSummary[]> => {
  return new Promise((resolve) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    searchTimeout = setTimeout(async () => {
      if (!query.trim()) {
        resolve([]);
        return;
      }

      const normalizedQuery = query.toLowerCase().trim();
      
      // Fast filter from cached list
      const matches = allPokemon
        .filter(pokemon => pokemon.name.toLowerCase().includes(normalizedQuery))
        .slice(0, maxResults);

      // Check cache for summaries first
      const summaries: PokemonSummary[] = [];
      const toFetch: PokemonListItem[] = [];

      for (const match of matches) {
        const cacheKey = `summary_${match.name}`;
        if (summaryCache.has(cacheKey)) {
          summaries.push(summaryCache.get(cacheKey)!);
        } else {
          toFetch.push(match);
        }
      }

      // Fetch missing summaries with limited concurrency
      if (toFetch.length > 0) {
        try {
          const fetchPromises = toFetch.map(async (item) => {
            const id = getPokemonIdFromUrl(item.url);
            const cacheKey = `summary_${item.name}`;
            
            try {
              const pokemon = await fetchPokemonFromUrl(item.url);
              const summary: PokemonSummary = {
                id: pokemon.id,
                name: pokemon.name,
                url: item.url,
                sprite: pokemon.sprites?.front_default || undefined,
                types: pokemon.types?.map(t => t.type.name) || [],
              };
              
              summaryCache.set(cacheKey, summary);
              return summary;
            } catch (error) {
              // Return basic summary if fetch fails
              return {
                id: parseInt(id || '0'),
                name: item.name,
                url: item.url,
              };
            }
          });

          const newSummaries = await Promise.all(fetchPromises);
          summaries.push(...newSummaries);
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
      }

      // Sort by original order and ID
      const sorted = summaries.sort((a, b) => {
        const aIndex = matches.findIndex(m => m.name === a.name);
        const bIndex = matches.findIndex(m => m.name === b.name);
        return aIndex - bIndex || a.id - b.id;
      });

      resolve(sorted);
    }, 300); // 300ms debounce
  });
};

// 6. Pre-fetch commonly searched Pokemon
export const prefetchPopularPokemon = async (): Promise<void> => {
  const popularIds = [1, 4, 7, 25, 39, 52, 54, 104, 115, 131, 134, 135, 136, 150, 151];
  
  try {
    await Promise.all(
      popularIds.map(id => fetchPokemonDetails(id).catch(() => null))
    );
  } catch (error) {
    console.error('Error prefetching popular Pokemon:', error);
  }
};

// 7. Utility functions
export const getPokemonIdFromUrl = (url: string): string | null => {
  const matches = url.match(/\/pokemon\/(\d+)\//);
  return matches ? matches[1] : null;
};

export const clearCache = (): void => {
  pokemonCache.clear();
  summaryCache.clear();
  listCache.clear();
  pendingRequests.clear();
};

export const getCacheStats = () => ({
  pokemon: pokemonCache.size(),
  summaries: summaryCache.size(),
  lists: listCache.size(),
  pending: pendingRequests.size,
});

// 8. Preload essential data
export const preloadEssentialData = async (): Promise<PokemonListItem[]> => {
  const [pokemonList] = await Promise.all([
    fetchPokemonList(1010),
    prefetchPopularPokemon(),
  ]);
  
  return pokemonList;
};