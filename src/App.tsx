import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "./context/ThemeContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Search from "./pages/Search";
import MovieDetail from "./pages/MovieDetail";
import PersonDetail from "./pages/PersonDetail";
import Watchlist from "./pages/Watchlist";
import Category from "./pages/Category";
import SetupGuide from "./components/layout/SetupGuide";
import FloatingActions from "./components/layout/FloatingActions";
import { tmdbService } from "./services/tmdb";

export default function App() {
  const isConfigured = tmdbService.isConfigured;

  return (
    <HelmetProvider>
      <ThemeProvider>
        <WatchlistProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col font-sans relative overflow-hidden bg-obsidian">
              {/* Grid Background */}
              <div className="fixed inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMikiPjxwYXRoIGQ9Ik0wIC41SDMxLjVWMzIiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none"></div>
              
              {/* Background gradient orbs */}
              <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[120px] animate-pulse" style={{ animationDelay: "2s" }}></div>
                <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-purple-900 blur-[150px] animate-pulse" style={{ animationDelay: "4s" }}></div>
              </div>

              <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
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
                      <Route path="/search" element={<Search />} />
                      <Route path="/movie/:id" element={<MovieDetail />} />
                      <Route path="/tv/:id" element={<MovieDetail />} />
                      <Route path="/person/:id" element={<PersonDetail />} />
                      <Route path="/watchlist" element={<Watchlist />} />
                    </Routes>
                  )}
                </main>
                <Footer />
                <FloatingActions />
              </div>
            </div>
          </BrowserRouter>
        </WatchlistProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
