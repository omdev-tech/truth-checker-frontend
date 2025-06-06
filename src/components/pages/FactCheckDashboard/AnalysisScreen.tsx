'use client';

import React, { useState, useEffect } from 'react';
import { DashboardState } from '@/lib/types';
import VideoPlayer from '../../organisms/VideoPlayer';
import SequencerTimeline from '../../organisms/SequencerTimeline';
import ResultsPanel from '../../organisms/ResultsPanel';
import { ArrowLeft, Settings, Download, Share } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalysisScreenProps {
  state: DashboardState;
  onMediaLoaded: (duration: number) => void;
  onSegmentSelect: (segmentId: number | null) => void;
  onPlaybackChange: (updates: Partial<DashboardState['playback']>) => void;
  onReset: () => void;
  isModal?: boolean;
}

const AnalysisScreen: React.FC<AnalysisScreenProps> = ({
  state,
  onMediaLoaded,
  onSegmentSelect,
  onPlaybackChange,
  onReset,
  isModal = false,
}) => {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const selectedSegment = state.ui.selectedSegment !== null 
    ? state.segments.find(s => s.id === state.ui.selectedSegment)
    : null;

  // Calculate responsive panel size
  const responsivePanelSize = Math.min(state.ui.panelSize, windowWidth * 0.4);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border-b border-gray-700 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">
                {isModal ? 'Close Dashboard' : 'Back to Upload'}
              </span>
            </button>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">
                {state.file?.name} • {formatTime(state.duration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Share className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px-180px)]">
        {/* Left Panel - Video Player & Processing */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex flex-col min-h-0"
          style={{ 
            marginRight: state.ui.showResultsPanel ? `${responsivePanelSize}px` : 0 
          }}
        >
          {/* Video Player */}
          <div className="flex-1 p-3 md:p-6 pb-2 md:pb-4 min-h-0">
            <div className="w-full h-full">
              <VideoPlayer
                mediaUrl={state.mediaUrl!}
                mediaType={state.mediaType!}
                playback={state.playback}
                currentSegment={state.segments.find(s => 
                  state.playback.currentTime >= s.startTime && 
                  state.playback.currentTime < s.endTime
                )}
                onLoadedMetadata={onMediaLoaded}
                onPlaybackChange={onPlaybackChange}
                isStream={state.mode === 'stream' && !!state.streamData}
              />
            </div>
          </div>

          {/* Compact Processing Status - Much smaller */}
          <div className="px-3 md:px-6 py-2 border-t border-gray-700 flex-shrink-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 md:gap-4 text-sm">
                <span className="text-gray-300">
                  {state.processing.overallProgress}%
                </span>
                <span className="text-green-400">
                  ✓ {state.processing.completedSegments}
                </span>
                <span className="text-blue-400">
                  ⟳ {state.processing.processingSegments}
                </span>
                {state.processing.errorSegments > 0 && (
                  <span className="text-red-400">
                    ✗ {state.processing.errorSegments}
                  </span>
                )}
                <span className="text-gray-400 hidden sm:inline">
                  ⋯ {state.processing.totalSegments - state.processing.completedSegments - state.processing.processingSegments - state.processing.errorSegments}
                </span>
              </div>
              
              {/* Compact progress bar */}
              <div className="w-24 md:w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${state.processing.overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Results */}
        {state.ui.showResultsPanel && selectedSegment && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-gray-800 border-l border-gray-700 fixed right-0 top-20"
            style={{ 
              width: `${responsivePanelSize}px`,
              height: 'calc(100vh - 80px - 180px)'
            }}
          >
            <ResultsPanel
              segment={selectedSegment}
              onClose={() => onSegmentSelect(null)}
              onReprocess={() => {
                // Reprocess segment
              }}
            />
          </motion.div>
        )}
      </div>

      {/* Timeline Area - More compact */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 border-t border-gray-700"
        style={{ 
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '180px'
        }}
      >
        <SequencerTimeline
          segments={state.segments}
          currentTime={state.playback.currentTime}
          duration={state.duration}
          zoom={state.ui.timelineZoom}
          selectedSegmentId={state.ui.selectedSegment}
          viewMode={state.ui.viewMode}
          onSegmentSelect={onSegmentSelect}
          onTimeSeek={(time: number) => onPlaybackChange({ currentTime: time })}
          onZoomChange={(zoom: number) => {
            // Update zoom level - placeholder for now
            console.log('Zoom changed to:', zoom);
          }}
          isLiveStream={state.processing.isLiveStream}
        />
      </motion.div>
    </div>
  );
};

export default AnalysisScreen; 