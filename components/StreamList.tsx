"use client";

import { Stream, Platform } from "@/types/stream";
import { StreamCard } from "@/components/StreamCard";
import { StreamCardSkeleton } from "@/components/StreamCardSkeleton";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface StreamListProps {
  streams: Stream[];
  platformLoadingStates: {
    twitch: boolean;
    youtube: boolean;
  };
}

export function StreamList({ streams, platformLoadingStates }: StreamListProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "twitch",
    "youtube",
    // "kick", // Disabled - Kick API requires backend proxy
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const filteredStreams = streams
    .filter((stream) => selectedPlatforms.includes(stream.platform))
    .filter((stream) => 
      stream.streamerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const platformStats = {
    twitch: streams.filter((s) => s.platform === "twitch").length,
    youtube: streams.filter((s) => s.platform === "youtube").length,
    kick: streams.filter((s) => s.platform === "kick").length,
  };

  const totalViewers = filteredStreams.reduce((acc, s) => acc + s.viewerCount, 0);

  return (
    <section className="space-y-8" aria-label="Live SoulCalibur 6 Streams">
      {/* Filters Panel */}
      <div className="sc6-border rounded-sm p-5" role="search">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* Platform Filter Buttons */}
          <div className="flex flex-wrap gap-3" role="group" aria-label="Platform filters">
            <span className="text-[#807060] text-sm font-['Cinzel'] tracking-wider uppercase self-center mr-2">
              Filter:
            </span>
            {(["twitch", "youtube"] as Platform[]).map((platform) => (
              <button
                key={platform}
                onClick={() => togglePlatform(platform)}
                className={`sc6-button px-4 py-2 rounded-sm ${
                  selectedPlatforms.includes(platform) ? 'active' : ''
                }`}
                aria-pressed={selectedPlatforms.includes(platform)}
                aria-label={`${selectedPlatforms.includes(platform) ? 'Hide' : 'Show'} ${platform} streams (${platformStats[platform]} available)`}
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                <span className="ml-2 opacity-60">
                  {(platform === 'twitch' || platform === 'youtube') && platformLoadingStates[platform] ? (
                    <Loader2 className="w-3 h-3 inline animate-spin" />
                  ) : (
                    `(${platformStats[platform]})`
                  )}
                </span>
              </button>
            ))}
            {/* Kick disabled - requires backend proxy */}
            <button
              disabled
              className="sc6-button px-4 py-2 rounded-sm opacity-50 cursor-not-allowed"
              title="Kick API requires backend proxy (coming soon)"
              aria-label="Kick streams not available"
            >
              <span className="line-through">Kick</span>
              <span className="ml-2 opacity-60">(0)</span>
            </button>
          </div>

          {/* Search */}
          <div className="w-full lg:w-auto">
            <input
              type="search"
              placeholder="Search for a streamer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sc6-input w-full lg:w-64 rounded-sm px-4 py-2.5 text-base"
              aria-label="Search streams by streamer name or title"
            />
          </div>
        </div>
      </div>

      {/* Stats Display */}
      <div className="flex items-center justify-center gap-4 text-center">
        <div className="gold-separator flex-1 max-w-[100px]" />
        <h2 className="flex items-center gap-3">
          <span className="text-[#a09080] text-base font-['Cormorant_Garamond'] italic">
            Showing
          </span>
          <span className="text-[#c9a84c] text-xl font-['Cinzel'] font-bold">
            {filteredStreams.length}
          </span>
          <span className="text-[#a09080] text-base font-['Cormorant_Garamond'] italic">
            {filteredStreams.length === 1 ? 'stream' : 'streams'}
          </span>
          {totalViewers > 0 && (
            <>
              <span className="text-[#605040]">•</span>
              <span className="text-[#a09080] text-base font-['Cormorant_Garamond'] italic">
                {totalViewers.toLocaleString()} watching
              </span>
            </>
          )}
        </h2>
        <div className="gold-separator flex-1 max-w-[100px]" />
      </div>

      {/* Stream Grid */}
      {filteredStreams.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredStreams.map((stream) => (
              <StreamCard key={`${stream.platform}-${stream.id}`} stream={stream} />
            ))}
          </div>
          
          {/* Loading indicator at bottom when fetching */}
          {Object.values(platformLoadingStates).some(loading => loading) && (
            <div className="flex items-center justify-center gap-3 py-8 mt-4">
              <Loader2 className="w-5 h-5 text-[#c9a84c] animate-spin" />
              <p className="text-[#a09080] text-sm font-['Cormorant_Garamond'] italic">
                Searching for more streams...
              </p>
            </div>
          )}
        </>
      ) : (
        // No streams yet - show loading cards or empty state
        <>
          {Object.values(platformLoadingStates).some(loading => loading) ? (
            // Loading state - show skeleton cards in grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <StreamCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            // No streams found state
            <div className="text-center py-20 sc6-border rounded-sm max-w-2xl mx-auto">
              <div className="space-y-4">
                <p className="text-[#a09080] text-2xl font-['Cinzel']">No Streams Found</p>
                <p className="text-[#706050] text-base font-['Cormorant_Garamond'] italic">
                  {searchQuery 
                    ? 'Try a different search term or adjust your filters' 
                    : 'No live SoulCalibur VI streams at the moment'}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
