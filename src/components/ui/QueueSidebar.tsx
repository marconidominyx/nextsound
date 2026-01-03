import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { useQueueStore } from '@/store/queueStore';
import { NowPlaying } from './NowPlaying';
import { QueueItem } from './QueueItem';
import { useAudioPlayerContext } from '@/context/audioPlayerContext';

export const QueueSidebar: React.FC = () => {
  const {
    songs,
    currentIndex,
    isSidebarOpen,
    setSidebarOpen,
    clearQueue,
    removeFromQueue,
    setCurrentIndex,
  } = useQueueStore();

  const { playTrack, isPlaying, togglePlay, currentTrack } = useAudioPlayerContext();

  const currentSong = currentIndex >= 0 ? songs[currentIndex] : null;
  const upcomingSongs = songs.filter((_, index) => index !== currentIndex);

  const handlePlaySong = (song: typeof songs[0]) => {
    const index = songs.findIndex((s) => s.queueId === song.queueId);
    if (index !== -1) {
      setCurrentIndex(index);
      playTrack(song);
    }
  };

  const handlePlayPause = () => {
    if (currentSong) {
      const isCurrentTrack = currentTrack?.id === currentSong.id;
      if (isCurrentTrack && isPlaying) {
        togglePlay();
      } else {
        playTrack(currentSong);
      }
    }
  };

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
            className={`
              fixed top-0 right-0 h-full w-80 md:w-80
              bg-white dark:bg-deep-dark
              border-l border-gray-200 dark:border-gray-700
              shadow-2xl z-50
              flex flex-col
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-text-primary">
                Queue
              </h2>
              <div className="flex items-center gap-2">
                {songs.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    title="Clear Queue"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-all duration-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Now Playing */}
              {currentSong && (
                <NowPlaying
                  song={currentSong}
                  isPlaying={isPlaying}
                  onPlay={handlePlayPause}
                  onPause={togglePlay}
                />
              )}

              {/* Upcoming Songs */}
              <div className="p-4">
                {upcomingSongs.length > 0 ? (
                  <>
                    <p className="text-sm font-medium text-gray-500 dark:text-text-secondary mb-3">
                      Up Next ({upcomingSongs.length})
                    </p>
                    <div className="space-y-2">
                      {upcomingSongs.map((song, idx) => {
                        const originalIndex = songs.findIndex(
                          (s) => s.queueId === song.queueId
                        );
                        return (
                          <div key={song.queueId} className="group">
                            <QueueItem
                              song={song}
                              index={originalIndex}
                              isCurrentSong={false}
                              onPlay={handlePlaySong}
                              onRemove={removeFromQueue}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-text-secondary text-sm">
                      {songs.length === 0
                        ? 'Your queue is empty'
                        : 'No more songs in queue'}
                    </p>
                    <p className="text-gray-400 dark:text-text-secondary/70 text-xs mt-1">
                      Add songs to your queue to see them here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

