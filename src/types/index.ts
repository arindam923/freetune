export interface Track {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number;
  streamUrl: string;
  coverUrl: string;
  license: string;
  source: 'jamendo' | 'archive' | 'musopen' | 'local';
}

export interface SearchResult {
  tracks: Track[];
  total: number;
  source: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  created_at: number;
  updated_at: number;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  isLoading: boolean;
  progress: number;
  duration: number;
  volume: number;
  repeat: 'off' | 'one' | 'all';
  shuffle: boolean;
}

export interface QueueState {
  queue: Track[];
  currentIndex: number;
}
