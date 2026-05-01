import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { tmdbService } from "../services/tmdb";
import { Movie } from "../types";
import MovieCard from "../components/movies/MovieCard";
import { Loader2, ArrowLeft } from "lucide-react";
import SEO from "../components/common/SEO";

const getCategoryTitle = (slug: string) => {
  switch (slug) {
    case "trending":
      return "Trending Now";
    case "popular":
      return "Popular";
    case "top_rated":
      return "Top Rated";
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

  const fetchMovies = async (pageNum: number) => {
    switch (slug) {
      case "trending":
        return await tmdbService.getTrending(type, pageNum);
      case "popular":
        return await tmdbService.getPopular(type, pageNum);
      case "top_rated":
        return await tmdbService.getTopRated(type, pageNum);
      default:
        return await tmdbService.getTrending(type, pageNum);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchInitialData = async () => {
      setLoading(true);
      setMovies([]);
      setPage(1);
      try {
        const res = await fetchMovies(1);
        if (isMounted) {
          setMovies(res.results);
          setPage(1);
          setHasMore(res.total_pages > 1);
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchInitialData();
    window.scrollTo(0, 0);

    return () => {
      isMounted = false;
    };
  }, [type, slug]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await fetchMovies(nextPage);
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
  }, [loadingMore, hasMore, page, type, slug]);

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
      <div className="pt-20 bg-obsidian min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-brand animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-obsidian min-h-screen text-white pt-24 pb-20 px-6 md:px-12">
      <SEO
        title={`${title} - IMDBflix`}
        description={`Browse ${title.toLowerCase()} on IMDBflix.`}
      />

      <div className="max-w-[1600px] mx-auto">
        <div className="flex items-center gap-6 mb-10">
          <Link
            to={type === "tv" ? "/tv" : "/movies"}
            className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-all hover:bg-white/10"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
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
          <div ref={loadMoreRef} className="py-20 flex justify-center w-full">
            {loadingMore && (
              <Loader2 className="w-10 h-10 text-brand animate-spin" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Category;
