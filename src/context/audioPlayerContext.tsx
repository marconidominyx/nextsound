import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useQueue } from '@/context/queueContext';
import { ITrack } from '@/types';

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
  const { getNextTrack, getPreviousTrack, setCurrentIndex, queue } = useQueue();

  // Enhanced playTrack that updates queue index
  const playTrackWithQueue = useCallback((track: ITrack) => {
    // Find track in queue and set as current
    const trackIndex = queue.findIndex(t => t.id === track.id);
    if (trackIndex >= 0) {
      setCurrentIndex(trackIndex);
    }
    audioPlayer.playTrack(track);
  }, [queue, setCurrentIndex, audioPlayer]);

  // Enhanced skipNext that uses queue
  const skipNext = useCallback(() => {
    const nextTrack = getNextTrack();
    if (nextTrack) {
      playTrackWithQueue(nextTrack);
    } else {
      audioPlayer.skipNext(() => getNextTrack());
    }
  }, [getNextTrack, playTrackWithQueue, audioPlayer]);

  // Enhanced skipPrevious that uses queue
  const skipPrevious = useCallback(() => {
    const prevTrack = getPreviousTrack();
    if (prevTrack) {
      playTrackWithQueue(prevTrack);
    } else {
      audioPlayer.skipPrevious(() => getPreviousTrack());
    }
  }, [getPreviousTrack, playTrackWithQueue, audioPlayer]);

  // Handle track end - auto-play next
  React.useEffect(() => {
    if (!audioPlayer.isPlaying && audioPlayer.progress === 0 && audioPlayer.currentTrack) {
      // Track just ended, try to play next
      const nextTrack = getNextTrack();
      if (nextTrack) {
        // Small delay to avoid immediate playback
        const timer = setTimeout(() => {
          playTrackWithQueue(nextTrack);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [audioPlayer.isPlaying, audioPlayer.progress, audioPlayer.currentTrack, getNextTrack, playTrackWithQueue]);

  return (
    <AudioPlayerContext.Provider
      value={{
        ...audioPlayer,
        playTrack: playTrackWithQueue,
        skipNext,
        skipPrevious,
      }}
    >
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

