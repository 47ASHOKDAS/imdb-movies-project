import React, { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw, ArrowRight, Server, ShieldCheck, Activity } from "lucide-react";
import { motion } from "motion/react";
import { VideoServer } from "../../services/legalSources";

interface ErrorFallbackProps {
  errorMsg: string;
  failedServer: VideoServer;
  nextServer: VideoServer | null;
  countdownSeconds?: number;
  onManualSwitch: () => void;
  onRetry: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  errorMsg,
  failedServer,
  nextServer,
  countdownSeconds = 5,
  onManualSwitch,
  onRetry,
}) => {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    setTimeLeft(countdownSeconds);
  }, [failedServer, countdownSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (nextServer) {
        onManualSwitch();
      }
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, nextServer, onManualSwitch]);

  const getIcon = (server: VideoServer) => {
    if (server.tag.toLowerCase().includes("primary")) return <Server className="w-5 h-5 text-brand" />;
    if (server.tag.toLowerCase().includes("recommended")) return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    return <Activity className="w-5 h-5 text-sky-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-zinc-950/95 flex flex-col justify-center items-center px-6 py-8 text-center backdrop-blur-md select-none"
    >
      <div className="max-w-xl w-full flex flex-col items-center">
        {/* Animated warning circle */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/35 flex items-center justify-center text-red-500 mb-6 shadow-[0_0_30px_rgba(239,68,68,0.15)]"
        >
          <AlertTriangle className="w-8 h-8" />
        </motion.div>

        {/* Title */}
        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight mb-2">
          Playback failed on {failedServer.name}
        </h3>
        <p className="text-sm font-medium text-zinc-400 max-w-md mb-6 leading-relaxed">
          {errorMsg || "The video stream is temporarily unavailable or returned a network error."}
        </p>

        {/* Status Indicators representing what failed & where we go */}
        <div className="w-full bg-zinc-900/60 border border-white/5 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center">
              {getIcon(failedServer)}
            </div>
            <div>
              <div className="text-[10px] font-black uppercase text-zinc-500">Offline Source</div>
              <div className="text-sm text-zinc-300 font-bold line-through tracking-tight">
                {failedServer.tag} ({failedServer.quality})
              </div>
            </div>
          </div>

          {nextServer && (
            <>
              <ArrowRight className="w-4 h-4 text-zinc-600 rotate-90 sm:rotate-0" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800/80 flex items-center justify-center animate-pulse">
                  {getIcon(nextServer)}
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Next Backup</div>
                  <div className="text-sm text-emerald-400 font-bold tracking-tight">
                    {nextServer.name} ({nextServer.quality})
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Countdown to failover */}
        {nextServer ? (
          <div className="flex flex-col items-center mb-8 w-full">
            <div className="relative w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3 max-w-sm">
              <motion.div
                className="absolute top-0 bottom-0 left-0 bg-brand rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: countdownSeconds, ease: "linear" }}
              />
            </div>
            <div className="text-sm font-medium text-zinc-400">
              Auto-switching to dynamic backup server in{" "}
              <span className="font-bold text-brand text-lg mx-1">{timeLeft}</span> seconds
            </div>
          </div>
        ) : (
          <div className="text-sm font-medium text-zinc-400 mb-8">
            All configured content servers are currently offline or unavailable.
          </div>
        )}

        {/* Option Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onRetry}
            className="flex items-center gap-2 px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 transition-colors border border-white/10 rounded-xl text-zinc-300 font-bold text-xs uppercase tracking-wider"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Source
          </motion.button>

          {nextServer && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onManualSwitch}
              className="flex items-center gap-2 px-6 py-3 bg-brand text-white hover:bg-brand/90 transition-colors rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-brand/20 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4 animate-pulse" />
              Switch Now
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ErrorFallback;
