import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Heart, Sun, Moon, Clapperboard, Menu, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import SearchInput from "./SearchInput";

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-6 py-4 md:px-12 flex items-center gap-10",
        isScrolled
          ? "bg-obsidian/60 backdrop-blur-3xl border-b border-white/5 py-3 shadow-2xl"
          : "bg-gradient-to-b from-obsidian/80 via-obsidian/20 to-transparent",
      )}
    >
      <Link to="/" className="flex items-center group shrink-0 relative">
        <div className="text-xl md:text-2xl font-display font-black tracking-tighter uppercase">
          <span className="text-brand drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]">
            IMDB
          </span>
          <span className="text-white">flix</span>
        </div>
      </Link>

      {/* Centered Global Search */}
      <div className="flex-grow max-w-2xl hidden sm:block mx-auto">
        <SearchInput />
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-8 hidden lg:flex">
          {[
            { name: "Home", path: "/" },
            { name: "Movies", path: "/movies" },
            { name: "TV Shows", path: "/tv" },
            { name: "Watchlist", path: "/watchlist", icon: Heart },
          ].map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "text-sm font-semibold transition-all duration-300 relative group flex items-center gap-2",
                location.pathname === link.path
                  ? "text-white"
                  : "text-zinc-400 hover:text-white",
              )}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.name}
              {location.pathname === link.path && (
                <div className="absolute -bottom-6 left-0 right-0 h-[2px] bg-brand rounded-t-full shadow-[0_-2px_10px_rgba(139,92,246,0.8)]" />
              )}
            </Link>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-all hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-white" /> : <Moon className="w-5 h-5 text-white" />}
        </button>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("toggleSidebar"))}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-all hover:bg-white/10"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
