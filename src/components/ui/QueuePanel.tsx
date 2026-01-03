import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueue } from '@/context/queueContext';
import { useAudioPlayerContext } from '@/context/audioPlayerContext';
import { QueueItem } from './QueueItem';
import { Button } from './button';
import { FiX, FiTrash2, FiMusic } from 'react-icons/fi';
import { ITrack } from '@/types';
import { getImageUrl, cn } from '@/utils';

export const QueuePanel: React.FC = () => {
  const {
    queue,
    currentIndex,
    isOpen,
    closeQueue,
    clearQueue,
    removeFromQueue,
    reorderQueue,
    setCurrentIndex,
  } = useQueue();

  const { playTrack, isPlaying, currentTrack } = useAudioPlayerContext();
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle drag and drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (!isNaN(dragIndex) && dragIndex !== dropIndex) {
      reorderQueue(dragIndex, dropIndex);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeQueue();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeQueue]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const currentQueueTrack = currentIndex >= 0 && currentIndex < queue.length 
    ? queue[currentIndex] 
    : null;

  // Use currentTrack from audio player if available, otherwise use queue current track
  const displayCurrentTrack = currentTrack || currentQueueTrack;
  
  // Check if there are tracks beyond the current one
  const hasUpcomingTracks = queue.length > 0 && (currentIndex < 0 || currentIndex < queue.length - 1);

  const handlePlayTrack = (track: ITrack, index: number) => {
    setCurrentIndex(index);
    playTrack(track);
  };

  const handleClearQueue = () => {
    if (window.confirm('Are you sure you want to clear the queue?')) {
      clearQueue();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40"
            onClick={closeQueue}
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <FiMusic className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Queue
                </h2>
                {queue.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({queue.length})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {queue.length > 0 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClearQueue}
                    className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    aria-label="Clear queue"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeQueue}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  aria-label="Close queue"
                >
                  <FiX className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {queue.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FiMusic className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
                    Your queue is empty
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Add songs to your queue to see them here
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {/* Now Playing Section */}
                  {displayCurrentTrack && (
                    <div className="mb-6">
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        Now Playing
                      </h3>
                      <div
                        className={cn(
                          'p-4 rounded-lg border-2 transition-all',
                          'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500',
                          isPlaying && 'ring-2 ring-blue-400 dark:ring-blue-500 ring-opacity-50'
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative flex-shrink-0">
                            <img
                              src={getImageUrl(displayCurrentTrack.poster_path)}
                              alt={displayCurrentTrack.title || displayCurrentTrack.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            {isPlaying && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-semibold text-blue-900 dark:text-blue-100 truncate">
                              {displayCurrentTrack.title || displayCurrentTrack.name || 'Unknown Track'}
                            </h4>
                            <p className="text-sm text-blue-700 dark:text-blue-300 truncate">
                              {displayCurrentTrack.artist || 'Unknown Artist'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Queue List Section */}
                  {hasUpcomingTracks && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        {currentIndex >= 0 ? 'Up Next' : 'Queue'}
                      </h3>
                      <div className="space-y-2">
                        {queue.map((track, index) => {
                          // Skip current track if it's shown in "Now Playing"
                          if (index === currentIndex && displayCurrentTrack) return null;
                          
                          return (
                            <div
                              key={`${track.id}-${index}`}
                              onDragOver={(e) => handleDragOver(e, index)}
                              onDrop={(e) => handleDrop(e, index)}
                              onDragLeave={handleDragLeave}
                              className={cn(
                                dragOverIndex === index && 'bg-blue-50 dark:bg-blue-900/10'
                              )}
                            >
                              <QueueItem
                                track={track}
                                index={index}
                                isCurrent={index === currentIndex}
                                isPlaying={index === currentIndex && isPlaying}
                                onPlay={(track) => handlePlayTrack(track, index)}
                                onRemove={removeFromQueue}
                                showDragHandle={true}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

