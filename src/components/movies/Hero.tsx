import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check, Star } from 'lucide-react';
import { Movie } from '../../types';
import { tmdbService } from '../../services/tmdb';
import { useWatchlist } from '../../context/WatchlistContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface HeroProps {
  movie: Movie;
}

const Hero: React.FC<HeroProps> = ({ movie }) => {
  const [scrollY, setScrollY] = useState(0);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  return (
    <div className="relative h-[95vh] w-full overflow-hidden bg-obsidian">
      {/* Cinematic Parallax Background */}
      <motion.div 
        style={{ y: scrollY * 0.4 }}
        className="absolute inset-0 z-0"
      >
        <img
          src={tmdbService.getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          className="w-full h-full object-cover brightness-[0.4] scale-110"
        />
        <div className="absolute inset-0 hero-mask" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian/20 to-obsidian" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-20 max-w-7xl mx-auto pt-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          {/* Futuristic Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="bg-brand/20 backdrop-blur-xl border border-brand/40 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
              </span>
              <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">Now Streaming</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-gold fill-current" />
              <span className="text-sm font-black tracking-tighter text-white">{movie.vote_average.toFixed(1)}</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-6xl md:text-8xl font-display font-black tracking-tighter text-white mb-6 leading-[0.9] uppercase"
          >
            {movie.title}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg text-zinc-300 mb-10 line-clamp-3 leading-relaxed max-w-xl font-medium"
          >
            {movie.overview}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link to={`/movie/${movie.id}`} className="btn-neon flex items-center gap-3">
              <Play className="w-5 h-5 fill-current" />
              WATCH NOW
            </Link>
            <button 
              onClick={handleWatchlist}
              className={cn(
                "btn-glass flex items-center gap-3 group",
                inWatchlist ? "text-brand border-brand/50 bg-brand/5 scale-105" : ""
              )}
            >
              {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5 group-hover:text-brand transition-colors" />}
              {inWatchlist ? 'IN WATCHLIST' : 'WATCHLIST'}
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Modern Scroll Indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase">Scroll</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-brand to-transparent rounded-full" />
      </motion.div>
    </div>
  );
};

export default Hero;
