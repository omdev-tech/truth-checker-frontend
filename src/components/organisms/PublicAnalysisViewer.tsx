'use client';

import React, { useState, useEffect } from 'react';
import { PublicContentDetailResponse, PublicContentSegment } from '@/lib/types/public-content';
import { DashboardState, EnhancedSegmentData } from '@/lib/types';
import { PublicContentTransformer } from '@/lib/services/publicContentTransformer';
import { PublicContentApi } from '@/lib/services/publicContentApi';
import AnalysisScreen from '@/components/pages/FactCheckDashboard/AnalysisScreen';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';

interface PublicAnalysisViewerProps {
  content: PublicContentDetailResponse;
  className?: string;
}

const PublicAnalysisViewer: React.FC<PublicAnalysisViewerProps> = ({
  content,
  className = '',
}) => {
  const [segments, setSegments] = useState<PublicContentSegment[]>([]);
  const [dashboardState, setDashboardState] = useState<DashboardState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSegments = async () => {
      try {
        setIsLoading(true);
        const fetchedSegments = await PublicContentApi.getPublicContentSegments(content.id);
        setSegments(fetchedSegments);

        // Transform segments for the dashboard
        const transformedSegments = PublicContentTransformer.transformSegmentsForDashboard(fetchedSegments);
        const processing = PublicContentTransformer.transformContentForProcessingState(content, fetchedSegments);

        // Create a complete dashboard state that mimics a completed analysis session
        const playableUrl = PublicContentTransformer.getPlayableUrl(content);
        const mediaType = PublicContentTransformer.hasVideoMedia(content) ? 'video' : 'audio';
        
        const state: DashboardState = {
          mode: 'analysis',
          file: null, // No file for public content
          streamData: null, // No stream data for public content  
          mediaUrl: playableUrl,
          mediaType,
          duration: content.duration_seconds || 0,
          segments: transformedSegments,
          processing,
          playback: {
            currentTime: 0,
            isPlaying: false,
            volume: 0.8,
            playbackRate: 1.0,
            isMuted: false,
          },
          ui: {
            selectedSegment: null,
            showResultsPanel: false,
            timelineZoom: 1.0,
            panelSize: 300,
            viewMode: 'timeline',
            showProcessingDetails: false,
          },
        };

        setDashboardState(state);
      } catch (err) {
        console.error('Failed to load segments:', err);
        setError('Failed to load analysis data');
      } finally {
        setIsLoading(false);
      }
    };

    loadSegments();
  }, [content.id]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">Loading analysis...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-red-600 font-medium">{error}</div>
        <p className="text-gray-500 mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  if (!dashboardState) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-gray-600">No analysis data available</div>
      </div>
    );
  }

  // Handler functions for AnalysisScreen
  const handleMediaLoaded = (duration: number) => {
    // Media is already loaded, this is just for interface compatibility
    console.log('Media loaded:', duration);
  };

  const handleSegmentSelect = (segmentId: number | null) => {
    setDashboardState(prev => prev ? {
      ...prev,
      ui: {
        ...prev.ui,
        selectedSegment: segmentId,
        showResultsPanel: segmentId !== null
      }
    } : null);
  };

  const handlePlaybackChange = (updates: Partial<DashboardState['playback']>) => {
    setDashboardState(prev => prev ? {
      ...prev,
      playback: { ...prev.playback, ...updates }
    } : null);
  };

  const handleReset = () => {
    // No reset action for public view - user will close modal instead
  };

  return (
    <div className={className}>
      <AnalysisScreen
        state={dashboardState}
        onMediaLoaded={handleMediaLoaded}
        onSegmentSelect={handleSegmentSelect}
        onPlaybackChange={handlePlaybackChange}
        onReset={handleReset}
        isModal={true}
      />
    </div>
  );
};

export default PublicAnalysisViewer; 