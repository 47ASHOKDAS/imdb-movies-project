import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from './context/ThemeContext';
import { WatchlistProvider } from './context/WatchlistContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Search from './pages/Search';
import MovieDetail from './pages/MovieDetail';
import PersonDetail from './pages/PersonDetail';
import Watchlist from './pages/Watchlist';
import SetupGuide from './components/layout/SetupGuide';
import FloatingActions from './components/layout/FloatingActions';
import { tmdbService } from './services/tmdb';

export default function App() {
  const isConfigured = tmdbService.isConfigured;

  return (
    <HelmetProvider>
      <ThemeProvider>
        <WatchlistProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col font-sans relative">
              <Navbar />
              <main className="flex-grow">
                {!isConfigured ? (
                  <SetupGuide />
                ) : (
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/movie/:id" element={<MovieDetail />} />
                    <Route path="/person/:id" element={<PersonDetail />} />
                    <Route path="/watchlist" element={<Watchlist />} />
                  </Routes>
                )}
              </main>
              <Footer />
              <FloatingActions />
            </div>
          </BrowserRouter>
        </WatchlistProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
