import React, { useEffect, useState } from 'react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import Hero from '../components/movies/Hero';
import MovieCard from '../components/movies/MovieCard';
import { MovieGridSkeleton } from '../components/ui/Skeleton';
import SEO from '../components/common/SEO';
import Sidebar, { GENRES } from '../components/layout/Sidebar';
import { TrendingUp, Star, Zap, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Group movies by year
  const groupMoviesByYear = (movies: Movie[]) => {
    const groups: { [key: string]: Movie[] } = {};
    movies.forEach(movie => {
      const year = movie.release_date ? movie.release_date.split('-')[0] : 'Unknown';
      if (!groups[year]) groups[year] = [];
      groups[year].push(movie);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [trendingRes, topRatedRes, actionRes] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getTopRated(),
          tmdbService.getMoviesByGenre(28)
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
    if (selectedGenre === 'all') fetchInitialData();
  }, [selectedGenre]);

  useEffect(() => {
    if (selectedGenre === 'all') return;
    
    const fetchFirstPage = async () => {
      setLoading(true);
      setPage(1);
      setGenreMovies([]);
      try {
        const res = await tmdbService.getMoviesByGenre(selectedGenre, 1);
        setGenreMovies(res.results);
        setHasMore(res.total_pages > 1);
      } catch (error) {
        console.error('Error fetching genre movies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFirstPage();
    window.scrollTo(0, 0);
  }, [selectedGenre]);

  const loadMore = async () => {
    if (loadingMore || !hasMore || selectedGenre === 'all') return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await tmdbService.getMoviesByGenre(selectedGenre, nextPage);
      setGenreMovies(prev => [...prev, ...res.results]);
      setPage(nextPage);
      setHasMore(nextPage < res.total_pages);
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Intersection Observer for Infinite Scroll
  const observer = React.useRef<IntersectionObserver | null>(null);
  const lastMovieElementRef = React.useCallback((node: HTMLDivElement) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore, selectedGenre, page]);

  if (loading && genreMovies.length === 0) {
    return (
      <div className="pt-20 bg-obsidian min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
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

  const moviesByYear = groupMoviesByYear(genreMovies);

  return (
    <div className="bg-obsidian min-h-screen text-white flex">
      <SEO 
        title={selectedGenre === 'all' ? "IMDBflix - Discover Movies" : `${GENRES.find(g => g.id === selectedGenre)?.name} Movies | IMDBflix`}
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
            <div className="mb-16">
              <span className="text-brand font-black text-xs tracking-[0.4em] uppercase mb-4 block">Collection</span>
              <h1 className="text-5xl md:text-7xl font-display font-black uppercase mb-4 tracking-tighter">
                {GENRES.find(g => g.id === selectedGenre)?.name} <span className="text-zinc-500">Movies</span>
              </h1>
              <div className="h-1 w-24 bg-brand rounded-full mb-6" />
              <p className="text-zinc-500 font-medium text-lg">Browse through our vast library of {GENRES.find(g => g.id === selectedGenre)?.name.toLowerCase()} films, sorted by release date.</p>
            </div>

            <div className="space-y-20">
              {moviesByYear.map(([year, movies]) => (
                <div key={year} className="relative">
                  <div className="sticky top-40 z-20 mb-10 flex items-center gap-10">
                    <h2 className="text-4xl font-display font-black text-white/90 drop-shadow-2xl">{year}</h2>
                    <div className="h-[1px] flex-grow bg-white/5 backdrop-blur-sm" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                    {movies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Trigger for Infinite Scroll */}
            {hasMore && (
              <div ref={lastMovieElementRef} className="py-20 flex justify-center">
                {loadingMore && <Loader2 className="w-10 h-10 text-brand animate-spin" />}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
