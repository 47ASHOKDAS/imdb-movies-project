import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tmdbService } from '../../services/tmdb';
import { Movie } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

const SearchInput: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const res = await tmdbService.searchMovies(query);
        setSuggestions(res.results.slice(0, 6));
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (movieId: number) => {
    navigate(`/movie/${movieId}`);
    setQuery('');
    setIsOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setQuery('');
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full group" ref={dropdownRef}>
      <form onSubmit={handleSearchSubmit} className="relative z-50">
        <div className={cn(
          "relative flex items-center transition-all duration-500",
          isOpen ? "scale-[1.01]" : ""
        )}>
          <div className="absolute left-4 text-zinc-500 group-focus-within:text-brand transition-colors duration-300">
            <Search className="w-3.5 h-3.5" />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            placeholder="Search movies..."
            className="w-full bg-white/5 border border-white/10 hover:border-white/20 focus:border-brand/40 focus:bg-white/10 rounded-xl py-2 pl-12 pr-10 text-xs font-semibold text-white placeholder:text-zinc-500 transition-all duration-300 backdrop-blur-xl outline-none shadow-xl"
          />

          <div className="absolute right-3 flex items-center gap-2">
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand" />
            ) : query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1 hover:bg-white/10 rounded-full text-zinc-500 hover:text-white transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (query.trim().length >= 2 || suggestions.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 mt-4 bg-obsidian/80 backdrop-blur-[40px] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-40 p-4"
          >
            <div className="flex items-center gap-2 px-4 mb-4">
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase">Top results</span>
            </div>

            <div className="space-y-2">
              {suggestions.length > 0 ? (
                suggestions.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleSelect(movie.id)}
                    className="w-full flex items-center gap-4 p-3 hover:bg-white/5 rounded-2xl transition-all group text-left"
                  >
                    <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10 glass-card">
                      <img
                        src={tmdbService.getImageUrl(movie.poster_path, 'w92')}
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-bold text-white truncate group-hover:text-brand transition-colors tracking-tight">
                        {movie.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-zinc-500 font-bold">{movie.release_date?.split('-')[0]}</span>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-brand" />
                          <span className="text-[10px] font-black text-zinc-400">{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              ) : !loading && (
                <div className="px-4 py-8 text-center text-zinc-500 italic">
                  No matching results found for "{query}"
                </div>
              )}
            </div>

            {query.trim() && (
              <div className="mt-4 pt-4 border-t border-white/5 px-4">
                <button
                  onClick={handleSearchSubmit}
                  className="w-full text-center text-[10px] font-black tracking-[0.2em] text-zinc-500 hover:text-brand transition-colors uppercase py-2"
                >
                  Press Enter for all results
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchInput;
