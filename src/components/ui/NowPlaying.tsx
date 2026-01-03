import React from 'react';
import { FiPlay, FiPause } from 'react-icons/fi';
import { QueueSong } from '@/store/queueStore';
import { getImageUrl, cn } from '@/utils';

interface NowPlayingProps {
  song: QueueSong;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export const NowPlaying: React.FC<NowPlayingProps> = ({
  song,
  isPlaying,
  onPlay,
  onPause,
}) => {
  const displayTitle = song.title || song.name || 'Unknown Track';
  const displayArtist = song.artist || 'Unknown Artist';

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-500 dark:text-text-secondary mb-2">
        Now Playing
      </p>
      <div
        className={cn(
          'bg-gradient-to-r from-blue-500/10 to-blue-600/5',
          'border border-blue-500/20 rounded-lg p-4',
          'shadow-lg shadow-blue-500/10',
          'transition-all duration-300'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative group">
            <img
              src={getImageUrl(song.poster_path)}
              alt={displayTitle}
              className="w-12 h-12 rounded-lg object-cover shadow-md"
            />
            <button
              onClick={isPlaying ? onPause : onPlay}
              className={cn(
                'absolute inset-0 flex items-center justify-center',
                'bg-black/50 opacity-0 group-hover:opacity-100',
                'transition-opacity duration-200 rounded-lg',
                'hover:bg-black/60'
              )}
            >
              {isPlaying ? (
                <FiPause className="w-5 h-5 text-white" />
              ) : (
                <FiPlay className="w-5 h-5 text-white ml-0.5" />
              )}
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-text-primary truncate">
              {displayTitle}
            </h3>
            <p className="text-sm text-gray-500 dark:text-text-secondary truncate">
              {displayArtist}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

