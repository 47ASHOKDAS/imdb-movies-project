import React, { useState, useEffect } from "react";
import {
  Film,
  Zap,
  Star,
  LayoutGrid,
  Flame,
  Heart,
  Ghost,
  Rocket,
  Laugh,
  X,
  Home,
  Tv,
  PlaySquare,
  ListVideo,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";

export const GENRES = [
  { id: "all", name: "All", icon: LayoutGrid },
  { id: "28", name: "Action", icon: Zap },
  { id: "35", name: "Comedy", icon: Laugh },
  { id: "18", name: "Drama", icon: Film },
  { id: "27", name: "Horror", icon: Ghost },
  { id: "878", name: "Sci-Fi", icon: Rocket },
  { id: "10749", name: "Romance", icon: Heart },
];

const NAV_LINKS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Movies", path: "/movies", icon: Film },
  { name: "TV Shows", path: "/tv", icon: Tv },
  { name: "Watchlist", path: "/watchlist", icon: ListVideo },
];

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const selectedGenre = searchParams.get("genre") || "all";

  useEffect(() => {
    const handleToggle = () => setIsOpen((prev) => !prev);
    window.addEventListener("toggleSidebar", handleToggle);
    return () => window.removeEventListener("toggleSidebar", handleToggle);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-80 bg-obsidian border-l border-white/5 z-50 flex flex-col shadow-2xl transform-gpu will-change-transform"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Main Navigation - Visible mainly on mobile/tablet */}
              <div className="space-y-2 lg:hidden">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 px-4">
                  Navigation
                </h3>
                {NAV_LINKS.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    location.pathname === link.path ||
                    (link.path === "/" && location.pathname === "/movies");
                  return (
                    <button
                      key={link.path}
                      onClick={() => {
                        navigate(link.path);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300",
                        isActive
                          ? "bg-brand/20 text-brand font-semibold shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isActive ? "text-brand" : "text-zinc-500",
                        )}
                      />
                      <span>{link.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4 px-4">
                  Categories
                </h3>
                {GENRES.map((genre) => {
                  const Icon = genre.icon;
                  const isHome =
                    location.pathname === "/" ||
                    location.pathname === "/movies";
                  const isActive = isHome && selectedGenre === genre.id;
                  return (
                    <button
                      key={genre.id}
                      onClick={() => {
                        if (genre.id === "all") {
                          navigate("/");
                        } else {
                          navigate(`/?genre=${genre.id}`);
                        }
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300",
                        isActive
                          ? "bg-brand/20 text-brand font-semibold shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                          : "text-zinc-400 hover:bg-white/5 hover:text-white",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5",
                          isActive ? "text-brand" : "text-zinc-500",
                        )}
                      />
                      <span>{genre.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
