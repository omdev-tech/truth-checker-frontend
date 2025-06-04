'use client';

import React from 'react';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';
import { SegmentData } from '@/lib/types';

interface SegmentMarkerProps {
  segment: SegmentData;
  isActive?: boolean;
  onClick: () => void;
  width: number;
  height?: number;
}

const SegmentMarker: React.FC<SegmentMarkerProps> = ({
  segment,
  isActive = false,
  onClick,
  width,
  height = 60,
}) => {
  const getStatusColor = (status: SegmentData['status'], factCheckResult?: SegmentData['factCheckResult']) => {
    if (status === 'processing') return 'bg-blue-500 animate-pulse';
    if (status === 'error') return 'bg-red-400';
    if (status === 'pending') return 'bg-gray-400';
    
    if (status === 'completed' && factCheckResult) {
      switch (factCheckResult.status) {
        case 'true': return 'bg-green-500';
        case 'false': return 'bg-red-500';
        case 'uncertain': return 'bg-orange-500';
        case 'not_checkable': return 'bg-gray-300';
        case 'no_text': return 'bg-gray-300';
        case 'error': return 'bg-red-400';
        default: return 'bg-gray-400';
      }
    }
    
    return 'bg-gray-400';
  };

  const getStatusText = (status: SegmentData['status'], factCheckResult?: SegmentData['factCheckResult']) => {
    if (status === 'processing') return 'Processing...';
    if (status === 'error') return 'Error';
    if (status === 'pending') return 'Pending';
    
    if (status === 'completed' && factCheckResult) {
      switch (factCheckResult.status) {
        case 'true': return 'Accurate';
        case 'false': return 'Inaccurate';
        case 'uncertain': return 'Uncertain';
        case 'not_checkable': return 'Not checkable';
        case 'no_text': return 'No text';
        case 'error': return 'Check failed';
        default: return 'Unknown';
      }
    }
    
    return 'Not processed';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`
        relative 
        cursor-pointer 
        rounded-md 
        border-2 
        transition-all 
        duration-200 
        hover:scale-105 
        group
        ${isActive ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-300 hover:border-gray-400'}
        ${getStatusColor(segment.status, segment.factCheckResult)}
      `}
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={onClick}
      title={getStatusText(segment.status, segment.factCheckResult)}
    >
      {/* Thumbnail or placeholder */}
      <div className="w-full h-full rounded-md overflow-hidden relative">
        {segment.thumbnail ? (
          <Image
            src={segment.thumbnail}
            alt={`Segment ${segment.id}`}
            className="w-full h-full object-cover"
            width={width}
            height={height}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <span className="text-xs text-gray-500">
              {formatTime(segment.startTime)}
            </span>
          </div>
        )}
        
        {/* Status overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {segment.status === 'processing' && (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          )}
          {segment.status === 'completed' && segment.factCheckResult && (
            <div className="text-white text-xs font-medium text-center">
              {getStatusText(segment.status, segment.factCheckResult)}
            </div>
          )}
        </div>
        
        {/* Time indicators */}
        <div className="absolute bottom-1 left-1 right-1 text-xs text-white bg-black bg-opacity-50 rounded px-1 py-0.5 text-center">
          {formatTime(segment.startTime)}-{formatTime(segment.endTime)}
        </div>
        
        {/* Active indicator */}
        {isActive && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full border-2 border-white"></div>
        )}
      </div>
    </div>
  );
};

export default SegmentMarker; 