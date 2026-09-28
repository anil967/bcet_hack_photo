export interface PhotoItem {
  id: string;
  fileName: string;
  thumbnailUrl: string;
  imageUrl: string;
  downloadUrl: string;
  matchScore?: number;
}

export interface SearchSuccessResponse {
  success: true;
  count: number;
  photos: PhotoItem[];
  durationMs?: number;
}

export interface SearchErrorResponse {
  success: false;
  error: string;
  message: string;
}

export type SearchResponse = SearchSuccessResponse | SearchErrorResponse;

const DEFAULT_PROD_API_URL = "https://photofinder-backend-pw5f.onrender.com";
const rawUrl = process.env.NEXT_PUBLIC_API_URL || "";
const API_BASE_URL = rawUrl.replace(/\/+$/, "");

function getEffectiveApiUrl(): string {
  // If explicitly provided via environment variable, use it
  if (API_BASE_URL) {
    return API_BASE_URL;
  }

  // Client-side environment detection
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Local development on machine
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://127.0.0.1:8000";
    }
    // Local testing from mobile on Wi-Fi (192.168.x.x or .local)
    if (host.startsWith("192.168.") || host.startsWith("10.") || host.endsWith(".local")) {
      return `http://${host}:8000`;
    }
  }

  // Production fallback (Vercel, etc.)
  return DEFAULT_PROD_API_URL;
}

export async function searchPhotosWithSelfie(base64Image: string): Promise<SearchResponse> {
  const baseUrl = getEffectiveApiUrl();
  try {
    const response = await fetch(`${baseUrl}/api/search-photos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ selfie: base64Image }),
    });

    if (response.status === 429) {
      return {
        success: false,
        error: "RATE_LIMITED",
        message: "Too many requests. Please wait a minute before trying again.",
      };
    }

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    return {
      success: false,
      error: "NETWORK_ERROR",
      message: "Unable to connect to PhotoFinder server. Please check your internet connection.",
    };
  }
}

export function getFullPhotoUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const baseUrl = getEffectiveApiUrl();
  return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
}
