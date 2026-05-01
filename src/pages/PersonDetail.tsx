import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Star, TrendingUp, Info } from 'lucide-react';
import { tmdbService } from '../services/tmdb';
import { Movie } from '../types';
import MovieCard from '../components/movies/MovieCard';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import SEO from '../components/common/SEO';

const PersonDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerson = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await tmdbService.getPersonDetails(id);
        setPerson(data);
      } catch (error) {
        console.error('Error fetching person details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPerson();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-obsidian">
        <div className="text-2xl font-display font-black text-brand animate-pulse uppercase tracking-tighter">Loading Actor...</div>
      </div>
    );
  }

  if (!person) return <div className="pt-32 text-center text-zinc-500 font-bold">Actor not found</div>;

  const movies = person.movie_credits?.cast
    ?.sort((a: any, b: any) => b.popularity - a.popularity)
    ?.slice(0, 20) || [];

  return (
    <div className="pb-20 bg-obsidian text-white min-h-screen">
      <SEO 
        title={person.name}
        description={person.biography || `Full biography and filmography of ${person.name}.`}
        image={person.profile_path ? tmdbService.getImageUrl(person.profile_path, 'original') : undefined}
        type="profile"
      />
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-8 pt-40 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left: Bio & Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div className="relative group mb-10">
              <div className="absolute -inset-4 bg-brand/20 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <img 
                src={person.profile_path ? tmdbService.getImageUrl(person.profile_path, 'original') : 'https://via.placeholder.com/500x750?text=No+Image'} 
                alt={person.name}
                className="w-full rounded-[2.5rem] shadow-2xl relative z-10 border border-white/10"
              />
            </div>

            <div className="space-y-8 glass-card p-8 rounded-[2.5rem]">
              <h3 className="text-xs font-black uppercase text-brand tracking-[0.3em]">Personal Details</h3>
              
              <div className="space-y-6">
                {person.birthday && (
                  <div className="flex items-center gap-4 text-zinc-400">
                    <Calendar className="w-5 h-5 text-brand" />
                    <div>
                      <div className="text-[10px] uppercase font-black opacity-50">Born</div>
                      <div className="text-sm font-bold text-white">{person.birthday}</div>
                    </div>
                  </div>
                )}
                
                {person.place_of_birth && (
                  <div className="flex items-center gap-4 text-zinc-400">
                    <MapPin className="w-5 h-5 text-brand" />
                    <div>
                      <div className="text-[10px] uppercase font-black opacity-50">Birthplace</div>
                      <div className="text-sm font-bold text-white leading-tight">{person.place_of_birth}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4 text-zinc-400">
                  <TrendingUp className="w-5 h-5 text-brand" />
                  <div>
                    <div className="text-[10px] uppercase font-black opacity-50">Popularity</div>
                    <div className="text-sm font-bold text-white">{person.popularity.toFixed(1)}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Filmography */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8"
          >
            <div className="mb-12">
              <span className="text-brand font-black text-xs tracking-widest uppercase mb-4 block">Actor Spotlight</span>
              <h1 className="text-5xl md:text-8xl font-display font-black tracking-tighter leading-[0.8] mb-8 uppercase">
                {person.name}
              </h1>
              
              {person.biography && (
                <div className="mb-16">
                  <h3 className="text-xs font-black uppercase text-zinc-500 tracking-[0.3em] mb-6 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Biography
                  </h3>
                  <p className="text-zinc-400 leading-relaxed text-lg font-medium line-clamp-6 hover:line-clamp-none transition-all cursor-pointer">
                    {person.biography}
                  </p>
                </div>
              )}
            </div>

            <section>
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-display font-black tracking-tight uppercase">MOST KNOWN <span className="text-brand">FOR</span></h2>
                <div className="h-[1px] flex-grow mx-8 bg-white/5" />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {movies.map((movie: Movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PersonDetail;
