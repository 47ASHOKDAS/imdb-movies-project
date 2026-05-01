import React from 'react';
import { Clapperboard, Github, Instagram, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="py-12 px-6 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2">
            <Clapperboard className="w-6 h-6 text-brand" />
            <span className="text-xl font-bold tracking-tighter">IMDBflix</span>
          </div>
          <p className="text-zinc-500 text-sm max-w-xs text-center md:text-left">
            Your ultimate destination for movie discovery and watchlist management. All data provided by TMDB and OMDb.
          </p>
        </div>

        <div className="flex gap-8">
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Platform</h4>
            <a href="#" className="text-zinc-500 text-sm hover:text-brand">About Us</a>
            <a href="#" className="text-zinc-500 text-sm hover:text-brand">Careers</a>
            <a href="#" className="text-zinc-500 text-sm hover:text-brand">Privacy</a>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-semibold text-sm">Social</h4>
            <div className="flex gap-4">
              <Twitter className="w-5 h-5 text-zinc-500 hover:text-brand cursor-pointer" />
              <Instagram className="w-5 h-5 text-zinc-500 hover:text-brand cursor-pointer" />
              <Github className="w-5 h-5 text-zinc-500 hover:text-brand cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 text-center text-zinc-600 text-xs">
        © {new Date().getFullYear()} IMDBflix. No movies are hosted on this server.
      </div>
    </footer>
  );
};

export default Footer;
