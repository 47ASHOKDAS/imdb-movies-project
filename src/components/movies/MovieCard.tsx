import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Plus, Check, Play } from 'lucide-react';
import { Movie } from '../../types';
import { tmdbService } from '../../services/tmdb';
import { useWatchlist } from '../../context/WatchlistContext';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, className }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05, y: -10 }}
      className={cn("relative group", className)}
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="aspect-[2/3] rounded-2xl overflow-hidden relative glass-card border-white/5 transition-all duration-500 group-hover:border-brand/40 group-hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]">
          <img
            src={tmdbService.getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-50"
            loading="lazy"
          />
          
          {/* Neon Rating Badge */}
          <div className="absolute top-4 left-4 z-10 transition-transform duration-300 group-hover:scale-110">
            <div className="backdrop-blur-xl bg-black/60 text-[10px] font-black px-2.5 py-1.5 rounded-lg text-white border border-brand/50 flex items-center gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.4)]">
              <Star className="w-3 h-3 text-brand fill-brand" />
              {movie.vote_average.toFixed(1)}
            </div>
          </div>

          {/* Quick Info Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-obsidian via-obsidian/80 to-transparent translate-y-2 group-hover:translate-y-0 transition-all duration-500">
            <h3 className="text-white text-base font-display font-black leading-tight group-hover:text-brand transition-colors mb-2">
              {movie.title}
            </h3>
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              <span className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase">
                {movie.release_date?.split('-')[0] || 'N/A'}
              </span>
              <span className="w-1 h-1 bg-brand rounded-full shadow-[0_0_5px_#8b5cf6]" />
              <span className="text-accent text-[10px] font-bold tracking-widest uppercase">
                Trending
              </span>
            </div>
          </div>

          {/* Play Icon Centered (only on hover) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100 pointer-events-none">
            <div className="w-14 h-14 bg-brand rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.8)]">
              <Play className="w-7 h-7 text-white fill-current ml-1" />
            </div>
          </div>
        </div>
      </Link>

      {/* Futuristic Watchlist Button */}
      <button
        onClick={handleWatchlist}
        className={cn(
          "absolute top-4 right-4 z-20 w-10 h-10 rounded-xl backdrop-blur-2xl border transition-all duration-500 transform",
          inWatchlist 
            ? "bg-brand border-brand text-white scale-100 shadow-[0_0_15px_rgba(139,92,246,0.5)]" 
            : "bg-black/60 border-white/10 text-white opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 hover:bg-brand hover:border-brand"
        )}
      >
        {inWatchlist ? <Check className="w-5 h-5 mx-auto" /> : <Plus className="w-5 h-5 mx-auto" />}
      </button>
    </motion.div>
  );
};

export default MovieCard;
