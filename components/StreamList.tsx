"use client";

import { Stream, Platform } from "@/types/stream";
import { StreamCard } from "@/components/StreamCard";
import { useState } from "react";

interface StreamListProps {
  streams: Stream[];
}

export function StreamList({ streams }: StreamListProps) {
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
    <div className="space-y-8">
      {/* Filters Panel */}
      <div className="sc6-border rounded-sm p-5">
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          {/* Platform Filter Buttons */}
          <div className="flex flex-wrap gap-3">
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
              >
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
                <span className="ml-2 opacity-60">({platformStats[platform]})</span>
              </button>
            ))}
            {/* Kick disabled - requires backend proxy */}
            <button
              disabled
              className="sc6-button px-4 py-2 rounded-sm opacity-50 cursor-not-allowed"
              title="Kick API requires backend proxy (coming soon)"
            >
              <span className="line-through">Kick</span>
              <span className="ml-2 opacity-60">(0)</span>
            </button>
          </div>

          {/* Search */}
          <div className="w-full lg:w-auto">
            <input
              type="text"
              placeholder="Search for a streamer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="sc6-input w-full lg:w-64 rounded-sm px-4 py-2.5 text-base"
            />
          </div>
        </div>
      </div>

      {/* Stats Display */}
      <div className="flex items-center justify-center gap-4 text-center">
        <div className="gold-separator flex-1 max-w-[100px]" />
        <div className="flex items-center gap-3">
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
        </div>
        <div className="gold-separator flex-1 max-w-[100px]" />
      </div>

      {/* Stream Grid */}
      {filteredStreams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStreams.map((stream) => (
            <StreamCard key={`${stream.platform}-${stream.id}`} stream={stream} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sc6-border rounded-sm">
          <p className="text-[#a09080] text-xl font-['Cinzel']">No Streams Found</p>
          <p className="text-[#706050] text-sm mt-2 italic">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}
