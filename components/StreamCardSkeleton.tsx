export function StreamCardSkeleton() {
  return (
    <div className="h-full flex flex-col overflow-hidden sc6-border sc6-card rounded-sm relative">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-[rgba(218,185,110,0.08)] to-transparent z-10 pointer-events-none" />
      
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-video w-full overflow-hidden bg-[#0a0908] flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[rgba(218,185,110,0.05)] to-transparent animate-pulse" />
        
        {/* Platform Badge Skeleton */}
        <div className="absolute top-3 left-3 flex gap-2">
          <div className="h-7 w-20 bg-[rgba(218,185,110,0.15)] rounded-sm animate-pulse" style={{ animationDelay: '0.1s' }} />
          <div className="h-7 w-16 bg-[rgba(218,185,110,0.15)] rounded-sm animate-pulse" style={{ animationDelay: '0.2s' }} />
        </div>
        
        {/* Viewer Count Skeleton */}
        <div className="absolute bottom-3 right-3 h-7 w-16 bg-[rgba(218,185,110,0.15)] rounded-sm animate-pulse" style={{ animationDelay: '0.15s' }} />
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col bg-gradient-to-b from-transparent to-[rgba(0,0,0,0.2)]">
        {/* Title Skeleton */}
        <div className="space-y-2 mb-3 min-h-[3rem]">
          <div className="h-5 w-full bg-[rgba(218,185,110,0.12)] rounded-sm animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="h-5 w-2/3 bg-[rgba(218,185,110,0.12)] rounded-sm animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        
        {/* Streamer Info Skeleton */}
        <div className="flex items-center gap-3 mt-auto">
          <div className="w-8 h-8 rounded-full bg-[rgba(218,185,110,0.12)] animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="h-4 w-32 bg-[rgba(218,185,110,0.12)] rounded-sm animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
}
