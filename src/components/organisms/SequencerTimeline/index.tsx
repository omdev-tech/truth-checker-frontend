'use client';

import React from 'react';
import Image from 'next/image';
import { EnhancedSegmentData } from '@/lib/types';

interface SequencerTimelineProps {
  segments: EnhancedSegmentData[];
  currentTime: number;
  duration: number;
  zoom: number;
  selectedSegmentId: number | null;
  viewMode: 'timeline' | 'grid';
  onSegmentSelect: (segmentId: number | null) => void;
  onTimeSeek: (time: number) => void;
  onZoomChange: (zoom: number) => void;
  isLiveStream?: boolean;
}

const SequencerTimeline: React.FC<SequencerTimelineProps> = ({
  segments,
  currentTime,
  duration,
  zoom,
  selectedSegmentId,
  onSegmentSelect,
  onTimeSeek,
  onZoomChange,
  isLiveStream = false,
}) => {
  const getStatusColor = (segment: EnhancedSegmentData) => {
    switch (segment.status) {
      case 'completed':
        // Check if there are any claims
        if (!segment.factCheckResult?.claims || segment.factCheckResult.claims.length === 0) {
          return 'bg-gray-500'; // Gray for no claims
        }
        
        // Color based on fact-check status
        if (segment.factCheckResult?.status === 'true') return 'bg-green-500';
        if (segment.factCheckResult?.status === 'false') return 'bg-red-500';
        if (segment.factCheckResult?.status === 'uncertain') return 'bg-orange-500';
        if (segment.factCheckResult?.status === 'not_checkable') return 'bg-gray-500';
        if (segment.factCheckResult?.status === 'no_text') return 'bg-gray-500';
        
        return 'bg-gray-500'; // Default to gray for unknown status
      case 'processing':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  const handleSegmentClick = (segment: EnhancedSegmentData) => {
    // For live streams, don't allow seeking back in time (it's live!)
    if (isLiveStream) {
      console.log(`🔴 Live stream: Segment ${segment.id} selected (no seeking for live content)`);
      onSegmentSelect(segment.id);
      return;
    }
    
    // Select the segment
    onSegmentSelect(segment.id);
    
    // Seek video to segment start time (only for non-live content)
    onTimeSeek(segment.startTime);
    
    console.log(`🎯 Segment ${segment.id} clicked - seeking to ${segment.startTime}s`);
  };

  // For live streams, calculate a dynamic duration based on segments
  const effectiveDuration = isLiveStream && segments.length > 0 
    ? Math.max(segments[segments.length - 1].endTime, duration)
    : duration;

  return (
    <div className="h-full bg-gray-800 p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium text-sm">
            {isLiveStream ? '🔴 Live Timeline' : 'Timeline'}
          </h3>
          {isLiveStream && (
            <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full animate-pulse">
              LIVE
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0.5}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => onZoomChange(Number(e.target.value))}
            className="w-16"
          />
          <span className="text-xs text-gray-400">{zoom.toFixed(1)}x</span>
        </div>
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {segments.map((segment, index) => (
          <div
            key={`segment-${segment.id}-${segment.lastUpdated.getTime()}`}
            className={`
              relative min-w-20 h-12 rounded-lg cursor-pointer transition-all
              ${getStatusColor(segment)}
              ${selectedSegmentId === segment.id ? 'ring-2 ring-white' : ''}
              ${isLiveStream && index === segments.length - 1 && segment.status === 'processing' ? 'animate-pulse' : ''}
            `}
            onClick={() => handleSegmentClick(segment)}
          >
            {segment.thumbnail && (
              <Image
                src={segment.thumbnail}
                alt={`Segment ${segment.id}`}
                fill
                className="object-cover rounded-lg opacity-80"
                sizes="80px"
              />
            )}
            
            <div className="absolute bottom-1 left-1 right-1">
              <div className="text-xs text-white font-medium">
                {isLiveStream ? `#${segment.id + 1}` : `${Math.floor(segment.startTime)}s`}
              </div>
              {segment.claimsCount > 0 && (
                <div className="text-xs text-white/80">
                  {segment.claimsCount} claims
                </div>
              )}
            </div>
            
            {segment.status === 'processing' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {isLiveStream && index === segments.length - 1 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            )}
          </div>
        ))}
        
        {isLiveStream && segments.length > 0 && (
          <div className="relative min-w-20 h-12 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center">
            <div className="text-xs text-gray-400 text-center">
              <div>Next</div>
              <div>#{segments.length + 1}</div>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-3 relative h-6 bg-gray-700 rounded">
        {!isLiveStream && (
          <div 
            className="absolute top-0 bottom-0 w-0.5 bg-white"
            style={{ left: `${(currentTime / effectiveDuration) * 100}%` }}
          />
        )}
        
        <div className="absolute inset-0 flex justify-between items-center px-2 text-xs text-gray-300">
          {isLiveStream ? (
            <>
              <span>Live Stream</span>
              <span>{segments.length} chunks processed</span>
            </>
          ) : (
            <>
              <span>0:00</span>
              <span>{Math.floor(effectiveDuration / 60)}:{(Math.floor(effectiveDuration) % 60).toString().padStart(2, '0')}</span>
            </>
          )}
        </div>
        
        {isLiveStream && (
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-red-600 animate-pulse"></div>
        )}
      </div>
    </div>
  );
};

export default SequencerTimeline; 