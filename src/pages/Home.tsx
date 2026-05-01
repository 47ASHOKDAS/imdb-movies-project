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
    
    let isMounted = true;

    const fetchFirstPage = async () => {
      setLoading(true);
      setGenreMovies([]); // Clear previous category movies
      setPage(1);
      try {
        const res = await tmdbService.getMoviesByGenre(selectedGenre, 1);
        if (isMounted) {
          setGenreMovies(res.results);
          setPage(1);
          setHasMore(res.total_pages > 1);
        }
      } catch (error) {
        console.error('Error fetching genre movies:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFirstPage();
    window.scrollTo(0, 0);

    return () => { isMounted = false; };
  }, [selectedGenre]);

  const loadMore = React.useCallback(async () => {
    if (loadingMore || !hasMore || selectedGenre === 'all') return;
    
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await tmdbService.getMoviesByGenre(selectedGenre, nextPage);
      setGenreMovies(prev => {
        const existingIds = new Set(prev.map(m => m.id));
        const newMovies = res.results.filter(m => !existingIds.has(m.id));
        return [...prev, ...newMovies];
      });
      setPage(nextPage);
      setHasMore(nextPage < res.total_pages && nextPage < 500);
    } catch (error) {
      console.error('Error loading more movies:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, selectedGenre, page]);

  // Target ref for intersection observer
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: '400px' } // Pre-load 400px before reaching the bottom
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, loadingMore]);

  if (loading && genreMovies.length === 0) {
    return (
      <div className="pt-20 bg-obsidian min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
      </div>
    );
  }

  const Section = ({ title, movies }: { title: string, movies: Movie[] }) => (
    <div className="mb-12 relative group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-8 bg-brand rounded-full" />
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">
            {title}
          </h2>
        </div>
        <Link to="/search" className="text-sm font-semibold tracking-wide text-brand hover:text-brand/80 transition-colors">
          View All
        </Link>
      </div>
      <div className="relative">
        <div className="flex overflow-x-auto gap-4 md:gap-6 pb-6 pt-2 no-scrollbar scroll-smooth snap-x">
          {movies.slice(0, 15).map((movie: Movie) => (
            <div key={movie.id} className="min-w-[140px] md:min-w-[180px] snap-start">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        
        {/* Right Fade/Scroll Indicator */}
        <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-l from-obsidian to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-end pr-2 hidden md:flex">
          <div className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 pointer-events-auto cursor-pointer hover:bg-brand hover:border-brand transition-all">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
        </div>
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

      <main className="flex-grow w-full">
        {selectedGenre === 'all' ? (
          <>
            {trending.length > 0 && <Hero movie={trending[0]} />}
            
            <div className="px-6 md:px-12 pb-20 -mt-8 relative z-20">
              <Section 
                title="Trending Now" 
                movies={trending.slice(1)} 
              />

              <Section 
                title="Top Rated" 
                movies={topRated} 
              />

              <Section 
                title="Action Packed" 
                movies={actionMovies} 
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
              <div ref={loadMoreRef} className="py-20 flex justify-center w-full">
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
