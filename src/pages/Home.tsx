import React, { useEffect, useState } from "react";
import { tmdbService } from "../services/tmdb";
import { Movie } from "../types";
import MovieCard from "../components/movies/MovieCard";
import { MovieGridSkeleton, Skeleton } from "../components/ui/Skeleton";
import SEO from "../components/common/SEO";
import ErrorMessage from "../components/common/ErrorMessage";
import { GENRES, PROVIDERS } from "../components/layout/Sidebar";
import { 
  TrendingUp, 
  Star, 
  Zap, 
  ChevronRight, 
  Loader2, 
  Play, 
  SlidersHorizontal,
  Sparkles,
  Clock,
  Filter,
  Check
} from "lucide-react";
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

  const movieGenres = movie.genre_ids 
    ? movie.genre_ids.map(id => GENRES.find(g => g.id === id.toString())?.name).filter(Boolean).slice(0, 3) 
    : ["Featured"];

  return (
    <div className="relative w-full h-[65vh] md:h-[80vh] overflow-hidden bg-black rounded-3xl mt-4 mb-16 border border-white/5 shadow-2xl shadow-cyan-500/5 group">
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
            className="w-full h-full object-cover animate-hero-bg opacity-70 md:opacity-85" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030305] via-[#030305]/80 to-transparent w-full md:w-2/3" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-20 container mx-auto px-6 md:px-12 flex flex-col justify-end pb-8 md:pb-16">
        <div className="max-w-2xl bg-black/35 p-6 md:p-8 rounded-3xl backdrop-blur-md border border-white/10 shadow-2xl">
          <motion.div 
            key={`meta-${movie.id}`} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-wrap items-center gap-3 mb-4"
          >
            <span className="px-3 py-1 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/25 text-[10px] font-mono font-black uppercase tracking-wider">FEATURED CHOICE</span>
            <span className="flex items-center gap-1 text-amber-400 text-xs font-bold bg-black/60 px-2.5 py-1 rounded-full border border-white/5">
              <Star size={13} fill="currentColor" className="text-amber-400" /> {rating}
            </span>
            <span className="text-xs text-zinc-300 font-bold bg-black/60 px-2.5 py-1 rounded-full font-mono border border-white/5">{releaseYear}</span>
            <div className="flex gap-1.5">
              {movieGenres.map((gName, idx) => (
                <span key={idx} className="text-[10px] text-zinc-400 bg-white/5 px-2.5 py-1 rounded-full">{gName}</span>
              ))}
            </div>
          </motion.div>
          
          <motion.h1 
            key={`title-${movie.id}`} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl lg:text-6xl font-display font-black mb-3 text-white uppercase tracking-tight line-clamp-1"
          >
            {movie.title || movie.name}
          </motion.h1>
          
          <motion.p 
            key={`desc-${movie.id}`} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-zinc-300 text-sm md:text-base mb-6 line-clamp-3 leading-relaxed font-normal"
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
              className="px-6 py-3 bg-brand text-white rounded-2xl font-bold text-xs md:text-sm flex items-center gap-2 hover:bg-brand/90 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 shadow-lg shadow-brand/25 cursor-pointer uppercase tracking-wider"
            >
              <Play fill="currentColor" size={15} /> WATCH NOW
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
  const selectedLang = searchParams.get("lang") || "all";
  const selectedRating = searchParams.get("rating") || "all";

  const updateFilters = (newFilters: Record<string, string>) => {
    const nextParams = new URLSearchParams(searchParams);
    
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val === "all" || !val) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });

    setSearchParams(nextParams);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(50), (val, index) => currentYear - index);

  // Categorized Section States for Premium Content layout
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [recentlyAdded, setRecentlyAdded] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);

  const [genreMovies, setGenreMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGridMode = selectedGenre !== "all" || !!selectedYear || selectedProvider !== "all" || selectedLang !== "all" || selectedRating !== "all";

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [trendingRes, popularRes, topRatedRes, recentlyAddedRes] = await Promise.all([
        tmdbService.getTrending(type),
        tmdbService.getPopular(type),
        tmdbService.getTopRated(type),
        tmdbService.getBollywood(type), // Doubles as recently added / national selections
      ]);
      setTrending(trendingRes.results);
      setPopular(popularRes.results);
      setTopRated(topRatedRes.results);
      setRecentlyAdded(recentlyAddedRes.results);

      // Fetch or Pre-populate Continue Watching watch state progress
      const localProgress = JSON.parse(localStorage.getItem("watch_progress") || "{}");
      const progressList = Object.values(localProgress).sort((a: any, b: any) => b.last_updated - a.last_updated);
      
      if (progressList.length > 0) {
        setContinueWatching(progressList);
      } else {
        // Prepopulate standard demo movies for instant high contrast resume sliders
        setContinueWatching([
          {
            id: 1001,
            title: "Sintel",
            overview: "A girl, her dragon, and an endless search.",
            poster_path: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400&h=600",
            backdrop_path: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
            progress: 68,
            last_updated: Date.now(),
            media_type: "movie",
            vote_average: 7.9
          },
          {
            id: 1002,
            title: "Big Buck Bunny",
            overview: "Giant rabbit, tiny pests, final score.",
            poster_path: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400&h=600",
            backdrop_path: "https://images.unsplash.com/photo-1501183007986-d0d080b147f9",
            progress: 35,
            last_updated: Date.now() - 3600000,
            media_type: "movie",
            vote_average: 7.5
          }
        ]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load movies. Please check your data source.");
      console.error("Error fetching homepage feeds:", e);
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

      let filtered = res.results;
      // Filter by language client-side in fallback
      if (selectedLang !== "all") {
        filtered = filtered.filter(m => m.original_language === selectedLang);
      }
      // Filter by rating client-side in fallback
      if (selectedRating !== "all") {
        const minRating = parseFloat(selectedRating);
        filtered = filtered.filter(m => m.vote_average >= minRating);
      }

      setGenreMovies(filtered);
      setPage(1);
      setHasMore(res.total_pages > 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load category.");
      console.error("Error filtering movies grid:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGridMode) return;
    fetchFirstPage();
    window.scrollTo(0, 0);
  }, [isGridMode, selectedGenre, type, selectedYear, selectedProvider, selectedLang, selectedRating]);

  // Target ref for infinite scroll observer in grid selection
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

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
      
      let filtered = res.results;
      if (selectedLang !== "all") {
        filtered = filtered.filter(m => m.original_language === selectedLang);
      }
      if (selectedRating !== "all") {
        const minRating = parseFloat(selectedRating);
        filtered = filtered.filter(m => m.vote_average >= minRating);
      }

      setGenreMovies((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMovies = filtered.filter((m) => !existingIds.has(m.id));
        return [...prev, ...newMovies];
      });
      setPage(nextPage);
      setHasMore(nextPage < res.total_pages && nextPage < 50);
    } catch (e) {
      console.error("Error loading more movies:", e);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, selectedGenre, page, isGridMode, type, selectedYear, selectedProvider, selectedLang, selectedRating]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, loadingMore]);

  // Premium continues watch layout slider 
  const ContinueWatchingSection = ({ progressList }: { progressList: any[] }) => {
    if (progressList.length === 0) return null;
    return (
      <div className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-8 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
          <h2 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase">
            Continue Watching
          </h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {progressList.map((item) => {
            const backdrop = tmdbService.getImageUrl(item.backdrop_path || item.poster_path, "w500");
            return (
              <div key={item.id} className="relative w-[240px] md:w-[320px] shrink-0 group flex flex-col gap-3 snap-start transform-gpu will-change-transform">
                <Link to={`/${item.media_type || "movie"}/${item.id}`} className="block relative aspect-video rounded-3xl overflow-hidden border border-white/5 bg-zinc-900 hover:border-cyan-400/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-400/10 transition-all duration-300 shadow-lg">
                  <img src={backdrop} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-75" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-[#030305]/20 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                    <p className="text-[10px] text-zinc-400 mt-1 uppercase font-mono font-bold tracking-wider flex items-center gap-1.5">
                      <span className="flex items-center gap-0.5"><Star size={10} fill="currentColor" className="text-amber-400" /> {item.vote_average?.toFixed(1)}</span>
                      <span>•</span>
                      <span>{item.media_type === "tv" ? "TV SHOW" : "MOVIE"}</span>
                    </p>
                  </div>
                  {/* Progress Line */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-800/80">
                    <div className="h-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] transition-all" style={{ width: `${item.progress || 50}%` }} />
                  </div>
                  {/* Play Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="w-12 h-12 bg-cyan-400 text-black rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                      <Play fill="currentColor" className="w-5 h-5 ml-1" />
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Horizontal carousels matching premium OTT structures
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-8 bg-brand rounded-full shadow-[0_0_10px_var(--color-brand)]" />
            <h2 className="text-xl md:text-2xl font-display font-black tracking-tight uppercase">
              {title}
            </h2>
          </div>
          {!isLoading && movies.length > 0 && (
            <Link
              to={`/category/${type}/${slug}`}
              className="text-xs font-bold tracking-widest uppercase text-brand hover:text-brand/80 transition-all flex items-center gap-1.5 group/btn"
            >
              <span>Explore All</span>
              <ChevronRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 w-[160px] md:w-[230px] shrink-0">
                <Skeleton className="aspect-[2/3] w-full rounded-3xl" />
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-3 w-1/2 rounded-full" />
              </div>
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs font-semibold tracking-widest uppercase bg-white/[0.01] border border-white/5 rounded-3xl">
            No items currently available.
          </div>
        ) : (
          <div className="relative group/carousel">
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent scroll-smooth snap-x snap-mandatory">
              {movies.map((movie: Movie) => (
                <div key={movie.id} className="w-[160px] md:w-[230px] shrink-0 snap-start">
                  <MovieCard movie={movie} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Top 8 genres list for chip deck rendering
  const FILTER_GENRES = [
    { id: "all", name: "All Genres" },
    { id: "28", name: "Action" },
    { id: "35", name: "Comedy" },
    { id: "18", name: "Drama" },
    { id: "27", name: "Horror" },
    { id: "878", name: "Sci-Fi" },
    { id: "10749", name: "Romance" },
    { id: "16", name: "Animation" },
  ];

  return (
    <div className="bg-transparent min-h-screen text-current flex">
      <SEO
        title={
          selectedProvider !== "all"
            ? `${PROVIDERS.find((p) => p.id === selectedProvider)?.name} ${type === "tv" ? "TV Shows" : "Movies"} | Cineflix`
            : selectedGenre !== "all"
              ? `${GENRES.find((g) => g.id === selectedGenre)?.name} ${type === "tv" ? "TV Shows" : "Movies"} | Cineflix`
              : `Cineflix - Stream premium ${type === "tv" ? "TV Shows" : "Movies"}`
        }
        description={`Stream top-rated ${type === "tv" ? "shows" : "movies"} and discover new content on Cineflix.`}
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
            {/* Featured Hero */}
            <CinematicHero trendingMovies={trending} type={type} />

            {/* Premium Material Design Filter Deck Control Center */}
            <div className="mb-14 bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-6 md:p-8 backdrop-blur-xl">
              <div className="flex flex-col gap-6">
                
                {/* Section Title */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal size={16} className="text-brand shadow-[0_0_8px_var(--color-brand)]" />
                    <h3 className="text-sm font-display font-black tracking-wider uppercase">Filter Center</h3>
                  </div>
                  {isGridMode && (
                    <button
                      onClick={() => setSearchParams({})}
                      className="text-[10px] font-black tracking-widest text-brand hover:text-brand/80 transition-all uppercase"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>

                {/* Genres Chip Row */}
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-3">GENRE CATALOG</span>
                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                    {FILTER_GENRES.map((gObj) => {
                      const isActive = selectedGenre === gObj.id;
                      return (
                        <button
                          key={gObj.id}
                          onClick={() => updateFilters({ genre: gObj.id })}
                          className={cn(
                            "px-4.5 py-2 rounded-full text-xs font-bold transition-all duration-300 pointer-events-auto cursor-pointer shrink-0 border flex items-center gap-1.5",
                            isActive 
                              ? "bg-brand border-brand text-white shadow-lg shadow-brand/20 scale-[1.03]" 
                              : "bg-[#0b0c10]/40 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/10"
                          )}
                        >
                          {isActive && <Check size={12} className="stroke-[3]" />}
                          <span>{gObj.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dual Column Parameters (Language, Rating, Year) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  
                  {/* Language Selector chips */}
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-3">LANGUAGE REVELATION</span>
                    <div className="flex gap-2 font-mono">
                      {[
                        { id: "all", name: "All" },
                        { id: "en", name: "English" },
                        { id: "hi", name: "Hindi" }
                      ].map((lang) => {
                        const isActive = selectedLang === lang.id;
                        return (
                          <button
                            key={lang.id}
                            onClick={() => updateFilters({ lang: lang.id })}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer pointer-events-auto",
                              isActive
                                ? "bg-cyan-400 border-cyan-400 text-black shadow-lg shadow-cyan-400/20 font-black"
                                : "bg-[#0b0c10]/40 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {lang.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rating selection chips */}
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-3">IMDb RATING THRESHOLD</span>
                    <div className="flex gap-2 font-mono">
                      {[
                        { id: "all", name: "Any" },
                        { id: "7.5", name: "★ 7.5+" },
                        { id: "8.5", name: "★ 8.5+" }
                      ].map((rating) => {
                        const isActive = selectedRating === rating.id;
                        return (
                          <button
                            key={rating.id}
                            onClick={() => updateFilters({ rating: rating.id })}
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer pointer-events-auto",
                              isActive
                                ? "bg-amber-400 border-amber-400 text-black shadow-lg shadow-amber-400/25 font-black"
                                : "bg-[#0b0c10]/40 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                          >
                            {rating.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Year Dropdown */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block mb-1">RELEASE YEAR</span>
                    <div className="relative">
                      <select
                        id="year-select-home"
                        value={selectedYear}
                        onChange={(e) => updateFilters({ year: e.target.value })}
                        className="w-full bg-[#0b0c10]/65 border border-white/5 text-zinc-300 rounded-xl outline-none cursor-pointer px-4 py-2.5 text-xs font-bold backdrop-blur-md hover:bg-zinc-950 transition-colors appearance-none"
                      >
                        <option value="" className="bg-[#030305] text-zinc-400">ALL TIMELINE</option>
                        {years.slice(0, 30).map((year) => (
                          <option key={year} value={year.toString()} className="bg-[#030305] text-zinc-300">
                            {year}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronRight className="w-4 h-4 text-zinc-500 rotate-90" />
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>

            {/* Continuing Progress Section */}
            <ContinueWatchingSection progressList={continueWatching} />

            {/* Categorized sliders row grids */}
            <Section title="Trending Now" movies={trending} slug="trending" isLoading={loading} />

            <Section title="Popular Movies & Shows" movies={popular} slug="popular" isLoading={loading} />

            <Section title="Top Rated Masterpieces" movies={topRated} slug="top-rated" isLoading={loading} />

            <Section title="Recently Added & Regional Hits" movies={recentlyAdded} slug="bollywood" isLoading={loading} />
          </div>
        ) : (
          /* Grid list discover mode (When active filter parameters are engaged) */
          <div className="pt-32 px-8 md:px-12 pb-20">
            <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div>
                <span className="text-brand font-black text-xs tracking-[0.4em] uppercase mb-3 block">
                  Cineflix Query Results
                </span>
                <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight uppercase">
                  Discover <span className="text-brand">{type === "movie" ? "Movies" : "TV Shows"}</span>
                </h1>
                <p className="text-zinc-500 mt-2 text-sm tracking-wide">
                  Explore tailored filter dimensions in our responsive grid layouts.
                </p>
              </div>

              {/* Reset filter dimensions btn */}
              <button
                onClick={() => setSearchParams({})}
                className="px-5 py-2.5 rounded-xl border border-white/5 bg-white/5 text-xs text-zinc-300 font-bold hover:bg-white/10 hover:text-white transition-all pointer-events-auto cursor-pointer"
              >
                Reset Filter Dimensions
              </button>
            </div>

            {loading ? (
              <MovieGridSkeleton />
            ) : genreMovies.length === 0 ? (
              <div className="py-24 text-center">
                <Filter className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-zinc-400 mb-2">No matching cinematiques found</h3>
                <p className="text-zinc-600 text-sm max-w-md mx-auto">
                  Try broadening your selection criteria of genres, languages, release years, or platforms.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
                  {genreMovies.map((movie: Movie) => (
                    <MovieCard key={movie.id} movie={movie} className="w-full" />
                  ))}
                </div>

                {/* Loading indicator for infinite scrolling */}
                <div ref={loadMoreRef} className="py-16 flex justify-center">
                  {loadingMore && (
                    <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs">
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                      <span>STREAMING EXTRA REALMS...</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
