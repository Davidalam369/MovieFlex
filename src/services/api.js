// OMDB API Configuration
const API_KEY = import.meta.env.VITE_OMDB_API_KEY || 'f3e38d5';
const BASE_URL = import.meta.env.VITE_OMDB_BASE_URL || 'http://www.omdbapi.com/';

// Check if API key is available
if (!API_KEY) {
  console.warn("⚠️ Warning: Please set VITE_OMDB_API_KEY in .env file");
}

// Helper function to normalize image paths with validation
const normalizeImagePath = (imagePath) => {
  if (!imagePath || imagePath === 'N/A') {
    return '/Images/placeholder.jpg';
  }
  
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it starts with /, it's already an absolute path
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // Otherwise, add the /Images/ prefix
  return `/Images/${imagePath}`;
};

// Helper to validate and fix image URL
const getValidImageUrl = (posterUrl) => {
  const normalized = normalizeImagePath(posterUrl);
  // Ensure absolute paths for public folder images
  if (normalized.startsWith('/Images/')) {
    return normalized;
  }
  return normalized;
};

// Language mapping for OMDB
const LANGUAGE_MAP = {
  'English': 'English',
  'Hindi': 'Hindi',
  'Malayalam': 'Malayalam',
  'Tamil': 'Tamil',
  'Telugu': 'Telugu'
};

// Year ranges for filtering
export const YEAR_RANGES = [
  { label: '2026', start: 2026, end: 2026 },
  { label: '2025', start: 2025, end: 2025 },
  { label: '2024', start: 2024, end: 2024 },
  { label: '2023', start: 2023, end: 2023 },
  { label: '2022', start: 2022, end: 2022 }
];

// Languages for filtering
export const LANGUAGES = {
  ENGLISH: 'English',
  HINDI: 'Hindi',
  MALAYALAM: 'Malayalam',
  TAMIL: 'Tamil',
  TELUGU: 'Telugu'
};

// Get language values as array
export const LANGUAGE_VALUES = Object.values(LANGUAGES);

// Cache implementation
const cache = {
  get: (key) => {
    try {
      const item = localStorage.getItem(`movie_cache_${key}`);
      if (item) {
        const { data, expiry } = JSON.parse(item);
        if (expiry > Date.now()) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Cache error:', e);
    }
    return null;
  },

  set: (key, data, ttl = 3600000) => {
    try {
      const item = {
        data,
        expiry: Date.now() + ttl
      };
      localStorage.setItem(`movie_cache_${key}`, JSON.stringify(item));
    } catch (e) {
      console.warn('Cache error:', e);
    }
  }
};

// Favorites management
export const favoritesManager = {
  getFavorites: () => {
    try {
      const favorites = localStorage.getItem('movie_favorites');
      return favorites ? JSON.parse(favorites) : [];
    } catch (e) {
      console.warn('Error getting favorites:', e);
      return [];
    }
  },

  addFavorite: (movie) => {
    try {
      const favorites = favoritesManager.getFavorites();
      if (!favorites.some(fav => fav.id === movie.id)) {
        favorites.push(movie);
        localStorage.setItem('movie_favorites', JSON.stringify(favorites));
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Error adding favorite:', e);
      return false;
    }
  },

  removeFavorite: (id) => {
    try {
      const favorites = favoritesManager.getFavorites();
      const updatedFavorites = favorites.filter(movie => movie.id !== id);
      localStorage.setItem('movie_favorites', JSON.stringify(updatedFavorites));
      return true;
    } catch (e) {
      console.warn('Error removing favorite:', e);
      return false;
    }
  },

  isFavorite: (id) => {
    const favorites = favoritesManager.getFavorites();
    return favorites.some(movie => movie.id === id);
  },

  clearFavorites: () => {
    try {
      localStorage.removeItem('movie_favorites');
      return true;
    } catch (e) {
      console.warn('Error clearing favorites:', e);
      return false;
    }
  }
};

// SEARCH MOVIES using OMDB API (Real API data only)
// This function fetches from the actual OMDB API for search queries
// Dummy data is NOT used for searches - only real API results are returned
export const searchMovies = async (query, page = 1) => {
  if (!query || query.trim() === '') {
    return [];
  }

  const cacheKey = `search_${query.toLowerCase().replace(/\s+/g, '_')}_${page}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`Returning cached results for: "${query}"`);
    return cached;
  }

  try {
    console.log(`Searching OMDB API for: "${query}"`);

    // Validate API key before making request
    if (!API_KEY || API_KEY === 'f3e38d5') {
      console.warn('⚠️ Warning: Using default/invalid API key. Please set VITE_OMDB_API_KEY environment variable.');
      console.warn('Search may return limited or no results.');
    }

    // ALWAYS fetch from OMDB API for search queries - never use dummy data
    const response = await fetch(
      `${BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=${page}&type=movie`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.Response === 'True' && data.Search && data.Search.length > 0) {
      console.log(`Found ${data.Search.length} results for "${query}"`);
      
      // Fetch details for each movie to get complete information
      const moviesWithDetails = await Promise.all(
        data.Search.slice(0, 10).map(async (movie) => {
          try {
            const detailResponse = await fetch(
              `${BASE_URL}?apikey=${API_KEY}&i=${movie.imdbID}&plot=short`
            );
            const detailData = await detailResponse.json();
            
            if (detailData.Response === 'True') {
              return formatMovie(detailData);
            }
            return formatMovie(movie);
          } catch (error) {
            console.warn(`Failed to fetch details for ${movie.imdbID}:`, error);
            return formatMovie(movie);
          }
        })
      );

      const movies = moviesWithDetails.filter(movie => movie);
      cache.set(cacheKey, movies);
      console.log(`Successfully cached ${movies.length} movies from API`);
      return movies;
    }

    console.log('No results from OMDB API for query:', query);
    if (data.Response === 'False') {
      console.log('API Error:', data.Error);
    }
    return [];

  } catch (error) {
    console.error('Search API error:', error);
    console.error('Failed to fetch from OMDB API. Check your API key and internet connection.');
    return [];
  }
};

// GET MOVIE BY ID using OMDB API
import { DUMMY_MOVIES } from '../data/movieData';

// GET MOVIE BY ID using OMDB API or Dummy Data
export const getMovieById = async (id) => {
  const cacheKey = `movie_${id}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Check if it's a dummy ID format (Language_Year_Index)
  if (typeof id === 'string' && id.includes('_') && !id.startsWith('tt')) {
    const parts = id.split('_');
    if (parts.length >= 3) {
      const language = parts[0];
      // Search in our new static data
      if (DUMMY_MOVIES[language]) {
        const movie = DUMMY_MOVIES[language].find(m => m.id === id);
        if (movie) {
          cache.set(cacheKey, movie, 86400000);
          return movie;
        }
      }
    }
  }

  try {
    const response = await fetch(
      `${BASE_URL}?apikey=${API_KEY}&i=${id}&plot=full`
    );

    const data = await response.json();

    if (data.Response === 'True') {
      const movie = formatMovie(data);
      cache.set(cacheKey, movie, 86400000);
      return movie;
    }

    return null;

  } catch (error) {
    console.error('Movie by ID error:', error);
    return null;
  }
};

// GET TRENDING MOVIES BY LANGUAGE
// Now fetches real data for CURRENT trending, but strict dummy data for older years
// Format movie data for OMDB/Internal
const formatMovie = (movie) => {
  return {
    id: movie.imdbID || movie.id || Math.random().toString(36).substr(2, 9),
    imdbID: movie.imdbID || '',
    Title: movie.Title || 'Unknown Movie',
    Year: movie.Year || 'N/A',
    Type: movie.Type || 'movie',
    Poster: getValidImageUrl(movie.Poster || movie.poster || ''),
    Language: movie.Language || 'English',
    Rating: movie.imdbRating || movie.Rating || 'N/A',
    Genre: movie.Genre || 'N/A',
    overview: movie.Plot || movie.overview || '',
    isFavorite: favoritesManager.isFavorite(movie.imdbID || movie.id || ''),
    Director: movie.Director || '',
    Actors: movie.Actors || '',
    Released: movie.Released || '',
    Runtime: movie.Runtime || 'N/A'
  };
};

// GET TRENDING MOVIES BY LANGUAGE (Dummy Data)
// This function returns static dummy movie data for trending/homepage display
// It does NOT make API calls - uses hardcoded data only
export const getTrendingMoviesByLanguage = async (language = 'English') => {
  const cacheKey = `trending_${language}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Use static dummy data directly (no API calls)
  let movies = [];
  if (DUMMY_MOVIES[language]) {
    movies = DUMMY_MOVIES[language];
  } else if (DUMMY_MOVIES['English']) {
    movies = DUMMY_MOVIES['English'];
  }

  // Cache the dummy data
  cache.set(cacheKey, movies, 3600000);
  return movies;
};

// GET RECENT MOVIES BY LANGUAGE (Dummy Data)
// This function returns static dummy movie data for recent releases
// It does NOT make API calls - uses hardcoded data only
export const getRecentMoviesByLanguage = async (language) => {
  // Reuse the trending logic - both use dummy data
  return getTrendingMoviesByLanguage(language);
};

// Export everything
export default {
  searchMovies,
  getMovieById,
  getTrendingMoviesByLanguage,
  getRecentMoviesByLanguage,
  favoritesManager,
  LANGUAGES,
  YEAR_RANGES,
  LANGUAGE_VALUES
};
