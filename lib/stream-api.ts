import { Stream, Platform } from "@/types/stream";

// Public Invidious instances to try (in order of preference)
const INVIDIOUS_INSTANCES = [
  "https://iv.nboeck.de",
  "https://invidious.privacyredirect.com",
  "https://y.com.sb",
  "https://invidious.slipfox.xyz",
  "https://invidious.projectsegfau.lt",
];

/**
 * Fetch YouTube streams via Invidious API (client-side compatible)
 */
async function fetchYouTubeStreams(): Promise<Stream[]> {
  const searchQueries = ["soulcalibur 6", "soul calibur 6", "soulcalibur vi", "sc6"];

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const query = searchQueries[0];
      const url = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&features=live`;

      console.log(`[Client] Trying ${instance}...`);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        console.warn(`[Client] Invidious instance ${instance} returned ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.warn(`[Client] Invidious instance ${instance} returned invalid data`);
        continue;
      }

      const streams: Stream[] = data
        .filter((video: { liveNow?: boolean }) => video.liveNow === true)
        .slice(0, 10)
        .map((video: { videoId: string; author: string; title: string; videoThumbnails?: { url: string }[]; viewCount?: number }) => ({
          id: `youtube-${video.videoId}`,
          platform: "youtube" as Platform,
          streamerName: video.author,
          title: video.title,
          thumbnailUrl: video.videoThumbnails?.[0]?.url || `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
          viewerCount: video.viewCount || 0,
          streamUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
          isLive: true,
        }));

      console.log(`[Client] Found ${streams.length} YouTube streams via ${instance}`);
      return streams;
    } catch (error) {
      console.warn(`[Client] Failed to fetch from ${instance}:`, error);
      continue;
    }
  }

  console.warn("[Client] All Invidious instances failed");
  return [];
}

/**
 * Fetch Twitch streams via public API proxy (client-side compatible)
 */
async function fetchTwitchStreams(): Promise<Stream[]> {
  try {
    // Using a public Twitch data endpoint - this may have CORS issues on client-side
    const response = await fetch(
      "https://api.twitch.tv/helix/streams?game_id=461067", // SoulCalibur VI game ID
      {
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!response.ok) {
      console.warn(`[Client] Twitch API returned ${response.status}`);
      return [];
    }

    const data = await response.json();
    return (data.data || []).slice(0, 10).map((stream: { id: string; user_name: string; title: string; thumbnail_url: string; viewer_count: number; user_login: string; started_at: string }) => ({
      id: `twitch-${stream.id}`,
      platform: "twitch" as Platform,
      streamerName: stream.user_name,
      title: stream.title,
      thumbnailUrl: stream.thumbnail_url.replace("{width}", "320").replace("{height}", "180"),
      viewerCount: stream.viewer_count,
      streamUrl: `https://twitch.tv/${stream.user_login}`,
      isLive: true,
      startedAt: stream.started_at,
    }));
  } catch (error) {
    console.warn("[Client] Failed to fetch Twitch streams:", error);
    return [];
  }
}

/**
 * Fetch all streams from multiple platforms
 */
export async function fetchAllStreams(): Promise<Stream[]> {
  try {
    const results = await Promise.allSettled([
      fetchYouTubeStreams(),
      fetchTwitchStreams(),
    ]);

    const allStreams: Stream[] = [];

    results.forEach((result, index) => {
      const platformName = ["YouTube", "Twitch"][index];
      if (result.status === "fulfilled") {
        console.log(`[Client] ${platformName}: ${result.value.length} streams`);
        allStreams.push(...result.value);
      } else {
        console.warn(`[Client] ${platformName} fetch failed:`, result.reason);
      }
    });

    // Sort by viewer count descending
    allStreams.sort((a, b) => b.viewerCount - a.viewerCount);

    console.log(`[Client] Total streams: ${allStreams.length}`);
    return allStreams;
  } catch (error) {
    console.error("[Client] Error fetching streams:", error);
    return [];
  }
}


