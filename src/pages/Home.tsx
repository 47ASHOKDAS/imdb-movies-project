import React, { useEffect, useState } from "react";
import { tmdbService } from "../services/tmdb";
import { Movie } from "../types";
import MovieCard from "../components/movies/MovieCard";
import { MovieGridSkeleton, Skeleton } from "../components/ui/Skeleton";
import SEO from "../components/common/SEO";
import ErrorMessage from "../components/common/ErrorMessage";
import { GENRES, PROVIDERS } from "../components/layout/Sidebar";
import { TrendingUp, Star, Zap, ChevronRight, Loader2, Play } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

interface HomeProps {
  type?: "movie" | "tv";
}

function CinematicHero({ trendingMovies, type }: { trendingMovies: Movie[]; type: "movie" | "tv" }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (trendingMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.min(trendingMovies.length, 5));
    }, 8000);
    return () => clearInterval(interval);
  }, [trendingMovies.length]);

  if (trendingMovies.length === 0) return null;
  const movie = trendingMovies[currentIndex];
  const backdropUrl = tmdbService.getImageUrl(movie.backdrop_path, "original");
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const releaseYear = movie.release_date 
    ? new Date(movie.release_date).getFullYear() 
    : (movie.first_air_date ? new Date(movie.first_air_date).getFullYear() : "N/A");

  return (
    <div className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden bg-black rounded-3xl mt-8 mb-16 border border-white/5 shadow-2xl shadow-cyan-500/5 group">
      <AnimatePresence mode="wait">
        <motion.div 
          key={movie.id}
          initial={{ opacity: 0, scale: 1.03 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src={backdropUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover animate-hero-bg opacity-70 md:opacity-80" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/45 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/75 to-transparent w-full md:w-2/3" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-20 container mx-auto px-6 md:px-12 flex flex-col justify-end pb-8 md:pb-12">
        <div className="max-w-2xl bg-black/20 p-6 md:p-8 rounded-2xl backdrop-blur-sm border border-white/5">
          <motion.div 
            key={`meta-${movie.id}`} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-center gap-3 mb-4"
          >
            <span className="px-2.5 py-0.5 rounded-md bg-cyan-400/10 text-cyan-400 border border-cyan-400/25 text-[10px] font-mono font-bold uppercase tracking-wider">PREMIERE</span>
            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/55 px-2.5 py-0.5 rounded-md backdrop-blur-md">
              <Star size={13} fill="currentColor" className="text-amber-400" /> {rating}
            </span>
            <span className="text-xs text-zinc-400 font-bold bg-black/55 px-2.5 py-0.5 rounded-md font-mono">{releaseYear}</span>
          </motion.div>
          
          <motion.h1 
            key={`title-${movie.id}`} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-2xl md:text-4xl lg:text-5xl font-display font-black mb-3 text-white uppercase tracking-tight line-clamp-1"
          >
            {movie.title}
          </motion.h1>
          
          <motion.p 
            key={`desc-${movie.id}`} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-zinc-300 text-xs md:text-sm mb-6 line-clamp-3 leading-relaxed font-light"
          >
            {movie.overview}
          </motion.p>
          
          <motion.div 
            key={`actions-${movie.id}`} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <Link 
              to={`/${type}/${movie.id}`} 
              className="px-5 py-2.5 bg-white text-black rounded-lg font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Play fill="currentColor" size={14} /> VIEW DETAILS
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

const Home = ({ type = "movie" }: HomeProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedGenre = searchParams.get("genre") || "all";
  const selectedYear = searchParams.get("year") || "";
  const selectedProvider = searchParams.get("provider") || "all";

  const setSelectedYear = (yearStr: string) => {
    const newParams: any = {};
    if (selectedGenre !== "all") newParams.genre = selectedGenre;
    if (selectedProvider !== "all") newParams.provider = selectedProvider;
    if (yearStr) newParams.year = yearStr;
    setSearchParams(newParams);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(50), (val, index) => currentYear - index);

  const [trending, setTrending] = useState<Movie[]>([]);
  const [bollywood, setBollywood] = useState<Movie[]>([]);
  const [hollywood, setHollywood] = useState<Movie[]>([]);
  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGridMode = selectedGenre !== "all" || !!selectedYear || selectedProvider !== "all";

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendingRes, bollywoodRes, hollywoodRes] = await Promise.all([
        tmdbService.getTrending(type),
        tmdbService.getBollywood(type),
        tmdbService.getHollywood(type),
      ]);
      setTrending(trendingRes.results);
      setBollywood(bollywoodRes.results);
      setHollywood(hollywoodRes.results);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load movies. Please try again.");
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGridMode) fetchInitialData();
  }, [isGridMode, type]);

  const fetchFirstPage = async () => {
    setLoading(true);
    setError(null);
    setGenreMovies([]); // Clear previous category movies
    setPage(1);
    try {
      const res = await tmdbService.getMoviesByGenre(
        selectedGenre,
        1,
        type,
        selectedYear,
        selectedProvider
      );
      setGenreMovies(res.results);
      setPage(1);
      setHasMore(res.total_pages > 1);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load category. Please try again.");
      console.error("Error fetching genre movies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGridMode) return;
    fetchFirstPage();
    window.scrollTo(0, 0);
  }, [isGridMode, selectedGenre, type, selectedYear, selectedProvider]);

  const loadMore = React.useCallback(async () => {
    if (loadingMore || !hasMore || !isGridMode) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await tmdbService.getMoviesByGenre(
        selectedGenre,
        nextPage,
        type,
        selectedYear,
        selectedProvider
      );
      setGenreMovies((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMovies = res.results.filter((m) => !existingIds.has(m.id));
        return [...prev, ...newMovies];
      });
      setPage(nextPage);
      setHasMore(nextPage < res.total_pages && nextPage < 500);
    } catch (error) {
      console.error("Error loading more movies:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, selectedGenre, page, isGridMode, type, selectedYear, selectedProvider]);

  // Target ref for intersection observer
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "400px" }, // Pre-load 400px before reaching the bottom
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, loadingMore]);


  const Section = ({
    title,
    movies,
    slug,
    isLoading,
  }: {
    title: string;
    movies: Movie[];
    slug: string;
    isLoading?: boolean;
  }) => {
    return (
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-brand rounded-full" />
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
          {!isLoading && movies.length > 0 && (
            <Link
              to={`/category/${type}/${slug}`}
              className="text-sm font-semibold tracking-wide text-brand hover:text-brand/80 transition-colors"
            >
              View All
            </Link>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="aspect-[2/3] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
            {movies.slice(0, 10).map((movie: Movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-transparent min-h-screen text-current flex">
      <SEO
        title={
          selectedProvider !== "all"
            ? `${PROVIDERS.find((p) => p.id === selectedProvider)?.name} ${type === "tv" ? "TV Shows" : "Movies"} | IMDBflix`
            : selectedGenre !== "all"
              ? `${GENRES.find((g) => g.id === selectedGenre)?.name} ${type === "tv" ? "TV Shows" : "Movies"} | IMDBflix`
              : `IMDBflix - Discover ${type === "tv" ? "TV Shows" : "Movies"}`
        }
        description={`Stream top-rated ${type === "tv" ? "shows" : "movies"} and find your next favorite film on IMDBflix.`}
      />

      <main className="flex-grow w-full">
        {error ? (
          <div className="pt-40 px-6 flex items-center justify-center">
            <ErrorMessage 
              message={error} 
              onRetry={isGridMode ? fetchFirstPage : fetchInitialData} 
            />
          </div>
        ) : !isGridMode ? (
          <div className="pt-24 px-6 md:px-12 pb-20 relative z-20">
            <CinematicHero trendingMovies={trending} type={type} />

            <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight uppercase">
                  Discover <span className="text-brand">{type === "movie" ? "Movies" : "TV Shows"}</span>
                </h1>
                <p className="text-zinc-500 mt-2 text-sm tracking-wide">
                  Explore top recommendations and curated libraries on our NEXUS grid.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <label
                  htmlFor="year-select-home"
                  className="text-[10px] font-bold text-cyan-400 font-mono uppercase tracking-[0.2em]"
                >
                  SYS_FILTER_YEAR
                </label>
                <div className="relative">
                  <select
                    id="year-select-home"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-[#0d0d12]/60 border border-white/5 text-zinc-300 rounded-xl outline-none cursor-pointer px-4 py-3 font-mono font-bold backdrop-blur-md hover:bg-zinc-900/80 transition-colors appearance-none"
                  >
                    <option
                      value=""
                      className="bg-[#030305] text-zinc-300"
                    >
                      ALL REALMS
                    </option>
                    {years.map((year) => (
                      <option
                        key={year}
                        value={year}
                        className="bg-[#030305] text-zinc-300"
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight className="w-4 h-4 text-cyan-400 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            <Section title="Trending Now" movies={trending} slug="trending" isLoading={loading} />

            <Section title="Bollywood" movies={bollywood} slug="bollywood" isLoading={loading} />

            <Section title="Hollywood" movies={hollywood} slug="hollywood" isLoading={loading} />
          </div>
        ) : (
          <div className="pt-32 px-8 md:px-12 pb-20">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-brand font-black text-xs tracking-[0.4em] uppercase mb-4 block">
                  Collection
                </span>
                <h1 className="text-5xl md:text-7xl font-display font-black uppercase mb-4 tracking-tighter">
                  {selectedProvider !== "all" 
                    ? PROVIDERS.find((p) => p.id === selectedProvider)?.name 
                    : GENRES.find((g) => g.id === selectedGenre)?.name}{" "}
                  <span className="text-zinc-500">{type === "movie" ? "Movies" : "TV Shows"}</span>
                </h1>
                <div className="h-1 w-24 bg-brand rounded-full mb-6" />
                <p className="text-zinc-500 font-medium text-lg">
                  Browse through our vast library of{" "}
                  {selectedProvider !== "all"
                    ? PROVIDERS.find((p) => p.id === selectedProvider)?.name
                    : GENRES.find((g) => g.id === selectedGenre)?.name.toLowerCase()}{" "}
                  {type === "movie" ? "films" : "shows"}, sorted by highest rating.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <label
                  htmlFor="year-select"
                  className="text-xs font-bold text-zinc-500 uppercase tracking-wider"
                >
                  Filter by Year
                </label>
                <div className="relative">
                  <select
                    id="year-select"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full bg-current/5 border border-current/10 text-current rounded-xl outline-none cursor-pointer px-4 py-3 font-bold backdrop-blur-md hover:bg-current/10 appearance-none"
                  >
                    <option
                      value=""
                      className="bg-[var(--theme-bg)] text-current"
                    >
                      All Years
                    </option>
                    {years.map((year) => (
                      <option
                        key={year}
                        value={year}
                        className="bg-[var(--theme-bg)] text-current"
                      >
                        {year}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight className="w-5 h-5 text-zinc-400 rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <MovieGridSkeleton count={10} />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                {genreMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}

            {/* Loading Trigger for Infinite Scroll */}
            {hasMore && (
              <div
                ref={loadMoreRef}
                className="py-20 flex justify-center w-full"
              >
                {loadingMore && (
                  <Loader2 className="w-10 h-10 text-brand animate-spin" />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
