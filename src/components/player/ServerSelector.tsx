import React from "react";
import { Server, ShieldCheck, Activity, Heart, Volume2, HardDrive, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";
import { VideoServer } from "../../services/legalSources";

interface ServerSelectorProps {
  servers: VideoServer[];
  activeServerId: number;
  loadingServerId: number | null;
  preferredServerId: number | null;
  onSelectServer: (server: VideoServer) => void;
  onSetPreferred: (serverId: number) => void;
  className?: string;
}

const ServerSelector: React.FC<ServerSelectorProps> = ({
  servers,
  activeServerId,
  loadingServerId,
  preferredServerId,
  onSelectServer,
  onSetPreferred,
  className = "",
}) => {
  const getIcon = (server: VideoServer, isActive: boolean) => {
    const defaultClasses = "w-5 h-5 transition-transform group-hover:scale-110";
    if (server.tag.toLowerCase().includes("primary")) {
      return <Server className={cn(defaultClasses, isActive ? "text-brand" : "text-zinc-500")} />;
    }
    if (server.tag.toLowerCase().includes("recommended")) {
      return <ShieldCheck className={cn(defaultClasses, isActive ? "text-emerald-400" : "text-zinc-500")} />;
    }
    return <Activity className={cn(defaultClasses, isActive ? "text-sky-400" : "text-zinc-500")} />;
  };

  const getBorderColorClass = (server: VideoServer, isActive: boolean, isPreferred: boolean) => {
    if (isActive) {
      if (server.tag.toLowerCase().includes("primary")) return "border-brand/40 bg-brand/5 ring-1 ring-brand/20 shadow-[0_0_15px_rgba(229,9,20,0.1)]";
      if (server.tag.toLowerCase().includes("recommended")) return "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
      return "border-sky-400/40 bg-sky-400/5 ring-1 ring-sky-400/20 shadow-[0_0_15px_rgba(56,189,248,0.1)]";
    }
    if (isPreferred) {
      return "border-red-500/30 bg-red-500/5 hover:border-red-500/45";
    }
    return "border-zinc-800 bg-zinc-950/40 hover:border-zinc-700/60 hover:bg-zinc-900/10";
  };

  const getTagColorClass = (server: VideoServer) => {
    if (server.tag.toLowerCase().includes("primary")) return "bg-brand/10 text-brand border border-brand/20";
    if (server.tag.toLowerCase().includes("recommended")) return "bg-emerald-500/15 text-emerald-400 border border-emerald-500/10";
    return "bg-sky-400/10 text-sky-400 border border-sky-400/10";
  };

  return (
    <div className={cn("space-y-3.5 text-left", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
          <HardDrive className="w-3.5 h-3.5 text-brand" />
          Streaming Servers
        </h4>
        <span className="text-[10px] text-zinc-600 font-bold uppercase">
          CC legal sources only
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {servers.map((server) => {
          const isActive = server.id === activeServerId;
          const isLoading = server.id === loadingServerId;
          const isPreferred = server.id === preferredServerId;

          return (
            <div
              key={server.id}
              className={cn(
                "w-full relative rounded-xl border p-3 flex items-center justify-between transition-all duration-300 group select-none",
                getBorderColorClass(server, isActive, isPreferred)
              )}
            >
              {/* Left Action Area to Switch Server */}
              <button
                onClick={() => onSelectServer(server)}
                className="flex-grow flex items-start gap-3 cursor-pointer outline-none text-left mr-2"
                title={`Switch to ${server.name}`}
              >
                <div className={cn(
                  "p-2 rounded-lg bg-zinc-900/80 mt-0.5 relative flex items-center justify-center transition-colors shadow-inner",
                  isActive && "bg-black"
                )}>
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  ) : (
                    getIcon(server, isActive)
                  )}
                </div>

                <div className="flex-grow min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 leading-tight">
                    <span className={cn(
                      "font-bold text-sm text-zinc-200 transition-colors group-hover:text-white",
                      isActive && "text-white"
                    )}>
                      {server.name}
                    </span>

                    {/* Highly stylized micro badges */}
                    <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded tracking-tighter uppercase shrink-0 scale-90 origin-left", getTagColorClass(server))}>
                      {server.tag}
                    </span>
                    <span className="text-[9px] font-bold bg-zinc-900 text-zinc-400 px-1 py-0.5 rounded uppercase scale-90 origin-left">
                      {server.quality}
                    </span>
                    {isActive && !isLoading && (
                      <span className="flex items-center gap-0.5 text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 py-0.5 rounded scale-90 origin-left">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-zinc-400 group-hover:text-zinc-300 transition-colors mt-0.5 truncate max-w-[280px]">
                    {server.desc}
                  </p>
                </div>
              </button>

              {/* Server Interaction Options (Heart for preference symbol) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSetPreferred(server.id);
                  }}
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center transition-all border outline-none cursor-pointer",
                    isPreferred
                      ? "bg-red-500/10 border-red-500/20 text-red-500 shadow-md shadow-red-500/5 hover:bg-zinc-800"
                      : "bg-zinc-900 border-zinc-800/80 text-zinc-500 hover:text-red-500 hover:bg-zinc-800 hover:border-zinc-700/50"
                  )}
                  title={isPreferred ? "Unmark as preferred server" : "Set as preferred server"}
                >
                  <Heart className={cn("w-3.5 h-3.5 transition-transform active:scale-90", isPreferred ? "fill-current" : "group-hover:scale-110")} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServerSelector;
