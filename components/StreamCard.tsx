import { Stream } from "@/types/stream";
import { Eye, ExternalLink } from "lucide-react";

interface StreamCardProps {
  stream: Stream;
}

const platformColors = {
  twitch: "bg-purple-600",
  youtube: "bg-red-600",
  kick: "bg-green-600",
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
      className="block group h-full"
    >
      <div className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:scale-105 bg-[#161b22] border border-gray-800 rounded-lg">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-[#0d1117] flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={stream.thumbnailUrl}
            alt={stream.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <span className={`${platformColors[stream.platform]} text-white text-xs font-bold px-2 py-1 rounded`}>
              {platformNames[stream.platform]}
            </span>
            {stream.isLive && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">
                🔴 LIVE
              </span>
            )}
          </div>
          <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-md">
            <Eye className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-semibold">
              {stream.viewerCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="font-bold text-lg text-gray-100 line-clamp-2 mb-2 group-hover:text-amber-500 transition-colors min-h-[3.5rem]">
            {stream.title}
          </h3>
          <div className="flex items-center gap-2 mt-auto">
            {stream.profilePictureUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={stream.profilePictureUrl}
                alt={stream.streamerName}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-gray-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs font-medium">
                {stream.streamerName.charAt(0).toUpperCase()}
              </div>
            )}
            <p className="text-gray-400 text-sm truncate">{stream.streamerName}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 flex-shrink-0">
          <div className="flex items-center gap-2 text-amber-500 text-sm font-medium group-hover:text-amber-400 transition-colors">
            <span>Watch Stream</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
      </div>
    </a>
  );
}
