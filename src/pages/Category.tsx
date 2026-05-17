import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { tmdbService } from "../services/tmdb";
import { Movie } from "../types";
import MovieCard from "../components/movies/MovieCard";
import { Loader2, ArrowLeft } from "lucide-react";
import { MovieGridSkeleton } from "../components/ui/Skeleton";
import SEO from "../components/common/SEO";
import ErrorMessage from "../components/common/ErrorMessage";

const getCategoryTitle = (slug: string) => {
  switch (slug) {
    case "trending":
      return "Trending Now";
    case "popular":
      return "Popular";
    case "top_rated":
      return "Top Rated";
    case "bollywood":
      return "Bollywood";
    case "hollywood":
      return "Hollywood";
    default:
      return "Category";
  }
};

const Category = () => {
  const { type = "movie", slug = "trending" } = useParams<{
    type: "movie" | "tv";
    slug: string;
  }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovies = useCallback(async (pageNum: number) => {
    switch (slug) {
      case "trending":
        return await tmdbService.getTrending(type, pageNum);
      case "popular":
        return await tmdbService.getPopular(type, pageNum);
      case "top_rated":
        return await tmdbService.getTopRated(type, pageNum);
      case "bollywood":
        return await tmdbService.getBollywood(type, pageNum);
      case "hollywood":
        return await tmdbService.getHollywood(type, pageNum);
      default:
        return await tmdbService.getTrending(type, pageNum);
    }
  }, [type, slug]);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMovies([]);
    setPage(1);
    try {
      const res = await fetchMovies(1);
      setMovies(res.results);
      setPage(1);
      setHasMore(res.total_pages > 1);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load movies. Please try again.");
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }, [fetchMovies]);

  useEffect(() => {
    fetchInitialData();
    window.scrollTo(0, 0);
  }, [fetchInitialData]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetchMovies(nextPage);
      
      if (res.results.length === 0) {
        setHasMore(false);
        return;
      }

      setMovies((prev) => {
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
  }, [loadingMore, hasMore, loading, page, fetchMovies]);

  const loadMoreRef = useRef<HTMLDivElement>(null);

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

  const title = getCategoryTitle(slug);

  if (loading && movies.length === 0) {
    return (
      <div className="bg-transparent min-h-screen text-current pt-24 pb-20 px-6 md:px-12">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-10 h-10 rounded-full border border-current/10 animate-pulse bg-current/5" />
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-10 bg-brand/50 rounded-full animate-pulse" />
              <div className="h-10 w-48 bg-current/5 rounded-lg animate-pulse" />
            </div>
          </div>
          <MovieGridSkeleton count={12} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-40 px-6 flex items-center justify-center min-h-screen">
        <ErrorMessage message={error} onRetry={fetchInitialData} />
      </div>
    );
  }

  return (
    <div className="bg-transparent min-h-screen text-current pt-24 pb-20 px-6 md:px-12">
      <SEO
        title={`${title} - IMDBflix`}
        description={`Browse ${title.toLowerCase()} on IMDBflix.`}
      />

      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-6 mb-10">
          <Link
            to={type === "tv" ? "/tv" : "/movies"}
            className="w-10 h-10 rounded-full border border-current/20 flex items-center justify-center transition-all hover:bg-current/10"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-current" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-10 bg-brand rounded-full" />
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-tight uppercase">
              {title}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {hasMore && (
          <div ref={loadMoreRef} className="py-20 w-full">
            {loadingMore && (
              <div className="mt-8">
                <MovieGridSkeleton count={6} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
