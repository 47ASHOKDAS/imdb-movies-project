import crypto from "crypto";

// ============================================================================
// Secure Backend API Example: Signed / Temporary Streaming URLs
// ============================================================================
// The following backend code prevents basic hotlinking by authorizing video request 
// parameters using a secure, private server-side cryptology signature (HMAC-SHA256).
// Keep 'VIDEO_STREAMING_SECRET_KEY' in local environment variables (.env), never expose!

// Safe secret loader
const STREAM_SECRET = process.env.VIDEO_STREAMING_SECRET_KEY || "fallback-temporary-secret-key-3829ad";

interface GenerateParams {
  movieId: string;
  originalVideoUrl: string;
  ipAddress?: string;
}

/**
 * Generates an encrypted temporary stream link containing expiration timestamp and HMAC signature.
 * Prevents hotlinking by certifying that only our authorized server computed the signature parameters.
 */
export function generateSignedStreamingUrl({ movieId, originalVideoUrl, ipAddress }: GenerateParams): string {
  // Configurable URL lifespan (e.g., links expire in 2 hours to limit token life duration)
  const expirationSeconds = 7200;
  const expiresAt = Math.floor(Date.now() / 1000) + expirationSeconds;

  // Build the message to sign consisting of unique components: Movie ID, Expiry, and client IP constraints (optional)
  const payloadToSign = [movieId, expiresAt, ipAddress || "any"].join("|");

  // Compute secure cryptographic SHA256 HMAC signature using server secrets
  const hmac = crypto.createHmac("sha256", STREAM_SECRET);
  hmac.update(payloadToSign);
  const signature = hmac.digest("hex");

  // Append signed cryptology indicators directly as standard URL parameters
  const separator = originalVideoUrl.includes("?") ? "&" : "?";
  return `${originalVideoUrl}${separator}mId=${encodeURIComponent(movieId)}&expires=${expiresAt}&sig=${signature}`;
}

/**
 * Validates whether the incoming signed request parameters are authentic, matching, and unexpired.
 */
export function verifyStreamingSignature(
  urlParameters: { mId?: string; expires?: string; sig?: string },
  clientIpAddress?: string
): boolean {
  const { mId, expires, sig } = urlParameters;

  if (!mId || !expires || !sig) {
    console.error("[DVR-SECURE-API] Validation failure: Missing DRM signature elements");
    return false;
  }

  // Confirm parameters are unexpired
  const expiresTimestamp = parseInt(expires, 10);
  if (isNaN(expiresTimestamp) || Date.now() / 1000 > expiresTimestamp) {
    console.error("[DVR-SECURE-API] Validation failure: Link signature expired");
    return false;
  }

  // Re-calculate HMAC using the same payload format and compare safely
  const payloadToSign = [mId, expiresTimestamp, clientIpAddress || "any"].join("|");
  const hmac = crypto.createHmac("sha256", STREAM_SECRET);
  hmac.update(payloadToSign);
  const recomputedSignature = hmac.digest("hex");

  // Use timing-safe division or direct equal comparison string handshakes
  const isValid = crypto.timingSafeEqual(
    Buffer.from(sig, "hex"),
    Buffer.from(recomputedSignature, "hex")
  );

  if (!isValid) {
    console.error("[DVR-SECURE-API] Validation failure: Cryptographic signature mismatch");
  }

  return isValid;
}

// Express Endpoint Example Payload definition:
/*
import express from "express";

const app = express();

app.get("/api/videos/sign-url", (req, res) => {
  // 1. Authorize user session from request credentials/cookies
  const userSession = req.headers.authorization;
  if (!userSession) {
    return res.status(401).json({ error: "Unauthorized access: Please sign in first." });
  }

  const { movieId, serverId } = req.query;
  if (!movieId) {
    return res.status(400).json({ error: "Missing movieId parameter" });
  }

  // 2. Fetch the matched legal repository stream URL from database
  const originalUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4";

  // 3. Generate secure signed stream URL matching client context
  const clientIp = req.ip || req.headers["x-forwarded-for"] || "any";
  const signedSecureUrl = generateSignedStreamingUrl({
    movieId: String(movieId),
    originalVideoUrl: originalUrl,
    ipAddress: String(clientIp)
  });

  return res.json({
    movieId,
    signedUrl: signedSecureUrl,
    expiresAt: Math.floor(Date.now() / 1000) + 7200,
    encryptionType: "SHA-256 HMAC"
  });
});
*/
