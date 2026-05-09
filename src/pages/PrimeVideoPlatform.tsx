import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  User, 
  Play, 
  Plus, 
  Info, 
  ChevronLeft, 
  ChevronRight, 
  Menu,
  Check,
  Loader2,
  X
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { tmdbService } from '../services/tmdb';
import { PROVIDERS } from '../components/layout/Sidebar';
import { motion, AnimatePresence } from "motion/react";

const Navbar = ({ activeTab, onTabChange, searchQuery, setSearchQuery, isSearchOpen, setIsSearchOpen }: any) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#0f171e]' : 'bg-gradient-to-b from-[#0f171e]/90 to-transparent'} px-4 py-3 flex items-center justify-between`}>
      <div className="flex items-center space-x-6">
        {/* Mobile Menu Icon */}
        <button className="lg:hidden text-gray-300 hover:text-white">
          <Menu size={24} />
        </button>
        
        {/* Logo */}
        <div className="text-xl font-bold tracking-tighter text-white flex items-center cursor-pointer" onClick={() => onTabChange('home')}>
          <span className="text-[#00a8e1] mr-1">prime</span> video
        </div>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center space-x-6 text-gray-300 font-medium text-sm">
          <button className={`hover:text-white transition-colors ${!searchQuery && activeTab === 'home' ? 'text-white font-bold border-b-2 border-white pb-1' : ''}`} onClick={() => onTabChange('home')}>Home</button>
          <button className={`hover:text-white transition-colors ${!searchQuery && activeTab === 'movies' ? 'text-white font-bold border-b-2 border-white pb-1' : ''}`} onClick={() => onTabChange('movies')}>Movies</button>
          <button className={`hover:text-white transition-colors ${!searchQuery && activeTab === 'tv' ? 'text-white font-bold border-b-2 border-white pb-1' : ''}`} onClick={() => onTabChange('tv')}>TV Shows</button>
          <button className={`hover:text-white transition-colors ${!searchQuery && activeTab === 'new' ? 'text-white font-bold border-b-2 border-white pb-1' : ''}`} onClick={() => onTabChange('new')}>Categories</button>
          <button className="hover:text-white transition-colors" onClick={() => navigate('/watchlist')}>My Stuff</button>
        </div>
      </div>

      <div className="flex items-center space-x-4 lg:space-x-6 text-gray-300">
        <div className="flex items-center">
            <div className={`flex items-center transition-all duration-300 ${isSearchOpen || searchQuery.length > 0 ? 'w-48 bg-black/50 border border-white/80 px-2 rounded' : 'w-6 bg-transparent border-transparent px-0'} overflow-hidden`}>
              <Search 
                className="w-5 h-5 cursor-pointer flex-shrink-0 hover:text-white transition-colors" 
                onClick={() => {
                  if (searchQuery.length > 0) {
                    setSearchQuery("");
                  } else {
                    setIsSearchOpen(!isSearchOpen);
                    if (!isSearchOpen) {
                      setTimeout(() => searchInputRef.current?.focus(), 100);
                    }
                  }
                }} 
              />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Search Prime" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`bg-transparent text-sm text-white placeholder-gray-400 outline-none w-full ml-2 transition-opacity duration-300 ${isSearchOpen || searchQuery.length > 0 ? 'opacity-100 py-1' : 'opacity-0 py-0'}`}
              />
            </div>
          </div>
        <button className="hover:text-white transition-colors flex items-center space-x-2">
          <img src="https://m.media-amazon.com/images/G/02/CerberusPrimeVideo-FN38FSBD/adult-1.png" alt="User Profile" className="w-8 h-8 rounded-sm object-cover" />
        </button>
      </div>
    </nav>
  );
};

const Hero = ({ movies, navigate }: any) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll the hero carousel
  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 7000); // Change movie every 7 seconds
    return () => clearInterval(timer);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % movies.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1));

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] lg:h-[90vh] bg-[#0f171e] overflow-hidden group">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-10"
        >
          <motion.img 
            initial={{ scale: 1 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
            src={tmdbService.getImageUrl(movies[currentIndex].backdrop_path || movies[currentIndex].poster_path, "original")} 
            alt={movies[currentIndex].title || movies[currentIndex].name}
            className="w-full h-full object-cover object-center"
          />
          {/* Gradients for blending */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-[#0f171e]/10 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentIndex}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative z-20 h-full flex flex-col justify-end pb-32 md:pb-48 px-4 md:px-12 lg:w-1/2"
        >
          <div className="flex items-center space-x-2 mb-2">
            <span className="bg-[#00a8e1] text-white text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
              Prime
            </span>
            <span className="text-gray-300 text-sm font-semibold tracking-wide uppercase">
              {movies[currentIndex].media_type === "tv" ? "TV Series" : "Movie"}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3 leading-tight drop-shadow-lg">
            {movies[currentIndex].title || movies[currentIndex].name}
          </h1>

          {/* Extended Metadata */}
          <div className="flex items-center space-x-3 text-sm md:text-base text-gray-300 mb-4 font-medium">
            <span className="text-[#00a8e1]">{(movies[currentIndex].release_date || movies[currentIndex].first_air_date)?.substring(0, 4)}</span>
            <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
            <span className="border border-gray-400 px-1 rounded text-xs md:text-sm font-bold text-gray-400">
              {movies[currentIndex].adult ? "18+" : "13+"}
            </span>
          </div>
          
          <p className="text-gray-300 text-sm md:text-base lg:text-lg mb-8 line-clamp-3 md:line-clamp-4 max-w-2xl drop-shadow-md">
            {movies[currentIndex].overview}
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => navigate(`/${movies[currentIndex].media_type || 'movie'}/${movies[currentIndex].id}`)} className="bg-[#00a8e1] hover:bg-[#0095c8] text-white font-bold py-3 px-8 rounded-md flex items-center transition-all hover:scale-105 active:scale-95 shadow-lg">
              <Play size={20} className="mr-2 fill-current" />
              Play
            </button>
            
            <button className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-md flex items-center backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
              <Plus size={20} className="mr-2" />
            </button>
            
            <button onClick={() => navigate(`/${movies[currentIndex].media_type || 'movie'}/${movies[currentIndex].id}`)} className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-4 rounded-md flex items-center backdrop-blur-sm transition-all hover:scale-105 active:scale-95">
              <Info size={20} className="mr-2" />
              Details
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel Navigation Indicators (Dots) */}
      <div className="absolute bottom-8 right-12 z-30 hidden md:flex space-x-2">
        {movies.map((_: any, index: number) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white w-6' : 'bg-gray-500 hover:bg-gray-300'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Prev/Next Navigation Arrows (Shows on Hover) */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hidden md:flex hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={36} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-black/60 hidden md:flex hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={36} />
      </button>
    </div>
  );
};

const VideoCard = ({ item, navigate }: any) => {
  const isPrime = Math.random() > 0.3; // Mock Prime badge
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isFetchingTrailer, setIsFetchingTrailer] = useState(false);

  const handlePlayTrailer = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFetchingTrailer) return;
    setIsFetchingTrailer(true);
    try {
      const details =
        item.media_type === "tv" || (!item.media_type && item.first_air_date)
          ? await tmdbService.getTvDetails(item.id)
          : await tmdbService.getMovieDetails(item.id);
      const trailer =
        details.videos?.results?.find(
          (v: any) => v.type === "Trailer" && v.site === "YouTube"
        ) || details.videos?.results?.find((v: any) => v.site === "YouTube");
      if (trailer) {
        setTrailerKey(trailer.key);
      } else {
        alert("No trailer available for this title.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetchingTrailer(false);
    }
  };

  return (
    <>
      <div onClick={() => navigate(`/${item.media_type || 'movie'}/${item.id}`)} className="relative flex-none w-[200px] md:w-[260px] lg:w-[300px] h-[112px] md:h-[146px] lg:h-[168px] rounded-md overflow-hidden group cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.12] hover:z-50 hover:shadow-2xl hover:shadow-black bg-gray-800 hover:ring-2 hover:ring-white/50">
        <img 
          src={tmdbService.getImageUrl(item.backdrop_path || item.poster_path, "w500")} 
          alt={item.title || item.name} 
          className="w-full h-full object-cover rounded-md"
          loading="lazy"
        />
        
        {/* Prime Badge */}
        {isPrime && (
          <div className="absolute top-2 left-2 bg-[#00a8e1] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm flex items-center shadow-md">
            <Check size={10} className="mr-0.5" /> prime
          </div>
        )}

        {/* Hover Overlay Details */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 rounded-md">
          <h3 className="text-white font-bold text-sm md:text-base truncate mb-2">{item.title || item.name}</h3>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePlayTrailer} 
              className="bg-white rounded-full p-2 hover:bg-gray-200 transition-colors"
            >
              {isFetchingTrailer ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              ) : (
                <Play size={14} className="text-black fill-current" />
              )}
            </button>
            <button className="border border-gray-400 rounded-full p-2 hover:border-white hover:text-white text-gray-400 transition-colors">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Trailer Modal via Portal (using fixed position, no need portal here since our structure works) */}
      <AnimatePresence>
        {trailerKey && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-12" onClick={(e) => e.stopPropagation()}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/20"
            >
              <button
                onClick={() => setTrailerKey(null)}
                className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                title="Trailer"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

const VideoCarousel = ({ title, items, navigate }: any) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const handleScroll = () => {
    if (rowRef.current) {
      setShowLeftArrow(rowRef.current.scrollLeft > 0);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth + 100 : clientWidth - 100;
      rowRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-10 px-4 md:px-12 relative group">
      <h2 className="text-white text-lg md:text-xl font-bold mb-3 flex items-center">
        <span className="text-[#00a8e1] mr-2">Prime</span> {title}
      </h2>
      
      <div className="relative">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 top-0 bottom-0 z-40 w-12 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white hover:bg-black/80 rounded-l-md"
          >
            <ChevronLeft size={36} />
          </button>
        )}

        {/* Scrollable Container */}
        <div 
          ref={rowRef}
          onScroll={handleScroll}
          className="flex space-x-3 overflow-x-auto overflow-y-visible scrollbar-hide py-12 -my-6 px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item: any) => (
            <VideoCard key={item.id} item={item} navigate={navigate} />
          ))}
        </div>

        {/* Right Arrow */}
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-40 w-12 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white hover:bg-black/80 rounded-r-md"
        >
          <ChevronRight size={36} />
        </button>
      </div>

    </div>
  );
};

const Footer = () => {
  return (
    <footer className="mt-20 py-10 text-center text-gray-400 text-sm border-t border-gray-800">
      <div className="flex justify-center items-center space-x-2 mb-4">
         <span className="text-xl font-bold text-white"><span className="text-[#00a8e1]">prime</span> video</span>
      </div>
      <div className="flex justify-center space-x-6 mb-4">
        <a href="#" className="hover:text-white transition-colors">Terms and Privacy Notice</a>
        <a href="#" className="hover:text-white transition-colors">Send us feedback</a>
        <a href="#" className="hover:text-white transition-colors">Help</a>
      </div>
      <p>© 1996-2026, Amazon.com, Inc. or its affiliates</p>
    </footer>
  );
};

const CATEGORY_CARDS = [
  { id: 1, title: 'Action and adventure', glow: 'bg-blue-500' },
  { id: 2, title: 'Anime', glow: 'bg-indigo-500' },
  { id: 3, title: 'Comedy', glow: 'bg-yellow-500' },
  { id: 4, title: 'Documentary', glow: 'bg-green-500' },
  { id: 5, title: 'Drama', glow: 'bg-red-500' },
  { id: 6, title: 'Fantasy', glow: 'bg-purple-500' },
  { id: 7, title: 'Horror', glow: 'bg-gray-500' },
  { id: 8, title: 'Kids', glow: 'bg-teal-500' },
  { id: 9, title: 'Mystery and thrillers', glow: 'bg-cyan-500' },
  { id: 10, title: 'Romance', glow: 'bg-pink-500' },
  { id: 11, title: 'Science fiction', glow: 'bg-blue-400' },
  { id: 12, title: 'Suspense', glow: 'bg-red-600' },
];

const CategoryCard: React.FC<{ title: string; glow: string; onClick: () => void }> = ({ title, glow, onClick }) => {
  return (
    <div onClick={onClick} className="relative h-28 rounded-xl overflow-hidden cursor-pointer group flex items-center p-6 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 hover:border-white transition-all duration-300">
      <div className={`absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-500 blur-2xl ${glow}`} />
      <h3 className="text-white font-bold text-lg relative z-10 drop-shadow-md tracking-wide">{title}</h3>
    </div>
  );
};

const MegaMenu = ({ onCategoryClick, onTabChange }: { onCategoryClick: (name: string) => void, onTabChange: (tab: any) => void }) => {
  return (
    <div className="absolute top-0 right-0 w-[380px] bg-[#0f171e] h-full min-h-[85vh] border-l border-gray-800 p-8 pt-12 z-10 text-sm shadow-2xl">
      <div className="mb-10">
        <h3 className="text-white font-extrabold text-lg mb-4 tracking-wide">Top categories</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <span onClick={() => onTabChange('home')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">Included with Prime</span>
          <span onClick={() => onCategoryClick('Amazon Originals')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">Amazon Originals</span>
          <span onClick={() => onTabChange('movies')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">Movies</span>
          <span onClick={() => onTabChange('tv')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">TV</span>
          <span onClick={() => onCategoryClick('Kids')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">Kids</span>
        </div>
      </div>
      <div className="mb-10">
        <h3 className="text-white font-extrabold text-lg mb-4 tracking-wide">Audio languages</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <span onClick={() => onCategoryClick('English')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">English</span>
          <span onClick={() => onCategoryClick('Hindi')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">Hindi</span>
          <span onClick={() => onCategoryClick('Telugu')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">Telugu</span>
          <span onClick={() => onCategoryClick('Tamil')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">Tamil</span>
          <span onClick={() => onCategoryClick('Malayalam')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">Malayalam</span>
        </div>
      </div>
       <div className="mb-10">
        <h3 className="text-white font-extrabold text-lg mb-4 tracking-wide">Other categories</h3>
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          <span onClick={() => onCategoryClick('Award winners')} className="text-gray-400 hover:text-white cursor-pointer transition-colors font-medium">Award winners</span>
        </div>
      </div>
    </div>
  );
};

export default function PrimeVideoPlatform({ providerId }: { providerId: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'home' | 'tv' | 'movies' | 'new'>('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreSearch, setHasMoreSearch] = useState(true);
  
  const [heroMovies, setHeroMovies] = useState<any[]>([]);
  const [rows, setRows] = useState<{ title: string, data: any[] }[]>([]);
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (tab: 'home' | 'tv' | 'movies' | 'new') => {
    setActiveTab(tab);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  useEffect(() => {
    setActiveTab('home');
    setSearchQuery("");
    setIsSearchOpen(false);
  }, [providerId]);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchPage(1);
      setHasMoreSearch(true);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setSearchPage(1);
      try {
        const results = await tmdbService.getMoviesByCategoryName(searchQuery, providerId || "119", 1);
        setSearchResults(results.results);
        if (results.results.length < 10) setHasMoreSearch(false);
        else setHasMoreSearch(true);
      } catch (error) {
        console.error("Platform search error", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, providerId]);

  // Load more search results when page increments
  useEffect(() => {
    if (searchPage === 1 || searchQuery.trim().length === 0 || !hasMoreSearch) return;
    
    const loadMore = async () => {
      setIsSearching(true);
      try {
        const results = await tmdbService.getMoviesByCategoryName(searchQuery, providerId || "119", searchPage);
        if (results.results.length === 0) {
          setHasMoreSearch(false);
        } else {
          setSearchResults(prev => {
            const newRes = [...prev, ...results.results];
            // keep unique
            return Array.from(new Map(newRes.map(item => [`${item.id}-${item.media_type}`, item])).values());
          });
        }
      } catch (error) {
        console.error("Platform search pagination error", error);
      } finally {
        setIsSearching(false);
      }
    };
    loadMore();
  }, [searchPage]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (searchQuery.trim().length === 0 || !hasMoreSearch || isSearching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setSearchPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [searchQuery, hasMoreSearch, isSearching]);

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
          r1Title = "Action and adventure movies";
          r2Title = "Comedy movies";
          r3Title = "Popular TV Shows";
          r4Title = "Romance movies";
        } else if (activeTab === 'tv') {
          [trending, r1, r2, r3, r4] = await Promise.all([
            tmdbService.getMoviesByGenre("all", 1, "tv", undefined, providerId),
            tmdbService.getMoviesByGenre("10759", 1, "tv", undefined, providerId),
            tmdbService.getMoviesByGenre("35", 1, "tv", undefined, providerId),
            tmdbService.getMoviesByGenre("18", 1, "tv", undefined, providerId),
            tmdbService.getMoviesByGenre("16", 1, "tv", undefined, providerId),
          ]);
          r1Title = "Action & Adventure TV";
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
          setHeroMovies(trending.results.slice(0, 5));
        }

        setRows([
          { title: activeTab === 'new' ? 'New Releases' : 'Trending', data: trending?.results || [] },
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
      <div className="bg-[#0f171e] min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#00a8e1] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f171e] font-sans selection:bg-[#00a8e1] selection:text-white pb-8 z-50 relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
      `}} />
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} searchQuery={searchQuery} setSearchQuery={setSearchQuery} isSearchOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
      <main>
        {searchQuery.trim().length > 0 ? (
          <div className="pt-32 px-4 md:px-12 pb-20 min-h-[70vh]">
            <h2 className="text-gray-400 text-xl mb-6">
              Search results for: <span className="text-white font-semibold">{searchQuery}</span>
            </h2>
            {isSearching && searchPage === 1 ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-12 h-12 text-[#00a8e1] animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {searchResults.map((item: any) => (
                    <VideoCard key={item.id} item={item} navigate={navigate} />
                  ))}
                </div>
                {hasMoreSearch && (
                  <div ref={loaderRef} className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-[#00a8e1] animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg">Your search for "{searchQuery}" did not have any matches.</p>
              </div>
            )}
          </div>
        ) : activeTab === 'new' ? (
          <div className="pt-24 min-h-[85vh]">
            <main className="px-12 py-10 relative h-full">
              <h1 className="text-[32px] font-extrabold text-white mb-8 tracking-tight">
                Categories
              </h1>

              {/* Categories Grid (Partially obscured by MegaMenu in the design) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pr-[400px]">
                {CATEGORY_CARDS.map((category) => (
                  <CategoryCard 
                    key={category.id} 
                    title={category.title} 
                    glow={category.glow} 
                    onClick={() => {
                      setSearchQuery(category.title);
                      // Let's also hide the categories view by pretending we just searched
                    }}
                  />
                ))}
              </div>

              {/* Floating Mega Menu Overlay exactly as shown in the image */}
              <MegaMenu onCategoryClick={(name) => setSearchQuery(name)} onTabChange={handleTabChange} />
            </main>
          </div>
        ) : (
          <>
            <Hero movies={heroMovies} navigate={navigate} />
            <div className="-mt-16 md:-mt-32 relative z-30 pb-16">
              {rows.map((row, index) => (
                <VideoCarousel 
                  key={index} 
                  title={row.title} 
                  items={row.data}
                  navigate={navigate}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
