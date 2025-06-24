'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SequencerState, SegmentData, ChunkProcessingResponse } from '@/lib/types';
import { truthCheckerApi } from '@/lib/api';
import { CONFIG } from '@/lib/config';
import ColorLegend from '../../molecules/ColorLegend';
import { useTranslation } from 'react-i18next';

// Temporary simple implementations - will be replaced with full components
interface VideoPlayerProps {
  videoUrl: string;
  onLoadedMetadata: (duration: number) => void;
  onTimeUpdate: (currentTime: number) => void;
  onPlay: () => void;
  onPause: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, onLoadedMetadata, onTimeUpdate, onPlay, onPause }) => {
  return (
    <div className="w-full bg-black rounded-lg overflow-hidden">
      <video
        src={videoUrl}
        className="w-full h-auto"
        controls
        onLoadedMetadata={(e) => onLoadedMetadata(e.currentTarget.duration)}
        onTimeUpdate={(e) => onTimeUpdate(e.currentTarget.currentTime)}
        onPlay={onPlay}
        onPause={onPause}
      />
    </div>
  );
};

interface SequencerTimelineProps {
  segments: SegmentData[];
  onSegmentClick: (segmentId: number) => void;
}

const SequencerTimeline: React.FC<SequencerTimelineProps> = ({ segments, onSegmentClick }) => {
  return (
    <div className="w-full p-4 bg-white rounded-lg border">
      <h3 className="font-semibold mb-3">Timeline</h3>
      <div className="flex gap-2 overflow-x-auto">
        {segments.map((segment: SegmentData) => (
          <div
            key={segment.id}
            className={`
              w-16 h-12 rounded cursor-pointer border-2 flex-shrink-0
              ${segment.status === 'processing' ? 'bg-blue-500 animate-pulse' : ''}
              ${segment.status === 'completed' && segment.factCheckResult?.status === 'true' ? 'bg-green-500' : ''}
              ${segment.status === 'completed' && segment.factCheckResult?.status === 'false' ? 'bg-red-500' : ''}
              ${segment.status === 'completed' && segment.factCheckResult?.status === 'uncertain' ? 'bg-orange-500' : ''}
              ${segment.status === 'completed' && (segment.factCheckResult?.status === 'not_checkable' || segment.factCheckResult?.status === 'no_text') ? 'bg-gray-300' : ''}
              ${segment.status === 'pending' ? 'bg-gray-400' : ''}
              ${segment.status === 'error' ? 'bg-red-400' : ''}
            `}
            onClick={() => onSegmentClick(segment.id)}
            title={`${segment.startTime}s - ${segment.endTime}s`}
          >
            <div className="w-full h-full flex items-center justify-center text-xs text-white font-medium">
              {segment.id + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface FactCheckModalProps {
  segment: SegmentData;
  isOpen: boolean;
  onClose: () => void;
}

const FactCheckModal: React.FC<FactCheckModalProps> = ({ segment, isOpen, onClose }) => {
  const { t } = useTranslation('common');
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Segment {segment.id + 1} ({segment.startTime}s - {segment.endTime}s)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          {segment.transcription && (
            <div>
              <h3 className="font-semibold mb-2">Transcription:</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">
                {segment.transcription}
              </p>
            </div>
          )}
          
          {segment.factCheckResult && (
            <div>
              <h3 className="font-semibold mb-2">Fact-Check Results:</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Status:</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    segment.factCheckResult.status === 'true' ? 'bg-green-100 text-green-800' :
                    segment.factCheckResult.status === 'false' ? 'bg-red-100 text-red-800' :
                    segment.factCheckResult.status === 'partially_true' ? 'bg-yellow-100 text-yellow-800' :
                    segment.factCheckResult.status === 'uncertain' ? 'bg-orange-100 text-orange-800' :
                    segment.factCheckResult.status === 'disputed' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                                        {segment.factCheckResult.status === 'true' ? t('statuses.true') :
                    segment.factCheckResult.status === 'false' ? t('statuses.false') :
                    segment.factCheckResult.status === 'partially_true' ? t('statuses.partiallyTrue') :
                    segment.factCheckResult.status === 'uncertain' ? t('statuses.uncertain') :
                    segment.factCheckResult.status === 'disputed' ? t('statuses.disputed') :
                    t('statuses.unknown')}
                  </span>
                </div>
                
                {segment.factCheckResult.claims && segment.factCheckResult.claims.length > 0 && (
                  <div>
                    <span className="font-medium">Claims:</span>
                    <ul className="mt-2 space-y-2">
                      {segment.factCheckResult.claims.map((claim, index) => (
                        <li key={index} className="bg-gray-50 p-3 rounded">
                          <div className="font-medium">{claim.text}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Status: {claim.status === 'true' ? t('statuses.true') :
                                   claim.status === 'false' ? t('statuses.false') :
                                   claim.status === 'partially_true' ? t('statuses.partiallyTrue') :
                                   claim.status === 'uncertain' ? t('statuses.uncertain') :
                            claim.status === 'disputed' ? t('statuses.disputed') :
                            t('statuses.unknown')} | Confidence: {claim.confidence === 'high' ? t('confidence.high') :
                                                       claim.confidence === 'medium' ? t('confidence.medium') :
                                                       claim.confidence === 'low' ? t('confidence.low') :
                                                               claim.confidence === 'insufficient' ? t('confidence.insufficient') :
                                                               claim.confidence}
                          </div>
                          {claim.explanation && (
                            <div className="text-sm text-gray-700 mt-1">
                              {claim.explanation}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface VideoSequencerProps {
  onError?: (error: string) => void;
  chunkDuration?: number;
  maxParallelProcessing?: number;
}

const VideoSequencer: React.FC<VideoSequencerProps> = ({
  onError,
  chunkDuration = CONFIG.MEDIA.CHUNK_DURATION,
  maxParallelProcessing = CONFIG.MEDIA.MAX_PARALLEL_PROCESSING,
}) => {
  const { t } = useTranslation('common');
  
  const [state, setState] = useState<SequencerState>({
    file: null,
    duration: 0,
    segments: [],
    currentTime: 0,
    isPlaying: false,
    processingQueue: [],
    selectedSegment: null,
    videoUrl: undefined,
  });

  const [processingCount, setProcessingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Create video chunks from file duration
  const createVideoChunks = useCallback((duration: number): SegmentData[] => {
    const chunks: SegmentData[] = [];
    
    for (let i = 0; i < duration; i += chunkDuration) {
      chunks.push({
        id: chunks.length,
        startTime: i,
        endTime: Math.min(i + chunkDuration, duration),
        status: 'pending',
      });
    }
    
    return chunks;
  }, [chunkDuration]);

  // Extract audio chunk from video file
  const extractAudioChunk = useCallback(async (
    file: File,
    startTime: number,
    endTime: number
  ): Promise<File> => {
    // For now, we'll send the entire file and let the backend handle chunking
    // In a future enhancement, we could use Web Audio API or FFmpeg.wasm for client-side chunking
    const blob = file.slice(0, file.size, file.type);
    return new File([blob], `chunk_${startTime}-${endTime}.${file.name.split('.').pop()}`, {
      type: file.type
    });
  }, []);

  // Process a single segment
  const processSegment = useCallback(async (segment: SegmentData) => {
    if (!state.file) return;

    try {
      // Update segment status to processing
      setState(prev => ({
        ...prev,
        segments: prev.segments.map(s => 
          s.id === segment.id ? { ...s, status: 'processing' } : s
        )
      }));

      setProcessingCount(prev => prev + 1);

      // Extract audio chunk
      const audioChunk = await extractAudioChunk(state.file, segment.startTime, segment.endTime);

      // Send to backend for processing
      const result: ChunkProcessingResponse = await truthCheckerApi.transcribeAndFactCheckChunk(audioChunk, {
        fast_mode: true,
        start_time: segment.startTime,
        end_time: segment.endTime,
        provider: 'elevenlabs'
      });

      // Update segment with results
      setState(prev => ({
        ...prev,
        segments: prev.segments.map(s => 
          s.id === segment.id ? {
            ...s,
            status: 'completed',
            transcription: result.transcription.text,
            factCheckResult: result.fact_check,
            processingTime: result.processing_time
          } : s
        )
      }));

    } catch (error) {
      console.error(`Error processing segment ${segment.id}:`, error);
      
      // Update segment status to error
      setState(prev => ({
        ...prev,
        segments: prev.segments.map(s => 
          s.id === segment.id ? { ...s, status: 'error' } : s
        )
      }));

      if (onError) {
        onError(`Failed to process segment ${segment.startTime}-${segment.endTime}s: ${error}`);
      }
    } finally {
      setProcessingCount(prev => prev - 1);
    }
  }, [state.file, extractAudioChunk, onError]);

  // Process segments sequentially with limited parallelism
  const processSegmentsQueue = useCallback(async () => {
    const pendingSegments = state.segments.filter(s => s.status === 'pending');
    
    for (const segment of pendingSegments) {
      // Wait if we're at max parallel processing
      while (processingCount >= maxParallelProcessing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Start processing (don't await - let it run in parallel)
      processSegment(segment);
    }
  }, [state.segments, processingCount, maxParallelProcessing, processSegment]);

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    setError(null);
    
    // Create object URL for video playback
    const videoUrl = URL.createObjectURL(file);
    
    setState(prev => ({
      ...prev,
      file,
      videoUrl,
      segments: [],
      currentTime: 0,
      isPlaying: false,
      selectedSegment: null,
    }));
  }, []);

  // Handle video metadata loaded
  const handleVideoLoaded = useCallback((duration: number) => {
    const segments = createVideoChunks(duration);
    
    setState(prev => ({
      ...prev,
      duration,
      segments,
    }));
  }, [createVideoChunks]);

  // Start processing when segments are ready
  useEffect(() => {
    if (state.segments.length > 0 && state.segments.some(s => s.status === 'pending')) {
      processSegmentsQueue();
    }
  }, [state.segments, processSegmentsQueue]);

  // Handle segment selection
  const handleSegmentClick = useCallback((segmentId: number) => {
    setState(prev => ({
      ...prev,
      selectedSegment: segmentId,
    }));
  }, []);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedSegment: null,
    }));
  }, []);

  // Handle time updates from video player
  const handleTimeUpdate = useCallback((currentTime: number) => {
    setState(prev => ({
      ...prev,
      currentTime,
    }));
  }, []);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: !prev.isPlaying,
    }));
  }, []);

  // Get current active segment
  const activeSegment = useMemo(() => {
    return state.segments.find(s => 
      state.currentTime >= s.startTime && state.currentTime < s.endTime
    );
  }, [state.segments, state.currentTime]);

  // Selected segment data
  const selectedSegmentData = useMemo(() => {
    return state.selectedSegment !== null 
      ? state.segments.find(s => s.id === state.selectedSegment)
      : null;
  }, [state.segments, state.selectedSegment]);

  if (!state.file) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Video Fact-Check Sequencer</h2>
          <p className="text-gray-600 mb-6">
            Upload a video or audio file to start real-time fact-checking analysis
          </p>
          
          <input
            type="file"
            accept="video/*,audio/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="mb-4"
          />
          
          <ColorLegend className="max-w-md mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Video Fact-Check Sequencer</h2>
        <ColorLegend compact className="flex-shrink-0" />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player */}
        <div className="lg:col-span-2">
          <VideoPlayer
            videoUrl={state.videoUrl!}
            onLoadedMetadata={handleVideoLoaded}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlayPause}
            onPause={handlePlayPause}
          />
        </div>

        {/* Processing Status */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-3">Processing Status</h3>
          <div className="space-y-2 text-sm">
            <div>Total Segments: {state.segments.length}</div>
            <div>Currently Processing: {processingCount}</div>
            <div>Completed: {state.segments.filter(s => s.status === 'completed').length}</div>
            <div>Pending: {state.segments.filter(s => s.status === 'pending').length}</div>
            {activeSegment && (
              <div className="pt-2 border-t">
                <div className="font-medium">Current Segment:</div>
                <div>{activeSegment.startTime}s - {activeSegment.endTime}s</div>
                <div className="capitalize">{activeSegment.status}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <SequencerTimeline
        segments={state.segments}
        onSegmentClick={handleSegmentClick}
      />

      {/* Fact-Check Modal */}
      {selectedSegmentData && (
        <FactCheckModal
          segment={selectedSegmentData}
          isOpen={state.selectedSegment !== null}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default VideoSequencer; 