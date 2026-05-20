import React from "react";
import { Play, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface WatchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  className?: string;
  variant?: "primary" | "secondary" | "glass";
}

const WatchButton: React.FC<WatchButtonProps> = ({
  isLoading,
  className = "",
  variant = "primary",
  children,
  ...props
}) => {
  return (
    <button
      disabled={isLoading || props.disabled}
      className={cn(
        "flex items-center justify-center gap-2.5 font-display font-semibold uppercase text-xs md:text-sm px-6 py-3.5 rounded-xl transition-all duration-300 select-none outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]",
        variant === "primary" && "bg-brand text-white border border-brand/20 shadow-lg shadow-brand/25 hover:shadow-brand/40",
        variant === "secondary" && "bg-white/10 text-white hover:bg-white/15 border border-white/5",
        variant === "glass" && "bg-zinc-950/40 hover:bg-zinc-900/40 text-brand border border-brand/35 backdrop-blur-md hover:border-brand/60 shadow-lg shadow-brand/5",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        <Play className="w-4 h-4 fill-current text-current" />
      )}
      <span>{children || "Watch Now"}</span>
    </button>
  );
};

export default WatchButton;
