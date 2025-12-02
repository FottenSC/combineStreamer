import { Stream, Platform } from "@/types/stream";

// Twitch GQL API configuration (similar to Xtra app approach)
// This uses Twitch's internal GraphQL API which doesn't require OAuth tokens
const TWITCH_GQL_URL = "https://gql.twitch.tv/gql";
// Public Client-ID used by web clients (from Twitch's web app)
const TWITCH_CLIENT_ID = "kimne78kx3ncx6brgo4mv6wki5h1ko";

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
 * Fetch Twitch streams using GQL API (similar to Xtra app)
 * This uses Twitch's internal GraphQL API with persisted queries
 */
async function fetchTwitchStreamsGql(gameSlug?: string): Promise<Stream[]> {
  try {
    // Using persisted query approach like Xtra
    // This query fetches streams for a specific game by slug
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
          // Fallback to top streams if no game specified
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

    console.log(`[Client] Fetching Twitch streams via GQL${gameSlug ? ` for game: ${gameSlug}` : ""}...`);

    const response = await fetch(TWITCH_GQL_URL, {
      method: "POST",
      headers: {
        "Client-Id": TWITCH_CLIENT_ID,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[Client] Twitch GQL API returned ${response.status}`);
      return [];
    }

    const data = await response.json();

    // Handle game-specific response
    if (gameSlug) {
      const gameData = data as TwitchGqlGameStreamsResponse;
      if (!gameData.data?.game?.streams?.edges) {
        console.warn("[Client] No game data found in Twitch GQL response");
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

      console.log(`[Client] Found ${streams.length} Twitch streams via GQL`);
      return streams;
    }

    // Handle top streams response
    const topData = data as TwitchGqlTopStreamsResponse;
    if (!topData.data?.streams?.edges) {
      console.warn("[Client] No streams found in Twitch GQL response");
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

    console.log(`[Client] Found ${streams.length} Twitch streams via GQL`);
    return streams;
  } catch (error) {
    console.warn("[Client] Failed to fetch Twitch streams via GQL:", error);
    return [];
  }
}

/**
 * Search Twitch streams by game name using GQL
 */
async function searchTwitchGameStreams(gameName: string): Promise<Stream[]> {
  try {
    // First, search for the game to get its slug
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

    console.log(`[Client] Searching Twitch for game: ${gameName}...`);

    const searchResponse = await fetch(TWITCH_GQL_URL, {
      method: "POST",
      headers: {
        "Client-Id": TWITCH_CLIENT_ID,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(searchBody),
      signal: AbortSignal.timeout(10000),
    });

    if (!searchResponse.ok) {
      console.warn(`[Client] Twitch game search returned ${searchResponse.status}`);
      return [];
    }

    const searchData = await searchResponse.json();
    const games = searchData.data?.searchFor?.games?.items || [];

    if (games.length === 0) {
      console.warn(`[Client] No games found matching: ${gameName}`);
      return [];
    }

    // Use the first matching game's slug
    const gameSlug = games[0].slug;
    console.log(`[Client] Found game: ${games[0].displayName} (${gameSlug})`);

    // Now fetch streams for this game
    return fetchTwitchStreamsGql(gameSlug);
  } catch (error) {
    console.warn(`[Client] Failed to search Twitch for game "${gameName}":`, error);
    return [];
  }
}

/**
 * Fetch Twitch streams - tries multiple approaches
 */
async function fetchTwitchStreams(): Promise<Stream[]> {
  // Try to fetch streams for SoulCalibur VI using the known slug
  // SoulCalibur VI slug on Twitch is "soulcalibur-vi"
  const streams = await fetchTwitchStreamsGql("soulcalibur-vi");

  if (streams.length > 0) {
    return streams;
  }

  // Fallback: try searching for the game
  console.log("[Client] Trying to search for SoulCalibur VI...");
  return searchTwitchGameStreams("SoulCalibur VI");
}

// Types for user stream response
interface TwitchGqlUserStreamResponse {
  data: {
    users: Array<{
      id: string;
      login: string;
      displayName: string;
      profileImageURL: string;
      stream: {
        id: string;
        viewersCount: number;
        createdAt: string;
        type: string;
        previewImageURL: string;
        broadcaster: {
          broadcastSettings: {
            title: string;
          };
        };
        game?: {
          id: string;
          displayName: string;
          slug: string;
        };
        freeformTags?: { name: string }[];
      } | null;
    }>;
  };
}

/**
 * Fetch streams for specific Twitch channels by login names
 * Uses GQL UsersStream query (similar to Xtra)
 */
export async function fetchTwitchChannelStreams(logins: string[]): Promise<Stream[]> {
  if (logins.length === 0) return [];

  try {
    // Using Apollo-style GraphQL query like Xtra
    const query = `
      query UsersStream($logins: [String!]) {
        users(logins: $logins) {
          displayName
          id
          login
          profileImageURL(width: 300)
          stream {
            broadcaster {
              broadcastSettings {
                title
              }
            }
            createdAt
            game {
              id
              displayName
              slug
            }
            id
            previewImageURL
            freeformTags {
              name
            }
            type
            viewersCount
          }
        }
      }
    `;

    const body = {
      query: query,
      variables: {
        logins: logins,
      },
    };

    console.log(`[Client] Fetching streams for ${logins.length} Twitch channels...`);

    const response = await fetch(TWITCH_GQL_URL, {
      method: "POST",
      headers: {
        "Client-Id": TWITCH_CLIENT_ID,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.warn(`[Client] Twitch GQL API returned ${response.status}`);
      return [];
    }

    const data = (await response.json()) as TwitchGqlUserStreamResponse;

    if (!data.data?.users) {
      console.warn("[Client] No users found in Twitch GQL response");
      return [];
    }

    const streams: Stream[] = data.data.users
      .filter((user) => user.stream && user.stream.type === "live")
      .map((user) => ({
        id: `twitch-${user.stream!.id}`,
        platform: "twitch" as Platform,
        streamerName: user.displayName,
        title: user.stream!.broadcaster.broadcastSettings.title || "Untitled Stream",
        thumbnailUrl: user.stream!.previewImageURL || `https://static-cdn.jtvnw.net/previews-ttv/live_user_${user.login}-320x180.jpg`,
        viewerCount: user.stream!.viewersCount,
        streamUrl: `https://twitch.tv/${user.login}`,
        isLive: true,
        startedAt: user.stream!.createdAt,
      }));

    console.log(`[Client] Found ${streams.length} live streams from ${logins.length} channels`);
    return streams;
  } catch (error) {
    console.warn("[Client] Failed to fetch Twitch channel streams:", error);
    return [];
  }
}

// Export GQL functions for direct use
export { fetchTwitchStreamsGql, searchTwitchGameStreams };

// Public Invidious instances to try (in order of preference)
// Some may have CORS restrictions when called from browser
const INVIDIOUS_INSTANCES = [
  "https://iv.nboeck.de",
  "https://invidious.privacyredirect.com",
  "https://y.com.sb",
  "https://invidious.slipfox.xyz",
  "https://invidious.projectsegfau.lt",
];

/**
 * Fetch YouTube streams via Invidious API (client-side)
 * Note: Some instances may block CORS requests
 */
async function fetchYouTubeStreams(): Promise<Stream[]> {
  const searchQueries = ["soulcalibur 6", "soul calibur 6", "soulcalibur vi", "sc6"];

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const query = searchQueries[0];
      const url = `${instance}/api/v1/search?q=${encodeURIComponent(query)}&type=video&features=live`;

      console.log(`[Client] Trying Invidious instance ${instance}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
        .map((video: { videoId: string; author: string; authorId?: string; authorThumbnails?: { url: string }[]; title: string; videoThumbnails?: { url: string }[]; viewCount?: number }) => ({
          id: `youtube-${video.videoId}`,
          platform: "youtube" as Platform,
          streamerName: video.author,
          profilePictureUrl: video.authorThumbnails?.[0]?.url,
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

  console.warn("[Client] All Invidious instances failed (may be CORS blocked)");
  return [];
}

/**
 * Fetch all streams from multiple platforms (client-side direct calls)
 * For static hosting (GitHub Pages) - calls APIs directly from browser
 */
export async function fetchAllStreams(): Promise<Stream[]> {
  try {
    console.log("[Client] Fetching streams from all platforms...");

    // Fetch from both platforms in parallel
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
        console.warn(`[Client] ${platformName} failed:`, result.reason);
      }
    });

    // Sort by viewer count (highest first)
    allStreams.sort((a, b) => b.viewerCount - a.viewerCount);

    console.log(`[Client] Total streams found: ${allStreams.length}`);
    return allStreams;
  } catch (error) {
    console.error("[Client] Error fetching streams:", error);
    return [];
  }
}


