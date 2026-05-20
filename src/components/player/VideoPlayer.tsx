import React, { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Sparkles,
  Loader2,
  Subtitles,
  HelpCircle,
  Clock,
  Activity,
  Award
} from "lucide-react";
import Hls from "hls.js";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import { VideoServer } from "../../services/legalSources";

interface VideoPlayerProps {
  server: VideoServer;
  onVideoError: (errorMsg: string) => void;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  server,
  onVideoError,
  title,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStateMsg, setLoadingStateMsg] = useState("Checking best server...");
  const [showControls, setShowControls] = useState(true);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [activeSubtitle, setActiveSubtitle] = useState("");

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated subtitles mapped to video time to demonstrate multi-feature legal player
  const mockSubtitles = [
    { start: 1, end: 5, text: "[Narrator] In a world protected by the Creative Commons license..." },
    { start: 6, end: 11, text: "High-quality open movie models serve as our streaming reference." },
    { start: 12, end: 17, text: "Currently connected cleanly to " + server.name + "." },
    { start: 18, end: 24, text: "Operating on a highly optimized, fully legal HTML5 server stream." },
    { start: 25, end: 32, text: "No scraping, no piracy. Enjoy pure high-fidelity media hosting." },
    { start: 35, end: 42, text: "Feel free to check our server options panel to change streaming sources." },
  ];

  // Watchdog slow loading detection (e.g. Server 1 is intentionally configured to fail or hang)
  useEffect(() => {
    setIsLoading(true);
    setLoadingStateMsg("Checking best server...");
    setActiveSubtitle("");

    // Clear previous HLS engine
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Set a watchdog timer for slow loading / broken link detection
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    watchdogTimerRef.current = setTimeout(() => {
      if (isLoading && videoRef.current && videoRef.current.readyState < 2) {
        onVideoError(
          "Connection timeout. Server took too long to stream data (" + server.name + ")"
        );
      }
    }, 7000); // 7s timeout for failure demonstration

    const video = videoRef.current;
    if (!video) return;

    video.src = "";
    video.load();

    const isHls = server.url.endsWith(".m3u8") || server.url.includes("adaptive");

    const setupNativeSource = () => {
      video.src = server.url;
      video.load();
    };

    if (isHls) {
      if (Hls.isSupported()) {
        hlsRef.current = new Hls({
          maxMaxBufferLength: 10,
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current.loadSource(server.url);
        hlsRef.current.attachMedia(video);

        hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
          setLoadingStateMsg("Connecting to safe server node...");
        });

        hlsRef.current.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            onVideoError("Fatal HLS streaming error: failed to resolve content segments.");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        // Native HLS for Safari
        setupNativeSource();
      } else {
        onVideoError("Browser does not support HLS stream decoding natively or via HlsJS.");
      }
    } else {
      // Normal MP4 file
      setupNativeSource();
    }

    return () => {
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [server, onVideoError]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      // Process simulated subtitles
      if (subtitlesEnabled) {
        const matchingSub = mockSubtitles.find(
          (sub) => video.currentTime >= sub.start && video.currentTime <= sub.end
        );
        setActiveSubtitle(matchingSub ? matchingSub.text : "");
      } else {
        setActiveSubtitle("");
      }
    };

    const handleDurationChange = () => setDuration(video.duration);
    
    const handleLoadStart = () => {
      setIsLoading(true);
      setLoadingStateMsg("Resolving CDN handshakes...");
    };

    const handleCanPlay = () => {
      setIsLoading(false);
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      // Attempt autoplay safely
      video.play().catch(() => {
        // Autoplay blocked: user must hit play manually
        setIsPlaying(false);
      });
    };

    const handleWaiting = () => {
      setIsLoading(true);
      setLoadingStateMsg("Re-buffering legal segments...");
    };

    const handleNativeError = () => {
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      
      const mediaError = video.error;
      let errorDetail = "Failed to open HTML5 video pipeline.";
      if (mediaError) {
        switch (mediaError.code) {
          case 1: errorDetail = "Content reading was aborted."; break;
          case 2: errorDetail = "Network connection failure. Checked block headers."; break;
          case 3: errorDetail = "Video codec decoding aborted. Unsupported media format."; break;
          case 4: errorDetail = "Legal source file is offline or unreachable."; break;
        }
      }
      onVideoError(errorDetail + " (" + server.name + ")");
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("durationchange", handleDurationChange);
    video.addEventListener("loadstart", handleLoadStart);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("error", handleNativeError);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("durationchange", handleDurationChange);
      video.removeEventListener("loadstart", handleLoadStart);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("error", handleNativeError);
    };
  }, [server, subtitlesEnabled, onVideoError]);

  // Controls hide timeout
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // Player handlers
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(() => setIsPlaying(false));
    }
    resetControlsTimeout();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const val = parseFloat(e.target.value);
    video.currentTime = val;
    setCurrentTime(val);
    resetControlsTimeout();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
    resetControlsTimeout();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const newMute = !isMuted;
    video.muted = newMute;
    setIsMuted(newMute);
    resetControlsTimeout();
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => {
        console.error("Fullscreen error:", err);
      });
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
    resetControlsTimeout();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return "00:00";
    const hrs = Math.floor(timeInSecs / 3600);
    const mins = Math.floor((timeInSecs % 3600) / 60);
    const secs = Math.floor(timeInSecs % 60);

    const fMins = mins < 10 ? `0${mins}` : mins;
    const fSecs = secs < 10 ? `0${secs}` : secs;

    if (hrs > 0) {
      return `${hrs}:${fMins}:${fSecs}`;
    }
    return `${fMins}:${fSecs}`;
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group border border-white/5 shadow-2xl flex flex-col justify-center select-none"
    >
      {/* HTML5 Core Video Node */}
      <video
        ref={videoRef}
        playsInline
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        autoPlay
      />

      {/* Checking/Buffering Spinner Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-black/80 flex flex-col items-center justify-center pointer-events-none transition-all">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-brand animate-spin" />
              <Activity className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <p className="text-white font-bold tracking-tight text-base mb-1">
                {loadingStateMsg}
              </p>
              <div className="flex items-center gap-2 text-zinc-500 font-medium text-xs">
                <span>Checking stream on {server.tag} ({server.quality})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CC Live Mapped Audio Subtitle Canvas Overlay */}
      {subtitlesEnabled && activeSubtitle && (
        <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 z-20 pointer-events-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] max-w-[85%] text-center">
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black/80 px-4 py-1.5 rounded-lg border border-white/5 text-sm md:text-base font-medium text-yellow-300 leading-relaxed tracking-wide inline-block"
          >
            {activeSubtitle}
          </motion.div>
        </div>
      )}

      {/* Dark gradient shadow overlays for top & bottom controls hover */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/10 to-black/60 transition-opacity duration-300 z-10",
          showControls ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Top Header Information Overlay */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 p-4 md:p-5 flex items-center justify-between z-20 pointer-events-auto transition-all duration-300 flex-wrap gap-2",
          showControls ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand/15 flex items-center justify-center">
            <Award className="w-4 h-4 text-brand" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wide">
              Safe Playing
            </span>
            <h4 className="text-white font-display font-black text-sm md:text-base tracking-tight leading-none uppercase">
              {title}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-black/50 border border-white/5 px-2.5 py-1 rounded-full text-[10px] font-black text-zinc-400 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-current animate-spin-slow" />
          ACTIVE SECTOR: <span className="text-emerald-400 font-bold ml-1">{server.name}</span>
        </div>
      </div>

      {/* BIG Center Play Button Overlay on Hover */}
      {!isLoading && !isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={togglePlay}
            className="w-14 h-14 bg-brand hover:bg-brand/90 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(229,9,20,0.5)] cursor-pointer outline-none transition-shadow"
          >
            <Play className="w-7 h-7 fill-current ml-1" />
          </motion.button>
        </div>
      )}

      {/* Bottom Media Controller Controls */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20 pointer-events-auto transition-all duration-300",
          showControls ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        )}
      >
        {/* Seek timeline layout */}
        <div className="flex items-center gap-3.5 mb-3 select-none">
          <span className="text-xs text-zinc-400 font-bold tracking-tight shrink-0 minimal-font">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-brand h-1 bg-zinc-800 hover:h-1.5 rounded-lg outline-none cursor-pointer duration-150 transition-all appearance-none"
            style={{
              background: `linear-gradient(to right, var(--color-brand) 0%, var(--color-brand) ${
                duration ? (currentTime / duration) * 100 : 0
              }%, rgba(82, 82, 91, 0.4) ${
                duration ? (currentTime / duration) * 100 : 0
              }%, rgba(82, 82, 91, 0.4) 100%)`,
            }}
          />

          <span className="text-xs text-zinc-400 font-bold tracking-tight shrink-0 minimal-font">
            {formatTime(duration)}
          </span>
        </div>

        {/* Action button controls list */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className="text-white hover:text-brand transition-colors cursor-pointer outline-none"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            {/* Slow Rewind 10s */}
            <button
              onClick={() => handleSkip(-10)}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer outline-none"
              title="Rewind 10s"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Volume audio controllers */}
            <div className="flex items-center gap-2 group/volume relative">
              <button
                onClick={toggleMute}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer outline-none"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <input
                type="range"
                min={0}
                max={1}
                step={0.1}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-16 h-1 accent-white rounded-lg outline-none cursor-pointer duration-150 transition-all appearance-none bg-zinc-800"
                style={{
                  background: `linear-gradient(to right, #ffffff 0%, #ffffff ${
                    (isMuted ? 0 : volume) * 100
                  }%, rgba(82, 82, 91, 0.4) ${(isMuted ? 0 : volume) * 100}%, rgba(82, 82, 91, 0.4) 100%)`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Toggle demo subtitle track */}
            <button
              onClick={() => setSubtitlesEnabled(!subtitlesEnabled)}
              className={cn(
                "transition-colors cursor-pointer outline-none flex items-center justify-center p-1 rounded-md",
                subtitlesEnabled ? "text-yellow-400 bg-yellow-400/10 hover:text-yellow-300" : "text-zinc-500 hover:text-white"
              )}
              title={subtitlesEnabled ? "Disable Captions" : "Enable CC Captions"}
            >
              <Subtitles className="w-4 h-4" />
            </button>

            {/* Maximize / Screen sizes toggle */}
            <button
              onClick={toggleFullscreen}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer outline-none"
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
