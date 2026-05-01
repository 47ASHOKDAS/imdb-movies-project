export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  original_language?: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  imdb_id?: string;
  media_type?: 'movie' | 'tv' | string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

export interface MovieDetails extends Movie {
  tagline: string | null;
  number_of_seasons?: number;
  credits: {
    cast: CastMember[];
  };
  videos: {
    results: Video[];
  };
  "watch/providers": {
    results: Record<
      string,
      {
        flatrate?: WatchProvider[];
        buy?: WatchProvider[];
        rent?: WatchProvider[];
      }
    >;
  };
}

export interface OMDBData {
  imdbRating: string;
  imdbVotes: string;
  Ratings: { Source: string; Value: string }[];
  [key: string]: any;
}
