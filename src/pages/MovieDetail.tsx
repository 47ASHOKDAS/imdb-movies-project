import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  Play,
  Plus,
  Zap,
  Check,
  Star,
  Calendar,
  Clock,
  Trophy,
  ExternalLink,
  AlertCircle,
  Share2,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { MovieDetails, OMDBData, Movie } from "../types";
import { tmdbService } from "../services/tmdb";
import { omdbService } from "../services/omdb";
import { useWatchlist } from "../context/WatchlistContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import MovieCard from "../components/movies/MovieCard";
import SEO from "../components/common/SEO";
import ErrorMessage from "../components/common/ErrorMessage";

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const isTv = location.pathname.includes("/tv/");
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [omdbData, setOmdbData] = useState<OMDBData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState<number | "">(1);
  const [selectedEpisode, setSelectedEpisode] = useState<number | "">(1);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [showServerModal, setShowServerModal] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [activeUrl, setActiveUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Progress Syncing Implementation
  useEffect(() => {
    const STORAGE_KEY = 'watch_progress';
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'MEDIA_DATA') {
        const mediaData = event.data.data;
        if (mediaData.id && (mediaData.type === 'movie' || mediaData.type === 'tv')) {
          try {
            const watchProgress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            watchProgress[mediaData.id] = {
              ...watchProgress[mediaData.id],
              ...mediaData,
              last_updated: Date.now()
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(watchProgress));
            console.log('Watch progress synced:', mediaData);
          } catch (e) {
            console.error("Failed to sync watch progress", e);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const loadMovie = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = isTv
        ? await tmdbService.getTvDetails(id)
        : await tmdbService.getMovieDetails(id);
      const mappedData = isTv
        ? { ...data, title: data.name, release_date: data.first_air_date }
        : data;
      setMovie(mappedData);

      const similar = isTv
        ? await tmdbService.getSimilarTv(id)
        : await tmdbService.getSimilarMovies(id);
      const mappedSimilar = isTv
        ? similar.results.map((item: any) => ({
            ...item,
            title: item.name,
            release_date: item.first_air_date,
          }))
        : similar.results;
      setSimilarMovies(mappedSimilar.slice(0, 10));

      if (data.imdb_id) {
        const omdb = await omdbService.getMovieByImdbId(data.imdb_id);
        setOmdbData(omdb);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to load movie details. Please try again.");
      console.error("Error loading details:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovie();
    window.scrollTo(0, 0);
  }, [id, isTv]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-obsidian">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="text-4xl font-display font-black text-brand tracking-tighter"
        >
          IMDB<span className="text-current">flix</span>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-obsidian p-6">
        <ErrorMessage message={error} onRetry={loadMovie} />
      </div>
    );
  }

  if (!movie)
    return (
      <div className="pt-32 text-center text-zinc-500 font-bold">
        Movie not found
      </div>
    );

  const inWatchlist = isInWatchlist(movie.id);
  const trailer = movie.videos.results.find(
    (v) => v.type === "Trailer" && v.site === "YouTube",
  );
  const watchData = movie["watch/providers"].results?.IN;
  const providers =
    watchData?.flatrate || watchData?.rent || watchData?.buy || [];
  const watchLink = watchData?.link;

  const handleWatchNow = () => {
    if (movie.id) {
      setShowServerModal(true);
    } else if (watchLink) {
      window.open(watchLink, "_blank");
    } else {
      alert("No ID found for this movie. Unable to play.");
    }
  };

  const handlePlayOnServer = (serverIndex: number) => {
    let url = "";
    const tmdbId = movie?.id;
    const imdbId = movie?.imdb_id;

    if (serverIndex === 0) {
      // Server 1: Vidlink (Modern & Fast)
      url = isTv
        ? `https://vidlink.pro/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`
        : `https://vidlink.pro/movie/${tmdbId}`;
    } else if (serverIndex === 1) {
      // Server 2: Vidsrc.me (Reliable Mirror - User Confirmed Working)
      url = isTv
        ? `https://vidsrc.me/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`
        : imdbId ? `https://vidsrc.me/embed/movie/${imdbId}` : `https://vidsrc.me/embed/movie/${tmdbId}`;
    } else if (serverIndex === 2) {
      // Server 3: Vidsrc.pm (Alternative Stable mirror)
      url = isTv
        ? `https://vidsrc.pm/embed/tv/${tmdbId}/${selectedSeason}/${selectedEpisode}`
        : `https://vidsrc.pm/embed/movie/${tmdbId}`;
    }

    if (url) {
      setActiveUrl(url);
      setShowPlayer(true);
      setShowServerModal(false);
    }
  };

  return (
    <div className="pb-20 bg-transparent text-current overflow-x-hidden">
      <SEO
        title={movie.title}
        description={movie.overview}
        image={tmdbService.getImageUrl(movie.poster_path, "w500")}
        type="video.movie"
      />
      {/* Cinematic Header Background */}
      <div className="fixed top-0 left-0 right-0 h-[80vh] w-full overflow-hidden z-0 pointer-events-none">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={tmdbService.getImageUrl(movie.backdrop_path, "original")}
          alt={movie.title}
          className="w-full h-full object-cover brightness-[0.25] transform-gpu will-change-[transform,opacity]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-bg)] via-transparent to-[var(--theme-bg)]/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-bg)] via-transparent to-[var(--theme-bg)]/20" />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 md:pt-48 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16">
          {/* Left: Poster & Rating */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-4"
          >
            <div className="relative group mx-auto max-w-sm lg:max-w-none transform-gpu transition-transform duration-500 hover:scale-[1.02]">
              <div className="absolute -inset-4 bg-brand/30 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <img
                src={tmdbService.getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                className="w-full rounded-[2rem] shadow-2xl relative z-10 border border-current/10"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowTrailer(true)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] z-20"
              >
                <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center shadow-[0_0_30px_var(--color-brand)]">
                  <Play className="w-10 h-10 text-white fill-current ml-2" />
                </div>
              </motion.button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="glass-card rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center group transition-all hover:bg-current/5">
                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 group-hover:text-gold transition-colors">
                  IMDb Score
                </div>
                <div className="flex items-center gap-1.5 text-gold">
                  <Star className="w-6 h-6 fill-current drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                  <span className="text-3xl font-display font-black text-current">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="glass-card rounded-[1.5rem] p-6 flex flex-col items-center justify-center text-center group transition-all hover:bg-current/5">
                <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2 group-hover:text-brand transition-colors">
                  Status
                </div>
                <div className="text-sm font-bold text-current uppercase tracking-wider">
                  {movie.status || "Released"}
                </div>
                {movie.release_date && (
                  <div className="text-xs text-zinc-500 mt-1 font-medium">
                    {movie.release_date.split("-")[0]}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right: Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-8 flex flex-col justify-center"
          >
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {movie.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="bg-brand/10 border border-brand/30 text-brand text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-full transition-all hover:bg-brand hover:text-white"
                >
                  {genre.name}
                </span>
              ))}
              <span className="glass-card border-current/10 text-zinc-500 text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-full flex items-center gap-2">
                <Clock className="w-3 h-3" />
                {movie.runtime}m
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-[0.9] mb-4 uppercase text-current neon-text-glow">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-xl md:text-2xl text-brand leading-relaxed max-w-3xl mb-10 font-medium italic drop-shadow-md">
                "{movie.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <button
                onClick={handleWatchNow}
                className="btn-neon min-w-[220px] flex items-center justify-center gap-3 text-lg py-4"
              >
                <Play className="w-6 h-6 fill-current" />
                WATCH NOW
              </button>
              <button
                onClick={() =>
                  inWatchlist
                    ? removeFromWatchlist(movie.id)
                    : addToWatchlist(movie)
                }
                className={cn(
                  "btn-glass min-w-[200px] flex items-center justify-center gap-3 text-sm py-4",
                  inWatchlist
                    ? "text-brand border-brand/40 bg-brand/5 scale-[1.02]"
                    : "",
                )}
              >
                {inWatchlist ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Plus className="w-5 h-5 group-hover:text-brand transition-colors" />
                )}
                {inWatchlist ? "IN WATCHLIST" : "ADD TO LIST"}
              </button>
              <button className="btn-glass p-4 rounded-xl aspect-square flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="glass-card rounded-[2rem] p-8 md:p-10 border-current/10 bg-current/5">
              <h3 className="text-xs font-black uppercase text-brand tracking-[0.3em] mb-6 flex items-center gap-2">
                <div className="w-8 h-[2px] bg-brand/50"></div>
                Storyline
              </h3>
              <p className="text-zinc-400 group-hover:text-current transition-colors leading-relaxed text-lg md:text-xl font-medium">
                {movie.overview}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Cast Section */}
        <section className="mt-32">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-display font-black tracking-tight uppercase">
              STARRING <span className="text-brand">ACTORS</span>
            </h2>
            <div className="h-[1px] flex-grow mx-8 bg-current/10" />
          </div>
          <div className="flex gap-8 overflow-x-auto pb-8 horizontal-scroll">
            {movie.credits.cast.slice(0, 10).map((actor, idx) => (
              <Link
                to={`/person/${actor.id}`}
                key={actor.id}
                className="flex-shrink-0 w-40 text-center group"
              >
                <div className="w-40 h-40 rounded-full overflow-hidden mb-4 border-2 border-current/10 shadow-2xl group cursor-pointer ring-offset-4 ring-offset-obsidian group-hover:ring-2 ring-brand transition-all duration-500">
                  <img
                    src={
                      actor.profile_path
                        ? tmdbService.getImageUrl(actor.profile_path, "w185")
                        : "https://via.placeholder.com/185x185?text=No+Image"
                    }
                    alt={actor.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110"
                  />
                </div>
                <h4 className="font-bold text-sm truncate group-hover:text-brand transition-colors">
                  {actor.name}
                </h4>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1 truncate">
                  {actor.character}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Recommended Movies */}
        {similarMovies.length > 0 && (
          <section className="mt-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-display font-black tracking-tight uppercase">
                MORE LIKE <span className="text-brand">THIS</span>
              </h2>
              <div className="h-[1px] flex-grow mx-8 bg-current/10" />
            </div>
            <div className="flex gap-6 overflow-x-auto pb-8 horizontal-scroll">
              {similarMovies.map((m) => (
                <div key={m.id} className="flex-shrink-0 w-48 md:w-56">
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Player Modal */}
      <AnimatePresence>
        {showPlayer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black"
          >
            <div className="absolute inset-0 bg-black" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full h-full flex flex-col"
            >
              <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black to-transparent">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowPlayer(false)}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors backdrop-blur-md"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                  <h3 className="font-display font-black uppercase text-lg tracking-tighter">
                    {movie.title}
                    {isTv && ` • S${selectedSeason} E${selectedEpisode}`}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-brand text-white shadow-lg shadow-brand/20">
                    Active
                  </span>
                </div>
              </div>

              <div className="flex-grow relative bg-black">
                <iframe
                  src={activeUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  referrerPolicy="no-referrer"
                  allow="autoplay; encrypted-media"
                  title="Video Player"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <div
              className="absolute inset-0 bg-obsidian/95 backdrop-blur-3xl"
              onClick={() => setShowTrailer(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative z-10 w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-current/10 bg-black"
            >
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                title="Movie Trailer"
                className="w-full h-full"
                allowFullScreen
                allow="autoplay"
              />
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute top-6 right-6 w-12 h-12 bg-current/10 hover:bg-current/20 backdrop-blur-xl rounded-full flex items-center justify-center transition-colors text-white"
              >
                <Plus className="w-8 h-8 rotate-45" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Server Selection Modal */}
      <AnimatePresence>
        {showServerModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10"
          >
            <div
              className="absolute inset-0 bg-obsidian/95 backdrop-blur-3xl"
              onClick={() => setShowServerModal(false)}
            />
            <motion.div
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              className="relative z-10 w-full max-w-lg glass-card rounded-[2rem] p-8 border border-current/10"
            >
              <button
                onClick={() => setShowServerModal(false)}
                className="absolute top-6 right-6 w-10 h-10 bg-current/10 hover:bg-current/20 backdrop-blur-xl rounded-full flex items-center justify-center transition-colors shadow-lg shadow-black/20 text-current"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>

              <div className="mb-8 pr-12">
                <h3 className="text-2xl font-display font-black uppercase mb-2">
                  Select <span className="text-brand">Source</span>
                </h3>
                <p className="text-sm font-medium text-zinc-400">
                  Choose a server to watch
                  {isTv ? " and select your season/episode" : ""}.
                </p>
              </div>

              {isTv &&
                movie.seasons &&
                typeof selectedSeason === "number" &&
                (() => {
                  const validSeasons = movie.seasons.filter(
                    (s) => s.season_number > 0,
                  );
                  const currentSeasonData = validSeasons.find(
                    (s) => s.season_number === selectedSeason,
                  );
                  const episodeCount = currentSeasonData?.episode_count || 50;

                  return (
                    <div className="flex gap-4 mb-8">
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                          Season
                        </label>
                        <select
                          className="w-full bg-current/5 border border-current/10 text-current rounded-xl outline-none cursor-pointer px-4 py-3 font-bold backdrop-blur-md hover:bg-current/10 overflow-hidden appearance-none"
                          value={selectedSeason}
                          onChange={(e) => {
                            setSelectedSeason(Number(e.target.value));
                            setSelectedEpisode(1);
                          }}
                        >
                          {validSeasons.map((s) => (
                            <option
                              key={s.season_number}
                              value={s.season_number}
                              className="bg-[var(--theme-bg)]"
                            >
                              {s.name || `Season ${s.season_number}`}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">
                          Episode
                        </label>
                        <select
                          className="w-full bg-current/5 border border-current/10 text-current rounded-xl outline-none cursor-pointer px-4 py-3 font-bold backdrop-blur-md hover:bg-current/10 appearance-none"
                          value={selectedEpisode}
                          onChange={(e) =>
                            setSelectedEpisode(Number(e.target.value))
                          }
                        >
                          {Array.from({ length: episodeCount }).map((_, i) => (
                            <option
                              key={i + 1}
                              value={i + 1}
                              className="bg-[var(--theme-bg)]"
                            >
                              Episode {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })()}

              <div className="space-y-4">
                <button
                  onClick={() => handlePlayOnServer(0)}
                  className="w-full relative overflow-hidden group btn-glass p-0 border border-brand/30 bg-brand/5 hover:bg-brand/10 transition-all text-left"
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg group-hover:text-brand transition-colors text-current flex items-center gap-2">
                        <Zap className="w-5 h-5 fill-current" />
                        Server 1 (Primary)
                        <span className="text-[10px] bg-brand/20 text-brand px-1.5 py-0.5 rounded uppercase tracking-tighter">Fast</span>
                      </span>
                      <span className="text-xs font-medium text-zinc-400">
                        Modern player • High Quality • Fast Streaming
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-brand fill-current ml-1" />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handlePlayOnServer(1)}
                  className="w-full relative overflow-hidden group btn-glass p-0 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all text-left"
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg group-hover:text-emerald-400 transition-colors text-current flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 fill-current" />
                        Server 2 (Stable)
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">Recommended</span>
                      </span>
                      <span className="text-xs font-medium text-zinc-400">
                        Best uptime • Stable streaming
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-emerald-400 fill-current ml-1" />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handlePlayOnServer(2)}
                  className="w-full relative overflow-hidden group btn-glass p-0 border border-sky-400/30 bg-sky-400/5 hover:bg-sky-400/10 transition-all text-left"
                >
                  <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-bold text-lg group-hover:text-sky-400 transition-colors text-current flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        Server 3 (Fallback)
                        <span className="text-[10px] bg-sky-400/20 text-sky-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">Reliable</span>
                      </span>
                      <span className="text-xs font-medium text-zinc-400">
                        Stable alternative mirror if others fail
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-sky-400/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-sky-400 fill-current ml-1" />
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovieDetail;
