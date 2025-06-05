'use client';

import React from 'react';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  onPlaybackRateChange: (rate: number) => void;
  isFullscreen: boolean;
  onFullscreenToggle: () => void;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onMuteToggle,
  onPlaybackRateChange,
  isFullscreen,
  onFullscreenToggle,
}) => {
  return (
    <div className="flex items-center gap-4 text-white">
      <button
        onClick={onPlayPause}
        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
      >
        {isPlaying ? '⏸️' : '▶️'}
      </button>
      
      <div className="flex-1 flex items-center gap-2">
        <span className="text-sm">{Math.floor(currentTime)}s</span>
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm">{Math.floor(duration)}s</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button onClick={onMuteToggle} className="p-1">
          {isMuted ? '🔇' : '🔊'}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.1}
          value={volume}
          onChange={(e) => onVolumeChange(Number(e.target.value))}
          className="w-20"
        />
      </div>
      
      <select
        value={playbackRate}
        onChange={(e) => onPlaybackRateChange(Number(e.target.value))}
        className="bg-transparent border border-white/20 rounded px-2 py-1 text-sm"
      >
        <option value={0.5}>0.5x</option>
        <option value={1}>1x</option>
        <option value={1.25}>1.25x</option>
        <option value={1.5}>1.5x</option>
        <option value={2}>2x</option>
      </select>
      
      <button
        onClick={onFullscreenToggle}
        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
      >
        {isFullscreen ? '🗗' : '⛶'}
      </button>
    </div>
  );
};

export default PlayerControls; 