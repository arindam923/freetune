import { invoke } from '@tauri-apps/api/core';
import { Track, Playlist } from '../types';

export type MusicSource = 'jamendo' | 'all';

export interface Station {
  id: string;
  name: string;
  description: string;
  category: string;
  image_url: string;
  streams: Stream[];
}

export interface Stream {
  name: string;
  url: string;
}

export interface CuratedPlaylist {
  id: string;
  name: string;
  description: string;
  category: string;
  query: string;
  source: string;
}

export const tauriApi = {
  player: {
    play: async (url: string) => {
      console.log('tauriApi.player.play called with URL:', url);
      console.log('URL type:', typeof url);
      console.log('URL length:', url?.length);
      try {
        const result = await invoke('play', { url: url });
        console.log('play result:', result);
        return result;
      } catch (e) {
        console.error('play invoke error:', e);
        throw e;
      }
    },
    pause: () => invoke('pause'),
    resume: () => invoke('resume'),
    stop: () => invoke('stop'),
    seek: (position: number) => invoke('seek', { position }),
    setVolume: (volume: number) => invoke('set_volume', { volume }),
    getStatus: () => invoke<{
      isPlaying: boolean;
      position: number;
      duration: number;
    }>('get_player_status'),
  },
  search: {
    jamendo: (query: string, limit?: number) =>
      invoke<Track[]>('search_jamendo_cmd', { query, limit: limit || 20 }),
    all: (query: string, limit?: number) =>
      invoke<Track[]>('search_all', { query, limit: limit || 20 }),
  },
  playlists: {
    getAll: () => invoke<Playlist[]>('get_playlists'),
    create: (name: string) => invoke<Playlist>('create_playlist', { name }),
    delete: (id: string) => invoke('delete_playlist', { id }),
    addTrack: (playlistId: string, track: Track) =>
      invoke('add_track_to_playlist', { playlistId, track }),
    removeTrack: (playlistId: string, trackId: string) =>
      invoke('remove_track_from_playlist', { playlistId, trackId }),
  },
  library: {
    getFavorites: () => invoke<Track[]>('get_favorites'),
    addFavorite: (track: Track) => invoke('add_favorite', { track }),
    removeFavorite: (trackId: string) => invoke('remove_favorite', { trackId }),
    getHistory: () => invoke<Track[]>('get_play_history'),
  },
  stations: {
    getAll: () => invoke<Station[]>('get_stations'),
    getCurated: () => invoke<CuratedPlaylist[]>('get_curated_playlists'),
  },
};
