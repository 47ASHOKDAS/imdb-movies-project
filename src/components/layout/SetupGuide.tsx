import React from 'react';
import { Key, AlertCircle, ExternalLink } from 'lucide-react';

const SetupGuide: React.FC = () => {
  return (
    <div className="pt-32 px-6 flex items-center justify-center min-h-[70vh]">
      <div className="max-w-md w-full glass p-10 rounded-3xl text-center border-brand/20">
        <div className="w-20 h-20 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <Key className="w-10 h-10 text-brand" />
        </div>
        
        <h2 className="text-3xl font-black mb-4 tracking-tight">API Key Required</h2>
        
        <p className="text-zinc-400 mb-8 leading-relaxed">
          To browse movies and see ratings, you need to provide your TMDB and OMDb API keys in the 
          <span className="text-white font-bold"> Secrets</span> panel in AI Studio.
        </p>

        <div className="space-y-4 text-left mb-10">
          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
            <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-brand rounded-full" />
              TMDB API Key
            </h4>
            <p className="text-xs text-zinc-500 mb-2">Required for movie data & posters</p>
            <a 
              href="https://www.themoviedb.org/settings/api" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-brand hover:underline flex items-center gap-1"
            >
              Get from TMDB <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
            <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              OMDb API Key
            </h4>
            <p className="text-xs text-zinc-500 mb-2">Required for IMDb ratings</p>
            <a 
              href="http://www.omdbapi.com/apikey.aspx" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-yellow-500 hover:underline flex items-center gap-1"
            >
              Get from OMDb <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-brand/10 p-4 rounded-xl text-left border border-brand/20">
          <AlertCircle className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <p className="text-xs text-brand leading-relaxed font-medium">
            After adding the keys, please wait for the app to refresh or manually click "Restart Server" if needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;
