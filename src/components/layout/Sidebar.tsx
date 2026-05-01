import React from 'react';
import { Film, Zap, Star, LayoutGrid, Flame, Heart, Ghost, Rocket, Laugh } from 'lucide-react';
import { cn } from '../../lib/utils';

export const GENRES = [
  { id: 'all', name: 'All', icon: LayoutGrid },
  { id: '28', name: 'Action', icon: Zap },
  { id: '35', name: 'Comedy', icon: Laugh },
  { id: '18', name: 'Drama', icon: Film },
  { id: '27', name: 'Horror', icon: Ghost },
  { id: '878', name: 'Sci-Fi', icon: Rocket },
  { id: '10749', name: 'Romance', icon: Heart },
];

interface SidebarProps {
  selectedGenre: string;
  onSelectGenre: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedGenre, onSelectGenre }) => {
  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 pt-24 px-6 border-r border-white/5 bg-obsidian z-40">
      <div className="space-y-8">
        <div>
          <h3 className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase mb-6 px-4">Browse</h3>
          <div className="space-y-1">
            {GENRES.map((genre) => {
              const Icon = genre.icon;
              return (
                <button
                  key={genre.id}
                  onClick={() => onSelectGenre(genre.id)}
                  className={cn(
                    "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group",
                    selectedGenre === genre.id 
                      ? "bg-brand/10 text-brand shadow-[0_0_20px_rgba(139,92,246,0.2)]" 
                      : "text-zinc-500 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "w-5 h-5 transition-transform group-hover:scale-110",
                    selectedGenre === genre.id ? "text-brand" : "text-zinc-500"
                  )} />
                  <span className="text-sm font-bold tracking-tight">{genre.name}</span>
                  {selectedGenre === genre.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand shadow-[0_0_10px_#8b5cf6]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="text-[10px] font-black tracking-[0.3em] text-zinc-500 uppercase mb-6 px-4">Library</h3>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all group">
            <Flame className="w-5 h-5 group-hover:text-brand" />
            <span className="text-sm font-bold tracking-tight">Top Rated</span>
          </button>
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-zinc-500 hover:bg-white/5 hover:text-white transition-all group">
            <Star className="w-5 h-5 group-hover:text-brand" />
            <span className="text-sm font-bold tracking-tight">Popular</span>
          </button>
        </div>
      </div>

      <div className="mt-auto pb-10 px-4">
        <div className="p-6 rounded-[2rem] bg-gradient-to-br from-brand/20 to-transparent border border-white/10 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-brand/20 blur-2xl group-hover:scale-150 transition-transform" />
          <p className="text-[10px] font-black text-brand tracking-widest uppercase mb-2">Pro Plan</p>
          <p className="text-xs font-bold text-white mb-4 leading-relaxed">Upgrade for ad-free experience</p>
          <button className="w-full py-2.5 rounded-xl bg-brand text-white text-[10px] font-black tracking-widest uppercase shadow-lg shadow-brand/20 hover:shadow-brand/40 transition-all">Go Pro</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
