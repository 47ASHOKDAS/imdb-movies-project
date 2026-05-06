import React, { useState, useEffect } from 'react';
import { Play, Info, Search, Bell, ChevronDown, User, ArrowLeft, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { PROVIDERS } from '../components/layout/Sidebar';

const NAVBAR_COLORS: Record<string, { logo: string, color: string }> = {
  "8": { logo: "NETFLIX", color: "#E50914" },
  "119": { logo: "PRIME VIDEO", color: "#00A8E1" },
  "337": { logo: "DISNEY+", color: "#113CCF" },
  "220": { logo: "JIOCINEMA", color: "#E5007D" },
  "122": { logo: "HOTSTAR", color: "#113CCF" },
};

export default function Platform() {
  const { name: providerId } = useParams();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [heroMovie, setHeroMovie] = useState<any>(null);
  const [rows, setRows] = useState<{ title: string, data: any[], isLargeRow?: boolean }[]>([]);
  const [loading, setLoading] = useState(true);

  const provider = PROVIDERS.find(p => p.id === providerId) || PROVIDERS[0];
  const { logo, color } = NAVBAR_COLORS[providerId || "8"] || NAVBAR_COLORS["8"];

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
        const [
          trending,
          action,
          comedy,
          horror,
          romance,
        ] = await Promise.all([
          tmdbService.getMoviesByGenre("all", 1, "movie", undefined, providerId),
          tmdbService.getMoviesByGenre("28", 1, "movie", undefined, providerId),
          tmdbService.getMoviesByGenre("35", 1, "movie", undefined, providerId),
          tmdbService.getMoviesByGenre("27", 1, "movie", undefined, providerId),
          tmdbService.getMoviesByGenre("10749", 1, "movie", undefined, providerId),
        ]);

        if (trending.results.length > 0) {
          // Select a random popular movie for the hero
          const randomHero = trending.results[Math.floor(Math.random() * Math.min(5, trending.results.length))];
          setHeroMovie(randomHero);
        }

        setRows([
          { title: `${provider.name.toUpperCase()} TRENDING`, data: trending.results.slice(0, 10), isLargeRow: true },
          { title: "Action Movies", data: action.results },
          { title: "Comedy Movies", data: comedy.results },
          { title: "Horror Movies", data: horror.results },
          { title: "Romance Movies", data: romance.results },
        ]);
      } catch (error) {
        console.error("Failed to fetch platform data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatformData();
  }, [providerId]);

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
            <li className="text-white cursor-pointer transition hover:text-gray-300" onClick={() => navigate('/')}>Home</li>
            <li className="cursor-pointer transition hover:text-gray-300" onClick={() => navigate('/tv')}>TV Shows</li>
            <li className="cursor-pointer transition hover:text-gray-300" onClick={() => navigate('/movies')}>Movies</li>
            <li className="cursor-pointer transition hover:text-gray-300">New & Popular</li>
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
        <div className="relative h-[85vh] text-white w-full object-contain">
          <div className="absolute w-full h-full">
            <img
              src={tmdbService.getImageUrl(heroMovie.backdrop_path || heroMovie.poster_path, "original")}
              alt={heroMovie.title || heroMovie.name}
              className="w-full h-full object-cover"
            />
            {/* Overlay Gradients to blend into the background */}
            <div className="absolute top-0 w-full h-full bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#141414] to-transparent" />
          </div>

          <div className="relative pt-[25vh] md:pt-[35vh] px-4 md:px-12 w-full md:w-2/3 lg:w-1/2">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
              {heroMovie.title || heroMovie.name}
            </h1>
            
            <p className="text-lg md:text-xl font-medium drop-shadow-lg mb-6 max-w-2xl line-clamp-3">
              {heroMovie.overview}
            </p>

            <div className="flex gap-4">
              <button 
                 onClick={() => navigate(`/movie/${heroMovie.id}`)}
                 className="flex items-center gap-2 bg-white text-black px-6 py-2 md:py-3 rounded md:text-lg font-semibold hover:bg-white/80 transition"
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
          </div>
        </div>
      )}
      
      {/* Rows */}
      <div className="-mt-32 relative z-20">
        {rows.map((row, index) => (
          <div key={index} className="px-4 md:px-12 py-4 mb-4">
            <h2 className="text-white text-lg md:text-xl font-bold mb-3 md:mb-4">
              {row.title}
            </h2>
            
            <div className="flex overflow-y-hidden overflow-x-scroll scrollbar-hide gap-2 md:gap-4 py-4 -my-4 pl-1">
              {row.data.map((movie) => (
                <img
                  key={movie.id}
                  src={tmdbService.getImageUrl(row.isLargeRow ? movie.poster_path : backdropOrPoster(movie), "w500")}
                  alt={movie.title || movie.name}
                  onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
                  className={`
                    object-cover rounded-md cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:z-10
                    ${row.isLargeRow ? 'w-[150px] md:w-[200px] h-[225px] md:h-[300px]' : 'w-[200px] md:w-[280px] h-[112px] md:h-[157px]'}
                  `}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        ))}
      </div>

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
