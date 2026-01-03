import React from 'react';
import { FiX, FiClock } from 'react-icons/fi';
import { QueueSong } from '@/store/queueStore';
import { getImageUrl, cn } from '@/utils';

interface QueueItemProps {
  song: QueueSong;
  index: number;
  isCurrentSong: boolean;
  onPlay: (song: QueueSong) => void;
  onRemove: (queueId: string) => void;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  song,
  index,
  isCurrentSong,
  onPlay,
  onRemove,
}) => {
  const displayTitle = song.title || song.name || 'Unknown Track';
  const displayArtist = song.artist || 'Unknown Artist';

  const formatDuration = (ms: number) => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onClick={() => !isCurrentSong && onPlay(song)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'transition-all duration-300 cursor-pointer',
        'hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-600/5',
        'hover:border hover:border-blue-500/20',
        'hover:shadow-lg hover:shadow-blue-500/10',
        isCurrentSong && 'bg-blue-500/5 border border-blue-500/20'
      )}
    >
      <img
        src={getImageUrl(song.poster_path)}
        alt={displayTitle}
        className="w-10 h-10 rounded-lg object-cover shadow-sm"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-text-primary truncate text-sm">
          {displayTitle}
        </h4>
        <p className="text-xs text-gray-500 dark:text-text-secondary truncate">
          {displayArtist}
        </p>
      </div>
      {song.duration && (
        <div className="flex items-center text-xs text-gray-400 dark:text-text-secondary/70 shrink-0">
          <FiClock className="w-3 h-3 mr-1" />
          {formatDuration(song.duration)}
        </div>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(song.queueId);
        }}
        className={cn(
          'p-1.5 rounded-full transition-all duration-200',
          'text-gray-400 hover:text-red-500 hover:bg-red-500/10',
          'hover:scale-110'
        )}
      >
        <FiX className="w-4 h-4" />
      </button>
    </div>
  );
};

