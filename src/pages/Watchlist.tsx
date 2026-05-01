import React from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import MovieCard from '../components/movies/MovieCard';
import { Clapperboard, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const Watchlist: React.FC = () => {
  const { watchlist } = useWatchlist();

  return (
    <div className="pt-32 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-16 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-3 text-brand mb-2">
            <Bookmark className="w-6 h-6 fill-current" />
            <span className="font-bold text-sm uppercase tracking-widest">Personal Collection</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">My Watchlist</h1>
        </div>
        <p className="text-zinc-500 font-medium">
          {watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} saved
        </p>
      </div>

      <AnimatePresence mode="popLayout">
        {watchlist.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            {watchlist.map((movie) => (
              <motion.div
                layout
                key={movie.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 text-center"
          >
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-6">
              <Clapperboard className="w-10 h-10 text-zinc-700" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Your watchlist is empty</h2>
            <p className="text-zinc-500 mb-8 max-w-sm">
              Discover amazing movies and save them here to watch them later.
            </p>
            <Link 
              to="/search" 
              className="bg-brand text-white px-8 py-3 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-brand/20"
            >
              Start Searching
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Watchlist;
