import { Stream } from "@/types/stream";
import { Eye } from "lucide-react";

interface StreamCardProps {
  stream: Stream;
}

const platformClasses = {
  twitch: "platform-twitch",
  youtube: "platform-youtube",
  kick: "platform-kick",
};

const platformNames = {
  twitch: "Twitch",
  youtube: "YouTube",
  kick: "Kick",
};

export function StreamCard({ stream }: StreamCardProps) {
  return (
    <a
      href={stream.streamUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block group h-full animate-fade-in"
    >
      <div className="h-full flex flex-col overflow-hidden sc6-border sc6-card rounded-sm">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#0a0908] flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0908]/80 via-transparent to-transparent opacity-60" />
          
          {/* Platform Badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={`${platformClasses[stream.platform]} text-white text-xs font-['Cinzel'] tracking-wider px-3 py-1.5 rounded-sm`}>
              {platformNames[stream.platform]}
            </span>
            {stream.isLive && (
              <span className="bg-gradient-to-r from-[#8b2020] to-[#6b1818] border border-[rgba(200,80,80,0.4)] text-white text-xs font-bold px-2 py-1.5 rounded-sm live-indicator">
                ● LIVE
              </span>
            )}
          </div>
          
          {/* Viewer Count */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#0a0908]/80 border border-[rgba(218,185,110,0.2)] px-2.5 py-1 rounded-sm">
            <Eye className="w-4 h-4 text-[#c9a84c]" />
            <span className="text-[#d4c4a0] text-sm font-semibold">
              {stream.viewerCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.2)]">
          <h3 className="font-['Cinzel'] font-semibold text-base text-[#e8dcc8] line-clamp-2 mb-3 group-hover:text-[#f5e4a8] transition-colors min-h-[3rem]">
            {stream.title}
          </h3>
          <div className="flex items-center gap-3 mt-auto">
            {stream.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stream.profilePictureUrl}
                alt={stream.streamerName}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-[rgba(218,185,110,0.3)]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3d3424] to-[#252015] border border-[rgba(218,185,110,0.3)] flex items-center justify-center text-[#c9a84c] text-sm font-['Cinzel']">
                {stream.streamerName.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-[#a09080] text-sm truncate font-['Cormorant_Garamond'] italic">{stream.streamerName}</p>
          </div>
        </div>
      </div>
    </a>
  );
}
