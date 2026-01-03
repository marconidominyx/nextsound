import React, { useState } from 'react';
import { ITrack } from '@/types';
import { getImageUrl, cn } from '@/utils';
import { Button } from './button';
import { FiX, FiGripVertical, FiPlay } from 'react-icons/fi';

interface QueueItemProps {
  track: ITrack;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  onPlay: (track: ITrack) => void;
  onRemove: (index: number) => void;
  onReorder?: (fromIndex: number, toIndex: number) => void;
  showDragHandle?: boolean;
}

export const QueueItem: React.FC<QueueItemProps> = ({
  track,
  index,
  isCurrent,
  isPlaying,
  onPlay,
  onRemove,
  showDragHandle = true,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const displayTitle = track.title || track.name || 'Unknown Track';
  const displayArtist = track.artist || 'Unknown Artist';

  const formatDuration = (ms: number | undefined) => {
    if (!ms) return '';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable={showDragHandle && !isCurrent}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => !isCurrent && onPlay(track)}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-all duration-300 group cursor-pointer',
        'hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-blue-600/5',
        'hover:border hover:border-blue-500/20',
        'hover:shadow-lg hover:shadow-blue-500/10',
        isCurrent && 'bg-gradient-to-r from-blue-500/10 to-blue-600/5 border border-blue-500/20',
        isDragging && 'opacity-50'
      )}
    >
      {/* Drag handle */}
      {showDragHandle && !isCurrent && (
        <div className="flex-shrink-0 text-gray-400 dark:text-gray-500 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
          <FiGripVertical className="w-4 h-4" />
        </div>
      )}

      {/* Play button or index */}
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
        {isCurrent ? (
          <div className="w-8 h-8 flex items-center justify-center">
            {isPlaying ? (
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
            ) : (
              <FiPlay className="w-4 h-4 text-blue-600" />
            )}
          </div>
        ) : (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
            {index + 1}
          </span>
        )}
      </div>

      {/* Track image */}
      <div className="flex-shrink-0">
        <img
          src={getImageUrl(track.poster_path)}
          alt={displayTitle}
          className="w-10 h-10 rounded-lg object-cover shadow-sm"
        />
      </div>

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            'text-sm font-medium truncate',
            'text-gray-900 dark:text-text-primary'
          )}
        >
          {displayTitle}
        </h4>
        <p
          className={cn(
            'text-xs truncate',
            'text-gray-500 dark:text-text-secondary'
          )}
        >
          {displayArtist}
        </p>
      </div>

      {/* Duration */}
      {track.duration && (
        <div className="flex-shrink-0 text-xs text-gray-500 dark:text-text-secondary flex items-center gap-1">
          <span>{formatDuration(track.duration)}</span>
        </div>
      )}

      {/* Remove button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'flex-shrink-0 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity',
          'text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400'
        )}
      onClick={(e) => {
        e.stopPropagation();
        onRemove(index);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
        aria-label={`Remove ${displayTitle} from queue`}
      >
        <FiX className="w-4 h-4" />
      </Button>
    </div>
  );
};

