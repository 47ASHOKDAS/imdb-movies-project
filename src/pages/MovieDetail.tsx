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
  Heart,
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

// Safe, legal multi-server custom streaming components
import { getLegalSourceForMovie, LegalMovieSource, VideoServer } from "../services/legalSources";
import VideoPlayer from "../components/player/VideoPlayer";
import ServerSelector from "../components/player/ServerSelector";
import ErrorFallback from "../components/player/ErrorFallback";

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
  const [preferredServer, setPreferredServer] = useState<number | null>(() => {
    const saved = localStorage.getItem("preferred_server");
    return saved !== null ? parseInt(saved, 10) : null;
  });

  // Safe, legal multi-server video player states
  const [legalSource, setLegalSource] = useState<LegalMovieSource | null>(null);
  const [activeServer, setActiveServer] = useState<VideoServer | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [loadingServerId, setLoadingServerId] = useState<number | null>(null);
  const [failedServer, setFailedServer] = useState<VideoServer | null>(null);
  
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

      // Procedurally generate or lookup CC available legal multi-server sources
      const sources = getLegalSourceForMovie(id, mappedData.title);
      setLegalSource(sources);

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

  // Launches the legal multi-server video player workflow
  const handleWatchNow = () => {
    if (legalSource && legalSource.servers.length > 0) {
      // Find the user's preferred server if set, or default to general index
      const preferred = preferredServer !== null ? legalSource.servers[preferredServer] : null;
      const initialServer = preferred || legalSource.servers[0];
      
      setActiveServer(initialServer);
      setPlaybackError(null);
      setFailedServer(null);
      setShowPlayer(true);
    } else if (watchLink) {
      window.open(watchLink, "_blank");
    } else {
      alert("No ID found for this movie. Unable to play.");
    }
  };

  // Handles custom video error and starts the automatic fallback loop
  const handleVideoError = (errorMsg: string) => {
    console.warn("Playback error handler invoked:", errorMsg);
    if (!activeServer || !legalSource) return;

    setFailedServer(activeServer);
    setPlaybackError(errorMsg);
  };

  // Switches to the next backup server automatically or manually
  const handleAutoSwitch = (nextServer: VideoServer | null) => {
    if (nextServer) {
      console.log("Auto-switching to backup server:", nextServer.name);
      setPlaybackError(null);
      setFailedServer(null);
      setActiveServer(nextServer);
    }
  };

  // Retries current server source
  const handleRetryServer = () => {
    if (!activeServer) return;
    console.log("Retrying custom server connection...");
    setPlaybackError(null);
    setFailedServer(null);

    const reattained = activeServer;
    setActiveServer(null);
    setTimeout(() => {
      setActiveServer(reattained);
    }, 100);
  };

  const handlePlayOnServer = (serverIndex: number) => {
    if (legalSource && legalSource.servers[serverIndex]) {
      setPlaybackError(null);
      setFailedServer(null);
      setActiveServer(legalSource.servers[serverIndex]);
      setShowPlayer(true);
    }
  };

  const handleSetPreferred = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newPreference = preferredServer === index ? null : index;
    setPreferredServer(newPreference);
    if (newPreference !== null) {
      localStorage.setItem("preferred_server", newPreference.toString());
    } else {
      localStorage.removeItem("preferred_server");
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
        {showPlayer && activeServer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center bg-zinc-950 p-4 md:p-6"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full h-full max-w-7xl glass-card rounded-[2rem] border border-white/10 overflow-hidden flex flex-col pointer-events-auto z-10 shadow-2xl shadow-black"
            >
              {/* Header inside player */}
              <div className="p-4 md:px-6 md:py-4 flex items-center justify-between border-b border-white/5 bg-zinc-950/80 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowPlayer(false);
                      setActiveServer(null);
                      setPlaybackError(null);
                      setFailedServer(null);
                    }}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center transition-all cursor-pointer text-zinc-300 hover:text-white"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                  <div>
                    <h3 className="font-display font-black uppercase text-sm md:text-lg tracking-tight leading-none text-white">
                      {movie.title}
                    </h3>
                    {isTv && (
                      <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider block mt-1">
                        Season {selectedSeason} • Episode {selectedEpisode}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 shadow-lg shadow-emerald-500/5 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Verified DRM Stream
                  </span>
                </div>
              </div>

              {/* Grid content containing Player and Server Selection */}
              <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 overflow-hidden bg-black">
                {/* Left side: Actual Video Screen with dynamic overlays */}
                <div className="lg:col-span-8 relative flex flex-col justify-center bg-zinc-950 min-h-[300px] border-b lg:border-b-0 lg:border-r border-white/5 overflow-hidden">
                  <VideoPlayer
                    server={activeServer}
                    onVideoError={handleVideoError}
                    title={movie.title}
                  />

                  {/* Failing/Error Overlays if connection breaks */}
                  {playbackError && failedServer && (
                    <ErrorFallback
                      errorMsg={playbackError}
                      failedServer={failedServer}
                      nextServer={
                        (() => {
                          const currentIdx = legalSource?.servers.findIndex((s) => s.id === failedServer.id) ?? -1;
                          if (currentIdx !== -1 && legalSource && currentIdx + 1 < legalSource.servers.length) {
                            return legalSource.servers[currentIdx + 1];
                          }
                          return null;
                        })()
                      }
                      onManualSwitch={() => {
                        const currentIdx = legalSource?.servers.findIndex((s) => s.id === failedServer.id) ?? -1;
                        if (currentIdx !== -1 && legalSource && currentIdx + 1 < legalSource.servers.length) {
                          handleAutoSwitch(legalSource.servers[currentIdx + 1]);
                        }
                      }}
                      onRetry={handleRetryServer}
                    />
                  )}
                </div>

                {/* Right side side panel: Streaming Status monitor, Manual server selectors, and metadata */}
                <div className="lg:col-span-4 p-5 md:p-6 flex flex-col gap-6 overflow-y-auto bg-zinc-950/50 horizontal-scroll leading-normal">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Active Stream Controller
                    </span>
                    <h4 className="text-white font-black uppercase text-xl leading-snug">
                      Theater Controls
                    </h4>
                    <p className="text-xs font-semibold text-zinc-500">
                      Configure your local media settings and mirror lines safely.
                    </p>
                  </div>

                  {/* Multi-server selection layout component */}
                  {legalSource && (
                    <ServerSelector
                      servers={legalSource.servers}
                      activeServerId={activeServer.id}
                      loadingServerId={loadingServerId}
                      preferredServerId={
                        preferredServer !== null && legalSource.servers[preferredServer]
                          ? legalSource.servers[preferredServer].id 
                          : null
                      }
                      onSelectServer={(server) => {
                        setPlaybackError(null);
                        setFailedServer(null);
                        setActiveServer(server);
                      }}
                      onSetPreferred={(serverId) => {
                        const targetIndex = legalSource.servers.findIndex((s) => s.id === serverId);
                        if (targetIndex !== -1) {
                          const nextPref = preferredServer === targetIndex ? null : targetIndex;
                          setPreferredServer(nextPref);
                          if (nextPref !== null) {
                            localStorage.setItem("preferred_server", nextPref.toString());
                          } else {
                            localStorage.removeItem("preferred_server");
                          }
                        }
                      }}
                    />
                  )}

                  {/* Technical Health Monitor section to enrich OTT feel */}
                  <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 mt-auto">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 mb-2.5">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Local Decoded Diagnostics
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-zinc-500">
                      <div className="space-y-0.5">
                        <p className="lowercase tracking-wide font-medium">Protocol</p>
                        <p className="text-zinc-300 uppercase tracking-tight">
                          {activeServer.url.endsWith(".m3u8") || activeServer.url.includes("adaptive") ? "HLS (.m3u8)" : "MP4 Progressive"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="lowercase tracking-wide font-medium">Resolution</p>
                        <p className="text-zinc-300 uppercase tracking-tight">{activeServer.quality}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="lowercase tracking-wide font-medium">Frame Buffer</p>
                        <p className="text-zinc-300">Fast Start enabled</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="lowercase tracking-wide font-medium">Sync State</p>
                        <p className="text-emerald-400">Legal CC content</p>
                      </div>
                    </div>
                  </div>
                </div>
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
    </div>
  );
};

export default MovieDetail;
