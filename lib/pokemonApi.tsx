import axios from 'axios';
import type { RawPokemon } from '../types/pokemon';

const BASE_URL = 'https://pokeapi.co/api/v2';

// --------------------
// Generic LRU Cache
// --------------------
class LRUCache<T> {
  private cache = new Map<string, T>();
  private maxSize: number;

  constructor(maxSize: number = 500) {
    this.maxSize = maxSize;
  }

  get(key: string): T | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (typeof firstKey === 'string') {
        this.cache.delete(firstKey);
      }
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

// --------------------
// Types & Interfaces
// --------------------
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

// --------------------
// Cache & Globals
// --------------------
const pokemonCache = new LRUCache<RawPokemon>(300);
const summaryCache = new LRUCache<PokemonSummary>(1000);
const listCache = new LRUCache<PokemonListItem[]>(10);
const pendingRequests = new Map<string, Promise<any>>();
let searchTimeout: NodeJS.Timeout;

// --------------------
// Axios Configuration
// --------------------
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const config = error.config;
    config.retry = config.retry || 0;

    if (config.retry < 3 && error.response?.status >= 500) {
      config.retry++;
      const delay = Math.pow(2, config.retry) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return apiClient(config);
    }

    return Promise.reject(error);
  }
);

// --------------------
// API Functions
// --------------------
export const fetchPokemonList = async (limit: number = 1010): Promise<PokemonListItem[]> => {
  const cacheKey = `list_${limit}`;

  if (listCache.has(cacheKey)) return listCache.get(cacheKey)!;
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

  const request = (async () => {
    try {
      const { data } = await apiClient.get<{ results: PokemonListItem[] }>(`/pokemon?limit=${limit}`);
      listCache.set(cacheKey, data.results);
      return data.results;
    } catch (err) {
      console.error('Error fetching Pokémon list:', err);
      throw err;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, request);
  return request;
};

export const fetchPokemonDetails = async (nameOrId: string | number): Promise<RawPokemon> => {
  const cacheKey = `pokemon_${nameOrId}`;
  if (pokemonCache.has(cacheKey)) return pokemonCache.get(cacheKey)!;
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

  const request = (async () => {
    try {
      const { data } = await apiClient.get<RawPokemon>(`/pokemon/${nameOrId}`);
      pokemonCache.set(cacheKey, data);
      return data;
    } catch (err) {
      console.error('Error fetching Pokémon details:', err);
      throw err;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, request);
  return request;
};

export const fetchPokemonFromUrl = async (url: string): Promise<RawPokemon> => {
  const cacheKey = `url_${url}`;
  if (pokemonCache.has(cacheKey)) return pokemonCache.get(cacheKey)!;
  if (pendingRequests.has(cacheKey)) return pendingRequests.get(cacheKey);

  const request = (async () => {
    try {
      const { data } = await apiClient.get<RawPokemon>(url);
      pokemonCache.set(cacheKey, data);
      return data;
    } catch (err) {
      console.error('Error fetching Pokémon from URL:', err);
      throw err;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  pendingRequests.set(cacheKey, request);
  return request;
};

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
      return;
    });
    promises.push(batchPromise);
  }

  await Promise.all(promises);
  return results.sort((a, b) => a.id - b.id);
};

export const searchPokemon = async (
  query: string,
  allPokemon: PokemonListItem[],
  maxResults: number = 20
): Promise<PokemonSummary[]> => {
  return new Promise(resolve => {
    if (searchTimeout) clearTimeout(searchTimeout);

    searchTimeout = setTimeout(async () => {
      if (!query.trim()) return resolve([]);

      const normalized = query.toLowerCase().trim();
      const matches = allPokemon
        .filter(p => p.name.includes(normalized))
        .slice(0, maxResults);

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

      if (toFetch.length > 0) {
        try {
          const fetched = await Promise.all(
            toFetch.map(async item => {
              const id = getPokemonIdFromUrl(item.url);
              const cacheKey = `summary_${item.name}`;
              try {
                const pokemon = await fetchPokemonFromUrl(item.url);
                const summary: PokemonSummary = {
                  id: pokemon.id,
                  name: pokemon.name,
                  url: item.url,
                  sprite: pokemon.sprites?.front_default,
                  types: pokemon.types?.map(t => t.type.name) || [],
                };
                summaryCache.set(cacheKey, summary);
                return summary;
              } catch {
                return { id: parseInt(id || '0'), name: item.name, url: item.url };
              }
            })
          );
          summaries.push(...fetched);
        } catch (err) {
          console.error('Error fetching search summaries:', err);
        }
      }

      const sorted = summaries.sort((a, b) => {
        const aIndex = matches.findIndex(m => m.name === a.name);
        const bIndex = matches.findIndex(m => m.name === b.name);
        return aIndex - bIndex || a.id - b.id;
      });

      resolve(sorted);
    }, 300);
  });
};

// --------------------
// Utility Functions
// --------------------
export const prefetchPopularPokemon = async (): Promise<void> => {
  const popularIds = [1, 4, 7, 25, 39, 52, 54, 104, 115, 131, 134, 135, 136, 150, 151];
  await Promise.all(popularIds.map(id => fetchPokemonDetails(id).catch(() => null)));
};

export const getPokemonIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? match[1] : null;
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

export const preloadEssentialData = async (): Promise<PokemonListItem[]> => {
  const [pokemonList] = await Promise.all([
    fetchPokemonList(1010),
    prefetchPopularPokemon(),
  ]);
  return pokemonList;
};
