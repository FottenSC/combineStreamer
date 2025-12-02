import { NextResponse } from "next/server";
import { Stream, Platform } from "@/types/stream";

// Helper function to create a timeout signal
function createTimeoutSignal(ms: number): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

// Public Invidious instances to try (in order of preference)
const INVIDIOUS_INSTANCES = [
  "https://iv.nboeck.de",
  "https://invidious.privacyredirect.com",
  "https://y.com.sb",
  "https://invidious.slipfox.xyz",
  "https://invidious.projectsegfau.lt",
];

// Twitch GQL API configuration
const TWITCH_GQL_URL = "https://gql.twitch.tv/gql";
const TWITCH_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

/**
 * Fetch YouTube streams via Invidious API (server-side to avoid CORS)
 */
async function fetchYouTubeStreams(): Promise<Stream[]> {
  const searchQueries = ["soulcalibur 6", "soul calibur 6", "soulcalibur vi", "sc6"];

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const query = searchQueries[0];
      const url = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&features=live`;

      console.log(`[Server] Trying ${instance}...`);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        signal: createTimeoutSignal(10000),
      });

      if (!response.ok) {
        console.warn(`[Server] Invidious instance ${instance} returned ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        console.warn(`[Server] Invidious instance ${instance} returned invalid data`);
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

      console.log(`[Server] Found ${streams.length} YouTube streams via ${instance}`);
      return streams;
    } catch (error) {
      console.warn(`[Server] Failed to fetch from ${instance}:`, error);
      continue;
    }
  }

  console.warn("[Server] All Invidious instances failed");
  return [];
}

// Types for Twitch GQL responses
interface TwitchGqlStream {
  id: string;
  viewersCount: number;
  createdAt: string;
  type: string;
  previewImageURL: string;
  broadcaster?: {
    id: string;
    login: string;
    displayName: string;
    profileImageURL: string;
    broadcastSettings?: {
      title?: string;
    };
  };
  game?: {
    id: string;
    displayName: string;
    slug: string;
  };
  freeformTags?: { name: string }[];
}

interface TwitchGqlGameStreamsResponse {
  data: {
    game: {
      streams: {
        edges: Array<{
          cursor: string;
          node: TwitchGqlStream;
        }>;
        pageInfo: {
          hasNextPage: boolean;
        };
      };
    } | null;
  };
}

interface TwitchGqlTopStreamsResponse {
  data: {
    streams: {
      edges: Array<{
        cursor: string;
        node: TwitchGqlStream;
      }>;
      pageInfo: {
        hasNextPage: boolean;
      };
    };
  };
}

/**
 * Fetch Twitch streams using GQL API
 */
async function fetchTwitchStreamsGql(gameSlug?: string): Promise<Stream[]> {
  try {
    const body = gameSlug
      ? {
          extensions: {
            persistedQuery: {
              sha256Hash: "76cb069d835b8a02914c08dc42c421d0dafda8af5b113a3f19141824b901402f",
              version: 1,
            },
          },
          operationName: "DirectoryPage_Game",
          variables: {
            cursor: null,
            imageWidth: 50,
            includeCostreaming: true,
            limit: 30,
            options: {
              broadcasterLanguages: [],
              freeformTags: [],
              sort: "VIEWER_COUNT",
            },
            slug: gameSlug,
            sortTypeIsRecency: false,
          },
        }
      : {
          extensions: {
            persistedQuery: {
              sha256Hash: "fb60a7f9b2fe8f9c9a080f41585bd4564bea9d3030f4d7cb8ab7f9e99b1cee67",
              version: 1,
            },
          },
          operationName: "BrowsePage_Popular",
          variables: {
            cursor: null,
            imageWidth: 50,
            includeCostreaming: true,
            limit: 30,
            options: {
              broadcasterLanguages: [],
              freeformTags: [],
              sort: "VIEWER_COUNT",
            },
            platformType: "all",
            sortTypeIsRecency: false,
          },
        };

    console.log(`[Server] Fetching Twitch streams via GQL${gameSlug ? ` for game: ${gameSlug}` : ""}...`);

    const response = await fetch(TWITCH_GQL_URL, {
      method: "POST",
      headers: {
        "Client-Id": TWITCH_CLIENT_ID,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: createTimeoutSignal(15000),
    });

    if (!response.ok) {
      console.warn(`[Server] Twitch GQL API returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Handle game-specific response
    if (gameSlug) {
      const gameData = data as TwitchGqlGameStreamsResponse;
      if (!gameData.data?.game?.streams?.edges) {
        console.warn("[Server] No game data found in Twitch GQL response");
        return [];
      }

      const streams: Stream[] = gameData.data.game.streams.edges
        .filter((edge) => edge.node && edge.node.type === "live")
        .map((edge) => ({
          id: `twitch-${edge.node.id}`,
          platform: "twitch" as Platform,
          streamerName: edge.node.broadcaster?.displayName || "Unknown",
          title: edge.node.broadcaster?.broadcastSettings?.title || "Untitled Stream",
          thumbnailUrl: edge.node.previewImageURL || `https://static-cdn.jtvnw.net/previews-ttv/live_user_${edge.node.broadcaster?.login || "unknown"}-320x180.jpg`,
          viewerCount: edge.node.viewersCount || 0,
          streamUrl: `https://twitch.tv/${edge.node.broadcaster?.login || ""}`,
          isLive: true,
          startedAt: edge.node.createdAt,
        }));

      console.log(`[Server] Found ${streams.length} Twitch streams via GQL`);
      return streams;
    }

    // Handle top streams response
    const topData = data as TwitchGqlTopStreamsResponse;
    if (!topData.data?.streams?.edges) {
      console.warn("[Server] No streams found in Twitch GQL response");
      return [];
    }

    const streams: Stream[] = topData.data.streams.edges
      .filter((edge) => edge.node && edge.node.type === "live")
      .map((edge) => ({
        id: `twitch-${edge.node.id}`,
        platform: "twitch" as Platform,
        streamerName: edge.node.broadcaster?.displayName || "Unknown",
        title: edge.node.broadcaster?.broadcastSettings?.title || "Untitled Stream",
        thumbnailUrl: edge.node.previewImageURL || `https://static-cdn.jtvnw.net/previews-ttv/live_user_${edge.node.broadcaster?.login || "unknown"}-320x180.jpg`,
        viewerCount: edge.node.viewersCount || 0,
        streamUrl: `https://twitch.tv/${edge.node.broadcaster?.login || ""}`,
        isLive: true,
        startedAt: edge.node.createdAt,
      }));

    console.log(`[Server] Found ${streams.length} Twitch streams via GQL`);
    return streams;
  } catch (error) {
    console.warn("[Server] Failed to fetch Twitch streams via GQL:", error);
    return [];
  }
}

/**
 * Search Twitch streams by game name using GQL
 */
async function searchTwitchGameStreams(gameName: string): Promise<Stream[]> {
  try {
    const searchBody = {
      extensions: {
        persistedQuery: {
          sha256Hash: "7f3580f6ac6cd8aa1424cff7c974a07143827d6fa36bba1b54318fe7f0b68dc5",
          version: 1,
        },
      },
      operationName: "SearchResultsPage_SearchResults",
      variables: {
        includeIsDJ: true,
        options: {
          shouldSkipDiscoveryControl: true,
          targets: [{ index: "GAME" }],
        },
        query: gameName,
      },
    };

    console.log(`[Server] Searching Twitch for game: ${gameName}...`);

    const searchResponse = await fetch(TWITCH_GQL_URL, {
      method: "POST",
      headers: {
        "Client-Id": TWITCH_CLIENT_ID,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(searchBody),
      signal: createTimeoutSignal(10000),
    });

    if (!searchResponse.ok) {
      console.warn(`[Server] Twitch game search returned ${searchResponse.status}`);
      return [];
    }

    const searchData = await searchResponse.json();
    const games = searchData.data?.searchFor?.games?.items || [];

    if (games.length === 0) {
      console.warn(`[Server] No games found matching: ${gameName}`);
      return [];
    }

    const gameSlug = games[0].slug;
    console.log(`[Server] Found game: ${games[0].displayName} (${gameSlug})`);

    return fetchTwitchStreamsGql(gameSlug);
  } catch (error) {
    console.warn(`[Server] Failed to search Twitch for game "${gameName}":`, error);
    return [];
  }
}

/**
 * Fetch Twitch streams - tries multiple approaches
 */
async function fetchTwitchStreams(): Promise<Stream[]> {
  const streams = await fetchTwitchStreamsGql("soulcalibur-vi");

  if (streams.length > 0) {
    return streams;
  }

  console.log("[Server] Trying to search for SoulCalibur VI...");
  return searchTwitchGameStreams("SoulCalibur VI");
}

export async function GET() {
  try {
    const results = await Promise.allSettled([
      fetchYouTubeStreams(),
      fetchTwitchStreams(),
    ]);

    const allStreams: Stream[] = [];

    results.forEach((result, index) => {
      const platformName = ["YouTube", "Twitch"][index];
      if (result.status === "fulfilled") {
        console.log(`[Server] ${platformName}: ${result.value.length} streams`);
        allStreams.push(...result.value);
      } else {
        console.warn(`[Server] ${platformName} fetch failed:`, result.reason);
      }
    });

    // Sort by viewer count descending
    allStreams.sort((a, b) => b.viewerCount - a.viewerCount);

    console.log(`[Server] Total streams: ${allStreams.length}`);
    
    return NextResponse.json({ streams: allStreams });
  } catch (error) {
    console.error("[Server] Error fetching streams:", error);
    return NextResponse.json({ streams: [], error: "Failed to fetch streams" }, { status: 500 });
  }
}
