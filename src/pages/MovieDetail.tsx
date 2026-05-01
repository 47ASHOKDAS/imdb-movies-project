import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, Plus, Check, Star, Calendar, Clock, Trophy, ExternalLink, AlertCircle, Share2 } from 'lucide-react';
import { MovieDetails, OMDBData } from '../types';
import { tmdbService } from '../services/tmdb';
import { omdbService } from '../services/omdb';
import { useWatchlist } from '../context/WatchlistContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [omdbData, setOmdbData] = useState<OMDBData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await tmdbService.getMovieDetails(id);
        setMovie(data);
        
        if (data.imdb_id) {
          const omdb = await omdbService.getMovieByImdbId(data.imdb_id);
          setOmdbData(omdb);
        }
      } catch (error) {
        console.error('Error loading movie details:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMovie();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-obsidian">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl font-display font-black text-brand tracking-tighter"
        >
          IMDB<span className="text-white">flix</span>
        </motion.div>
      </div>
    );
  }

  if (!movie) return <div className="pt-32 text-center text-zinc-500 font-bold">Movie not found</div>;

  const inWatchlist = isInWatchlist(movie.id);
  const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const watchData = movie['watch/providers'].results?.IN;
  const providers = watchData?.flatrate || watchData?.rent || watchData?.buy || [];
  const watchLink = watchData?.link;

  const handleWatchNow = () => {
    if (movie.imdb_id) {
      window.open(`https://www.playimdb.com/title/${movie.imdb_id}/`, '_blank');
    } else if (watchLink) {
      window.open(watchLink, '_blank');
    } else {
      alert('No IMDb ID found for this movie. Unable to redirect to playimdb.');
    }
  };

  return (
    <div className="pb-20 bg-obsidian text-white overflow-x-hidden">
      {/* Cinematic Header Background */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2 }}
          src={tmdbService.getImageUrl(movie.backdrop_path, 'original')}
          alt={movie.title}
          className="w-full h-full object-cover brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/60 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-96 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left: Poster & Rating */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4"
          >
            <div className="relative group mx-auto max-w-sm lg:max-w-none">
              <div className="absolute -inset-4 bg-brand/30 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img 
                src={tmdbService.getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="w-full rounded-[2rem] shadow-2xl relative z-10 border border-white/10"
              />
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowTrailer(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] z-20"
              >
                <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.6)]">
                  <Play className="w-10 h-10 text-white fill-current ml-2" />
                </div>
              </motion.button>
            </div>

            <div className="mt-10 p-8 glass-card rounded-[2rem] space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-zinc-400 text-xs font-black uppercase tracking-widest">IMDb Score</div>
                <div className="flex items-center gap-1.5 text-gold">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-xl font-display font-black text-white">{movie.vote_average.toFixed(1)}</span>
                </div>
              </div>
              {omdbData && (
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="text-zinc-400 text-xs font-black uppercase tracking-widest">Metascore</div>
                  <div className={cn(
                    "px-3 py-1 rounded text-sm font-black text-white",
                    parseInt(omdbData.Metascore) > 75 ? "bg-green-500" : "bg-gold"
                  )}>
                    {omdbData.Metascore}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Right: Info */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 flex flex-col justify-end"
          >
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {movie.genres.map(genre => (
                <span key={genre.id} className="bg-brand/10 border border-brand/30 text-white text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full">
                  {genre.name}
                </span>
              ))}
              <span className="bg-white/5 border border-white/10 text-zinc-400 text-[10px] font-black tracking-widest uppercase px-3 py-1.5 rounded-full flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {movie.runtime}m
              </span>
            </div>

            <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-[0.8] mb-6 uppercase">
              {movie.title}
            </h1>
            
            <p className="text-xl text-zinc-300 leading-relaxed max-w-3xl mb-12 font-medium opacity-80 italic">
              "{movie.tagline}"
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-16">
              <button 
                onClick={handleWatchNow}
                className="btn-neon min-w-[200px] flex items-center justify-center gap-3"
              >
                <Play className="w-5 h-5 fill-current" />
                WATCH NOW
              </button>
              <button 
                onClick={() => inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie)}
                className={cn(
                  "btn-glass min-w-[200px] flex items-center justify-center gap-3",
                  inWatchlist ? "text-brand border-brand/40 bg-brand/5 scale-105" : ""
                )}
              >
                {inWatchlist ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5 group-hover:text-brand transition-colors" />}
                {inWatchlist ? 'IN WATCHLIST' : 'WATCHLIST'}
              </button>
              <button className="btn-glass p-4 rounded-xl">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xs font-black uppercase text-brand tracking-[0.3em] mb-6">Storyline</h3>
                <p className="text-zinc-400 leading-relaxed text-lg font-medium">
                  {movie.overview}
                </p>
              </div>

              <div>
                <h3 className="text-xs font-black uppercase text-brand tracking-[0.3em] mb-6">Where to Watch</h3>
                {providers.length > 0 ? (
                  <div className="flex flex-wrap gap-4">
                    {providers.slice(0, 4).map(p => (
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        key={p.provider_id} 
                        className="w-14 h-14 rounded-2xl overflow-hidden glass-card border-white/10 cursor-pointer shadow-xl shadow-black"
                        onClick={handleWatchNow}
                      >
                        <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} title={p.provider_name} className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-zinc-500 font-medium bg-white/5 p-4 rounded-2xl border border-white/5 max-w-sm">
                    <AlertCircle className="w-5 h-5 opacity-50" />
                    <span className="text-sm">Available soon in India</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cast Section */}
        <section className="mt-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-display font-black tracking-tight">STARRING <span className="text-brand">ACTORS</span></h2>
            <div className="h-[1px] flex-grow mx-8 bg-white/5" />
          </div>
          <div className="flex gap-8 overflow-x-auto pb-8 horizontal-scroll">
            {movie.credits.cast.slice(0, 10).map((actor, idx) => (
              <div 
                key={actor.id} 
                className="flex-shrink-0 w-40 text-center"
              >
                <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-2 border-white/5 shadow-2xl group cursor-pointer ring-offset-4 ring-offset-obsidian hover:ring-2 ring-brand transition-all duration-500">
                  <img 
                    src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/185x185?text=No+Image'} 
                    alt={actor.name} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>
                <h4 className="font-bold text-sm truncate">{actor.name}</h4>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1 truncate">{actor.character}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailer && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <div className="absolute inset-0 bg-obsidian/95 backdrop-blur-3xl" onClick={() => setShowTrailer(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative z-10 w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 bg-black"
            >
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                title="Movie Trailer"
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
              />
              <button 
                onClick={() => setShowTrailer(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center transition-colors"
              >
                <Plus className="w-8 h-8 rotate-45" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetail;
