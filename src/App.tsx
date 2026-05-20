import { useState, useEffect } from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./context/ThemeContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Sidebar from "./components/layout/Sidebar";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MovieDetail from "./pages/MovieDetail";
import PersonDetail from "./pages/PersonDetail";
import Watchlist from "./pages/Watchlist";
import Category from "./pages/Category";
import Platform from "./pages/Platform";
import SetupGuide from "./components/layout/SetupGuide";
import FloatingActions from "./components/layout/FloatingActions";
import { tmdbService } from "./services/tmdb";
import { MonitorPlay } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

function BootSequence({ onComplete }: { onComplete: () => void; key?: string }) {
  const [logs, setLogs] = useState<string[]>([]);
  const fullLogs = [
    "INITIATING SYS_HANDSHAKE...",
    "SECURE DECRYPTION_KEYS GENERATED...",
    "HANDSHAKE PROTOCOLS SYNCHRONIZED...",
    "CONNECTING TO NEXUS MAINFRAME...",
    "NEXUS_OS SYSTEM ONLINE. HELLO USER."
  ];

  useEffect(() => {
    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < fullLogs.length) {
        setLogs(prev => [...prev, fullLogs[currentLog]]);
        currentLog++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 550);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }} 
      exit={{ opacity: 0, scale: 1.05, filter: "blur(15px)" }} 
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 bg-[#030305] z-[9999] flex flex-col items-center justify-center font-mono text-cyan-400 p-8 select-none"
    >
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-4 mb-8">
          <MonitorPlay size={40} className="animate-pulse text-cyan-400" />
          <h1 className="text-3xl font-bold tracking-[0.4em] font-display text-white">NEXUS_OS</h1>
        </div>
        <div className="space-y-2 text-sm md:text-base opacity-80 min-h-[140px]">
          {logs.map((log, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-4">
              <span className="text-zinc-600">[{new Date().toISOString().split("T")[1].slice(0, 8)}]</span>
              <span className="tracking-tight">{log}</span>
            </motion.div>
          ))}
        </div>
        <div className="mt-8 h-1 w-full bg-zinc-900 rounded overflow-hidden">
          <div 
            className="h-full bg-cyan-400 transition-all duration-200 ease-out shadow-[0_0_15px_#00f3ff]"
            style={{ width: `${(logs.length / fullLogs.length) * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}

function AppLayout() {
  const isConfigured = tmdbService.isConfigured;
  const location = useLocation();
  const isPlatformPage = location.pathname.startsWith("/platform/");
  const [booted, setBooted] = useState(() => {
    return sessionStorage.getItem("nexus_booted") === "true";
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleBootComplete = () => {
    sessionStorage.setItem("nexus_booted", "true");
    setBooted(true);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {!booted && <BootSequence key="boot" onComplete={handleBootComplete} />}
      </AnimatePresence>

      <div className="min-h-screen flex flex-col font-sans relative overflow-hidden text-current bg-[#030305]">
        {/* Cinematic atmospheric layers */}
        <div className="noise-overlay" />
        <div className="scanlines" />
        <div className="ambient-mouse-glow" />

        {/* Grid Background */}
        {!isPlatformPage && (
          <>
            <div className="fixed inset-0 z-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMikiPjxwYXRoIGQ9Ik0wIC41SDMxLjVWMzIiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none"></div>

            <div className="fixed inset-0 z-10 pointer-events-none">
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,var(--color-brand)_0%,transparent_60%)] opacity-20 transform-gpu animate-pulse"></div>
              <div
                className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_60%)] opacity-20 transform-gpu animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>
          </>
        )}

        <div className="relative z-20 flex flex-col min-h-screen bg-transparent">
          {!isPlatformPage && <Navbar />}
          <Sidebar />
          <main className="flex-grow">
            {!isConfigured ? (
              <SetupGuide />
            ) : (
              <Routes>
                <Route path="/" element={<Home type="movie" />} />
                <Route path="/movies" element={<Home type="movie" />} />
                <Route path="/tv" element={<Home type="tv" />} />
                <Route
                  path="/category/:type/:slug"
                  element={<Category />}
                />
                <Route path="/platform/:name" element={<Platform />} />
                <Route path="/search" element={<Search />} />
                <Route path="/movie/:id" element={<MovieDetail />} />
                <Route path="/tv/:id" element={<MovieDetail />} />
                <Route path="/person/:id" element={<PersonDetail />} />
                <Route path="/watchlist" element={<Watchlist />} />
              </Routes>
            )}
          </main>
          {!isPlatformPage && <Footer />}
          <FloatingActions />
        </div>
      </div>
    </>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <WatchlistProvider>
          <HashRouter>
            <AppLayout />
          </HashRouter>
        </WatchlistProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
