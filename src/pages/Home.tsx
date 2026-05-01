import React, { useEffect, useState } from "react";
import { tmdbService } from "../services/tmdb";
import { Movie } from "../types";
import MovieCard from "../components/movies/MovieCard";
import { MovieGridSkeleton } from "../components/ui/Skeleton";
import SEO from "../components/common/SEO";
import { GENRES } from "../components/layout/Sidebar";
import { TrendingUp, Star, Zap, ChevronRight, Loader2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { cn } from "../lib/utils";

interface HomeProps {
  type?: "movie" | "tv";
}

const Home = ({ type = "movie" }: HomeProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedGenre = searchParams.get("genre") || "all";
  const selectedYear = searchParams.get("year") || "";

  const setSelectedGenre = (genreStr: string) => {
    setSearchParams(
      genreStr === "all" ? {} : { genre: genreStr, year: selectedYear },
    );
  };

  const setSelectedYear = (yearStr: string) => {
    const newParams: any = {};
    if (selectedGenre !== "all") newParams.genre = selectedGenre;
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

  const isGridMode = selectedGenre !== "all" || !!selectedYear;

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
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
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
      }
    };
    if (!isGridMode) fetchInitialData();
  }, [isGridMode, type]);

  useEffect(() => {
    if (!isGridMode) return;

    let isMounted = true;

    const fetchFirstPage = async () => {
      setLoading(true);
      setGenreMovies([]); // Clear previous category movies
      setPage(1);
      try {
        const res = await tmdbService.getMoviesByGenre(
          selectedGenre,
          1,
          type,
          selectedYear,
        );
        if (isMounted) {
          setGenreMovies(res.results);
          setPage(1);
          setHasMore(res.total_pages > 1);
        }
      } catch (error) {
        console.error("Error fetching genre movies:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchFirstPage();
    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [isGridMode, selectedGenre, type, selectedYear]);

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
  }, [loadingMore, hasMore, selectedGenre, page]);

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

  if (loading && genreMovies.length === 0) {
    return (
      <div className="pt-20 bg-obsidian min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
      </div>
    );
  }

  const Section = ({
    title,
    movies,
    slug,
  }: {
    title: string;
    movies: Movie[];
    slug: string;
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
          {movies.length > 0 && (
            <Link
              to={`/category/${type}/${slug}`}
              className="text-sm font-semibold tracking-wide text-brand hover:text-brand/80 transition-colors"
            >
              View All
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
          {movies.slice(0, 10).map((movie: Movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-transparent min-h-screen text-current flex">
      <SEO
        title={
          selectedGenre === "all"
            ? "IMDBflix - Discover Movies"
            : `${GENRES.find((g) => g.id === selectedGenre)?.name} Movies | IMDBflix`
        }
        description="Stream top-rated movies and find your next favorite film on IMDBflix."
      />

      <main className="flex-grow w-full">
        {!isGridMode ? (
          <div className="pt-32 px-6 md:px-12 pb-20 relative z-20">
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight">
                  Discover <span className="text-brand">Movies</span>
                </h1>
                <p className="text-zinc-500 mt-2 text-lg">
                  Explore the best movies across various categories.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <label
                  htmlFor="year-select-home"
                  className="text-xs font-bold text-zinc-500 uppercase tracking-wider"
                >
                  Filter by Year
                </label>
                <div className="relative">
                  <select
                    id="year-select-home"
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

            <Section title="Trending Now" movies={trending} slug="trending" />

            <Section title="Bollywood" movies={bollywood} slug="bollywood" />

            <Section title="Hollywood" movies={hollywood} slug="hollywood" />
          </div>
        ) : (
          <div className="pt-32 px-8 md:px-12 pb-20">
            <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-brand font-black text-xs tracking-[0.4em] uppercase mb-4 block">
                  Collection
                </span>
                <h1 className="text-5xl md:text-7xl font-display font-black uppercase mb-4 tracking-tighter">
                  {GENRES.find((g) => g.id === selectedGenre)?.name}{" "}
                  <span className="text-zinc-500">Movies</span>
                </h1>
                <div className="h-1 w-24 bg-brand rounded-full mb-6" />
                <p className="text-zinc-500 font-medium text-lg">
                  Browse through our vast library of{" "}
                  {GENRES.find(
                    (g) => g.id === selectedGenre,
                  )?.name.toLowerCase()}{" "}
                  films, sorted by highest rating.
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

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 md:gap-8">
              {genreMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

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
