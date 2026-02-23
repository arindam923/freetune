import { create } from 'zustand';
import { Track, PlayerState } from '../types';
import { tauriApi } from '../services/tauriApi';

interface PlayerStore extends PlayerState {
  setCurrentTrack: (track: Track | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setRepeat: (repeat: 'off' | 'one' | 'all') => void;
  setShuffle: (shuffle: boolean) => void;
  playTrack: (track: Track) => Promise<void>;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTrack: null,
  isPlaying: false,
  isLoading: false,
  progress: 0,
  duration: 0,
  volume: 1,
  repeat: 'off',
  shuffle: false,
  setCurrentTrack: (track) => set({ currentTrack: track }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setRepeat: (repeat) => set({ repeat }),
  setShuffle: (shuffle) => set({ shuffle }),
  playTrack: async (track: Track) => {
    try {
      console.log('playTrack called with:', JSON.stringify(track, null, 2));
      
      if (!track.streamUrl) {
        console.error('No stream URL provided! Track:', track);
        alert(`No stream URL! Title: ${track.title}, Stream URL: ${track.streamUrl}`);
        return;
      }
      
      set({ currentTrack: track, isPlaying: false, isLoading: true, progress: 0 });
      console.log('Calling tauriApi.player.play with URL:', track.streamUrl);
      
      tauriApi.player.play(track.streamUrl).catch(err => {
        console.error('Play error:', err);
        set({ isPlaying: false, isLoading: false });
      });
      
      setTimeout(() => {
        usePlayerStore.getState().setIsLoading(false);
      }, 10000);
    } catch (error) {
      console.error('Failed to play track:', error);
      set({ isPlaying: false, isLoading: false });
    }
  },
}));
