'use client';

import React from 'react';

interface WaveformDisplayProps {
  waveform: number[];
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  waveform,
  currentTime,
  duration,
  onSeek,
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative">
      <div className="flex items-end justify-center gap-1 h-24 bg-gray-800 rounded-lg p-4 cursor-pointer"
           onClick={(e) => {
             const rect = e.currentTarget.getBoundingClientRect();
             const x = e.clientX - rect.left;
             const width = rect.width;
             const seekTime = (x / width) * duration;
             onSeek(seekTime);
           }}>
        {waveform.map((amplitude, index) => (
          <div
            key={index}
            className={`w-1 bg-blue-400 transition-colors ${
              (index / waveform.length) * 100 <= progress ? 'bg-blue-500' : 'bg-gray-600'
            }`}
            style={{
              height: `${Math.max(2, amplitude * 64)}px`,
            }}
          />
        ))}
      </div>
      
      {/* Progress indicator */}
      <div 
        className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
        style={{ left: `${progress}%` }}
      />
    </div>
  );
};

export default WaveformDisplay; 