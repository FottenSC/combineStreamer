"use client";

import { useQuery } from "@tanstack/react-query";
import { StreamList } from "@/components/StreamList";
import { Stream } from "@/types/stream";
import { Loader2 } from "lucide-react";
import { fetchAllStreams } from "@/lib/stream-api";

export default function Home() {
  const { data: streams, isLoading, error, refetch } = useQuery({
    queryKey: ["streams"],
    queryFn: fetchAllStreams,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            SoulCalibur 6 Stream Finder
          </h1>
          <p className="text-slate-300 text-lg md:text-xl">
            Find live SoulCalibur 6 streams across Twitch, YouTube, and Kick
          </p>
          <p className="text-slate-400 text-sm mt-2">
            Powered by Twitch, Invidious (YouTube), and Kick APIs
          </p>
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
            <p className="text-white text-xl">Searching for live streams...</p>
            <p className="text-slate-400 text-sm mt-2">This may take a few seconds</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-400 text-xl mb-4">Failed to load streams</p>
            <p className="text-slate-400 text-sm mb-4">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {streams && <StreamList streams={streams} />}
      </div>
    </main>
  );
}

