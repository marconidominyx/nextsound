import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { ITrack } from '@/types';

interface QueueContextType {
  queue: ITrack[];
  currentIndex: number;
  isOpen: boolean;
  addToQueue: (track: ITrack, position?: 'next' | 'end') => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (fromIndex: number, toIndex: number) => void;
  clearQueue: () => void;
  setCurrentIndex: (index: number) => void;
  toggleQueue: () => void;
  openQueue: () => void;
  closeQueue: () => void;
  playNext: () => ITrack | null;
  playPrevious: () => ITrack | null;
  getCurrentTrack: () => ITrack | null;
  getNextTrack: () => ITrack | null;
  getPreviousTrack: () => ITrack | null;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

interface QueueProviderProps {
  children: ReactNode;
}

const QUEUE_STORAGE_KEY = 'nextsound_queue';
const CURRENT_INDEX_STORAGE_KEY = 'nextsound_queue_index';

export const QueueProvider: React.FC<QueueProviderProps> = ({ children }) => {
  // Load from localStorage on mount
  const [queue, setQueue] = useState<ITrack[]>(() => {
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [currentIndex, setCurrentIndexState] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(CURRENT_INDEX_STORAGE_KEY);
      return stored ? parseInt(stored, 10) : -1;
    } catch {
      return -1;
    }
  });

  const [isOpen, setIsOpen] = useState(false);

  // Persist queue to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to save queue to localStorage:', error);
    }
  }, [queue]);

  // Persist current index to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_INDEX_STORAGE_KEY, currentIndex.toString());
    } catch (error) {
      console.error('Failed to save current index to localStorage:', error);
    }
  }, [currentIndex]);

  const addToQueue = useCallback((track: ITrack, position: 'next' | 'end' = 'end') => {
    setQueue(prev => {
      if (position === 'next') {
        // Insert after current track
        const newIndex = currentIndex + 1;
        const newQueue = [...prev];
        newQueue.splice(newIndex, 0, track);
        return newQueue;
      } else {
        // Add to end
        return [...prev, track];
      }
    });
  }, [currentIndex]);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => {
      const newQueue = prev.filter((_, i) => i !== index);
      
      // Adjust current index if needed
      if (index < currentIndex) {
        setCurrentIndexState(prevIndex => prevIndex - 1);
      } else if (index === currentIndex) {
        // If removing current track, move to next or previous
        setCurrentIndexState(-1);
      }
      
      return newQueue;
    });
  }, [currentIndex]);

  const reorderQueue = useCallback((fromIndex: number, toIndex: number) => {
    setQueue(prev => {
      const newQueue = [...prev];
      const [moved] = newQueue.splice(fromIndex, 1);
      newQueue.splice(toIndex, 0, moved);
      
      // Adjust current index
      if (fromIndex === currentIndex) {
        setCurrentIndexState(toIndex);
      } else if (fromIndex < currentIndex && toIndex >= currentIndex) {
        setCurrentIndexState(prev => prev - 1);
      } else if (fromIndex > currentIndex && toIndex <= currentIndex) {
        setCurrentIndexState(prev => prev + 1);
      }
      
      return newQueue;
    });
  }, [currentIndex]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentIndexState(-1);
  }, []);

  const setCurrentIndex = useCallback((index: number) => {
    setCurrentIndexState(index);
  }, []);

  const toggleQueue = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const openQueue = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeQueue = useCallback(() => {
    setIsOpen(false);
  }, []);

  const getCurrentTrack = useCallback((): ITrack | null => {
    if (currentIndex >= 0 && currentIndex < queue.length) {
      return queue[currentIndex];
    }
    return null;
  }, [queue, currentIndex]);

  const getNextTrack = useCallback((): ITrack | null => {
    if (currentIndex >= 0 && currentIndex < queue.length - 1) {
      return queue[currentIndex + 1];
    }
    return null;
  }, [queue, currentIndex]);

  const getPreviousTrack = useCallback((): ITrack | null => {
    if (currentIndex > 0 && currentIndex < queue.length) {
      return queue[currentIndex - 1];
    }
    return null;
  }, [queue, currentIndex]);

  const playNext = useCallback((): ITrack | null => {
    const nextTrack = getNextTrack();
    if (nextTrack) {
      setCurrentIndexState(prev => prev + 1);
      return nextTrack;
    }
    return null;
  }, [getNextTrack]);

  const playPrevious = useCallback((): ITrack | null => {
    const prevTrack = getPreviousTrack();
    if (prevTrack) {
      setCurrentIndexState(prev => prev - 1);
      return prevTrack;
    }
    return null;
  }, [getPreviousTrack]);

  return (
    <QueueContext.Provider
      value={{
        queue,
        currentIndex,
        isOpen,
        addToQueue,
        removeFromQueue,
        reorderQueue,
        clearQueue,
        setCurrentIndex,
        toggleQueue,
        openQueue,
        closeQueue,
        playNext,
        playPrevious,
        getCurrentTrack,
        getNextTrack,
        getPreviousTrack,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
};

export const useQueue = () => {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error('useQueue must be used within QueueProvider');
  }
  return context;
};

