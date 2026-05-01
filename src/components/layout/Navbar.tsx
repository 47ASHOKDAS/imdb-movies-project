import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Bookmark, Sun, Moon, Clapperboard, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import SearchInput from './SearchInput';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-700 px-8 py-5 md:px-20 flex items-center justify-between",
      isScrolled 
        ? "bg-obsidian/80 backdrop-blur-3xl border-b border-white/5 py-3 shadow-[0_10px_30px_rgba(0,0,0,1)]" 
        : "bg-gradient-to-b from-obsidian/90 via-obsidian/40 to-transparent"
    )}>
      <div className="flex items-center gap-12 flex-grow">
        <Link to="/" className="flex items-center group shrink-0 relative">
          <div className="text-2xl md:text-3xl font-display font-black tracking-tighter">
            <span className="text-brand drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]">IMDB</span>
            <span className="text-white">flix</span>
          </div>
          <div className="absolute -bottom-1 left-0 w-0 h-[2px] bg-brand group-hover:w-full transition-all duration-500" />
        </Link>

        {/* Global Search */}
        <div className="flex-grow max-w-xl hidden sm:block">
          <SearchInput />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-white/10 pr-6 mr-2 hidden md:flex">
          <Link to="/" className={cn(
            "text-xs font-black tracking-widest uppercase transition-all duration-300",
            location.pathname === '/' ? "text-brand" : "text-zinc-500 hover:text-white"
          )}>HOME</Link>
          <Link to="/watchlist" className={cn(
            "text-xs font-black tracking-widest uppercase transition-all duration-300",
            location.pathname === '/watchlist' ? "text-brand" : "text-zinc-500 hover:text-white"
          )}>WATCHLIST</Link>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-indigo-400" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
