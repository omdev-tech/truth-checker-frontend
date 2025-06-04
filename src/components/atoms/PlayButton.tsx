'use client';

import React from 'react';
import { Play, Pause } from 'lucide-react';

interface PlayButtonProps {
  isPlaying: boolean;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const PlayButton: React.FC<PlayButtonProps> = ({
  isPlaying,
  onClick,
  disabled = false,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        rounded-full 
        bg-blue-600 
        hover:bg-blue-700 
        disabled:bg-gray-400 
        disabled:cursor-not-allowed
        flex 
        items-center 
        justify-center 
        text-white 
        transition-colors 
        duration-200
        ${className}
      `}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? (
        <Pause size={iconSizes[size]} />
      ) : (
        <Play size={iconSizes[size]} className="ml-0.5" />
      )}
    </button>
  );
};

export default PlayButton; 