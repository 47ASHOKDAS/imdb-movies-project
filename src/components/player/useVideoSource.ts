import { useState, useEffect } from "react";
import { VideoServer, getLegalSourceForMovie } from "../../services/legalSources";

export interface UseVideoSourceResult {
  isLoading: boolean;
  error: string | null;
  signedUrl: string | null;
  format: "mp4" | "hls" | "unsupported";
}

/**
 * Custom React Hook: useVideoSource
 * Securely retrieves the video streaming source for a specific Movie ID.
 * Ensures no random fallbacks occur, logs critical identifiers, and simulates
 * loading secure temporary/signed URLs from a remote backend.
 */
export function useVideoSource(
  movieId: string | null | undefined,
  server: VideoServer | null
): UseVideoSourceResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<"mp4" | "hls" | "unsupported">("mp4");

  useEffect(() => {
    // 1. Confirm the clicked movieId is reaching the hook/player
    console.log("[useVideoSource] Running for movieId:", movieId);

    if (!movieId) {
      console.log("[useVideoSource] Error: missing movieId");
      setError("Missing Movie ID: No stream target identified.");
      setSignedUrl(null);
      setIsLoading(false);
      return;
    }

    if (!server) {
      console.log("[useVideoSource] Error: no server/source specified");
      setError("Missing playback destination server.");
      setSignedUrl(null);
      setIsLoading(false);
      return;
    }

    // 2. Clear previous states and engage loading state
    setIsLoading(true);
    setError(null);
    setSignedUrl(null);

    // Simulate requesting signed/temporary video URL from the secure backend API
    const timer = setTimeout(() => {
      try {
        // Validate CDN URL is not empty
        if (!server.url) {
          console.log("[useVideoSource] Error: Selected source URL is empty!");
          setError("Empty video URL: This clean CDN node does not have a stream mapping.");
          setSignedUrl(null);
          setIsLoading(false);
          return;
        }

        // Detect supported video streaming formats
        const lowerUrl = server.url.toLowerCase();
        let detectedFormat: "mp4" | "hls" | "unsupported" = "unsupported";

        if (lowerUrl.includes(".m3u8") || lowerUrl.includes("adaptive") || lowerUrl.includes("hls")) {
          detectedFormat = "hls";
        } else if (lowerUrl.includes(".mp4")) {
          detectedFormat = "mp4";
        }

        if (detectedFormat === "unsupported") {
          console.log("[useVideoSource] Error: Unsupported stream format of", server.url);
          setError("Unsupported stream format: Codec decoding is required.");
          setFormat("unsupported");
          setIsLoading(false);
          return;
        }

        setFormat(detectedFormat);

        // Generate a secure, signed/temporary video URL simulation to prevent hotlinking
        // In a real application, the client sends a token and receives an expirational CDN path
        // that is signed using a HMAC secret key by the backend server.
        const expirationTime = Math.floor(Date.now() / 1000) + 3600; // 1 Hour Token Expiration
        const dummyHmacSignature = Math.random().toString(36).substring(2, 12);
        
        const secureSignedUrl = `${server.url}${server.url.includes("?") ? "&" : "?"}expires=${expirationTime}&signature=${dummyHmacSignature}`;

        // Log required debugging details per instruction #9
        console.log("[useVideoSource] Signature handshakes success!");
        console.log("[useVideoSource] movieId:", movieId);
        console.log("[useVideoSource] selected source:", secureSignedUrl);

        setSignedUrl(secureSignedUrl);
        setIsLoading(false);
      } catch (err: any) {
        console.error("[useVideoSource] Encryption handler crash:", err);
        setError("Encryption token verification failed.");
        setIsLoading(false);
      }
    }, 750); // Small realistic token retrieval lag (OTT effect)

    return () => clearTimeout(timer);
  }, [movieId, server]);

  return { isLoading, error, signedUrl, format };
}
