const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {},
): Promise<T> {
  if (!TMDB_API_KEY) {
    throw new Error("VITE_TMDB_API_KEY is not set");
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
  getTrending: (type: "movie" | "tv" = "movie", page: number = 1) =>
    fetchTMDB<{ results: any[]; total_pages: number }>(`/discover/${type}`, {
      sort_by: "popularity.desc",
      [type === "movie" ? "primary_release_date.gte" : "first_air_date.gte"]:
        new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      with_original_language: "en|hi",
      page: page.toString(),
    }),
  getBollywood: (type: "movie" | "tv" = "movie", page: number = 1) =>
    fetchTMDB<{ results: any[]; total_pages: number }>(`/discover/${type}`, {
      sort_by: "popularity.desc",
      with_original_language: "hi",
      page: page.toString(),
    }),
  getHollywood: (type: "movie" | "tv" = "movie", page: number = 1) =>
    fetchTMDB<{ results: any[]; total_pages: number }>(`/discover/${type}`, {
      sort_by: "popularity.desc",
      with_original_language: "en",
      page: page.toString(),
    }),
  getPopular: (type: "movie" | "tv" = "movie", page: number = 1) =>
    fetchTMDB<{ results: any[]; total_pages: number }>(`/discover/${type}`, {
      sort_by: "popularity.desc",
      with_original_language: "en|hi",
      page: page.toString(),
    }),
  getTopRated: (type: "movie" | "tv" = "movie", page: number = 1) =>
    fetchTMDB<{ results: any[]; total_pages: number }>(`/discover/${type}`, {
      sort_by: "vote_average.desc",
      "vote_count.gte": "1000",
      without_genres: "99,10755",
      with_original_language: "en|hi",
      page: page.toString(),
    }),
  getMoviesByGenre: (
    genreId: number | string,
    page: number = 1,
    type: "movie" | "tv" = "movie",
    year?: string,
  ) => {
    let actualGenreId = genreId.toString();
    const isAnime = actualGenreId === "anime";
    if (isAnime) actualGenreId = "16"; // 16 is Animation in TMDB

    const params: Record<string, string> = {
      page: page.toString(),
      sort_by: "vote_average.desc",
      "vote_count.gte": "300",
      [type === "movie" ? "primary_release_date.lte" : "first_air_date.lte"]:
        new Date().toISOString().split("T")[0],
      with_original_language: isAnime ? "ja" : "en|hi",
    };

    if (actualGenreId && actualGenreId !== "all") {
      params.with_genres = actualGenreId;
    }

    if (year) {
      if (type === "movie") {
        params.primary_release_year = year;
        delete params["primary_release_date.lte"]; // the lte date might interfere
      } else {
        params.first_air_date_year = year;
        delete params["first_air_date.lte"];
      }
    }

    return fetchTMDB<{ results: any[]; total_pages: number }>(
      `/discover/${type}`,
      params,
    );
  },
  getSimilarMovies: (id: string | number) =>
    fetchTMDB<{ results: any[] }>(`/movie/${id}/similar`),
  getPersonDetails: (id: string | number) =>
    fetchTMDB<any>(`/person/${id}`, { append_to_response: "movie_credits" }),
  searchMulti: async (query: string) => {
    const data = await fetchTMDB<{ results: any[] }>("/search/multi", {
      query,
    });
    return {
      ...data,
      results: data.results
        .filter(
          (m) =>
            (m.media_type === "movie" || m.media_type === "tv") &&
            (m.original_language === "en" || m.original_language === "hi"),
        )
        .map((m) => {
          if (m.media_type === "tv") {
            return {
              ...m,
              title: m.name,
              release_date: m.first_air_date,
            };
          }
          return m;
        }),
    };
  },
  getMovieDetails: (id: string | number) =>
    fetchTMDB<any>(`/movie/${id}`, {
      append_to_response: "credits,videos,watch/providers",
    }),
  getTvDetails: (id: string | number) =>
    fetchTMDB<any>(`/tv/${id}`, {
      append_to_response: "credits,videos,watch/providers",
    }),
  getSimilarTv: (id: string | number) =>
    fetchTMDB<{ results: any[] }>(`/tv/${id}/similar`),
  getMovieByImdbId: async (imdbId: string) => {
    const searchResult = await fetchTMDB<{ movie_results: any[] }>(
      `/find/${imdbId}`,
      { external_source: "imdb_id" },
    );
    if (searchResult.movie_results.length > 0) {
      return searchResult.movie_results[0];
    }
    return null;
  },
  getImageUrl: (
    path: string | null,
    size: "w92" | "w185" | "w342" | "w500" | "w780" | "original" = "w500",
  ) =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : "/placeholder.jpg",
};
