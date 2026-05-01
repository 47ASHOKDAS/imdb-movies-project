import React, { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import Hero from '../components/movies/Hero';
import MovieCard from '../components/movies/MovieCard';
import { MovieGridSkeleton } from '../components/ui/Skeleton';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronRight, Sparkles, TrendingUp, Star, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendingRes, popularRes] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getPopular()
        ]);
        setTrending(trendingRes.results);
        setPopular(popularRes.results);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="pt-20 bg-obsidian min-h-screen">
        <div className="h-[80vh] bg-zinc-900/20 animate-pulse rounded-3xl mx-8 mt-8" />
        <div className="px-8 mt-12">
          <MovieGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  const MovieSection = ({ title, movies, icon: Icon, accent }: { title: string, movies: Movie[], icon: any, accent: string }) => (
    <section className="mb-20">
      <div className="flex items-center justify-between px-8 md:px-20 mb-8">
        <div className="flex items-center gap-4">
          <div className={cn("p-2 rounded-xl", accent.replace('bg-', 'bg-opacity-10 bg-'))}>
            <Icon className={cn("w-6 h-6", accent.replace('bg-', 'text-'))} />
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-black tracking-tight uppercase">
            {title.split(' ')[0]} <span className="text-zinc-500">{title.split(' ').slice(1).join(' ')}</span>
          </h2>
        </div>
        <Link to="/search" className="group flex items-center gap-2 text-xs font-black tracking-widest text-zinc-500 hover:text-brand transition-colors">
          VIEW ALL <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="flex gap-6 overflow-x-auto px-8 md:px-20 pb-8 horizontal-scroll snap-x">
        {movies.map((movie) => (
          <div key={movie.id} className="flex-shrink-0 w-48 md:w-64 snap-start">
            <MovieCard movie={movie} className="w-full" />
          </div>
        ))}
      </div>
    </section>
  );

  return (
    <div className="bg-obsidian min-h-screen overflow-x-hidden">
      {trending.length > 0 && <Hero movie={trending[0]} />}

      <div className="mt-[-80px] relative z-20 pb-20">
        <MovieSection 
          title="Trending Now" 
          movies={trending.slice(1)} 
          icon={TrendingUp} 
          accent="bg-brand" 
        />

        <MovieSection 
          title="Fan Favorites" 
          movies={popular} 
          icon={Star} 
          accent="bg-gold" 
        />

        {/* Global Stats or Promo Card */}
        <div className="px-8 md:px-20 mb-20">
          <div className="glass-card rounded-[2.5rem] p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand/20 blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 text-brand font-black tracking-widest text-xs uppercase mb-4">
                  <Sparkles className="w-4 h-4" />
                  Premium Experience
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-black mb-6 leading-tight uppercase">
                  UNLIMITED <span className="text-brand">CINEMA</span> IN THE PALM OF YOUR HAND.
                </h2>
                <p className="text-zinc-400 font-medium text-lg leading-relaxed mb-8">
                  Experience movies like never before with crystal clear quality and seamless streaming on any device.
                </p>
                <button className="btn-neon">UPGRADE TO PRO</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-32 h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <MovieSection 
          title="Top Rated" 
          movies={popular.slice().reverse()} 
          icon={Zap} 
          accent="bg-accent" 
        />
      </div>
    </div>
  );
};

export default Home;
