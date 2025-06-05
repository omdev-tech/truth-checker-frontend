'use client';

import React from 'react';
import { EnhancedSegmentData } from '@/lib/types';

interface PlayerOverlayProps {
  segment: EnhancedSegmentData;
  isVisible: boolean;
}

const PlayerOverlay: React.FC<PlayerOverlayProps> = ({ segment, isVisible }) => {
  if (!isVisible) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return segment.factCheckResult?.status === 'true' ? 'text-green-400' : 
               segment.factCheckResult?.status === 'false' ? 'text-red-400' : 'text-orange-400';
      case 'processing':
        return 'text-blue-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white">
      <div className="flex items-center gap-2 mb-1">
        <div className={`w-2 h-2 rounded-full ${getStatusColor(segment.status).replace('text-', 'bg-')}`}></div>
        <span className="text-sm font-medium">
          Segment {segment.id + 1} ({Math.floor(segment.startTime)}s - {Math.floor(segment.endTime)}s)
        </span>
      </div>
      
      {segment.status === 'completed' && segment.claimsCount > 0 && (
        <div className="text-xs text-gray-300">
          {segment.claimsCount} claims • {Math.round(segment.accuracyScore || 0)}% accuracy
        </div>
      )}
      
      {segment.status === 'processing' && (
        <div className="text-xs text-blue-400">Processing claims...</div>
      )}
      
      {segment.status === 'error' && (
        <div className="text-xs text-red-400">Processing failed</div>
      )}
    </div>
  );
};

export default PlayerOverlay; 