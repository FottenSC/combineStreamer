import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
      className="block group"
    >
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="p-0 relative">
          <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stream.thumbnailUrl}
              alt={stream.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute top-2 left-2 flex gap-2">
              <Badge
                className={`${platformColors[stream.platform]} text-white font-bold`}
              >
                {platformNames[stream.platform]}
              </Badge>
              {stream.isLive && (
                <Badge className="bg-red-600 text-white font-bold animate-pulse">
                  🔴 LIVE
                </Badge>
              )}
            </div>
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded-md">
              <Eye className="w-4 h-4 text-white" />
              <span className="text-white text-sm font-semibold">
                {stream.viewerCount.toLocaleString()}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="font-bold text-lg text-white line-clamp-2 mb-2 group-hover:text-purple-400 transition-colors">
            {stream.title}
          </h3>
          <p className="text-slate-400 text-sm">{stream.streamerName}</p>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <div className="flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:text-purple-300 transition-colors">
            <span>Watch Stream</span>
            <ExternalLink className="w-4 h-4" />
          </div>
        </CardFooter>
      </Card>
    </a>
  );
}
