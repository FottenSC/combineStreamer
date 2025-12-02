export type Platform = 'twitch' | 'youtube' | 'kick';

export interface Stream {
  id: string;
  platform: Platform;
  streamerName: string;
  profilePictureUrl?: string;
  title: string;
  thumbnailUrl: string;
  viewerCount: number;
  streamUrl: string;
  isLive: boolean;
  startedAt?: string;
}

export interface StreamApiResponse {
  streams: Stream[];
  lastUpdated: string;
}
