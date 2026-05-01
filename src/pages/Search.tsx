import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search as SearchIcon, Link as LinkIcon, Info, Loader2, Star } from 'lucide-react';
import { Movie } from '../types';
import { tmdbService } from '../services/tmdb';
import MovieCard from '../components/movies/MovieCard';
import { MovieGridSkeleton } from '../components/ui/Skeleton';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(urlQuery);
  const [results, setResults] = useState<Movie[]>([]);
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const suggestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
      handleSearch(urlQuery);
    }
  }, [urlQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if it's an IMDb link
      const imdbRegex = /tt\d+/;
      const imdbMatch = searchQuery.match(imdbRegex);

      if (imdbMatch) {
        const imdbId = imdbMatch[0];
        const movie = await tmdbService.getMovieByImdbId(imdbId);
        if (movie) {
          navigate(`/movie/${movie.id}`);
          return;
        } else {
          setError("Couldn't find any movie with that IMDb ID.");
          setResults([]);
        }
      } else {
        // Regular search
        const res = await tmdbService.searchMulti(searchQuery);
        setResults(res.results);
        if (res.results.length === 0) {
          setError("No titles found for your search.");
        }
      }
    } catch (err) {
      setError("An error occurred while searching. Please check your API key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await tmdbService.searchMulti(query);
        setSuggestions(res.results.slice(0, 8));
        setShowSuggestions(true);
      } catch (e) {
        console.error(e);
      }
    };

    const timer = setTimeout(() => {
      if (query && query !== urlQuery) fetchSuggestions();
    }, 300);
    return () => clearTimeout(timer);
  }, [query, urlQuery]);

  const onSelectSuggestion = (movie: Movie) => {
    navigate(`/${movie.media_type === 'tv' ? 'tv' : 'movie'}/${movie.id}`);
    setShowSuggestions(false);
  };

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col items-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black mb-8 tracking-tighter text-center"
        >
          EXPLORE <span className="text-brand">MOVIES</span>
        </motion.h1>

        <div className="w-full max-w-3xl relative" ref={suggestionRef}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowSuggestions(true)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch(query);
                setShowSuggestions(false);
              }
            }}
            placeholder="Search movie titles or paste IMDb link..."
            className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-16 text-lg focus:border-brand outline-none transition-all glass shadow-2xl"
          />
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-500" />
          
          <AnimatePresence>
            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute right-5 top-1/2 -translate-y-1/2"
              >
                <Loader2 className="w-6 h-6 animate-spin text-brand" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-4 bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-50 glass backdrop-blur-3xl"
              >
                <div className="py-4">
                  <p className="px-6 pb-2 text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Suggestions</p>
                  {suggestions.map((movie) => (
                    <button
                      key={movie.id}
                      onClick={() => onSelectSuggestion(movie)}
                      className="w-full flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors text-left group"
                    >
                      <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-800 shadow-lg shadow-black/50">
                        <img
                          src={tmdbService.getImageUrl(movie.poster_path)}
                          alt={movie.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <h4 className="text-lg font-bold truncate group-hover:text-brand transition-colors">
                          {movie.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-zinc-500 font-bold">
                            {movie.release_date?.split('-')[0] || 'N/A'}
                          </span>
                          <div className="flex items-center gap-1.5 text-yellow-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-xs font-black">{movie.vote_average.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      handleSearch(query);
                      setShowSuggestions(false);
                    }}
                    className="w-full py-4 text-center text-xs uppercase tracking-widest font-black text-zinc-600 hover:text-white transition-colors border-t border-white/5 bg-black/20"
                  >
                    View All Results
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex gap-4 text-xs font-medium text-zinc-500">
          <span className="flex items-center gap-1">
            <Info className="w-3 h-3" />
            Paste IMDb links (e.g. imdb.com/title/tt...)
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-zinc-500 text-lg">{error}</p>
          </motion.div>
        ) : loading ? (
          <MovieGridSkeleton count={12} />
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            {results.map((movie, index) => (
              <motion.div 
                key={movie.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Search;
