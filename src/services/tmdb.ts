const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!TMDB_API_KEY) {
    throw new Error('VITE_TMDB_API_KEY is not set');
  }

  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    ...params,
  });

  const response = await fetch(`${TMDB_BASE_URL}${endpoint}?${queryParams}`);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.statusText}`);
  }
  return response.json();
}

export const tmdbService = {
  isConfigured: !!TMDB_API_KEY,
  getTrending: () => fetchTMDB<{ results: any[] }>('/trending/movie/day'),
  getPopular: () => fetchTMDB<{ results: any[] }>('/movie/popular'),
  getTopRated: () => fetchTMDB<{ results: any[] }>('/movie/top_rated'),
  getMoviesByGenre: (genreId: number | string) => fetchTMDB<{ results: any[] }>('/discover/movie', { with_genres: genreId.toString() }),
  getSimilarMovies: (id: string | number) => fetchTMDB<{ results: any[] }>(`/movie/${id}/similar`),
  getPersonDetails: (id: string | number) => fetchTMDB<any>(`/person/${id}`, { append_to_response: 'movie_credits' }),
  searchMovies: (query: string) => fetchTMDB<{ results: any[] }>('/search/movie', { query }),
  getMovieDetails: (id: string | number) => 
    fetchTMDB<any>(`/movie/${id}`, { append_to_response: 'credits,videos,watch/providers' }),
  getMovieByImdbId: async (imdbId: string) => {
    const searchResult = await fetchTMDB<{ movie_results: any[] }>(`/find/${imdbId}`, { external_source: 'imdb_id' });
    if (searchResult.movie_results.length > 0) {
      return searchResult.movie_results[0];
    }
    return null;
  },
  getImageUrl: (path: string | null, size: 'w92' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500') => 
    path ? `https://image.tmdb.org/t/p/${size}${path}` : '/placeholder.jpg',
};
