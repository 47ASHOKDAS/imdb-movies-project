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
    <div className="relative h-screen w-full overflow-hidden bg-obsidian">
      {/* Cinematic Background with Multi-Layer Gradients */}
      <motion.div 
        style={{ y: scrollY * 0.3 }}
        className="absolute inset-0 z-0"
      >
        <img
          src={tmdbService.getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          className="w-full h-full object-cover brightness-[0.5]"
        />
        {/* Left Edge Fade for content readability */}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-obsidian via-obsidian/60 to-transparent" />
        {/* Bottom Edge Fade */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
      </motion.div>

      {/* Content Section - Aligned Left for Netflix Look */}
      <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-24">
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl pt-20"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-5 mb-8"
          >
            <div className="flex items-center gap-2 bg-brand/10 border border-brand/30 px-4 py-1.5 rounded-full backdrop-blur-md">
              <span className="w-2 h-2 bg-brand rounded-full animate-pulse shadow-[0_0_10px_#8b5cf6]" />
              <span className="text-[10px] font-black tracking-[0.3em] text-white uppercase">TOP TRENDING</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-gold fill-current" />
              <span className="text-sm font-black text-white">{movie.vote_average.toFixed(1)} Rating</span>
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl md:text-9xl font-display font-black tracking-tighter text-white mb-8 leading-[0.85] uppercase drop-shadow-2xl"
          >
            {movie.title}
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-zinc-300 mb-12 line-clamp-3 leading-relaxed max-w-xl font-medium drop-shadow-lg"
          >
            {movie.overview}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link 
              to={`/movie/${movie.id}`} 
              className="relative group overflow-hidden bg-brand text-white px-10 py-5 rounded-2xl font-black tracking-widest text-sm flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_40px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_60px_rgba(139,92,246,0.5)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-brand via-[#a855f7] to-brand bg-[length:200%_100%] animate-gradient-x" />
              <Play className="w-5 h-5 fill-current relative z-10" />
              <span className="relative z-10">WATCH NOW</span>
            </Link>
            
            <button 
              onClick={handleWatchlist}
              className={cn(
                "px-10 py-5 rounded-2xl font-black tracking-widest text-sm border-2 flex items-center gap-4 transition-all hover:bg-white/10",
                inWatchlist 
                  ? "bg-white/10 border-brand text-brand" 
                  : "bg-white/5 border-white/10 text-white"
              )}
            >
              {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {inWatchlist ? 'IN WATCHLIST' : 'WATCHLIST'}
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Cinematic Gradient at the bottom to blend with the background */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent z-10" />
    </div>
  );
};

export default Hero;
