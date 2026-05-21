import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Heart,
  Sun,
  Moon,
  Clapperboard,
  Menu,
  X,
  Zap,
} from "lucide-react";
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
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-4 py-4 md:px-12 flex items-center justify-between gap-2 md:gap-10",
        isScrolled ? "glass-nav py-3 shadow-2xl" : "bg-transparent",
      )}
    >
      <Link to="/" className="flex items-center group shrink-0 relative">
        <div className="text-lg md:text-2xl font-display font-black tracking-tighter uppercase">
          <span className="text-brand drop-shadow-[0_0_15px_var(--color-brand)]">
            IMDB
          </span>
          <span className="text-current font-semibold">flix</span>
        </div>
      </Link>

      {/* Centered Global Search */}
      <div className="flex-grow md:max-w-xl mx-2 md:mx-auto">
        <SearchInput />
      </div>

      <div className="flex items-center gap-2 md:gap-6 shrink-0">
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
                  ? "text-current"
                  : "text-zinc-500 hover:text-current opacity-80 hover:opacity-100",
              )}
            >
              {link.icon && <link.icon className="w-4 h-4 text-brand" />}
              {link.name}
              {location.pathname === link.path && (
                <div className="absolute -bottom-6 left-0 right-0 h-[2px] bg-brand rounded-t-full shadow-[0_-2px_10px_var(--color-brand)]" />
              )}
            </Link>
          ))}
        </div>

        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-full border border-current/20 flex items-center justify-center transition-all hover:bg-current/10"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Moon className="w-5 h-5 text-current" />
          ) : theme === "light" ? (
            <Sun className="w-5 h-5 text-current" />
          ) : (
            <Zap className="w-5 h-5 text-current" />
          )}
        </button>

        {/* User Profile Avatar dropdown card */}
        <div className="relative group/avatar">
          <button className="w-10 h-10 rounded-full border border-brand/20 overflow-hidden shadow-md flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:scale-95">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </button>
          
          <div className="absolute right-0 top-full mt-3 w-64 bg-zinc-950/95 border border-white/10 rounded-2xl p-4 shadow-2xl opacity-0 scale-95 pointer-events-none group-hover/avatar:opacity-100 group-hover/avatar:scale-100 group-hover/avatar:pointer-events-auto transition-all duration-300 origin-top-right backdrop-blur-xl z-[100]">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-brand/35">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Alex Mercer</h4>
                <p className="text-[10px] text-brand font-bold tracking-widest uppercase mt-0.5">Premium Ultra</p>
              </div>
            </div>
            <div className="space-y-2.5">
              <div className="text-[10px] text-zinc-500 font-mono font-bold tracking-tight">
                <span className="block text-[8px] uppercase tracking-widest text-zinc-650 mb-0.5">REGISTERED ACCOUNT</span>
                <span className="truncate block font-semibold text-zinc-300">47ashokdas@gmail.com</span>
              </div>
              <div className="text-[10px] text-zinc-500 font-mono font-bold tracking-tight">
                <span className="block text-[8px] uppercase tracking-widest text-zinc-650 mb-0.5">MEMBERSHIP ACCESS</span>
                <span className="text-cyan-400 font-semibold uppercase">ACTIVE SUBSCRIBER</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("toggleSidebar"))}
          className="w-10 h-10 rounded-full border border-current/20 flex items-center justify-center transition-all hover:bg-current/10"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-current" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
