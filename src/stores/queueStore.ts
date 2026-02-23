import { create } from 'zustand';
import { Track } from '../types';

interface QueueStore {
  queue: Track[];
  currentIndex: number;
  addToQueue: (track: Track) => void;
  addToQueueNext: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setCurrentIndex: (index: number) => void;
  reorderQueue: (from: number, to: number) => void;
  setQueue: (tracks: Track[], startIndex?: number) => void;
}

export const useQueueStore = create<QueueStore>((set) => ({
  queue: [],
  currentIndex: 0,
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  addToQueueNext: (track) =>
    set((state) => ({
      queue: [
        ...state.queue.slice(0, state.currentIndex + 1),
        track,
        ...state.queue.slice(state.currentIndex + 1),
      ],
    })),
  removeFromQueue: (index) =>
    set((state) => ({
      queue: state.queue.filter((_, i) => i !== index),
      currentIndex:
        index < state.currentIndex
          ? state.currentIndex - 1
          : state.currentIndex,
    })),
  clearQueue: () => set({ queue: [], currentIndex: 0 }),
  setCurrentIndex: (index) => set({ currentIndex: index }),
  reorderQueue: (from, to) =>
    set((state) => {
      const newQueue = [...state.queue];
      const [removed] = newQueue.splice(from, 1);
      newQueue.splice(to, 0, removed);
      return { queue: newQueue };
    }),
  setQueue: (tracks, startIndex = 0) =>
    set({ queue: tracks, currentIndex: startIndex }),
}));
