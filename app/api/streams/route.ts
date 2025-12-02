import { NextRequest, NextResponse } from "next/server";
import { Stream, Platform } from "@/types/stream";

// Public Invidious instances to try (in order of preference)
const INVIDIOUS_INSTANCES = [
  "https://iv.nboeck.de",
  "https://invidious.privacyredirect.com",
  "https://y.com.sb",
  "https://invidious.slipfox.xyz",
  "https://invidious.projectsegfau.lt",
];

// Kick API base URL
const KICK_API_BASE = "https://kick.com/api";

async function fetchYouTubeStreams(): Promise<Stream[]> {
  const searchQueries = [
    "soulcalibur 6",
    "soul calibur 6",
    "soulcalibur vi",
    "sc6",
  ];

  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const query = searchQueries[0];
      const url = `${instance}/api/v1/search?q=${encodeURIComponent(
        query
      )}&type=video&features=live`;

      console.log(`[Server] Trying ${instance}...`);

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(10000), // 10 second timeout
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

      // Map Invidious response to our Stream type
      const streams: Stream[] = data
        .filter((video: any) => {
          return video.liveNow === true || video.type === "live";
        })
        .map((video: any) => {
          const thumbnailUrl =
            video.videoThumbnails?.find((t: any) => t.quality === "high")?.url ||
            video.videoThumbnails?.[0]?.url ||
            `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;

          return {
            id: video.videoId || `yt-${Math.random()}`,
            platform: "youtube" as Platform,
            streamerName: video.author || video.authorId || "Unknown",
            title: video.title || "Untitled Stream",
            thumbnailUrl: thumbnailUrl.startsWith("//")
              ? `https:${thumbnailUrl}`
              : thumbnailUrl,
            viewerCount: video.viewCount || video.liveViewers || 0,
            streamUrl: `https://youtube.com/watch?v=${video.videoId}`,
            isLive: true,
            startedAt: video.published
              ? new Date(video.published * 1000).toISOString()
              : undefined,
          };
        });

      console.log(`[Server] Found ${streams.length} YouTube streams via ${instance}`);
      return streams;
    } catch (error) {
      console.error(`[Server] Error fetching from Invidious instance ${instance}:`, error);
      // Continue to next attempt
    }
  }

  console.warn("[Server] All Invidious instances failed");
  return [];
}

async function fetchKickStreams(): Promise<Stream[]> {
  // Kick often blocks server-side requests without proper headers/cookies (Cloudflare).
  // We'll leave this as a placeholder or try a basic fetch.
  return [];
}

// Twitch API credentials
const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

// Simple in-memory cache for Twitch access token
let twitchAccessToken: string | null = null;
let twitchTokenExpiry: number = 0;

async function getTwitchAccessToken(): Promise<string | null> {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    console.warn("[Server] Missing Twitch credentials");
    return null;
  }

  // Return cached token if valid (with 60s buffer)
  if (twitchAccessToken && Date.now() < twitchTokenExpiry - 60000) {
    return twitchAccessToken;
  }

  try {
    console.log("[Server] Fetching new Twitch access token...");
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    if (!response.ok) {
      console.error(`[Server] Twitch token fetch failed: ${response.status}`);
      return null;
    }

    const data = await response.json();
    twitchAccessToken = data.access_token;
    // expires_in is in seconds
    twitchTokenExpiry = Date.now() + data.expires_in * 1000;
    
    return twitchAccessToken;
  } catch (error) {
    console.error("[Server] Error fetching Twitch token:", error);
    return null;
  }
}

async function fetchTwitchStreams(): Promise<Stream[]> {
  const token = await getTwitchAccessToken();
  if (!token || !TWITCH_CLIENT_ID) {
    return [];
  }

  try {
    // Step 1: Get Game ID for "SOULCALIBUR VI"
    // We can hardcode it if we are sure, but fetching it is safer.
    // SC6 Game ID is usually 497385, but let's search to be sure.
    const gameResponse = await fetch(
      "https://api.twitch.tv/helix/games?name=SOULCALIBUR%20VI",
      {
        headers: {
          "Client-Id": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!gameResponse.ok) {
      console.error(`[Server] Twitch game search failed: ${gameResponse.status}`);
      return [];
    }

    const gameData = await gameResponse.json();
    const gameId = gameData.data?.[0]?.id;

    if (!gameId) {
      console.warn("[Server] Could not find Game ID for SoulCalibur VI");
      return [];
    }

    // Step 2: Fetch Streams
    const streamsResponse = await fetch(
      `https://api.twitch.tv/helix/streams?game_id=${gameId}&first=20`,
      {
        headers: {
          "Client-Id": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
        },
      }
    );

    if (!streamsResponse.ok) {
      console.error(`[Server] Twitch streams fetch failed: ${streamsResponse.status}`);
      return [];
    }

    const streamsData = await streamsResponse.json();

    const streams: Stream[] = streamsData.data.map((stream: any) => ({
      id: stream.id,
      platform: "twitch" as Platform,
      streamerName: stream.user_name,
      title: stream.title,
      // Replace {width}x{height} with actual dimensions
      thumbnailUrl: stream.thumbnail_url.replace("{width}", "640").replace("{height}", "360"),
      viewerCount: stream.viewer_count,
      streamUrl: `https://twitch.tv/${stream.user_login}`,
      isLive: true,
      startedAt: stream.started_at,
    }));

    console.log(`[Server] Found ${streams.length} Twitch streams`);
    return streams;

  } catch (error) {
    console.error("[Server] Error fetching Twitch streams:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  try {
    // Fetch from all sources
    const [youtubeStreams, twitchStreams, kickStreams] = await Promise.all([
      fetchYouTubeStreams(),
      fetchTwitchStreams(),
      fetchKickStreams(),
    ]);

    const allStreams = [...youtubeStreams, ...twitchStreams, ...kickStreams];

    // Sort by viewer count
    allStreams.sort((a, b) => b.viewerCount - a.viewerCount);

    return NextResponse.json({
      streams: allStreams,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Server] Error in streams API:", error);
    return NextResponse.json(
      { error: "Failed to fetch streams" },
      { status: 500 }
    );
  }
}
