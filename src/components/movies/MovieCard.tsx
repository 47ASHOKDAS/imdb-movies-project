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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn("relative group flex flex-col gap-3", className)}
    >
      <Link to={`/movie/${movie.id}`} className="relative outline-none">
        <div className="aspect-[2/3] rounded-xl overflow-hidden relative border border-white/5 bg-zinc-900 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-brand/20 group-hover:border-white/10">
          <img
            src={tmdbService.getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
            loading="lazy"
          />
          
          {/* Rating Badge */}
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-black/80 backdrop-blur-md text-[11px] font-bold px-2 py-1 rounded-md text-white border border-yellow-500/30 flex items-center gap-1 shadow-lg">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : 'NR'}
            </div>
          </div>

          {/* Quick Add Overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex justify-center">
             <button 
                onClick={handleWatchlist}
                className="w-full bg-white text-black py-2 rounded-md font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
                aria-label={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
             >
                {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {inWatchlist ? "Added" : "Watchlist"}
             </button>
          </div>
        </div>
      </Link>

      <div className="flex flex-col">
        <h3 className="text-white text-sm font-semibold truncate group-hover:text-brand transition-colors">
          {movie.title || movie.name}
        </h3>
        <span className="text-zinc-500 text-xs font-medium">
          {(movie.release_date || movie.first_air_date)?.split('-')[0] || 'Unknown'}
        </span>
      </div>
    </motion.div>
  );
};

export default MovieCard;
