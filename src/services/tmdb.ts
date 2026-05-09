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
    providerId?: string,
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

    if (providerId && providerId !== "all") {
      params.with_watch_providers = providerId;
      params.watch_region = "IN";
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
  getMoviesByCategoryName: async (categoryName: string, providerId: string) => {
    // Map category name to TMDB discover params
    const params: Record<string, string> = {
      sort_by: "popularity.desc",
      with_watch_providers: providerId,
      watch_region: "IN",
    };

    const name = categoryName.toLowerCase();
    
    // Genres mapping
    const genreMap: Record<string, string> = {
      'action and adventure': '28,12',
      'anime': '16',
      'comedy': '35',
      'documentary': '99',
      'drama': '18',
      'fantasy': '14',
      'horror': '27',
      'kids': '10751',
      'mystery and thrillers': '9648,53',
      'romance': '10749',
      'science fiction': '878',
      'suspense': '53'
    };

    // Language mapping
    const langMap: Record<string, string> = {
      'english': 'en',
      'hindi': 'hi',
      'telugu': 'te',
      'tamil': 'ta',
      'malayalam': 'ml'
    };

    let fetchMovie = true;
    let fetchTv = true;

    if (genreMap[name]) {
      params.with_genres = genreMap[name];
    } else if (langMap[name]) {
      params.with_original_language = langMap[name];
    } else if (name === 'award winners') {
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = '2000';
    } else if (name === 'amazon originals' || name === 'included with prime') {
       // Just general popular for the provider
    } else if (name === 'movies' || name === 'movie') {
       fetchTv = false;
    } else if (name === 'tv' || name === 'tv shows') {
       fetchMovie = false;
    } else {
       // fallback to search with multiple pages
       const pList = await Promise.all([
         tmdbService.searchWithProvider(categoryName, providerId, 1).catch(() => ({ results: [] })),
         tmdbService.searchWithProvider(categoryName, providerId, 2).catch(() => ({ results: [] })),
         tmdbService.searchWithProvider(categoryName, providerId, 3).catch(() => ({ results: [] })),
       ]);
       const allRes = pList.flatMap(p => p.results).map(m => (!m.media_type ? { ...m, media_type: m.first_air_date ? 'tv' : 'movie', title: m.name || m.title } : m));
       const uniqueRes = Array.from(new Map(allRes.map(item => [`${item.id}-${item.media_type}`, item])).values());
       return { results: uniqueRes };
    }

    const promises = [];
    if (fetchMovie) {
       promises.push(
         fetchTMDB<{ results: any[] }>("/discover/movie", { ...params, page: "1" }).catch(() => ({ results: [] })),
         fetchTMDB<{ results: any[] }>("/discover/movie", { ...params, page: "2" }).catch(() => ({ results: [] })),
         fetchTMDB<{ results: any[] }>("/discover/movie", { ...params, page: "3" }).catch(() => ({ results: [] }))
       );
    }
    if (fetchTv) {
       promises.push(
         fetchTMDB<{ results: any[] }>("/discover/tv", { ...params, page: "1" }).catch(() => ({ results: [] })),
         fetchTMDB<{ results: any[] }>("/discover/tv", { ...params, page: "2" }).catch(() => ({ results: [] })),
         fetchTMDB<{ results: any[] }>("/discover/tv", { ...params, page: "3" }).catch(() => ({ results: [] }))
       );
    }
    
    const pages = await Promise.all(promises);
    
    const allResults = pages.flatMap(p => p.results).map(m => (!m.media_type ? { ...m, media_type: m.first_air_date ? 'tv' : 'movie', title: m.name || m.title } : m));
    // remove duplicates based on id + media_type
    const uniqueResults = Array.from(new Map(allResults.map(item => [`${item.id}-${item.media_type}`, item])).values());
    
    // Shuffle the results to mix TV and Movies
    const shuffled = uniqueResults.sort(() => 0.5 - Math.random());
    
    return { results: shuffled };
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
  searchWithProvider: async (query: string, providerId: string, page: number = 1) => {
    const data = await fetchTMDB<{ results: any[] }>("/search/multi", { query, page: page.toString() });
    
    // Filter to only movies and tv shows
    const baseResults = data.results
      .filter(
        (m) =>
          (m.media_type === "movie" || m.media_type === "tv") &&
          (m.original_language === "en" || m.original_language === "hi")
      )
      .map((m) => {
        if (m.media_type === "tv") {
          return { ...m, title: m.name, release_date: m.first_air_date };
        }
        return m;
      });

    // Check watch providers for each result
    const filteredResults = await Promise.all(
      baseResults.map(async (item) => {
        try {
          const providersData = await fetchTMDB<any>(`/${item.media_type}/${item.id}/watch/providers`);
          const inRegion = providersData.results?.IN || providersData.results?.US;
          
          if (!inRegion) return null;

          const hasProvider = 
            inRegion.flatrate?.some((p: any) => p.provider_id.toString() === providerId.toString()) ||
            inRegion.rent?.some((p: any) => p.provider_id.toString() === providerId.toString()) ||
            inRegion.buy?.some((p: any) => p.provider_id.toString() === providerId.toString());
            
          return hasProvider ? item : null;
        } catch (e) {
          return null;
        }
      })
    );

    return {
      ...data,
      results: filteredResults.filter(Boolean)
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
