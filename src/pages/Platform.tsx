import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Search, Bell, ChevronDown, User, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { PROVIDERS } from '../components/layout/Sidebar';
import { motion, AnimatePresence } from "motion/react";

const NAVBAR_COLORS: Record<string, { logo: string, color: string }> = {
  "8": { logo: "NETFLIX", color: "#E50914" },
  "119": { logo: "PRIME VIDEO", color: "#00A8E1" },
  "337": { logo: "DISNEY+", color: "#113CCF" },
  "220": { logo: "JIOCINEMA", color: "#E5007D" },
  "122": { logo: "HOTSTAR", color: "#113CCF" },
};

function MovieRow({ title, data, isLargeRow, navigate }: any) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);
  
  const handleClick = (direction: "left" | "right") => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth * 0.8 : scrollLeft + clientWidth * 0.8;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="px-4 md:px-12 py-4 mb-4 relative group">
      <h2 className="text-white text-lg md:text-xl font-bold mb-3 md:mb-4 transition-colors hover:text-gray-300 w-max cursor-pointer">
        {title}
      </h2>
      
      <div className="relative">
        <button 
          onClick={() => handleClick("left")}
          className={`absolute top-0 bottom-0 left-0 z-40 m-auto h-full w-12 cursor-pointer bg-black/40 opacity-0 transition duration-300 group-hover:opacity-100 hover:bg-black/60 backdrop-blur-[2px] flex items-center justify-center -ml-4 md:-ml-12 ${!isMoved && 'hidden'}`}
        >
           <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div 
          ref={rowRef}
          className="flex overflow-y-hidden overflow-x-scroll scrollbar-hide gap-2 md:gap-4 py-6 -my-6 pl-1"
        >
          {data.map((movie: any) => (
            <img
              key={movie.id}
              src={tmdbService.getImageUrl(isLargeRow ? movie.poster_path : backdropOrPoster(movie), "w500")}
              alt={movie.title || movie.name}
              onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
              className={`
                object-cover rounded-md cursor-pointer transition-transform duration-300 ease-out hover:scale-110 hover:z-10 shadow-lg flex-shrink-0
                ${isLargeRow ? 'w-[150px] md:w-[200px] h-[225px] md:h-[300px]' : 'w-[200px] md:w-[280px] h-[112px] md:h-[157px]'}
              `}
              loading="lazy"
            />
          ))}
        </div>

        <button 
          onClick={() => handleClick("right")}
          className="absolute top-0 bottom-0 right-0 z-40 m-auto h-full w-12 cursor-pointer bg-black/40 opacity-0 transition duration-300 group-hover:opacity-100 hover:bg-black/60 backdrop-blur-[2px] flex items-center justify-center -mr-4 md:-mr-12"
        >
           <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}

export default function Platform() {
  const { name: providerId } = useParams();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroMovies, setHeroMovies] = useState<any[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [rows, setRows] = useState<{ title: string, data: any[], isLargeRow?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'tv' | 'movies' | 'new'>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const provider = PROVIDERS.find(p => p.id === providerId) || PROVIDERS[0];
  const { logo, color } = NAVBAR_COLORS[providerId || "8"] || NAVBAR_COLORS["8"];

  useEffect(() => {
    setActiveTab('home'); // Reset tab when provider changes
    setSearchQuery("");
    setIsSearchOpen(false);
  }, [providerId]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await tmdbService.searchWithProvider(searchQuery, providerId || "8");
        setSearchResults(results.results);
      } catch (error) {
        console.error("Platform search error", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, providerId]);

  useEffect(() => {
    const fetchPlatformData = async () => {
      setLoading(true);
      try {
        let trending: any, r1: any, r2: any, r3: any, r4: any;
        let r1Title = "", r2Title = "", r3Title = "", r4Title = "";
        
        if (activeTab === 'home') {
          [trending, r1, r2, r3, r4] = await Promise.all([
            tmdbService.getMoviesByGenre("all", 1, "movie", undefined, providerId),
            tmdbService.getMoviesByGenre("28", 1, "movie", undefined, providerId),
            tmdbService.getMoviesByGenre("35", 1, "movie", undefined, providerId),
            tmdbService.getMoviesByGenre("all", 1, "tv", undefined, providerId),
            tmdbService.getMoviesByGenre("10749", 1, "movie", undefined, providerId),
          ]);
          r1Title = "Action Movies";
          r2Title = "Comedy Movies";
          r3Title = "Popular TV Shows";
          r4Title = "Romance Movies";
        } else if (activeTab === 'tv') {
          [trending, r1, r2, r3, r4] = await Promise.all([
            tmdbService.getMoviesByGenre("all", 1, "tv", undefined, providerId),
            tmdbService.getMoviesByGenre("10759", 1, "tv", undefined, providerId),
            tmdbService.getMoviesByGenre("35", 1, "tv", undefined, providerId),
            tmdbService.getMoviesByGenre("18", 1, "tv", undefined, providerId),
            tmdbService.getMoviesByGenre("16", 1, "tv", undefined, providerId),
          ]);
          r1Title = "Action & Adventure";
          r2Title = "Comedy TV";
          r3Title = "Drama Series";
          r4Title = "Animation";
        } else if (activeTab === 'movies') {
          [trending, r1, r2, r3, r4] = await Promise.all([
            tmdbService.getMoviesByGenre("all", 1, "movie", undefined, providerId),
            tmdbService.getMoviesByGenre("878", 1, "movie", undefined, providerId),
            tmdbService.getMoviesByGenre("53", 1, "movie", undefined, providerId),
            tmdbService.getMoviesByGenre("12", 1, "movie", undefined, providerId),
            tmdbService.getMoviesByGenre("27", 1, "movie", undefined, providerId),
          ]);
          r1Title = "Sci-Fi Movies";
          r2Title = "Thrillers";
          r3Title = "Adventure Movies";
          r4Title = "Horror Movies";
        } else if (activeTab === 'new') {
          const currentYear = new Date().getFullYear().toString();
          [trending, r1, r2, r3, r4] = await Promise.all([
            tmdbService.getMoviesByGenre("all", 1, "movie", currentYear, providerId),
            tmdbService.getMoviesByGenre("all", 1, "tv", currentYear, providerId),
            tmdbService.getMoviesByGenre("all", 2, "movie", currentYear, providerId),
            tmdbService.getMoviesByGenre("all", 2, "tv", currentYear, providerId),
            tmdbService.getMoviesByGenre("all", 3, "movie", currentYear, providerId),
          ]);
          r1Title = "New TV Shows";
          r2Title = "More New Movies";
          r3Title = "More New TV Shows";
          r4Title = "Recent Releases";
        }

        if (trending?.results?.length > 0) {
          // Keep top 5 trending movies for rotating hero
          setHeroMovies(trending.results.slice(0, 5));
          setHeroIndex(0);
        }

        setRows([
          { title: `${provider.name.toUpperCase()} ${activeTab === 'new' ? 'NEW RELEASES' : 'TRENDING'}`, data: trending?.results?.slice(0, 10) || [], isLargeRow: true },
          { title: r1Title, data: r1?.results || [] },
          { title: r2Title, data: r2?.results || [] },
          { title: r3Title, data: r3?.results || [] },
          { title: r4Title, data: r4?.results || [] },
        ]);
      } catch (error) {
        console.error("Failed to fetch platform data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformData();
  }, [providerId, activeTab]);

  useEffect(() => {
    if (heroMovies.length <= 1) return;
    
    // Rotate hero movie every 8 seconds
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroMovies.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [heroMovies]);

  if (loading) {
    return (
      <div className="bg-[#141414] min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-[#141414] min-h-screen font-sans selection:bg-red-600 selection:text-white overflow-x-hidden text-white relative z-50">
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />

      {/* Navbar */}
      <nav
        className={`fixed top-0 w-full z-50 transition-colors duration-500 ease-in-out px-4 md:px-12 py-4 flex items-center justify-between ${
          isScrolled ? 'bg-[#141414]' : 'bg-gradient-to-b from-black/80 to-transparent'
        }`}
      >
        <div className="flex items-center gap-6 md:gap-8">
          <button onClick={() => navigate(-1)} className="text-white hover:text-gray-300">
             <ArrowLeft className="w-6 h-6" />
          </button>
          
          <button 
             onClick={() => window.dispatchEvent(new CustomEvent("toggleSidebar"))}
             className="text-white hover:text-gray-300 md:hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
          
          <h1 
             className="text-2xl md:text-4xl font-extrabold tracking-wider cursor-pointer" 
             style={{ fontFamily: 'Arial, sans-serif', transform: 'scaleY(1.2)', color: color }}
             onClick={() => setActiveTab('home')}
          >
            {logo}
          </h1>
          
          {/* Desktop Nav */}
          <ul className="hidden md:flex gap-5 text-sm text-gray-300 font-medium">
            <li className={`cursor-pointer transition hover:text-white ${activeTab === 'home' ? 'text-white font-bold' : ''}`} onClick={() => setActiveTab('home')}>Home</li>
            <li className={`cursor-pointer transition hover:text-white ${activeTab === 'tv' ? 'text-white font-bold' : ''}`} onClick={() => setActiveTab('tv')}>TV Shows</li>
            <li className={`cursor-pointer transition hover:text-white ${activeTab === 'movies' ? 'text-white font-bold' : ''}`} onClick={() => setActiveTab('movies')}>Movies</li>
            <li className={`cursor-pointer transition hover:text-white ${activeTab === 'new' ? 'text-white font-bold' : ''}`} onClick={() => setActiveTab('new')}>New & Popular</li>
            <li className="cursor-pointer transition hover:text-gray-300" onClick={() => navigate('/watchlist')}>My List</li>
          </ul>
        </div>

        <div className="flex items-center gap-4 text-white">
          <div className="flex items-center">
            <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-48 bg-black/50 border border-white/80 px-2' : 'w-5 bg-transparent border-transparent px-0'} overflow-hidden`}>
              <Search 
                className="w-5 h-5 cursor-pointer flex-shrink-0" 
                onClick={() => {
                  setIsSearchOpen(!isSearchOpen);
                  if (!isSearchOpen) {
                    setTimeout(() => searchInputRef.current?.focus(), 100);
                  } else {
                    setSearchQuery("");
                  }
                }} 
              />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Titles, people, genres" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent text-sm text-white placeholder-gray-400 outline-none w-full ml-2 transition-opacity duration-300 ${isSearchOpen ? 'opacity-100 py-1' : 'opacity-0 py-0'}`}
              />
            </div>
          </div>
          <span className="hidden md:block text-sm cursor-pointer">Kids</span>
          <Bell className="w-5 h-5 cursor-pointer" />
          
          {/* Profile Dropdown Mock */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded bg-blue-500 flex items-center justify-center overflow-hidden">
               <User className="w-5 h-5 text-white" />
            </div>
            <ChevronDown className="w-4 h-4 transition group-hover:rotate-180" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      {searchQuery.trim().length > 0 ? (
        <div className="pt-32 px-4 md:px-12 pb-20 min-h-[70vh]">
          <h2 className="text-gray-400 text-xl mb-6">
            Explore titles related to: <span className="text-white font-semibold">{searchQuery}</span>
          </h2>
          {isSearching ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchResults.map((movie: any) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={movie.id}
                  onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
                  className="cursor-pointer group"
                >
                  <img
                    src={tmdbService.getImageUrl(movie.poster_path)}
                    alt={movie.title || movie.name}
                    className="w-full aspect-[2/3] object-cover rounded-md transition-transform duration-300 group-hover:scale-105"
                  />
                  <p className="mt-2 text-sm text-center line-clamp-1 group-hover:text-white text-gray-300 transition-colors">
                    {movie.title || movie.name}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Your search for "{searchQuery}" did not have any matches on {provider.name}.</p>
              <p className="mt-2 text-sm text-gray-500">Suggestions:</p>
              <ul className="list-disc text-sm text-gray-500 inline-block text-left mt-2 pl-4">
                <li>Try different keywords</li>
                <li>Looking for a movie or TV show?</li>
                <li>Try using a movie, TV show title, an actor or director</li>
                <li>Note: This only searches the {provider.name} catalog.</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Hero */}
          {heroMovies.length > 0 && (
            <div className="relative min-h-[85vh] flex flex-col justify-end pb-32 md:pb-48 text-white w-full overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <motion.img
                    initial={{ scale: 1 }}
                    animate={{ scale: 1.15 }}
                    transition={{ duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
                    src={tmdbService.getImageUrl(heroMovies[heroIndex].backdrop_path || heroMovies[heroIndex].poster_path, "original")}
                    alt={heroMovies[heroIndex].title || heroMovies[heroIndex].name}
                    className="w-full h-full object-cover origin-center"
                  />
                  {/* Overlay Gradients to blend into the background */}
                  <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                  <div className="absolute top-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 w-full h-3/4 bg-gradient-to-t from-[#141414] via-[#141414]/90 to-transparent pointer-events-none" />
                </motion.div>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={heroIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative z-10 px-4 md:px-12 w-full md:w-2/3 lg:w-1/2"
                >
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] text-balance">
                    {heroMovies[heroIndex].title || heroMovies[heroIndex].name}
                  </h1>
                  
                  <p className="text-base md:text-lg lg:text-xl font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-6 max-w-2xl line-clamp-3 text-gray-100">
                    {heroMovies[heroIndex].overview}
                  </p>

                  <div className="flex gap-3 md:gap-4">
                    <button 
                       onClick={() => navigate(`/${heroMovies[heroIndex].media_type || 'movie'}/${heroMovies[heroIndex].id}`)}
                       className="flex items-center justify-center gap-2 bg-white text-black px-6 py-2 md:py-3 rounded md:text-lg font-semibold hover:bg-white/80 transition cursor-pointer"
                    >
                      <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                      Play
                    </button>
                    <button 
                       onClick={() => navigate(`/${heroMovies[heroIndex].media_type || 'movie'}/${heroMovies[heroIndex].id}`)}
                       className="flex items-center justify-center gap-2 bg-gray-500/70 text-white px-6 py-2 md:py-3 rounded md:text-lg font-semibold hover:bg-gray-500/50 transition cursor-pointer"
                    >
                      <Info className="w-5 h-5 md:w-6 md:h-6" />
                      More Info
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}
          
          {/* Rows */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="-mt-16 md:-mt-32 relative z-20 pb-16"
          >
            {rows.map((row, index) => (
              <MovieRow 
                key={index}
                title={row.title}
                data={row.data}
                isLargeRow={row.isLargeRow}
                navigate={navigate}
              />
            ))}
          </motion.div>
        </>
      )}

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-16 text-gray-400 text-sm">
        <div className="flex gap-4 mb-6">
          <a href="#" className="hover:text-white transition">Questions? Contact us.</a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="flex flex-col gap-3">
            <a href="#" className="hover:text-white transition">Audio Description</a>
            <a href="#" className="hover:text-white transition">Investor Relations</a>
            <a href="#" className="hover:text-white transition">Legal Notices</a>
          </div>
          <div className="flex flex-col gap-3">
            <a href="#" className="hover:text-white transition">Help Center</a>
            <a href="#" className="hover:text-white transition">Jobs</a>
            <a href="#" className="hover:text-white transition">Cookie Preferences</a>
          </div>
          <div className="flex flex-col gap-3">
            <a href="#" className="hover:text-white transition">Gift Cards</a>
            <a href="#" className="hover:text-white transition">Terms of Use</a>
            <a href="#" className="hover:text-white transition">Corporate Information</a>
          </div>
          <div className="flex flex-col gap-3">
            <a href="#" className="hover:text-white transition">Media Center</a>
            <a href="#" className="hover:text-white transition">Privacy</a>
            <a href="#" className="hover:text-white transition">Contact Us</a>
          </div>
        </div>
        <button className="border border-gray-400 px-4 py-1 text-sm hover:text-white mb-4">
          Service Code
        </button>
        <p>&copy; 1997-2026 {provider.name}, Inc.</p>
      </footer>
    </div>
  );
}

function backdropOrPoster(movie: any) {
  return movie.backdrop_path ? movie.backdrop_path : movie.poster_path;
}
