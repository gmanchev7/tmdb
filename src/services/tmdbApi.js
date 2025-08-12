import axios from 'axios';
import rateLimiter from '../utils/rateLimiter';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your_tmdb_api_key_here';
const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
  timeout: 10000,
});

tmdbApi.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 429) {
      console.warn('TMDB Rate limit hit');
    }
    return Promise.reject(error);
  }
);

export const searchMovie = async (title, language = 'en-US') => {
  try {
    const searchResult = await rateLimiter.execute(async () => {
      const response = await tmdbApi.get('/search/movie', {
        params: {
          query: title,
          language: language,
          page: 1,
        },
      });
      return response.data;
    });

    if (searchResult?.results && searchResult.results.length > 0) {
      const movie = searchResult.results[0];
      return await getMovieDetails(movie.id, language);
    }

    return null;
  } catch (error) {
    console.error('Error searching movie:', error.message);
    if (error.response?.status === 404 || error.response?.status === 401) {
      return null;
    }
    return null;
  }
};

export const getMovieDetails = async (movieId, language = 'en-US') => {
  return rateLimiter.execute(async () => {
    try {
      const response = await tmdbApi.get(`/movie/${movieId}`, {
        params: {
          language,
          append_to_response: 'credits,videos'
        }
      });

      const movie = response.data;
      const credits = movie.credits || {};
      const videos = movie.videos || {};

      const director = credits.crew?.find(person => person.job === 'Director');
      const actors = credits.cast?.slice(0, 5).map(actor => actor.name) || [];
      const trailer = videos.results?.find(video =>
        video.type === 'Trailer' && video.site === 'YouTube'
      );

      return {
        tmdbId: movie.id,
        title: movie.title,
        overview: movie.overview || 'No overview available',
        actors: actors,
        genres: movie.genres?.map(genre => genre.name) || [],
        poster: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
        release: movie.release_date,
        rating: movie.vote_average || 0,
        trailer: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
        director: director ? director.name : 'Unknown',
        duration: movie.runtime || 0,
      };
    } catch (error) {
      console.error('Error getting movie details:', error.message);
      throw error;
    }
  });
};

export const searchMovieWithSuggestions = async (query, language = 'en-US') => {
  return rateLimiter.execute(async () => {
    try {
      const response = await tmdbApi.get('/search/movie', {
        params: {
          query: query,
          language: language,
          page: 1,
        },
      });

      return response.data.results.slice(0, 5).map(movie => ({
        id: movie.id,
        title: movie.title,
        year: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        poster: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
      }));
    } catch (error) {
      console.error('Error searching movies with suggestions:', error.message);
      return [];
    }
  });
};

export const getGenres = async (language = 'en-US') => {
  return rateLimiter.execute(async () => {
    try {
      const response = await tmdbApi.get('/genre/movie/list', {
        params: { language }
      });
      return response.data.genres || [];
    } catch (error) {
      console.error('Error fetching genres:', error.message);
      return [];
    }
  });
};

export const getLanguages = async () => {
  return rateLimiter.execute(async () => {
    try {
      const response = await tmdbApi.get('/configuration/languages');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching languages:', error.message);
      return [];
    }
  });
};