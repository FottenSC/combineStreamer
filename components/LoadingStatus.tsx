"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface LoadingStatusProps {
  isVisible: boolean;
}

const loadingMessages = [
  "Searching for SoulCalibur VI streams...",
  "Checking Twitch channels...",
  "Scanning YouTube for live content...",
  "Gathering stream data...",
  "Almost there...",
];

export function LoadingStatus({ isVisible }: LoadingStatusProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="text-center py-20 sc6-border rounded-sm max-w-lg mx-auto">
      <div className="flex flex-col items-center gap-6">
        {/* Animated loader icon */}
        <div className="relative">
          <Loader2 className="w-12 h-12 text-[#c9a84c] animate-spin" />
          <div className="absolute inset-0 w-12 h-12 rounded-full bg-[#c9a84c] opacity-20 animate-ping" />
        </div>
        
        {/* Loading message */}
        <div className="space-y-2">
          <p className="text-[#c9a84c] text-lg font-['Cinzel'] tracking-wide animate-pulse">
            {loadingMessages[messageIndex]}
          </p>
          <p className="text-[#806050] text-sm italic font-['Cormorant_Garamond']">
            This may take a moment
          </p>
        </div>

        {/* Progress dots */}
        <div className="flex gap-2">
          {loadingMessages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === messageIndex
                  ? "w-8 bg-[#c9a84c]"
                  : "w-1.5 bg-[rgba(218,185,110,0.3)]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
