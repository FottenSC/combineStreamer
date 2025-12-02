import { Stream } from "@/types/stream";

/**
 * Fetch all streams from the server-side API
 * This avoids CORS issues by letting the server handle external requests
 */
export async function fetchAllStreams(): Promise<Stream[]> {
  try {
    const response = await fetch("/api/streams", {
      next: { revalidate: 60 }, // Revalidate every minute
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.streams || !Array.isArray(data.streams)) {
      console.warn("API returned invalid data format", data);
      return [];
    }

    console.log(`[Client] Fetched ${data.streams.length} streams from API`);
    return data.streams;
  } catch (error) {
    console.error("Error fetching streams:", error);
    return [];
  }
}

// Export individual fetchers as stubs if they are needed for type compatibility or tests,
// but they shouldn't be used directly anymore.
export async function fetchYouTubeStreams(): Promise<Stream[]> {
  return [];
}

export async function fetchKickStreams(): Promise<Stream[]> {
  return [];
}

export async function fetchTwitchStreams(): Promise<Stream[]> {
  return [];
}


