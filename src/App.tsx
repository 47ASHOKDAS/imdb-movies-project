import { HashRouter, Route, Routes } from "react-router-dom";
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
import SetupGuide from "./components/layout/SetupGuide";
import FloatingActions from "./components/layout/FloatingActions";
import { tmdbService } from "./services/tmdb";

export default function App() {
  const isConfigured = tmdbService.isConfigured;

  return (
    <HelmetProvider>
      <ThemeProvider>
        <WatchlistProvider>
          <HashRouter>
            <div className="min-h-screen flex flex-col font-sans relative overflow-hidden text-current bg-transparent">
              {/* Grid Background */}
              <div className="fixed inset-0 z-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wMikiPjxwYXRoIGQ9Ik0wIC41SDMxLjVWMzIiLz48L3N2Zz4=')] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none"></div>

              {/* Background gradient orbs - Optimized with radial gradients instead of blur filters for buttery smooth performance */}
              <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,var(--color-brand)_0%,transparent_60%)] opacity-20 transform-gpu animate-pulse"></div>
                <div
                  className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle_at_center,var(--color-accent)_0%,transparent_60%)] opacity-20 transform-gpu animate-pulse"
                  style={{ animationDelay: "2s" }}
                ></div>
                <div
                  className="absolute top-[30%] left-[30%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(88,28,135,0.8)_0%,transparent_60%)] opacity-10 transform-gpu animate-pulse"
                  style={{ animationDelay: "4s" }}
                ></div>
              </div>

              <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
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
          </HashRouter>
        </WatchlistProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
