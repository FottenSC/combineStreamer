"use client";

import { useQuery } from "@tanstack/react-query";
import { StreamList } from "@/components/StreamList";
import { RefreshCw, Check } from "lucide-react";
import { fetchTwitchStreams, fetchYouTubeStreams } from "@/lib/stream-api";
import { useEffect, useState, useMemo } from "react";
import { Stream } from "@/types/stream";

export default function Home() {
  // Separate queries for each platform
  const twitchQuery = useQuery({
    queryKey: ["streams", "twitch"],
    queryFn: fetchTwitchStreams,
    refetchInterval: 60000,
  });

  const youtubeQuery = useQuery({
    queryKey: ["streams", "youtube"],
    queryFn: fetchYouTubeStreams,
    refetchInterval: 60000,
  });

  const [showSuccess, setShowSuccess] = useState(false);

  // Combine streams from all platforms
  const allStreams = useMemo(() => {
    const streams: Stream[] = [];
    if (twitchQuery.data) streams.push(...twitchQuery.data);
    if (youtubeQuery.data) streams.push(...youtubeQuery.data);
    
    // Sort by viewer count
    return streams.sort((a, b) => b.viewerCount - a.viewerCount);
  }, [twitchQuery.data, youtubeQuery.data]);

  // Check if any query is fetching
  const isFetching = twitchQuery.isFetching || youtubeQuery.isFetching;
  const isInitialLoading = twitchQuery.isLoading || youtubeQuery.isLoading;

  // Show success indicator when all fetching completes
  useEffect(() => {
    if (!isFetching && !isInitialLoading && (twitchQuery.data || youtubeQuery.data)) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isFetching, isInitialLoading, twitchQuery.data, youtubeQuery.data]);

  const handleRefresh = () => {
    twitchQuery.refetch();
    youtubeQuery.refetch();
  };

  // Platform loading states
  const platformLoadingStates = {
    twitch: twitchQuery.isFetching,
    youtube: youtubeQuery.isFetching,
  };

  return (
    <div className="min-h-screen sc6-bg flex flex-col">
      {/* Light rays effect */}
      <div className="light-rays" />
      
      {/* Navigation Header */}
      <nav className="relative z-50 border-b border-[rgba(218,185,110,0.2)] bg-gradient-to-b from-[#1a1610]/98 to-[#0f0d0a]/95 backdrop-blur-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <img 
                src="/Horseface.png" 
                alt="SC6 Logo" 
                className="h-12 w-auto drop-shadow-[0_0_10px_rgba(218,185,110,0.3)]"
              />
              <div className="hidden sm:block h-8 w-px bg-gradient-to-b from-transparent via-[rgba(218,185,110,0.3)] to-transparent" />
              <span className="hidden sm:block text-[#c9a84c] font-['Cinzel'] text-base tracking-[0.15em] uppercase">
                Zoetrope Stream Finder
              </span>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="sc6-button px-4 py-2 rounded-sm flex items-center gap-2 relative overflow-hidden"
            >
              {showSuccess ? (
                <Check className="w-4 h-4 text-[#5a9a5a] animate-in zoom-in duration-200" />
              ) : (
                <RefreshCw className={`w-4 h-4 transition-transform ${isFetching ? 'animate-spin' : ''}`} />
              )}
              <span className="hidden sm:inline">
                {showSuccess ? 'Updated' : isFetching ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Stream List - always shown, never blocked */}
        <StreamList 
          streams={allStreams} 
          platformLoadingStates={platformLoadingStates}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[rgba(218,185,110,0.15)] py-6 mt-auto">
        <div className="text-center text-[#605040] text-sm italic font-['Cormorant_Garamond']">
          The legend of the cursed sword continues...
        </div>
      </footer>
    </div>
  );
}

