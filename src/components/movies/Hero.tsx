import React, { useState, useEffect } from 'react';
import { Play, Info, Plus, Check, Star, ChevronLeft, ChevronRight } from 'lucide-react';
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
    <div className="w-full px-6 md:px-12 pt-28 pb-8">
      <div className="relative h-[55vh] min-h-[400px] md:h-[600px] w-full overflow-hidden rounded-[2rem] bg-obsidian border border-white/5 shadow-2xl">
        {/* Cinematic Background with Multi-Layer Gradients */}
        <motion.div 
          style={{ y: scrollY * 0.15 }}
          className="absolute inset-0 z-0"
        >
          <img
            src={tmdbService.getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover brightness-[0.4]"
          />
          {/* Left Edge Fade for content readability */}
          <div className="absolute inset-y-0 left-0 w-3/4 bg-gradient-to-r from-obsidian/90 via-obsidian/60 to-transparent" />
        </motion.div>

        {/* Content Section - Aligned Left for Netflix Look */}
        <div className="relative z-10 h-full flex flex-col justify-center px-10 md:px-20">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-5 mb-5"
            >
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-md backdrop-blur-md">
                <span className="text-[10px] font-bold tracking-wider text-zinc-300 uppercase">TOP TRENDING</span>
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-5xl md:text-8xl font-display font-black tracking-tighter text-[#e50914] mb-6 leading-[0.85] uppercase drop-shadow-2xl"
              style={{ WebkitTextStroke: '1px rgba(255,0,0,0.3)' }}
            >
              {movie.title || movie.name}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-base md:text-lg text-zinc-300 mb-10 line-clamp-3 leading-relaxed max-w-xl font-medium drop-shadow-lg"
            >
              {movie.overview}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link 
                to={`/movie/${movie.id}`} 
                className="bg-brand hover:bg-brand/90 text-white px-8 py-3 rounded-lg font-semibold text-sm flex items-center gap-3 transition-colors shadow-lg"
              >
                <Play className="w-5 h-5 fill-current" />
                Play Now
              </Link>
              
              <Link 
                to={`/movie/${movie.id}`}
                className="bg-zinc-800/80 hover:bg-zinc-700 text-white px-8 py-3 rounded-lg font-semibold text-sm flex items-center gap-3 transition-colors backdrop-blur-md"
              >
                More Info
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Carousel Arrows */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-20 hidden md:block">
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors z-20 hidden md:block">
          <ChevronRight className="w-8 h-8" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
          <div className="w-6 h-2 rounded-full bg-brand" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
          <div className="w-2 h-2 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
