"use client";

import { Stream, Platform } from "@/types/stream";
import { StreamCard } from "@/components/StreamCard";
import { useState } from "react";
import { Swords } from "lucide-react";

interface StreamListProps {
  streams: Stream[];
}

const platformBgColors = {
  twitch: "bg-purple-500/20 border-purple-500/30 text-purple-400",
  youtube: "bg-red-500/20 border-red-500/30 text-red-400",
  kick: "bg-green-500/20 border-green-500/30 text-green-400",
};

export function StreamList({ streams }: StreamListProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "twitch",
    "youtube",
    "kick",
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
    <div className="space-y-6">
      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Platform Filter Buttons */}
        <div className="flex gap-2">
          {(["twitch", "youtube", "kick"] as Platform[]).map((platform) => (
            <button
              key={platform}
              onClick={() => togglePlatform(platform)}
              className={`px-4 py-2 rounded border text-sm font-medium transition-all ${
                selectedPlatforms.includes(platform)
                  ? platformBgColors[platform]
                  : "bg-[#161b22] border-gray-800 text-gray-500 hover:border-gray-700"
              }`}
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
              <span className="ml-2 text-xs opacity-70">({platformStats[platform]})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search for streamer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-xs bg-[#161b22] border border-gray-800 rounded px-4 py-2 text-gray-300 text-sm placeholder-gray-600 focus:outline-none focus:border-amber-600/50 transition-colors"
          />
        </div>
      </div>

      {/* Stats Header */}
      <div className="flex items-center gap-2">
        <Swords className="w-4 h-4 text-amber-500" />
        <span className="text-gray-400 text-sm">
          Showing <span className="text-amber-500 font-semibold">{filteredStreams.length}</span> live streams
          {totalViewers > 0 && (
            <span className="text-gray-500"> • {totalViewers.toLocaleString()} total viewers</span>
          )}
        </span>
      </div>

      {/* Stream Grid */}
      {filteredStreams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStreams.map((stream) => (
            <StreamCard key={`${stream.platform}-${stream.id}`} stream={stream} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#161b22] rounded-lg border border-gray-800">
          <p className="text-gray-400 text-lg">No streams found</p>
          <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
