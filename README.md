# IMDBflix - Professional Movie Discovery

IMDBflix is a high-end OTT-style movie discovery platform built with React, Tailwind CSS, and the TMDB/OMDb APIs.

## Features

- **OTT Interface**: Clean Netflix/Prime style UI with dark theme by default.
- **Advanced Search**: Search by movie title or directly paste an IMDb movie link (e.g., `https://www.imdb.com/title/tt1228705/`) to jump to technical details.
- **Interactive Details**: High-fidelity detail page with plot summaries, cast profile, and trailers.
- **Watch Providers**: Real-time "Where to Watch" integration (US-based).
- **Personal Watchlist**: Save movies to your local collection.
- **Theme Sync**: Toggle between Dark and Light modes with persistent settings.
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop.

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Animations**: Framer Motion (`motion`)
- **Data**: TMDB API (Primary), OMDb API (Ratings)

## Setup Instructions

1. **Obtain API Keys**:
   - Get a TMDB API Key from [themoviedb.org](https://www.themoviedb.org/documentation/api)
   - Get an OMDb API Key from [omdbapi.com](http://www.omdbapi.com/apikey.aspx)

2. **Environment Variables**:
   Create a `.env` file in the root (or use the AI Studio Secrets panel) and add:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_key_here
   VITE_OMDB_API_KEY=your_omdb_key_here
   ```

3. **Install & Run**:
   ```bash
   npm install
   npm run dev
   ```

## Disclaimer

This app is for information discovery purposes only. It does not host, stream, or facilitate piracy. All media information is sourced from official metadata providers.
