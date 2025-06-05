'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DashboardState, EnhancedSegmentData, ChunkProcessingResponse } from '@/lib/types';
import { truthCheckerApi } from '@/lib/api';
import { CONFIG } from '@/lib/config';
import UploadScreen from './UploadScreen';
import AnalysisScreen from './AnalysisScreen';
import { toast } from 'sonner';

interface FactCheckDashboardProps {
  className?: string;
  initialFile?: File | null;
  onClose?: () => void;
}

export const FactCheckDashboard: React.FC<FactCheckDashboardProps> = ({
  className = '',
  initialFile = null,
  onClose,
}) => {
  const [state, setState] = useState<DashboardState>({
    mode: initialFile ? 'analysis' : 'upload',
    file: initialFile,
    mediaUrl: initialFile ? URL.createObjectURL(initialFile) : null,
    mediaType: initialFile ? (initialFile.type.startsWith('video/') ? 'video' : 'audio') : null,
    duration: 0,
    segments: [],
    processing: {
      totalSegments: 0,
      completedSegments: 0,
      processingSegments: 0,
      errorSegments: 0,
      overallProgress: 0,
      startTime: initialFile ? new Date() : null,
    },
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
  });

  const processingStartedRef = useRef(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Generate video thumbnail
  const generateThumbnail = useCallback(async (videoFile: File, timeInSeconds: number): Promise<string> => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoFile);
    
    return new Promise((resolve, reject) => {
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = timeInSeconds;
      });
      
      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = 160;
        canvas.height = 90;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL());
        URL.revokeObjectURL(video.src);
      });
      
      video.addEventListener('error', () => {
        reject(new Error('Failed to generate thumbnail'));
        URL.revokeObjectURL(video.src);
      });
    });
  }, []);

  // Generate audio waveform
  const generateWaveform = useCallback(async (audioFile: File): Promise<number[]> => {
    try {
      const audioContext = new AudioContext();
      const arrayBuffer = await audioFile.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      const channelData = audioBuffer.getChannelData(0);
      const samples = 100; // Number of waveform bars
      const blockSize = Math.floor(channelData.length / samples);
      
      const waveform: number[] = [];
      for (let i = 0; i < samples; i++) {
        let sum = 0;
        for (let j = 0; j < blockSize; j++) {
          sum += Math.abs(channelData[i * blockSize + j]);
        }
        waveform.push(sum / blockSize);
      }
      
      return waveform;
    } catch (error) {
      console.error('Failed to generate waveform:', error);
      return [];
    }
  }, []);

  // Create segments from file duration
  const createSegments = useCallback(async (
    file: File, 
    duration: number, 
    chunkDuration: number = CONFIG.MEDIA.CHUNK_DURATION
  ): Promise<EnhancedSegmentData[]> => {
    const segments: EnhancedSegmentData[] = [];
    const isVideo = file.type.startsWith('video/');
    
    for (let i = 0; i < duration; i += chunkDuration) {
      const startTime = i;
      const endTime = Math.min(i + chunkDuration, duration);
      const segmentDuration = endTime - startTime;
      
      let thumbnail: string | undefined;
      let waveform: number[] | undefined;
      
      try {
        if (isVideo) {
          // Generate thumbnail at middle of segment
          const midTime = startTime + segmentDuration / 2;
          thumbnail = await generateThumbnail(file, midTime);
        } else {
          // Generate waveform for audio (simplified - in reality you'd want chunk-specific waveforms)
          if (segments.length === 0) {
            waveform = await generateWaveform(file);
          }
        }
      } catch (error) {
        console.error(`Failed to generate ${isVideo ? 'thumbnail' : 'waveform'} for segment ${segments.length}:`, error);
      }
      
      segments.push({
        id: segments.length,
        startTime,
        endTime,
        duration: segmentDuration,
        status: 'pending',
        claimsCount: 0,
        lastUpdated: new Date(),
        thumbnail,
        waveform,
      });
    }
    
    return segments;
  }, [generateThumbnail, generateWaveform]);

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      // Create media URL for playback
      const mediaUrl = URL.createObjectURL(file);
      const mediaType = file.type.startsWith('video/') ? 'video' : 'audio';
      
      // Update state to analysis mode
      setState(prev => ({
        ...prev,
        mode: 'analysis',
        file,
        mediaUrl,
        mediaType,
        processing: {
          ...prev.processing,
          startTime: new Date(),
        },
      }));

      toast.success(`${mediaType === 'video' ? 'Video' : 'Audio'} uploaded successfully!`);
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast.error('Failed to process uploaded file');
    }
  }, []);

  // Handle video metadata loaded
  const handleMediaLoaded = useCallback(async (duration: number) => {
    if (!state.file) return;

    try {
      // Create segments with thumbnails/waveforms
      const segments = await createSegments(state.file, duration);
      
      setState(prev => ({
        ...prev,
        duration,
        segments,
        processing: {
          ...prev.processing,
          totalSegments: segments.length,
        },
      }));

      // Start processing segments
      toast.info('Starting fact-check analysis...');
    } catch (error) {
      console.error('Error creating segments:', error);
      toast.error('Failed to create media segments');
    }
  }, [state.file, createSegments]);

  // Extract actual audio/video chunk from media file using Web Audio API
  const extractAudioChunk = useCallback(async (
    file: File, 
    startTime: number, 
    endTime: number
  ): Promise<File> => {
    console.log('🎵 WEB AUDIO API CHUNK EXTRACTION START');
    console.log('📁 Original file:', {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      type: file.type
    });
    console.log('⏱️ Extracting timeframe:', {
      start: `${startTime}s`,
      end: `${endTime}s`,
      duration: `${endTime - startTime}s`
    });

    try {
      // Create audio context
      const audioContext = new AudioContext();
      
      // Load and decode audio file
      const arrayBuffer = await file.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      console.log('🎶 Audio loaded:', {
        duration: `${audioBuffer.duration.toFixed(2)}s`,
        sampleRate: audioBuffer.sampleRate,
        channels: audioBuffer.numberOfChannels
      });
      
      // Calculate sample positions
      const sampleRate = audioBuffer.sampleRate;
      const startSample = Math.floor(startTime * sampleRate);
      const endSample = Math.floor(endTime * sampleRate);
      const chunkLength = endSample - startSample;
      
      // Create new buffer for the chunk
      const chunkBuffer = audioContext.createBuffer(
        audioBuffer.numberOfChannels,
        chunkLength,
        sampleRate
      );
      
      // Copy audio data for each channel
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        const originalData = audioBuffer.getChannelData(channel);
        const chunkData = chunkBuffer.getChannelData(channel);
        
        for (let i = 0; i < chunkLength; i++) {
          const sourceIndex = startSample + i;
          chunkData[i] = sourceIndex < originalData.length ? originalData[sourceIndex] : 0;
        }
      }
      
      console.log('✂️ Chunk extracted:', {
        originalDuration: `${audioBuffer.duration.toFixed(2)}s`,
        chunkDuration: `${chunkBuffer.duration.toFixed(2)}s`,
        compressionRatio: `${((1 - chunkBuffer.duration / audioBuffer.duration) * 100).toFixed(1)}% shorter`
      });
      
      // Convert buffer to WAV file
      const wavBlob = await audioBufferToWav(chunkBuffer);
      const chunkFile = new File(
        [wavBlob], 
        `chunk_${startTime}-${endTime}_${file.name.replace(/\.[^/.]+$/, '.wav')}`, 
        { type: 'audio/wav' }
      );
      
      console.log('💾 WAV chunk created:', {
        name: chunkFile.name,
        size: `${(chunkFile.size / 1024 / 1024).toFixed(2)} MB`,
        type: chunkFile.type
      });
      
      // Clean up
      audioContext.close();
      
      return chunkFile;
      
    } catch (error) {
      console.error('❌ Web Audio API extraction failed:', error);
      throw error;
    }
  }, []);

  // Convert AudioBuffer to WAV Blob
  const audioBufferToWav = useCallback(async (buffer: AudioBuffer): Promise<Blob> => {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);
    
    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }
    
    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }, []);

  // Simple fallback: For audio files or when proper chunking fails
  const createFileWithTimeParams = useCallback((
    file: File, 
    startTime: number, 
    endTime: number
  ): File => {
    console.log('📋 FALLBACK: Creating file with time parameters');
    console.log('📁 Fallback file details:', {
      originalName: file.name,
      originalSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      originalType: file.type,
      timeRange: `${startTime}s - ${endTime}s`,
      duration: `${endTime - startTime}s`
    });
    console.log('⚠️ NOTE: Sending full file with time params - backend should extract the specific time range');
    
    const chunkFileName = `chunk_${startTime}-${endTime}_${file.name}`;
    const chunkFile = new File([file], chunkFileName, {
      type: file.type
    });
    
    console.log('📦 Created fallback chunk:', {
      name: chunkFile.name,
      size: `${(chunkFile.size / 1024 / 1024).toFixed(2)} MB`,
      type: chunkFile.type,
      note: 'Same as original file - backend will handle time-based extraction'
    });
    
    return chunkFile;
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Process a single segment
  const processSegment = useCallback(async (segment: EnhancedSegmentData) => {
    if (!state.file) return;

    console.log('\n🚀 PROCESSING SEGMENT START');
    console.log('📊 Segment info:', {
      id: segment.id,
      timeRange: `${segment.startTime}s - ${segment.endTime}s`,
      duration: `${segment.duration}s`,
      status: segment.status,
      lastUpdated: segment.lastUpdated.toISOString()
    });

    // Check if segment is already being processed or completed
    if (segment.status === 'processing' || segment.status === 'completed') {
      console.log('⚠️ SEGMENT ALREADY PROCESSED OR IN PROGRESS - SKIPPING');
      console.log('Current status:', segment.status);
      return;
    }

    try {
      // Update segment status to processing
      setState(prev => ({
        ...prev,
        segments: prev.segments.map(s => 
          s.id === segment.id ? { 
            ...s, 
            status: 'processing',
            lastUpdated: new Date()
          } : s
        ),
        processing: {
          ...prev.processing,
          processingSegments: prev.processing.processingSegments + 1,
        },
      }));

      // Double-check current segment status from state (safety check for concurrent processing)
      const currentSegment = state.segments.find(s => s.id === segment.id);
      if (currentSegment && (currentSegment.status === 'processing' || currentSegment.status === 'completed')) {
        console.log('⚠️ SEGMENT STATUS CHANGED DURING PROCESSING SETUP - ABORTING');
        console.log('Found status:', currentSegment.status);
        return;
      }

      console.log('📦 Creating media chunk...');
      
      // Try to extract actual chunk for video/audio, fallback if needed
      let mediaChunk: File;
      try {
        // Use Web Audio API for both audio and video files (extracts audio track)
        console.log('🎵 Using Web Audio API for chunk extraction');
        mediaChunk = await extractAudioChunk(state.file, segment.startTime, segment.endTime);
      } catch (chunkError) {
        console.warn('⚠️ Web Audio API extraction failed, using fallback:', chunkError);
        mediaChunk = createFileWithTimeParams(state.file, segment.startTime, segment.endTime);
      }

      console.log('📡 Sending to backend...');
      console.log('🔧 API call params:', {
        fileName: mediaChunk.name,
        fileSize: `${(mediaChunk.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: mediaChunk.type,
        config: {
          fast_mode: true,
          start_time: segment.startTime,
          end_time: segment.endTime,
          provider: 'elevenlabs'
        }
      });

      const apiCallStart = Date.now();

      // Send to backend for processing
      const result: ChunkProcessingResponse = await truthCheckerApi.transcribeAndFactCheckChunk(mediaChunk, {
        fast_mode: true,
        start_time: segment.startTime,
        end_time: segment.endTime,
        provider: 'elevenlabs'
      });

      const apiCallDuration = Date.now() - apiCallStart;

      console.log('✅ BACKEND RESPONSE RECEIVED');
      console.log('⏱️ API call took:', `${apiCallDuration}ms`);
      console.log('📝 Transcription result:', {
        text: result.transcription.text?.substring(0, 100) + (result.transcription.text?.length > 100 ? '...' : ''),
        textLength: result.transcription.text?.length || 0,
        confidence: result.transcription.confidence,
        language: result.transcription.language
      });
      console.log('🔍 Fact-check result:', {
        claimsFound: result.fact_check.claims?.length || 0,
        overallConfidence: result.fact_check.overall_confidence,
        processingTime: result.processing_time
      });

      if (result.fact_check.claims && result.fact_check.claims.length > 0) {
        console.log('📋 Claims details:');
        result.fact_check.claims.forEach((claim, idx) => {
          console.log(`  Claim ${idx + 1}:`, {
            text: claim.text?.substring(0, 50) + (claim.text?.length > 50 ? '...' : ''),
            status: claim.status,
            confidence: claim.confidence
          });
        });
      }

      // Calculate claims count and accuracy score
      const claimsCount = result.fact_check.claims?.length || 0;
      const accuracyScore = result.fact_check.overall_confidence * 100;

      console.log('📊 Calculated metrics:', {
        claimsCount,
        accuracyScore: `${accuracyScore.toFixed(1)}%`
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
            processingTime: result.processing_time,
            claimsCount,
            accuracyScore,
            lastUpdated: new Date()
          } : s
        ),
        processing: {
          ...prev.processing,
          processingSegments: prev.processing.processingSegments - 1,
          completedSegments: prev.processing.completedSegments + 1,
        },
      }));

      console.log('✅ SEGMENT PROCESSING COMPLETED');
      console.log(`🎯 Segment ${segment.id} (${segment.startTime}s-${segment.endTime}s) processed successfully`);

    } catch (error) {
      console.error('\n❌ SEGMENT PROCESSING FAILED');
      console.error('💥 Error details:', error);
      console.error('🔧 Failed segment:', {
        id: segment.id,
        timeRange: `${segment.startTime}s - ${segment.endTime}s`,
        fileName: state.file?.name
      });
      
      // Update segment status to error
      setState(prev => ({
        ...prev,
        segments: prev.segments.map(s => 
          s.id === segment.id ? { 
            ...s, 
            status: 'error',
            lastUpdated: new Date()
          } : s
        ),
        processing: {
          ...prev.processing,
          processingSegments: prev.processing.processingSegments - 1,
          errorSegments: prev.processing.errorSegments + 1,
        },
      }));

      toast.error(`Failed to process segment ${segment.startTime}-${segment.endTime}s`);
    }
    
    console.log('🏁 PROCESSING SEGMENT END\n');
  }, [state.file, state.mediaType, extractAudioChunk, createFileWithTimeParams]);

  // Process segments with controlled parallelism
  const processSegments = useCallback(async (maxParallel: number = 1) => {
    const pendingSegments = state.segments.filter(s => s.status === 'pending');
    
    console.log('🎬 STARTING BATCH PROCESSING');
    console.log('📊 Processing strategy:', {
      totalSegments: pendingSegments.length,
      maxParallel,
      processingMode: 'Sequential batches'
    });
    
    for (let i = 0; i < pendingSegments.length; i += maxParallel) {
      const batch = pendingSegments.slice(i, i + maxParallel);
      
      console.log(`\n📦 PROCESSING BATCH ${Math.floor(i/maxParallel) + 1}/${Math.ceil(pendingSegments.length/maxParallel)}`);
      console.log('🎯 Batch segments:', batch.map(s => `${s.id} (${s.startTime}s-${s.endTime}s)`));
      
      // Process batch and wait for completion
      await Promise.allSettled(batch.map(segment => processSegment(segment)));
      
      console.log('✅ Batch completed, waiting before next batch...');
      
      // Small delay between batches to prevent overwhelming
      if (i + maxParallel < pendingSegments.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('🏁 ALL BATCHES COMPLETED');
  }, [state.segments, processSegment]);

  // Auto-start processing when segments are created
  useEffect(() => {
    if (state.segments.length > 0 && 
        state.segments.some(s => s.status === 'pending') && 
        !processingStartedRef.current) {
      
      console.log('\n🎬 SEGMENTS CREATED - READY FOR PROCESSING');
      console.log('📊 Processing setup:', {
        totalSegments: state.segments.length,
        pendingSegments: state.segments.filter(s => s.status === 'pending').length,
        processingSegments: state.segments.filter(s => s.status === 'processing').length,
        completedSegments: state.segments.filter(s => s.status === 'completed').length,
        strategy: 'Web Audio API + Sequential Processing',
        processingStarted: processingStartedRef.current
      });
      console.log('🧐 Detailed segment status:');
      state.segments.forEach(s => {
        console.log(`  Segment ${s.id}: ${s.status} (${s.startTime}s-${s.endTime}s)`);
      });
      console.log('');
      console.log('🚀 AUTO-STARTING PROCESSING IN 2 SECONDS...');
      console.log('💡 Check browser console for detailed progress logs');
      
      // Mark processing as started to prevent duplicates
      processingStartedRef.current = true;
      
      // Clear any existing timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      
      // Start processing after a short delay
      processingTimeoutRef.current = setTimeout(() => {
        processSegments();
      }, 2000);

      // Cleanup timeout if component unmounts or dependencies change
      return () => {
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
      };
    }
  }, [state.segments.length]); // Remove processSegments from dependencies to prevent re-triggering

  // Manual start processing function
  const startProcessing = useCallback(() => {
    console.log('🔄 MANUAL PROCESSING START');
    processSegments();
  }, [processSegments]);

  // Update overall progress
  useEffect(() => {
    const { totalSegments, completedSegments, errorSegments } = state.processing;
    if (totalSegments > 0) {
      const overallProgress = Math.round((completedSegments / totalSegments) * 100);
      
      setState(prev => ({
        ...prev,
        processing: {
          ...prev.processing,
          overallProgress,
        },
      }));

      // Reset processing ref when all segments are done (completed or error)
      if (completedSegments + errorSegments >= totalSegments) {
        console.log('🏁 ALL SEGMENTS PROCESSED - Resetting processing flag');
        processingStartedRef.current = false;
      }
    }
  }, [state.processing.completedSegments, state.processing.totalSegments, state.processing.errorSegments]);

  // Handle segment selection
  const handleSegmentSelect = useCallback((segmentId: number | null) => {
    const segment = segmentId !== null ? state.segments.find(s => s.id === segmentId) : null;
    
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        selectedSegment: segmentId,
        showResultsPanel: segmentId !== null,
      },
      playback: segment ? {
        ...prev.playback,
        currentTime: segment.startTime,
        isPlaying: true, // Auto-play when segment is selected
      } : prev.playback,
    }));

    if (segment) {
      console.log(`🎯 Segment ${segment.id} selected - seeking to ${segment.startTime}s and playing`);
    }
  }, [state.segments]);

  // Handle playback state changes
  const handlePlaybackChange = useCallback((updates: Partial<DashboardState['playback']>) => {
    setState(prev => ({
      ...prev,
      playback: {
        ...prev.playback,
        ...updates,
      },
    }));
  }, []);

  // Reset to upload mode
  const handleReset = useCallback(() => {
    if (state.mediaUrl) {
      URL.revokeObjectURL(state.mediaUrl);
    }

    // Clear any pending timeouts
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    // Reset processing flag
    processingStartedRef.current = false;
    
    // If onClose is provided, use it instead of resetting to upload mode
    if (onClose) {
      onClose();
      return;
    }
    
    setState({
      mode: 'upload',
      file: null,
      mediaUrl: null,
      mediaType: null,
      duration: 0,
      segments: [],
      processing: {
        totalSegments: 0,
        completedSegments: 0,
        processingSegments: 0,
        errorSegments: 0,
        overallProgress: 0,
        startTime: null,
      },
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
    });
  }, [state.mediaUrl, onClose]);

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {state.mode === 'upload' ? (
        <UploadScreen onFileUpload={handleFileUpload} />
      ) : (
        <AnalysisScreen 
          state={state}
          onMediaLoaded={handleMediaLoaded}
          onSegmentSelect={handleSegmentSelect}
          onPlaybackChange={handlePlaybackChange}
          onReset={handleReset}
          isModal={!!onClose}
        />
      )}
    </div>
  );
};

export default FactCheckDashboard; 