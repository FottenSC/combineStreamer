"use client";

import { useQuery } from "@tanstack/react-query";
import { StreamList } from "@/components/StreamList";
import { Loader2, Swords, RefreshCw } from "lucide-react";
import { fetchAllStreams } from "@/lib/stream-api";

export default function Home() {
  const { data: streams, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["streams"],
    queryFn: fetchAllStreams,
    refetchInterval: 60000,
  });

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Navigation Header */}
      <nav className="border-b border-amber-900/30 bg-[#0d1117]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src="/Horseface.png" 
                alt="SC6 Logo" 
                className="h-10 w-auto"
              />
              <nav className="hidden md:flex items-center gap-6 ml-6">
                <span className="text-amber-500 font-medium text-sm tracking-wide cursor-pointer hover:text-amber-400 transition-colors">
                  LIVE STREAMS
                </span>
              </nav>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-2 text-gray-400 hover:text-amber-500 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-gold-gradient text-3xl md:text-4xl font-bold tracking-wide">
              LIVE STREAMS
            </h1>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-amber-600/50 to-transparent max-w-[100px]"></div>
          </div>
          <p className="text-gray-500 text-sm">
            Find SoulCalibur VI streams across Twitch and YouTube
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <Swords className="w-12 h-12 text-amber-600/30 absolute" />
              <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
            </div>
            <p className="text-gray-300 text-lg mt-6 font-medium">Searching for live streams...</p>
            <p className="text-gray-600 text-sm mt-2">This may take a few seconds</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-20 bg-[#161b22] rounded-lg border border-red-900/30">
            <p className="text-red-400 text-xl mb-4">Failed to load streams</p>
            <p className="text-gray-500 text-sm mb-6">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-amber-600 text-black rounded font-semibold hover:bg-amber-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stream List */}
        {streams && <StreamList streams={streams} />}
      </main>
    </div>
  );
}

