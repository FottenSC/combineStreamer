"use client";

import { useQuery } from "@tanstack/react-query";
import { StreamList } from "@/components/StreamList";
import { Loader2, RefreshCw } from "lucide-react";
import { fetchAllStreams } from "@/lib/stream-api";

export default function Home() {
  const { data: streams, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["streams"],
    queryFn: fetchAllStreams,
    refetchInterval: 60000,
  });

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
              onClick={() => refetch()}
              disabled={isFetching}
              className="sc6-button px-4 py-2 rounded-sm flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full">
        {/* Error State */}
        {error && (
          <div className="text-center py-20 sc6-border rounded-sm max-w-lg mx-auto">
            <p className="text-[#c85050] text-xl mb-4 font-['Cinzel']">Failed to Load Streams</p>
            <p className="text-[#806050] text-sm mb-6 italic px-6">
              {error instanceof Error ? error.message : "An unknown error occurred"}
            </p>
            <button
              onClick={() => refetch()}
              className="sc6-button px-8 py-3 rounded-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stream List - always shown, handles its own loading state */}
        {!error && <StreamList streams={streams || []} isLoading={isLoading} />}
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

