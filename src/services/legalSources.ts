export interface VideoServer {
  id: number;
  name: string;
  url: string;
  desc: string;
  tag: string;
  quality: string;
  isFailing?: boolean; // For demonstrating the automatic failover workflow
}

export interface LegalMovieSource {
  id: string;
  title: string;
  servers: VideoServer[];
}

export const DEMO_LEGAL_MOVIES: LegalMovieSource[] = [
  {
    id: "demo-sintel",
    title: "Sintel (Creative Commons Film)",
    servers: [
      {
        id: 1,
        name: "Server 1 (Primary - East Coast CDN)",
        url: "https://invalid-failing-cdn-server1.club/sintel_1080p.mp4", // Intentionally broken stream to demonstrate auto-fallback
        desc: "Primary UHD Fiber node bandwidth. Direct connection.",
        tag: "Primary",
        quality: "1080p Direct",
        isFailing: true
      },
      {
        id: 2,
        name: "Server 2 (Stable - Cloudflare CDN)",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        desc: "Global edge network caching. Perfect uptime and routing.",
        tag: "Recommended",
        quality: "1080p MP4"
      },
      {
        id: 3,
        name: "Server 3 (Fallback - Adaptive HLS)",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        desc: "Adaptive bitrate HTTP Live Streaming. Handles slow connections.",
        tag: "Reliable",
        quality: "Auto HLS"
      }
    ]
  },
  {
    id: "demo-bunny",
    title: "Big Buck Bunny (Animation Demo)",
    servers: [
      {
        id: 1,
        name: "Server 1 (Primary - London Hub)",
        url: "https://broken-node-primary-cdn-server1.net/bunny.mp4", // Broken stream
        desc: "High performance CDN edge socket in Europe.",
        tag: "Primary",
        quality: "1080p Direct",
        isFailing: true
      },
      {
        id: 2,
        name: "Server 2 (Stable - Google CDN)",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        desc: "Official public asset delivery system. Fast & stable.",
        tag: "Recommended",
        quality: "1080p MP4"
      },
      {
        id: 3,
        name: "Server 3 (Fallback - Adaptive HLS)",
        url: "https://playertest.longtailvideo.com/adaptive/oceans/oceans.m3u8",
        desc: "Guaranteed fallback adaptive stream mapped for cross-device support.",
        tag: "Reliable",
        quality: "Auto HLS"
      }
    ]
  },
  {
    id: "demo-tears",
    title: "Tears of Steel (Sci-Fi Demo Film)",
    servers: [
      {
        id: 1,
        name: "Server 1 (Primary - Tokyo Node)",
        url: "https://slow-and-failing-dns-tokyo.org/tears_of_steel.mp4", // Broken stream
        desc: "Fast peering node in Japan. Excellent latency.",
        tag: "Primary",
        quality: "1080p Direct",
        isFailing: true
      },
      {
        id: 2,
        name: "Server 2 (Stable - Web Server Mirror)",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        desc: "Standard compressed stream format. Highly compatible.",
        tag: "Recommended",
        quality: "1080p MP4"
      },
      {
        id: 3,
        name: "Server 3 (Fallback - Adaptive HLS)",
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
        desc: "Universal backup stream ensuring high playback success.",
        tag: "Reliable",
        quality: "Auto HLS"
      }
    ]
  }
];

export function getCustomServersForMovie(id: string): VideoServer[] | null {
  try {
    const saved = localStorage.getItem(`custom_servers_${id}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Error loading custom servers", e);
  }
  return null;
}

export function saveCustomServersForMovie(id: string, servers: VideoServer[]) {
  try {
    localStorage.setItem(`custom_servers_${id}`, JSON.stringify(servers));
  } catch (e) {
    console.error("Error saving custom servers", e);
  }
}

export function getLegalSourceForMovie(id: string, title: string): LegalMovieSource {
  // Check if user has defined custom servers for this movie
  const customServers = getCustomServersForMovie(id);
  if (customServers && customServers.length > 0) {
    return {
      id: String(id),
      title: title,
      servers: customServers
    };
  }

  // If matched directly by a demo key
  const matched = DEMO_LEGAL_MOVIES.find(m => m.id === id);
  if (matched) return matched;

  // Otherwise, procedurally generate a legal video source mapping for any TMDB film ID
  const sum = String(id).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = Math.abs(sum) % DEMO_LEGAL_MOVIES.length;
  const picked = DEMO_LEGAL_MOVIES[index];

  // Map the TMDB title dynamically in place
  return {
    id: String(id),
    title: title || picked.title,
    servers: picked.servers.map(srv => ({
      ...srv,
      // Keep descriptions and links exactly correct but custom
    }))
  };
}
