import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { ITrack } from '@/types';
import { useQueueStore } from '@/store/queueStore';

interface AudioPlayerContextType {
  currentTrack: ITrack | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'one' | 'all';
  isMinimized: boolean;
  playTrack: (track: ITrack) => void;
  togglePlay: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seek: (position: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleFavorite: () => void;
  toggleMinimize: () => void;
  closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

interface AudioPlayerProviderProps {
  children: ReactNode;
}

export const AudioPlayerProvider: React.FC<AudioPlayerProviderProps> = ({ children }) => {
  const audioPlayer = useAudioPlayer();
  const { songs, currentIndex, setCurrentIndex, playNext, playPrevious, repeatMode } = useQueueStore();

  // Enhanced skipNext that integrates with queue
  const enhancedSkipNext = useCallback(() => {
    if (songs.length > 0 && currentIndex >= 0) {
      const nextIndex = currentIndex < songs.length - 1 ? currentIndex + 1 : (repeatMode === 'all' ? 0 : currentIndex);
      if (nextIndex !== currentIndex && songs[nextIndex]) {
        setCurrentIndex(nextIndex);
        audioPlayer.playTrack(songs[nextIndex]);
      }
    } else {
      audioPlayer.skipNext();
    }
  }, [songs, currentIndex, repeatMode, setCurrentIndex, audioPlayer]);

  // Enhanced skipPrevious that integrates with queue
  const enhancedSkipPrevious = useCallback(() => {
    if (songs.length > 0 && currentIndex >= 0) {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : (repeatMode === 'all' ? songs.length - 1 : currentIndex);
      if (prevIndex !== currentIndex && songs[prevIndex]) {
        setCurrentIndex(prevIndex);
        audioPlayer.playTrack(songs[prevIndex]);
      }
    } else {
      audioPlayer.skipPrevious();
    }
  }, [songs, currentIndex, repeatMode, setCurrentIndex, audioPlayer]);

  // Enhanced playTrack that updates queue index
  const enhancedPlayTrack = useCallback((track: ITrack) => {
    const queueIndex = songs.findIndex((s) => s.id === track.id);
    if (queueIndex !== -1) {
      setCurrentIndex(queueIndex);
    }
    audioPlayer.playTrack(track);
  }, [songs, setCurrentIndex, audioPlayer]);

  const value = {
    ...audioPlayer,
    playTrack: enhancedPlayTrack,
    skipNext: enhancedSkipNext,
    skipPrevious: enhancedSkipPrevious,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayerContext = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayerContext must be used within AudioPlayerProvider');
  }
  return context;
};

