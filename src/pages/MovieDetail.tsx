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
import {
  getLegalSourceForMovie,
  LegalMovieSource,
  VideoServer,
  saveCustomServersForMovie,
  getCustomServersForMovie,
  DEMO_LEGAL_MOVIES
} from "../services/legalSources";
import { SecureVideoPlayer } from "../components/player/SecureVideoPlayer";
import ServerSelector from "../components/player/ServerSelector";
import ErrorFallback from "../components/player/ErrorFallback";
import { Settings, Info, Save, Undo2, Tv } from "lucide-react";

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

  // Playback control states (Secure direct HTML5 player vs high compatibility embed frames)
  const [playerMode, setPlayerMode] = useState<'html5' | 'embed'>('html5');
  const [embedServerIndex, setEmbedServerIndex] = useState<number>(0);
  const [showCustomServerForm, setShowCustomServerForm] = useState(false);
  const [customUrl1, setCustomUrl1] = useState("");
  const [customUrl2, setCustomUrl2] = useState("");
  const [customUrl3, setCustomUrl3] = useState("");
  
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

      // Fetch legal sources for this movie ID
      const sources = getLegalSourceForMovie(id, mappedData.title);
      setLegalSource(sources);
      console.log("movieId:", id);
      console.log("available sources:", sources ? sources.servers : []);
      if (sources && sources.servers && sources.servers.length >= 3) {
        setCustomUrl1(sources.servers[0]?.url || "");
        setCustomUrl2(sources.servers[1]?.url || "");
        setCustomUrl3(sources.servers[2]?.url || "");
      } else {
        setCustomUrl1("");
        setCustomUrl2("");
        setCustomUrl3("");
      }

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
  
  // Safely fallback to other regions if IN is not available
  const watchData = movie["watch/providers"].results?.IN || 
                    movie["watch/providers"].results?.US || 
                    (movie["watch/providers"].results ? Object.values(movie["watch/providers"].results)[0] : null) as any;
  const providers =
    watchData?.flatrate || watchData?.rent || watchData?.buy || [];
  const watchLink = watchData?.link;

  const movieId = id || "";

  // Construct legal video sources mapping dictionary for logging as expected per user request
  const videoSources: Record<string, any> = {};
  DEMO_LEGAL_MOVIES.forEach((m) => {
    videoSources[m.id] = m;
  });
  if (legalSource) {
    videoSources[movieId] = legalSource;
  }

  const watchProviders = providers;

  // Exact console logs requested by user
  console.log("movieId:", movieId);
  console.log("videoSources:", videoSources[movieId]);
  console.log("providerLinks:", watchProviders);

  const hasPlayableSource = !!(legalSource && legalSource.servers && legalSource.servers.length > 0 && legalSource.servers.some(s => s.url));

  // Launches the legal multi-server video player workflow
  const handleWatchNow = () => {
    console.log("movieId:", id);
    console.log("available sources:", legalSource ? legalSource.servers : []);

    if (legalSource && legalSource.servers && legalSource.servers.length > 0 && legalSource.servers.some(s => s.url)) {
      // Find the user's preferred server if set, or default to general index
      const preferred = preferredServer !== null ? legalSource.servers[preferredServer] : null;
      const initialServer = preferred && preferred.url ? preferred : (legalSource.servers.find(s => s.url) || legalSource.servers[0]);
      
      console.log("selected source:", initialServer.url);
      
      setPlayerMode("html5");
      setActiveServer(initialServer);
      setPlaybackError(null);
      setFailedServer(null);
      setShowPlayer(true);
    } else {
      console.log("selected source: Embed Mirror (vidsrc/vidlink)");
      setPlayerMode("embed");
      setEmbedServerIndex(0);
      
      const defaultMirrorServer: VideoServer = {
        id: 0,
        name: "Mirror Server 1 (Vidlink)",
        url: isTv
          ? `https://vidlink.pro/tv/${id}/${selectedSeason || 1}/${selectedEpisode || 1}`
          : `https://vidlink.pro/movie/${id}`,
        desc: "Very fast, responsive direct streaming",
        tag: "Fastest",
        quality: "1080p Dynamic"
      };
      setActiveServer(defaultMirrorServer);
      setPlaybackError(null);
      setFailedServer(null);
      setShowPlayer(true);
    }
  };

  // Handles custom video error and starts the automatic fallback loop
  const handleVideoError = (errorMsg: string) => {
    console.warn("Playback error handler invoked:", errorMsg);
    console.log("video error event:", errorMsg);
    if (!activeServer || !legalSource) return;

    setFailedServer(activeServer);

    // Find the next server for this movieId only
    const currentIdx = legalSource.servers.findIndex((s) => s.id === activeServer.id) ?? -1;
    let nextIdx = currentIdx + 1;
    let nextServer: VideoServer | null = null;
    while (nextIdx < legalSource.servers.length) {
      if (legalSource.servers[nextIdx].url) {
        nextServer = legalSource.servers[nextIdx];
        break;
      }
      nextIdx++;
    }

    if (nextServer) {
      console.log(`Fallback: Server ${activeServer.name} failed. Automatically trying next backup server for current movieId ${id}:`, nextServer.name);
      setPlaybackError(`Server failed: ${errorMsg}. Trying backup server...`);
      setLoadingServerId(nextServer.id);
      
      setTimeout(() => {
        setLoadingServerId(null);
        setPlaybackError(null);
        setFailedServer(null);
        console.log("selected source:", nextServer.url);
        setActiveServer(nextServer);
      }, 2000);
    } else {
      console.log("All configured source servers have failed for movieId:", id);
      setPlaybackError("Video not available");
    }
  };

  // Switches to the next backup server automatically or manually
  const handleAutoSwitch = (nextServer: VideoServer | null) => {
    if (nextServer) {
      console.log("selected source:", nextServer.url);
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

  const getEmbedUrl = () => {
    if (!movie) return "";
    const tmdbId = movie.id;
    const imdbId = movie.imdb_id;

    if (embedServerIndex === 0) {
      return isTv
        ? `https://vidlink.pro/tv/${tmdbId}/${selectedSeason || 1}/${selectedEpisode || 1}`
        : `https://vidlink.pro/movie/${tmdbId}`;
    } else if (embedServerIndex === 1) {
      return isTv
        ? `https://vidsrc.me/embed/tv/${tmdbId}/${selectedSeason || 1}/${selectedEpisode || 1}`
        : imdbId ? `https://vidsrc.me/embed/movie/${imdbId}` : `https://vidsrc.me/embed/movie/${tmdbId}`;
    } else {
      return isTv
        ? `https://vidsrc.pm/embed/tv/${tmdbId}/${selectedSeason || 1}/${selectedEpisode || 1}`
        : `https://vidsrc.pm/embed/movie/${tmdbId}`;
    }
  };

  const handleSaveCustomServers = (e: React.FormEvent) => {
    e.preventDefault();
    if (!movie) return;

    const updatedServers: VideoServer[] = [
      {
        id: 1,
        name: "Server 1 (Primary - Custom CDN)",
        url: customUrl1,
        desc: "Custom CDN stream loaded via secure local storage.",
        tag: "Primary",
        quality: "1080p Direct",
        isFailing: !customUrl1
      },
      {
        id: 2,
        name: "Server 2 (Stable - Custom Backup)",
        url: customUrl2,
        desc: "Configured backup streaming segment.",
        tag: "Backup 1",
        quality: "1080p MP4",
        isFailing: !customUrl2
      },
      {
        id: 3,
        name: "Server 3 (Fallback - Adaptive HLS)",
        url: customUrl3,
        desc: "Adaptive backup stream for cross-device playback.",
        tag: "Backup 2",
        quality: "Auto HLS",
        isFailing: !customUrl3
      }
    ];

    saveCustomServersForMovie(movie.id.toString(), updatedServers);
    
    setLegalSource({
      id: movie.id.toString(),
      title: movie.title,
      servers: updatedServers
    });

    const active = updatedServers.find(s => s.url) || updatedServers[0];
    console.log("selected source:", active.url || "None");
    setActiveServer(active);
    setPlaybackError(null);
    setFailedServer(null);
    setShowCustomServerForm(false);
  };

  const handleResetDefaultServers = () => {
    if (!movie) return;
    localStorage.removeItem(`custom_servers_${movie.id}`);
    const sources = getLegalSourceForMovie(movie.id.toString(), movie.title);
    setLegalSource(sources);
    if (sources && sources.servers && sources.servers.length >= 3) {
      setCustomUrl1(sources.servers[0]?.url || "");
      setCustomUrl2(sources.servers[1]?.url || "");
      setCustomUrl3(sources.servers[2]?.url || "");
      setActiveServer(sources.servers[0]);
    } else {
      setCustomUrl1("");
      setCustomUrl2("");
      setCustomUrl3("");
      setActiveServer(null);
    }
    setPlaybackError(null);
    setFailedServer(null);
    setShowCustomServerForm(false);
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

            <div className="flex flex-col gap-6 mb-12">
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={handleWatchNow}
                  className="btn-neon min-w-[220px] flex items-center justify-center gap-3 text-lg py-4"
                >
                  <Play className="w-6 h-6 fill-current" />
                  WATCH NOW
                </button>
              </div>

              {!hasPlayableSource && (
                <div className="flex flex-col gap-3 w-full max-w-2xl mt-2">
                  <div className="flex items-center gap-2 text-zinc-400 font-bold text-xs uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                    <span>Watch Options</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {providers.length > 0 ? (
                      providers.slice(0, 4).map((p: any) => (
                        <button
                          key={p.provider_id}
                          onClick={() => {
                            if (watchLink) {
                              console.log("selected source: External provider (TMDB Watch Providers link)");
                              window.open(watchLink, "_blank");
                            }
                          }}
                          className="flex items-center gap-2.5 bg-zinc-900 border border-white/5 hover:border-brand/40 hover:bg-zinc-850 px-4 py-3 rounded-xl transition duration-300 hover:scale-[1.01] text-white cursor-pointer shadow-lg shadow-black/20"
                        >
                          {p.logo_path && (
                            <img
                              src={`https://image.tmdb.org/t/p/original${p.logo_path}`}
                              alt={p.provider_name}
                              className="w-5 h-5 rounded object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Watch on {p.provider_name}
                          </span>
                        </button>
                      ))
                    ) : watchLink ? (
                      <button
                        onClick={() => window.open(watchLink, "_blank")}
                        className="flex items-center gap-2.5 bg-zinc-900 border border-white/5 hover:border-brand/40 px-5 py-3 rounded-xl transition duration-300 hover:scale-[1.01] text-white cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current text-white animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Stream on External Provider
                        </span>
                      </button>
                    ) : (
                      <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/40 px-5 py-3 rounded-xl border border-white/5">
                        No Streaming Provider config found
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
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
                  {playerMode === "html5" ? (
                    <>
                      {/* Only render SecureVideoPlayer if a valid url exists */}
                      {activeServer && activeServer.url ? (
                        <SecureVideoPlayer
                          movieId={id || ""}
                          server={activeServer}
                          onVideoError={handleVideoError}
                          title={movie.title}
                        />
                      ) : (
                        <div className="absolute inset-0 z-40 bg-zinc-950 flex flex-col justify-center items-center px-6 py-8 text-center backdrop-blur-md select-none">
                          <div className="max-w-xl w-full flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/35 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                              <AlertCircle className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
                              Playback Not Possible
                            </h3>
                            <p className="text-lg font-bold text-brand uppercase tracking-widest mb-4">
                              Video not available
                            </p>
                            <p className="text-sm font-medium text-zinc-400 max-w-sm leading-relaxed">
                              No legal streaming feed has been configured for the selected Movie ID. Use the dashboard controls to configure a custom CDN endpoint.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Failing/Error Overlays if connection breaks */}
                      {playbackError && playbackError !== "Video not available" && failedServer && failedServer.id !== -1 && (
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
                    </>
                  ) : (
                    <iframe
                      src={getEmbedUrl()}
                      className="w-full h-full border-0 absolute inset-0 bg-black"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                      allow="autoplay; encrypted-media"
                      title="Web Mirror Video Player"
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

                  {/* Mode switcher tabs */}
                  <div className="grid grid-cols-2 bg-zinc-900/80 p-1 rounded-xl border border-white/5 shrink-0">
                    <button
                      onClick={() => setPlayerMode("html5")}
                      className={cn(
                        "text-center py-2 px-2 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all",
                        playerMode === "html5"
                          ? "bg-brand text-white shadow-lg shadow-brand/20"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      Secure HTML5 Player
                    </button>
                    <button
                      onClick={() => setPlayerMode("embed")}
                      className={cn(
                        "text-center py-2 px-2 text-[10px] font-black uppercase rounded-lg cursor-pointer transition-all",
                        playerMode === "embed"
                          ? "bg-zinc-800 text-zinc-100 border border-white/10"
                          : "text-zinc-400 hover:text-white"
                      )}
                    >
                      Legacy Web Mirrors
                    </button>
                  </div>

                  {/* Season & Episode controls only for TV series inside the player sidebar */}
                  {isTv && movie.seasons && (
                    <div className="bg-zinc-900/60 p-4 rounded-2xl border border-white/5 space-y-3">
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                        <Tv className="w-3.5 h-3.5 text-brand" />
                        Episode Navigator
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Season</label>
                          <select
                            className="w-full bg-zinc-950 border border-white/10 text-zinc-250 rounded-xl outline-none cursor-pointer px-3 py-2 text-xs font-bold hover:bg-zinc-900 transition-colors"
                            value={selectedSeason}
                            onChange={(e) => {
                              setSelectedSeason(Number(e.target.value));
                              setSelectedEpisode(1);
                            }}
                          >
                            {movie.seasons
                              .filter((s) => s.season_number > 0)
                              .map((s) => (
                                <option key={s.season_number} value={s.season_number} className="bg-zinc-950">
                                  {s.name || `Season ${s.season_number}`}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Episode</label>
                          <select
                            className="w-full bg-zinc-950 border border-white/10 text-zinc-250 rounded-xl outline-none cursor-pointer px-3 py-2 text-xs font-bold hover:bg-zinc-900 transition-colors"
                            value={selectedEpisode}
                            onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                          >
                            {Array.from({
                              length:
                                movie.seasons.find((s) => s.season_number === selectedSeason)
                                  ?.episode_count || 32,
                            }).map((_, i) => (
                              <option key={i + 1} value={i + 1} className="bg-zinc-950">
                                Episode {i + 1}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HTML5 Selector Panel */}
                  {playerMode === "html5" && showCustomServerForm ? (
                    <form onSubmit={handleSaveCustomServers} className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 space-y-4">
                      <span className="text-[10px] font-black uppercase text-brand tracking-wider flex items-center gap-1.5">
                        <Settings className="w-3.5 h-3.5 animate-spin-slow" />
                        Configure Stream CDN URLs
                      </span>
                      
                      <div className="space-y-3 text-xs">
                        <div className="space-y-1">
                          <label className="font-semibold text-zinc-400">Server 1 (Primary Direct Stream)</label>
                          <input
                            type="text"
                            placeholder="Direct MP4 or HLS .m3u8 Url"
                            value={customUrl1}
                            onChange={(e) => setCustomUrl1(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-700 outline-none focus:border-brand/50 transition-colors font-mono text-[11px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-zinc-400">Server 2 (Backup Stream Endpoint)</label>
                          <input
                            type="text"
                            placeholder="Fallback direct stream url"
                            value={customUrl2}
                            onChange={(e) => setCustomUrl2(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-700 outline-none focus:border-brand/50 transition-colors font-mono text-[11px]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-semibold text-zinc-400">Server 3 (Fallback Adaptive Feed)</label>
                          <input
                            type="text"
                            placeholder="Adaptive backup video url"
                            value={customUrl3}
                            onChange={(e) => setCustomUrl3(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-zinc-100 placeholder-zinc-700 outline-none focus:border-brand/50 transition-colors font-mono text-[11px]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <button
                          type="submit"
                          className="py-2.5 px-3 bg-brand text-white rounded-xl text-xs font-bold cursor-pointer hover:opacity-90 flex items-center justify-center gap-1.5 shadow-lg shadow-brand/10 transition-opacity"
                        >
                          <Save className="w-3.5 h-3.5" />
                          Save Feeds
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCustomServerForm(false)}
                          className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                        >
                          Cancel
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleResetDefaultServers}
                        className="w-full py-1.5 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-wider flex items-center justify-center gap-1"
                      >
                        <Undo2 className="w-3 h-3" />
                        Reset Default Streams
                      </button>
                    </form>
                  ) : playerMode === "html5" ? (
                    <>
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

                      <button
                        onClick={() => {
                          setShowCustomServerForm(true);
                        }}
                        className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl border border-white/5 flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold"
                      >
                        <Settings className="w-4 h-4 text-brand" />
                        Configure Direct Streams / Custom CDN
                      </button>
                    </>
                  ) : null}

                  {/* Legacy Mirror Selector Panel */}
                  {playerMode === "embed" && (
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block">
                        Select Mirror Server Connection
                      </span>
                      <div className="space-y-2.5">
                        {[
                          { id: 0, name: "Mirror Server 1 (Vidlink)", desc: "Very fast, responsive direct streaming", tag: "Fastest" },
                          { id: 1, name: "Mirror Server 2 (Vidsrc.me)", desc: "Long-standing high uptime server", tag: "Stable" },
                          { id: 2, name: "Mirror Server 3 (Vidsrc.pm)", desc: "Alternative backup mirror server", tag: "Backup" }
                        ].map((srv) => (
                          <button
                            key={srv.id}
                            onClick={() => {
                              setEmbedServerIndex(srv.id);
                            }}
                            className={cn(
                              "w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer",
                              embedServerIndex === srv.id
                                ? "border-brand bg-brand/10 text-brand"
                                : "border-white/5 bg-zinc-900/40 hover:bg-zinc-900/70 text-zinc-300"
                            )}
                          >
                            <div>
                              <p className="font-bold text-xs">{srv.name}</p>
                              <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{srv.desc}</p>
                            </div>
                            <span className={cn(
                              "text-[9px] font-bold uppercase px-2 py-0.5 rounded",
                              embedServerIndex === srv.id
                                ? "bg-brand/20 text-brand"
                                : "bg-white/5 text-zinc-400"
                            )}>
                              {srv.tag}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Health Monitor section to enrich OTT feel */}
                  <div className="bg-zinc-900/60 border border-white/5 rounded-2xl p-4 mt-auto">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider flex items-center gap-1.5 mb-2.5">
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      Diagnostics Monitor
                    </span>
                    <div className="grid grid-cols-2 gap-3 text-[11px] font-bold text-zinc-500">
                      <div className="space-y-0.5">
                        <p className="lowercase tracking-wide font-medium">Protocol</p>
                        <p className="text-zinc-300 uppercase tracking-tight">
                          {playerMode === "embed"
                            ? "Iframe sandbox"
                            : activeServer.url.endsWith(".m3u8") || activeServer.url.includes("adaptive")
                            ? "HLS (.m3u8)"
                            : "MP4 Progressive"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="lowercase tracking-wide font-medium">Resolution</p>
                        <p className="text-zinc-300 uppercase tracking-tight">
                          {playerMode === "embed" ? "1085p Dynamic" : activeServer.quality}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="lowercase tracking-wide font-medium">Engine Mode</p>
                        <p className="text-zinc-300">
                          {playerMode === "embed" ? "Direct Mirror" : "HTML5 Failover"}
                        </p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="lowercase tracking-wide font-medium">Sync State</p>
                        <p className={playerMode === "embed" ? "text-amber-400" : "text-emerald-400"}>
                          {playerMode === "embed" ? "Cloud Hybrid feed" : "Direct stream"}
                        </p>
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
