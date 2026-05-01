import React, { useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import Hero from '../components/movies/Hero';
import SEO from '../components/common/SEO';

const Home: React.FC = () => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const trendingRes = await tmdbService.getTrending();
        setTrending(trendingRes.results);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="pt-20 bg-obsidian min-h-screen">
        <div className="h-[80vh] bg-zinc-900/20 animate-pulse rounded-3xl mx-8 mt-8" />
      </div>
    );
  }

  return (
    <div className="bg-obsidian min-h-screen overflow-x-hidden flex flex-col">
      <SEO 
        title="IMDBflix - Unlimited Cinema" 
        description="Stream top-rated movies and find your next favorite film. High-quality trailers and personalized watchlists available on IMDBflix."
      />
      
      {trending.length > 0 && (
        <div className="flex-grow flex flex-col">
          <Hero movie={trending[0]} />
        </div>
      )}
    </div>
  );
};

export default Home;
