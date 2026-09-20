import { SearchPhotosRequest, SearchPhotosResponse } from '../types';
import { searchEventPhotos } from '../mockData';

/**
 * Searches photos for a given registration ID and selfie.
 * Connects to POST /api/search-photos if present, otherwise uses mock event data.
 */
export async function searchPhotos(request: SearchPhotosRequest): Promise<SearchPhotosResponse> {
  // If backend endpoint is available, try it; otherwise fall back to local service logic
  try {
    const response = await fetch('/api/search-photos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (response.ok) {
      const data = await response.json();
      return data as SearchPhotosResponse;
    }
  } catch {
    // Expected in client-side prototype or local dev preview
  }

  // Use client mock data engine
  return await searchEventPhotos(request);
}
