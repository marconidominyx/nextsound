import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ITrack } from '@/types';

export interface QueueSong extends ITrack {
  addedAt: number;
  queueId: string;
}

interface QueueState {
  songs: QueueSong[];
  currentIndex: number;
  isPlaying: boolean;
  isSidebarOpen: boolean;
  repeatMode: 'none' | 'one' | 'all';
  shuffleMode: boolean;
}

interface QueueActions {
  addToQueue: (track: ITrack, position?: 'next' | 'end') => void;
  removeFromQueue: (queueId: string) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  setCurrentIndex: (index: number) => void;
  setPlaying: (isPlaying: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  playNext: () => void;
  playPrevious: () => void;
  moveToTop: (queueId: string) => void;
  removeDuplicates: () => void;
}

type QueueStore = QueueState & QueueActions;

const generateQueueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useQueueStore = create<QueueStore>()(
  persist(
    (set, get) => ({
      songs: [],
      currentIndex: -1,
      isPlaying: false,
      isSidebarOpen: false,
      repeatMode: 'none',
      shuffleMode: false,

      addToQueue: (track, position = 'end') => {
        const queueSong: QueueSong = {
          ...track,
          addedAt: Date.now(),
          queueId: generateQueueId(),
        };

        set((state) => {
          if (position === 'next' && state.currentIndex >= 0) {
            const newSongs = [...state.songs];
            newSongs.splice(state.currentIndex + 1, 0, queueSong);
            return { songs: newSongs };
          } else {
            return { songs: [...state.songs, queueSong] };
          }
        });
      },

      removeFromQueue: (queueId) => {
        set((state) => {
          const index = state.songs.findIndex((s) => s.queueId === queueId);
          if (index === -1) return state;

          const newSongs = state.songs.filter((s) => s.queueId !== queueId);
          let newIndex = state.currentIndex;

          if (index < state.currentIndex) {
            newIndex = state.currentIndex - 1;
          } else if (index === state.currentIndex) {
            newIndex = -1;
          }

          return { songs: newSongs, currentIndex: newIndex };
        });
      },

      reorderQueue: (fromIndex, toIndex) => {
        set((state) => {
          const newSongs = [...state.songs];
          const [moved] = newSongs.splice(fromIndex, 1);
          newSongs.splice(toIndex, 0, moved);

          let newIndex = state.currentIndex;
          if (fromIndex === state.currentIndex) {
            newIndex = toIndex;
          } else if (
            fromIndex < state.currentIndex &&
            toIndex >= state.currentIndex
          ) {
            newIndex = state.currentIndex - 1;
          } else if (
            fromIndex > state.currentIndex &&
            toIndex <= state.currentIndex
          ) {
            newIndex = state.currentIndex + 1;
          }

          return { songs: newSongs, currentIndex: newIndex };
        });
      },

      clearQueue: () => {
        set({ songs: [], currentIndex: -1 });
      },

      setCurrentIndex: (index) => {
        set({ currentIndex: index });
      },

      setPlaying: (isPlaying) => {
        set({ isPlaying });
      },

      toggleSidebar: () => {
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
      },

      setSidebarOpen: (isOpen) => {
        set({ isSidebarOpen: isOpen });
      },

      playNext: () => {
        set((state) => {
          if (state.songs.length === 0) return state;
          const nextIndex =
            state.currentIndex < state.songs.length - 1
              ? state.currentIndex + 1
              : state.repeatMode === 'all'
              ? 0
              : state.currentIndex;
          return { currentIndex: nextIndex };
        });
      },

      playPrevious: () => {
        set((state) => {
          if (state.songs.length === 0) return state;
          const prevIndex =
            state.currentIndex > 0
              ? state.currentIndex - 1
              : state.repeatMode === 'all'
              ? state.songs.length - 1
              : state.currentIndex;
          return { currentIndex: prevIndex };
        });
      },

      moveToTop: (queueId) => {
        set((state) => {
          const index = state.songs.findIndex((s) => s.queueId === queueId);
          if (index === -1) return state;

          const newSongs = [...state.songs];
          const [moved] = newSongs.splice(index, 1);
          newSongs.unshift(moved);

          const newIndex =
            index === state.currentIndex ? 0 : state.currentIndex + 1;

          return { songs: newSongs, currentIndex: newIndex };
        });
      },

      removeDuplicates: () => {
        set((state) => {
          const seen = new Set<string>();
          const uniqueSongs: QueueSong[] = [];
          let newIndex = state.currentIndex;
          let removedCount = 0;

          state.songs.forEach((song, index) => {
            const key = `${song.id}-${song.name}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueSongs.push(song);
            } else if (index < state.currentIndex) {
              removedCount++;
            }
          });

          if (removedCount > 0) {
            newIndex = Math.max(0, state.currentIndex - removedCount);
          }

          return { songs: uniqueSongs, currentIndex: newIndex };
        });
      },
    }),
    {
      name: 'nextsound-queue',
      partialize: (state) => ({
        songs: state.songs,
        currentIndex: state.currentIndex,
        repeatMode: state.repeatMode,
        shuffleMode: state.shuffleMode,
      }),
    }
  )
);

