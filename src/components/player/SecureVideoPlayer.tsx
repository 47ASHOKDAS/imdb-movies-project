import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { 
  Shield, 
  AlertCircle, 
  Loader2, 
  PlayCircle,
  HelpCircle,
  Cpu,
  RefreshCw
} from "lucide-react";
import { VideoServer } from "../../services/legalSources";
import { useVideoSource } from "./useVideoSource";
import { motion, AnimatePresence } from "motion/react";

interface SecureVideoPlayerProps {
  movieId: string;
  server: VideoServer | null;
  onVideoError: (errorMsg: string) => void;
  title: string;
}

/**
 * SecureVideoPlayer Component
 * Features strict DRM UI parameters, blocks right-clicks, prevents downloading,
 * auto-configures HLS files via hls.js for non-Safari browsers, and gracefully
 * alerts users on empty/unsupported configurations or failed networks.
 */
export const SecureVideoPlayer: React.FC<SecureVideoPlayerProps> = ({
  movieId,
  server,
  onVideoError,
  title,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // States
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Load secure streaming endpoint parameters via the useVideoSource hook
  const { isLoading, error: sourceError, signedUrl, format } = useVideoSource(movieId, server);

  // Reset internal player errors when server or movie ID changes
  useEffect(() => {
    setStreamError(null);
  }, [movieId, server]);

  // Handle HLS stream mounting and video element initialization
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !signedUrl || format !== "hls") {
      // Clear previous HVS instance if target drops HLS or is not ready
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    console.log("[SecureVideoPlayer] Initializing secure HLS stream...");

    if (Hls.isSupported()) {
      // Setup hls.js for Chrome/Edge/Firefox
      const hls = new Hls({
        maxMaxBufferLength: 15,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
      });

      hlsRef.current = hls;
      hls.loadSource(signedUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          const detail = `Fatal HLS segment stream error on ${server?.name || "Server"}.`;
          console.error("video error event:", detail, data);
          setStreamError(detail);
          onVideoError(detail);
        }
      });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log("[SecureVideoPlayer] HLS manifest parsed. Autoplay triggered safely.");
        video.play().catch(() => {
          setIsVideoPlaying(false);
        });
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Apple/Safari HLS playback
      video.src = signedUrl;
      video.load();
    } else {
      const formatErr = "Your browser does not support HLS stream decoding.";
      console.error("video error event:", formatErr);
      setStreamError(formatErr);
      onVideoError(formatErr);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [signedUrl, format, onVideoError, server]);

  // Set non-HLS (MP4) URLs when ready
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !signedUrl || format !== "mp4") return;

    console.log("[SecureVideoPlayer] Initializing secure HTML5 MP4 player...");
    video.src = signedUrl;
    video.load();

    video.play().catch(() => {
      setIsVideoPlaying(false);
    });
  }, [signedUrl, format]);

  // Direct HTML5 Native Video error events trap
  const handleNativeVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const videoNode = e.currentTarget;
    if (!videoNode || !signedUrl) return;

    const mediaError = videoNode.error;
    let errorDetail = "Failed to load secure video media stream.";
    if (mediaError) {
      switch (mediaError.code) {
        case 1: errorDetail = "Video retrieval was manually aborted."; break;
        case 2: errorDetail = "Secure streaming network link interrupted."; break;
        case 3: errorDetail = "Unsupported codec decoding or profile restriction."; break;
        case 4: errorDetail = "The selected video CDN is currently offline or unreachable."; break;
      }
    }
    const fullMessage = `${errorDetail} (Server: ${server?.name || "Unknown"})`;
    console.error("video error event:", fullMessage);
    setStreamError(fullMessage);
    onVideoError(fullMessage);
  };

  const handlePlayState = () => setIsVideoPlaying(true);
  const handlePauseState = () => setIsVideoPlaying(false);

  // Derive consolidated error state (hook setup errors, or video timeline failure)
  const activeError = sourceError || streamError;

  return (
    <div 
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-white/5 shadow-2xl flex flex-col justify-center select-none group"
      onContextMenu={(e) => e.preventDefault()} // Block hotkey inspections and direct source saving
    >
      {/* Dynamic Animated Status Canvas */}
      <AnimatePresence mode="wait">
        {/* State A: Loading secure URL tokens */}
        {isLoading && !activeError && (
          <motion.div
            key="secure-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-brand animate-spin" />
                <Shield className="w-5 h-5 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-white text-lg font-black tracking-tight uppercase">
                  Loading secure player...
                </p>
                <div className="flex items-center justify-center gap-1.5 text-zinc-500 font-medium text-xs">
                  <Cpu className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
                  <span>Configuring signed handshake: {server?.name || "Primary"}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* State B: Error alert overlay */}
        {activeError && (
          <motion.div
            key="secure-error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="max-w-md w-full flex flex-col items-center bg-black/45 border border-red-500/15 p-8 rounded-2xl backdrop-blur-md shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/35 flex items-center justify-center text-red-500 mb-5 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                <AlertCircle className="w-8 h-8" />
              </div>
              
              <h3 className="text-lg font-display font-black text-white uppercase tracking-tight mb-2">
                Secure Playback Error
              </h3>
              
              <p className="text-sm font-bold text-brand uppercase tracking-widest mb-4">
                {activeError.includes("CDN") || activeError.includes("unreachable") || activeError.includes("failed") 
                  ? "Failed secure server node connection" 
                  : "Invalid Streaming File"}
              </p>

              <div className="p-3.5 rounded-lg bg-zinc-900/60 text-zinc-400 font-mono text-xs mb-6 w-full text-center border border-white/5 break-words">
                {activeError}
              </div>

              <div className="flex flex-col gap-2 w-full">
                <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                  Authentication token could not be verified or is blocked. Select a different backup server from the list on the right.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strict Secure HTML5 Core Video Node */}
      {signedUrl && !activeError && (
        <video
          ref={videoRef}
          controls
          controlsList="nodownload" // Disable standard Chrome/Firefox download button
          disablePictureInPicture   // Prevent unauthorized external embedding and casting
          onContextMenu={(e) => e.preventDefault()} // Guard against download clicks
          className="w-full h-full object-contain backdrop-blur-[1px]"
          onPlay={handlePlayState}
          onPause={handlePauseState}
          onError={handleNativeVideoError}
          playsInline
        />
      )}

      {/* Video Overlay Info Badges */}
      {!isLoading && !activeError && (
        <div className="absolute top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-2 bg-black/85 px-3 py-1.5 rounded-lg border border-white/5 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase text-zinc-300 tracking-wider">
              Secure Stream: {format.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-black/85 border border-white/5 px-2.5 py-1 rounded-full text-[10px] font-black text-zinc-400 backdrop-blur-md">
            SERVER: <span className="text-brand font-bold">{server?.name || "Primary"}</span>
          </div>
        </div>
      )}
    </div>
  );
};
