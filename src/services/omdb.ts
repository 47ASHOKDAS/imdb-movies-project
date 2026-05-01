const OMDB_BASE_URL = 'https://www.omdbapi.com/';
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;
import { OMDBData } from '../types';

export const omdbService = {
  isConfigured: !!OMDB_API_KEY,
  getMovieByImdbId: async (imdbId: string): Promise<OMDBData | null> => {
    if (!OMDB_API_KEY) return null;
    
    try {
      const response = await fetch(`${OMDB_BASE_URL}?i=${imdbId}&apikey=${OMDB_API_KEY}`);
      if (!response.ok) return null;
      return response.json();
    } catch (e) {
      console.error('OMDb fetch error:', e);
      return null;
    }
  }
};
