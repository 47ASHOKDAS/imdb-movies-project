import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Heart } from "lucide-react";
import { Movie } from "../../types";
import { tmdbService } from "../../services/tmdb";
import { useWatchlist } from "../../context/WatchlistContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../lib/utils";

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, className }) => {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(movie.id);
  const [isExploding, setIsExploding] = useState(false);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
      setIsExploding(true);
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([50, 50, 50]); // Vibrate to give physical feedback
      }
      setTimeout(() => setIsExploding(false), 1000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "100px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative group flex flex-col gap-3 transform-gpu will-change-[transform,opacity]",
        className,
      )}
    >
      <Link
        to={`/${movie.media_type === "tv" || (!movie.media_type && movie.first_air_date) ? "tv" : "movie"}/${movie.id}`}
        className="relative outline-none block"
      >
        <div className="aspect-[2/3] rounded-xl overflow-hidden relative border border-white/5 bg-zinc-900 transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-2xl group-hover:shadow-brand/20 group-hover:border-white/10 transform-gpu will-change-[transform,box-shadow]">
          <img
            src={tmdbService.getImageUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover transition-[transform,filter] duration-300 group-hover:brightness-75 transform-gpu will-change-[filter]"
            loading="lazy"
          />

          {/* Watchlist Toggle */}
          <div className="absolute top-2 left-2 z-10 w-9 h-9">
            <motion.button
              whileTap={{ scale: 0.85 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleWatchlist}
              className="absolute inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center rounded-full border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.5)] overflow-visible"
              aria-label={
                inWatchlist ? "Remove from watchlist" : "Add to watchlist"
              }
            >
              <AnimatePresence>
                {isExploding && (
                  <>
                    {/* Shockwave */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-brand pointer-events-none origin-center"
                      initial={{ scale: 1, opacity: 1, borderWidth: "4px" }}
                      animate={{ scale: 4, opacity: 0, borderWidth: "0px" }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                    {/* Outer Particles */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none origin-center"
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                    >
                      {Array.from({ length: 16 }).map((_, i) => (
                        <motion.div
                          key={`outer-${i}`}
                          className="absolute w-2 h-2 rounded-full top-1/2 left-1/2 -mt-1 -ml-1"
                          style={{
                            background: i % 2 === 0 ? "#ff2a2a" : "#ff7b7b",
                            boxShadow: "0 0 16px currentColor",
                          }}
                          initial={{ x: 0, y: 0, scale: 0 }}
                          animate={{
                            x:
                              Math.cos((i * 22.5 * Math.PI) / 180) *
                              (50 + Math.random() * 40),
                            y:
                              Math.sin((i * 22.5 * Math.PI) / 180) *
                              (50 + Math.random() * 40),
                            scale: [0, 2, 0],
                          }}
                          transition={{ duration: 0.6, ease: "circOut" }}
                        />
                      ))}
                      {/* Inner particles */}
                      {Array.from({ length: 10 }).map((_, i) => (
                        <motion.div
                          key={`inner-${i}`}
                          className="absolute w-1.5 h-1.5 rounded-full top-1/2 left-1/2 -mt-[3px] -ml-[3px]"
                          style={{
                            background: "#fff",
                            boxShadow: "0 0 8px #fff",
                          }}
                          initial={{ x: 0, y: 0, scale: 0 }}
                          animate={{
                            x: Math.cos((i * 36 * Math.PI) / 180) * 30,
                            y: Math.sin((i * 36 * Math.PI) / 180) * 30,
                            scale: [0, 1.5, 0],
                          }}
                          transition={{
                            duration: 0.5,
                            ease: "easeOut",
                            delay: 0.05,
                          }}
                        />
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <motion.div
                animate={
                  isExploding
                    ? {
                        scale: [1, 2, 0.8, 1.4, 0.9, 1.1, 1],
                        rotate: [0, -25, 25, -20, 20, -10, 10, 0],
                        x: [0, -3, 3, -2, 2, -1, 1, 0],
                        y: [0, 3, -3, 2, -2, 1, -1, 0],
                      }
                    : {
                        scale: 1,
                        rotate: 0,
                        x: 0,
                        y: 0,
                      }
                }
                transition={{
                  duration: 0.8,
                  ease: "easeInOut",
                }}
                className="flex items-center justify-center transform-gpu drop-shadow-xl"
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors duration-300",
                    inWatchlist
                      ? "fill-brand text-brand drop-shadow-[0_0_8px_currentColor]"
                      : "text-white/80 drop-shadow-md",
                  )}
                />
              </motion.div>
            </motion.button>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2 right-2 z-10">
            <div className="bg-black/80 backdrop-blur-md text-[11px] font-bold px-2 py-1 rounded-md text-white border border-yellow-500/30 flex items-center gap-1 shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              {movie.vote_average > 0 ? movie.vote_average.toFixed(1) : "NR"}
            </div>
          </div>
        </div>
      </Link>

      <div className="flex flex-col">
        <h3 className="text-current text-sm font-semibold truncate group-hover:text-brand transition-colors">
          {movie.title || movie.name}
        </h3>
        <span className="text-zinc-500 text-xs font-medium">
          {(movie.release_date || movie.first_air_date)?.split("-")[0] ||
            "Unknown"}
        </span>
      </div>
    </motion.div>
  );
};

export default MovieCard;
