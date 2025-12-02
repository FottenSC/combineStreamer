"use client";

import { Stream, Platform } from "@/types/stream";
import { StreamCard } from "@/components/StreamCard";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface StreamListProps {
  streams: Stream[];
}

export function StreamList({ streams }: StreamListProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "twitch",
    "youtube",
    "kick",
  ]);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const filteredStreams = streams.filter((stream) =>
    selectedPlatforms.includes(stream.platform)
  );

  const platformStats = {
    twitch: streams.filter((s) => s.platform === "twitch").length,
    youtube: streams.filter((s) => s.platform === "youtube").length,
    kick: streams.filter((s) => s.platform === "kick").length,
  };

  return (
    <div className="space-y-6">
      {/* Platform Filters */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => togglePlatform("twitch")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            selectedPlatforms.includes("twitch")
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50 scale-105"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
          }`}
        >
          Twitch ({platformStats.twitch})
        </button>
        <button
          onClick={() => togglePlatform("youtube")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            selectedPlatforms.includes("youtube")
              ? "bg-red-600 text-white shadow-lg shadow-red-500/50 scale-105"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
          }`}
        >
          YouTube ({platformStats.youtube})
        </button>
        <button
          onClick={() => togglePlatform("kick")}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
            selectedPlatforms.includes("kick")
              ? "bg-green-600 text-white shadow-lg shadow-green-500/50 scale-105"
              : "bg-slate-800/50 text-slate-400 hover:bg-slate-700/50"
          }`}
        >
          Kick ({platformStats.kick})
        </button>
      </div>

      {/* Stream Count */}
      <div className="text-center">
        <p className="text-slate-300 text-lg">
          Showing <span className="font-bold text-purple-400">{filteredStreams.length}</span> live
          stream{filteredStreams.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Stream Grid */}
      {filteredStreams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStreams.map((stream) => (
            <StreamCard key={`${stream.platform}-${stream.id}`} stream={stream} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-400 text-xl">No streams found for the selected platforms</p>
        </div>
      )}
    </div>
  );
}
