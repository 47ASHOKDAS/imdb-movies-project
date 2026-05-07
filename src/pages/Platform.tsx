import React, { useState, useEffect, useRef } from 'react';
import { Play, Info, Search, Bell, ChevronDown, User, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { PROVIDERS } from '../components/layout/Sidebar';
import { motion } from "motion/react";

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
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [rows, setRows] = useState<{ title: string, data: any[], isLargeRow?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'tv' | 'movies' | 'new'>('home');

  const provider = PROVIDERS.find(p => p.id === providerId) || PROVIDERS[0];
  const { logo, color } = NAVBAR_COLORS[providerId || "8"] || NAVBAR_COLORS["8"];

  useEffect(() => {
    setActiveTab('home'); // Reset tab when provider changes
  }, [providerId]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
          // Select a random popular movie for the hero
          const randomHero = trending.results[Math.floor(Math.random() * Math.min(5, trending.results.length))];
          setHeroMovie(randomHero);
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
             onClick={() => navigate('/')}
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
          <Search className="w-5 h-5 cursor-pointer" />
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

      {/* Hero */}
      {heroMovie && (
        <div className="relative min-h-[85vh] flex flex-col justify-end pb-40 text-white w-full">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 w-full h-full overflow-hidden"
          >
            <motion.img
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
              src={tmdbService.getImageUrl(heroMovie.backdrop_path || heroMovie.poster_path, "original")}
              alt={heroMovie.title || heroMovie.name}
              className="w-full h-full object-cover origin-center"
            />
            {/* Overlay Gradients to blend into the background */}
            <div className="absolute top-0 w-full h-full bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none" />
            <div className="absolute top-1/2 bottom-0 w-full bg-gradient-to-t from-[#141414] to-transparent pointer-events-none" />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative px-4 md:px-12 w-full md:w-2/3 lg:w-1/2"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
              {heroMovie.title || heroMovie.name}
            </h1>
            
            <p className="text-lg md:text-xl font-medium drop-shadow-lg mb-6 max-w-2xl line-clamp-3">
              {heroMovie.overview}
            </p>

            <div className="flex gap-4">
              <button 
                 onClick={() => navigate(`/movie/${heroMovie.id}`)}
                 className="flex items-center gap-2 bg-white text-black px-6 py-2 md:py-3 rounded md:text-lg font-semibold hover:bg-white/80 transition cursor-pointer"
              >
                <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                Play
              </button>
              <button 
                 onClick={() => navigate(`/movie/${heroMovie.id}`)}
                 className="flex items-center gap-2 bg-gray-500/70 text-white px-6 py-2 md:py-3 rounded md:text-lg font-semibold hover:bg-gray-500/50 transition"
              >
                <Info className="w-5 h-5 md:w-6 md:h-6" />
                More Info
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Rows */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="-mt-32 relative z-20"
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
