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

const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_BASE_URL = rawUrl.replace(/\/+$/, "");

export async function searchPhotosWithSelfie(base64Image: string): Promise<SearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search-photos`, {
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
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
