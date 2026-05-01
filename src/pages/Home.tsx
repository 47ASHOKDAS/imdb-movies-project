import React, { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import Hero from '../components/movies/Hero';
import MovieCard from '../components/movies/MovieCard';
import { MovieGridSkeleton } from '../components/ui/Skeleton';
import SEO from '../components/common/SEO';
import Sidebar, { GENRES } from '../components/layout/Sidebar';
import { TrendingUp, Star, Zap, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [trendingRes, topRatedRes, actionRes] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getTopRated(),
          tmdbService.getMoviesByGenre(28) // Action is 28
        ]);
        setTrending(trendingRes.results);
        setTopRated(topRatedRes.results);
        setActionMovies(actionRes.results);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchGenreMovies = async () => {
      if (selectedGenre === 'all') return;
      try {
        const res = await tmdbService.getMoviesByGenre(selectedGenre);
        setGenreMovies(res.results);
      } catch (error) {
        console.error('Error fetching genre movies:', error);
      }
    };
    fetchGenreMovies();
  }, [selectedGenre]);

  if (loading) {
    return (
      <div className="pt-20 bg-obsidian min-h-screen">
        <div className="h-[80vh] bg-zinc-900/20 animate-pulse rounded-3xl mx-8 mt-8" />
      </div>
    );
  }

  const Section = ({ title, movies, icon: Icon, color }: any) => (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-xl bg-opacity-10", color.replace('text-', 'bg-'))}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
          <h2 className="text-2xl font-display font-black tracking-tight uppercase">
            {title}
          </h2>
        </div>
        <Link to="/search" className="group flex items-center gap-2 text-[10px] font-black tracking-widest text-zinc-500 hover:text-brand transition-colors">
          VIEW ALL <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
        {movies.slice(0, 10).map((movie: Movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-obsidian min-h-screen text-white flex">
      <SEO 
        title="IMDBflix - Discover Movies" 
        description="Stream top-rated movies and find your next favorite film on IMDBflix."
      />
      
      <Sidebar selectedGenre={selectedGenre} onSelectGenre={setSelectedGenre} />

      <main className="flex-grow lg:pl-64">
        {/* Mobile Genre Selector */}
        <div className="lg:hidden flex gap-4 overflow-x-auto px-8 py-6 sticky top-20 z-30 bg-obsidian/80 backdrop-blur-xl border-b border-white/5 no-scrollbar">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={cn(
                "whitespace-nowrap px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase transition-all",
                selectedGenre === genre.id 
                  ? "bg-brand text-white shadow-lg shadow-brand/20" 
                  : "bg-white/5 text-zinc-500 hover:text-white"
              )}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {selectedGenre === 'all' ? (
          <>
            {trending.length > 0 && <Hero movie={trending[0]} />}
            
            <div className="px-8 md:px-12 pb-20 -mt-20 relative z-20">
              <Section 
                title="Trending Now" 
                movies={trending.slice(1)} 
                icon={TrendingUp} 
                color="text-brand"
              />

              <Section 
                title="Top Rated" 
                movies={topRated} 
                icon={Star} 
                color="text-gold"
              />

              <Section 
                title="Action Packed" 
                movies={actionMovies} 
                icon={Zap} 
                color="text-blue-500"
              />
            </div>
          </>
        ) : (
          <div className="pt-32 px-8 md:px-12 pb-20">
            <div className="mb-12">
              <h1 className="text-5xl font-display font-black uppercase mb-4 tracking-tighter">
                {GENRES.find(g => g.id === selectedGenre)?.name} <span className="text-brand">Movies</span>
              </h1>
              <p className="text-zinc-500 font-medium">Discover the best in {GENRES.find(g => g.id === selectedGenre)?.name.toLowerCase()} cinema.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
              {genreMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
