'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { DashboardState, EnhancedSegmentData, ChunkProcessingResponse, StreamData } from '@/lib/types';
import { truthCheckerApi, getVideoInfo, VideoInfo } from '@/lib/api';
import { CONFIG } from '@/lib/config';
import UploadScreen from './UploadScreen';
import AnalysisScreen from './AnalysisScreen';
import { toast } from 'sonner';

interface FactCheckDashboardProps {
  className?: string;
  initialFile?: File | null;
  initialStream?: StreamData | null;
  onClose?: () => void;
}

export const FactCheckDashboard: React.FC<FactCheckDashboardProps> = ({
  className = '',
  initialFile = null,
  initialStream = null,
  onClose,
}) => {
  const [state, setState] = useState<DashboardState>({
    mode: initialFile ? 'analysis' : initialStream ? 'stream' : 'upload',
    file: initialFile,
    streamData: initialStream,
    mediaUrl: initialFile ? URL.createObjectURL(initialFile) : initialStream?.url || null,
    mediaType: initialFile ? (initialFile.type.startsWith('video/') ? 'video' : 'audio') : 'video', // Assume video for streams
    duration: 0,
    segments: [],
    processing: {
      totalSegments: 0,
      completedSegments: 0,
      processingSegments: 0,
      errorSegments: 0,
      overallProgress: 0,
      startTime: (initialFile || initialStream) ? new Date() : null,
      isLiveStream: !!initialStream,
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
  // Add a ref to track which segments are currently being processed
  const processingSegmentsRef = useRef<Set<number>>(new Set());
  // Add a ref to prevent multiple simultaneous segment creation for live streams
  const creatingLiveSegmentRef = useRef(false);

  // Handle media loaded for both files and streams
  const handleMediaLoaded = useCallback(async (duration: number) => {
    const source = state.file || state.streamData;
    if (!source) return;

    try {
      // Create segments with thumbnails/waveforms
      const segments = await createSegments(source, duration);
      
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
      if (state.processing.isLiveStream) {
        toast.info('Starting live stream fact-checking...');
      } else {
        toast.info('Starting fact-check analysis...');
      }
    } catch (error) {
      console.error('Error creating segments:', error);
      toast.error('Failed to create segments');
    }
  }, [state.file, state.streamData, state.processing.isLiveStream]);

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

  // Add helper function to detect stream type
  const getStreamType = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('twitch.tv')) {
      return 'twitch';
    } else {
      return 'direct-url';
    }
  };

  // Add helper function to detect if a stream is live using backend API
  // const isLiveStream = useCallback(async (streamData: StreamData | null): Promise<boolean> => {
  //   if (!streamData) return false;
    
  //   // For streams, always check with backend API for authoritative live status
  //   if (streamData.url) {
  //     try {
  //       console.log('🔍 Checking live status via backend API:', streamData.url.substring(0, 50) + '...');
        
  //       const streamType = getStreamType(streamData.url);
  //       const videoInfo: VideoInfo = await getVideoInfo({
  //         url: streamData.url,
  //         stream_type: streamType,
  //         start_time: 0,
  //         duration: CONFIG.MEDIA.CHUNK_DURATION,
  //         provider: 'elevenlabs',
  //         fast_mode: true
  //       });
        
  //       console.log('📡 Backend video-info response:', {
  //         is_live: videoInfo.is_live,
  //         processing_mode: videoInfo.processing_mode,
  //         method: videoInfo.live_status.method,
  //         broadcast_content: videoInfo.live_status.live_broadcast_content,
  //         source: 'Backend API (authoritative)'
  //       });
        
  //       return videoInfo.is_live;
        
  //     } catch (error) {
  //       console.warn('⚠️ Backend live status check failed, using frontend fallback:', error);
        
  //       // Fallback to frontend metadata if backend is unavailable
  //       if (streamData.metadata?.isLive !== undefined) {
  //         console.log('🔄 Using frontend metadata as fallback:', {
  //           isLive: streamData.metadata.isLive,
  //           source: 'StreamFactChecker metadata (fallback)',
  //           reliable: false
  //         });
  //         return streamData.metadata.isLive;
  //       }
  //     }
  //   }
    
  //   // Last resort: URL-based detection
  //   console.log('⚠️ Using URL-based live detection (last resort)');
  //   const url = streamData.url.toLowerCase();
  //   return url.includes('live=1') || url.includes('live=true') || url.includes('/live/');
  // }, []);

  // Synchronous version for immediate checks (uses cached result)
  const isLiveStreamSync = (streamData: StreamData | null): boolean => {
    if (!streamData) return false;
    
    // Check environment variables for testing configuration
    const forceLiveSimulation = process.env.NEXT_PUBLIC_FORCE_LIVE_SIMULATION === 'true';
    
    // Force simulation mode (only if explicitly enabled via environment variable)
    if (streamData.url.toLowerCase().includes('simulate_live') || forceLiveSimulation) {
      console.log('🔴 LIVE SIMULATION MODE ACTIVE:', {
        reason: streamData.url.includes('simulate_live') ? 'URL contains simulate_live' : 'NEXT_PUBLIC_FORCE_LIVE_SIMULATION=true',
        forceLiveSimulation,
        url: streamData.url.substring(0, 50) + '...'
      });
      return true;
    }

    // Fallback to frontend metadata for immediate sync checks
    if (streamData.metadata?.isLive !== undefined) {
      return streamData.metadata.isLive;
    }
    
    // Last resort: URL-based detection
    const url = streamData.url.toLowerCase();
    return url.includes('live=1') || url.includes('live=true') || url.includes('/live/');
  };

  // Create segments from file duration or for live stream
  const createSegments = useCallback(async (
    source: File | StreamData, 
    duration: number, 
    chunkDuration: number = CONFIG.MEDIA.CHUNK_DURATION
  ): Promise<EnhancedSegmentData[]> => {
    const segments: EnhancedSegmentData[] = [];
    const isFile = source instanceof File;
    const isStreamData = !isFile; // StreamData object
    const isVideo = isFile ? source.type.startsWith('video/') : true; // Assume video for streams
    
    // Determine the appropriate chunk duration based on content type
    let effectiveChunkDuration: number;
    
    if (isFile) {
      // Regular uploaded files use standard chunk duration
      effectiveChunkDuration = CONFIG.MEDIA.CHUNK_DURATION;
      console.log('📁 File processing mode: using chunk duration', effectiveChunkDuration + 's');
    } else {
      const streamData = source as StreamData;
      const isLive = isLiveStreamSync(streamData);
      
      if (isLive) {
        // Live streams use shorter chunks for real-time processing
        effectiveChunkDuration = CONFIG.MEDIA.LIVE_STREAM_CHUNK_DURATION;
        console.log('🔴 Live stream detected: using live chunk duration', effectiveChunkDuration + 's');
      } else {
        // Regular videos (non-live YouTube, Twitch VODs) use standard chunk duration
        effectiveChunkDuration = CONFIG.MEDIA.VIDEO_CHUNK_DURATION;
        console.log('🎬 Regular video detected: using video chunk duration', effectiveChunkDuration + 's');
      }
    }
    
    let actualDuration = duration;
    
    // For streams, always call backend API to get authoritative info (including live status)
    if (isStreamData && (source as StreamData).url) {
      try {
        console.log('🔍 Getting authoritative video info from backend:', (source as StreamData).url);
        
        const streamType = getStreamType((source as StreamData).url);
        const videoInfo: VideoInfo = await getVideoInfo({
          url: (source as StreamData).url,
          stream_type: streamType,
          start_time: 0,
          duration: effectiveChunkDuration,
          provider: 'elevenlabs',
          fast_mode: true
        });
        
        console.log('📡 Backend video-info response:', {
          is_live: videoInfo.is_live,
          processing_mode: videoInfo.processing_mode,
          duration: videoInfo.duration,
          method: videoInfo.live_status.method,
          broadcast_content: videoInfo.live_status.live_broadcast_content,
          source: 'Backend API (authoritative)'
        });
        
        // Update frontend metadata with backend's authoritative result
        const streamData = source as StreamData;
        if (streamData.metadata) {
          streamData.metadata.isLive = videoInfo.is_live;
        } else {
          streamData.metadata = { isLive: videoInfo.is_live };
        }
        
        // Use backend's authoritative live status
        const backendIsLive = videoInfo.is_live;
        
        // Update chunk duration based on authoritative live status
        if (backendIsLive) {
          effectiveChunkDuration = CONFIG.MEDIA.LIVE_STREAM_CHUNK_DURATION;
          console.log('🔴 Backend confirmed live stream: using live chunk duration', effectiveChunkDuration + 's');
          actualDuration = effectiveChunkDuration; // Just use one chunk for live
        } else {
          effectiveChunkDuration = CONFIG.MEDIA.VIDEO_CHUNK_DURATION;
          console.log('🎬 Backend confirmed regular video: using video chunk duration', effectiveChunkDuration + 's');
          actualDuration = videoInfo.duration; // Use actual video duration
        }
        
        console.log(`✅ Backend analysis complete: ${videoInfo.duration_formatted} (${backendIsLive ? 'live - incremental' : Math.ceil(actualDuration / effectiveChunkDuration) + ' segments'})`);
        
      } catch (error) {
        console.warn('⚠️ Backend video-info API failed, using frontend fallback:', error);
        
        // Fallback to original logic if backend is unavailable
        const isLiveStreamData = isLiveStreamSync(source as StreamData);
        if (isLiveStreamData) {
          actualDuration = effectiveChunkDuration;
        }
      }
    }
    
    // Final determination of live status for segment creation
    const finalIsLive = isStreamData ? isLiveStreamSync(source as StreamData) : false;
    
    // For regular streams (not live), get the actual video duration
    // For live streams, we don't need the full duration since we process incrementally
    if (isStreamData && !finalIsLive && (source as StreamData).url) {
      try {
        console.log('🔍 Getting video info for regular stream:', (source as StreamData).url);
        
        const streamType = getStreamType((source as StreamData).url);
        const videoInfo: VideoInfo = await getVideoInfo({
          url: (source as StreamData).url,
          stream_type: streamType,
          start_time: 0,
          duration: effectiveChunkDuration,
          provider: 'elevenlabs',
          fast_mode: true
        });
        
        console.log('📹 Video info received:', videoInfo);
        actualDuration = videoInfo.duration;
        
        // Update live status based on backend response
        if (videoInfo.is_live && !finalIsLive) {
          console.log('🔄 Backend detected live stream - updating local detection');
          // Re-run with updated live status
          const streamData = source as StreamData;
          if (streamData.metadata) {
            streamData.metadata.isLive = true;
          }
          return createSegments(source, duration, chunkDuration); // Retry with updated metadata
        }
        
        console.log(`✅ Adjusted to real video duration: ${videoInfo.duration_formatted} (${Math.ceil(actualDuration / effectiveChunkDuration)} segments expected)`);
        
      } catch (error) {
        console.warn('⚠️ Could not get video info, using default duration:', error);
        // Continue with provided duration
      }
    } else if (finalIsLive) {
      console.log('🔴 Live stream detected - skipping duration API call, will process incrementally');
      // For live streams, we don't need the actual duration since we process in real-time
      actualDuration = effectiveChunkDuration; // Just use one chunk duration for the first segment
    }
    
    // For live streams, only create the first segment - others will be created incrementally
    const segmentsToCreate = finalIsLive ? 1 : Math.ceil(actualDuration / effectiveChunkDuration);
    
    console.log('📦 Creating segments:', {
      isStreamData,
      isFile,
      isLive: finalIsLive,
      duration: `${actualDuration}s`,
      configChunkDuration: `${CONFIG.MEDIA.CHUNK_DURATION}s`,
      liveStreamChunkDuration: `${CONFIG.MEDIA.LIVE_STREAM_CHUNK_DURATION}s`,
      videoChunkDuration: `${CONFIG.MEDIA.VIDEO_CHUNK_DURATION}s`,
      effectiveChunkDuration: `${effectiveChunkDuration}s`,
      segmentsToCreate: finalIsLive ? '1 (live - incremental)' : segmentsToCreate,
      totalEstimated: finalIsLive ? 'N/A (incremental)' : Math.ceil(actualDuration / effectiveChunkDuration),
      note: finalIsLive ? 'Live stream - only creating first segment' : 'Regular processing - creating all segments'
    });

    for (let i = 0; i < segmentsToCreate; i++) {
      const startTime = i * effectiveChunkDuration;
      const endTime = Math.min(startTime + effectiveChunkDuration, actualDuration);
      const segmentDuration = endTime - startTime;
      
      // Debug logging for live streams
      if (finalIsLive) {
        console.log(`🔴 Creating initial live segment ${i}:`, {
          startTime: `${startTime}s`,
          endTime: `${endTime}s`,
          segmentDuration: `${segmentDuration}s`,
          effectiveChunkDuration: `${effectiveChunkDuration}s`,
          note: 'Only first segment created - others will be added incrementally'
        });
      }
      
      let thumbnail: string | undefined;
      let waveform: number[] | undefined;
      
      // Only generate thumbnails/waveforms for uploaded files, not streams
      if (isFile) {
        try {
          if (isVideo) {
            // Generate thumbnail at middle of segment for uploaded files
            const midTime = startTime + segmentDuration / 2;
            thumbnail = await generateThumbnail(source as File, midTime);
          } else {
            // Generate waveform for audio files
            if (segments.length === 0) {
              waveform = await generateWaveform(source as File);
            }
          }
        } catch (error) {
          console.error(`Failed to generate ${isVideo ? 'thumbnail' : 'waveform'} for segment ${segments.length}:`, error);
        }
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
    
    console.log(`✅ Created ${segments.length} segment${segments.length > 1 ? 's' : ''} for ${isStreamData ? (finalIsLive ? 'live stream' : 'stream') : 'file'} processing`);
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
        streamData: null, // Clear stream data when uploading file
        mediaUrl,
        mediaType,
        processing: {
          ...prev.processing,
          startTime: new Date(),
          isLiveStream: false,
        },
      }));

      toast.success(`${mediaType === 'video' ? 'Video' : 'Audio'} uploaded successfully!`);
    } catch (error) {
      console.error('Error handling file upload:', error);
      toast.error('Failed to process uploaded file');
    }
  }, []);

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

  // Function to create the next live segment when the previous one completes
  const createNextLiveSegment = useCallback((streamData: StreamData) => {
    console.log(streamData);
    // Prevent multiple simultaneous segment creation
    if (creatingLiveSegmentRef.current) {
      console.log('⚠️ Already creating a live segment - skipping duplicate creation');
      return;
    }

    creatingLiveSegmentRef.current = true;

    setState(prev => {
      // Get the next segment ID based on existing segments
      const nextSegmentId = prev.segments.length;
      const chunkDuration = CONFIG.MEDIA.LIVE_STREAM_CHUNK_DURATION;
      
      // For display purposes: show progressive time ranges
      const displayStartTime = nextSegmentId * chunkDuration;
      const displayEndTime = displayStartTime + chunkDuration;
      
      console.log(`🆕 Creating live segment ${nextSegmentId}:`);
      console.log(`  📺 Display time: ${displayStartTime}s-${displayEndTime}s (for UI)`);
      console.log(`  🔴 Processing: will use 0s-${chunkDuration}s (current live position)`);
      console.log(`  📊 Total segments after creation: ${nextSegmentId + 1}`);
      
      const newSegment: EnhancedSegmentData = {
        id: nextSegmentId,
        startTime: displayStartTime, // For display in UI
        endTime: displayEndTime,     // For display in UI
        duration: chunkDuration,
        status: 'pending',
        claimsCount: 0,
        lastUpdated: new Date(),
      };
      
      // Reset the creation flag
      setTimeout(() => {
        creatingLiveSegmentRef.current = false;
      }, 100); // Small delay to prevent rapid creation
      
      return {
        ...prev,
        segments: [...prev.segments, newSegment],
        processing: {
          ...prev.processing,
          totalSegments: prev.processing.totalSegments + 1,
        },
      };
    });
  }, []);

  // Initialize stream analysis if stream data is provided
  useEffect(() => {
    if (initialStream && state.mode === 'stream') {
      console.log('🎥 Starting stream analysis:', initialStream);
      toast.success(`Connected to ${initialStream.type} stream!`);
      
      // For streams, we need to manually trigger segment creation since there's no media element duration event
      // Use a default duration for live streams (will be adjusted in createSegments based on live status)
      const defaultStreamDuration = CONFIG.MEDIA.LIVE_STREAM_CHUNK_DURATION; // 30 seconds for live streams
      
      console.log('🔧 Triggering handleMediaLoaded for stream with duration:', defaultStreamDuration + 's');
      handleMediaLoaded(defaultStreamDuration);
    }
  }, [initialStream, state.mode, handleMediaLoaded]);

  // Process a single segment
  const processSegment = useCallback(async (segment: EnhancedSegmentData) => {
    // Check if processing was cancelled (dashboard closed)
    if (!processingStartedRef.current) {
      console.log('🛑 Processing cancelled - dashboard was closed');
      return;
    }

    // Check if this segment is already being processed (race condition protection)
    if (processingSegmentsRef.current.has(segment.id)) {
      console.log(`⚠️ SEGMENT ${segment.id} ALREADY BEING PROCESSED - SKIPPING DUPLICATE`);
      return;
    }

    const source = state.file || state.streamData;
    if (!source) {
      console.log('❌ PROCESS SEGMENT CALLED BUT NO SOURCE (file or streamData)');
      return;
    }

    const streamData = state.streamData;
    const isLive = streamData ? isLiveStreamSync(streamData) : false;

    console.log('\n🚀 PROCESSING SEGMENT START');
    console.log('📝 Segment info:', {
      id: segment.id,
      timeRange: `${segment.startTime}s - ${segment.endTime}s`,
      duration: `${segment.duration}s`,
      status: segment.status,
      isStream: !!state.streamData,
      isLive: isLive,
      sourceType: state.streamData ? state.streamData.type : 'file',
      processingStartedRef: processingStartedRef.current,
      currentlyProcessing: Array.from(processingSegmentsRef.current)
    });

    // Check if segment is already being processed or completed
    if (segment.status === 'processing' || segment.status === 'completed') {
      console.log('⚠️ SEGMENT ALREADY PROCESSED OR IN PROGRESS - SKIPPING');
      return;
    }

    // Mark this segment as being processed
    processingSegmentsRef.current.add(segment.id);

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

      // Handle stream processing differently than file processing
      if (state.streamData) {
        console.log('🌊 PROCESSING STREAM SEGMENT');
        console.log('📡 Stream type:', state.streamData.type);
        console.log('🔗 Stream URL:', state.streamData.url);
        
        // For live streams, always process from current time (0) but track chunk number
        let processStartTime: number;
        let processDuration: number;
        
        if (isLive) {
          // For live streams: always start from 0 (current live position)
          processStartTime = 0;
          processDuration = CONFIG.MEDIA.LIVE_STREAM_CHUNK_DURATION; // Always use 30s for live streams
          
          console.log('🔴 LIVE STREAM PROCESSING:');
          console.log(`  📊 Chunk #${segment.id + 1}`);
          console.log(`  ⏱️ Processing: current live position (0s) for ${processDuration}s (LIVE_STREAM_CHUNK_DURATION)`);
          console.log(`  🎯 Frontend segment: ${segment.startTime}s-${segment.endTime}s (for display only)`);
          console.log(`  🔧 Backend will receive: 0s-${processDuration}s`);
          
        } else {
          // For regular videos: use actual segment times
          processStartTime = segment.startTime;
          processDuration = segment.duration;
          
          console.log('🎬 REGULAR VIDEO PROCESSING:');
          console.log(`  ⏱️ Processing: ${processStartTime}s-${segment.endTime}s`);
        }
        
        // Use real backend processing for streams
        console.log('🔗 CALLING BACKEND STREAM PROCESSING');
        
        const apiCallStart = Date.now();
        const result: ChunkProcessingResponse = await truthCheckerApi.processStreamSegment({
          url: state.streamData.url,
          stream_type: state.streamData.type,
          start_time: processStartTime, // 0 for live, actual time for regular videos
          duration: processDuration,
          provider: 'elevenlabs',
          fast_mode: true
        });
        const apiCallDuration = Date.now() - apiCallStart;
        
        console.log('📡 BACKEND API CALL DETAILS:');
        console.log('  🔗 URL:', state.streamData.url.substring(0, 50) + '...');
        console.log('  📊 Request params:', {
          start_time: processStartTime,
          duration: processDuration,
          stream_type: state.streamData.type,
          isLive: isLive ? 'YES' : 'NO'
        });
        
        console.log('✅ STREAM SEGMENT PROCESSED');
        console.log('⏱️ API call took:', `${apiCallDuration}ms`);
        console.log('📝 Real result:', {
          transcriptionLength: result.transcription.text?.length || 0,
          claimsCount: result.fact_check.claims?.length || 0,
          confidence: result.fact_check.overall_confidence,
          isLiveChunk: isLive,
          chunkNumber: isLive ? segment.id + 1 : undefined
        });

        // Calculate claims count and accuracy score
        const claimsCount = result.fact_check.claims?.length || 0;
        const accuracyScore = result.fact_check.overall_confidence * 100;

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
              lastUpdated: new Date(),
              // Add metadata for live streams
              ...(isLive && {
                metadata: {
                  isLiveChunk: true,
                  chunkNumber: segment.id + 1,
                  actualProcessingTime: `0s-${processDuration}s (live)`,
                  displayTime: `${segment.startTime}s-${segment.endTime}s`
                }
              })
            } : s
          ),
          processing: {
            ...prev.processing,
            processingSegments: prev.processing.processingSegments - 1,
            completedSegments: prev.processing.completedSegments + 1,
          },
        }));

        // For live streams, automatically create the next segment when current one completes
        // Only call this once per segment completion by checking if this segment hasn't been processed yet
        if (isLive && state.streamData && !processingSegmentsRef.current.has(segment.id + 1)) {
          console.log('🔴 Live segment completed - checking if next segment should be created');
          console.log('🔍 Current state:', {
            completedSegmentId: segment.id,
            nextSegmentId: segment.id + 1,
            isAlreadyProcessingNext: processingSegmentsRef.current.has(segment.id + 1),
            isCreatingSegment: creatingLiveSegmentRef.current,
            totalSegments: state.segments ? state.segments.length : 'unknown'
          });
          
          // Additional check: make sure the next segment doesn't already exist
          const nextSegmentExists = state.segments && state.segments.some(s => s.id === segment.id + 1);
          
          if (!nextSegmentExists && !creatingLiveSegmentRef.current) {
            console.log('✅ Creating next live segment');
            createNextLiveSegment(state.streamData);
          } else {
            console.log('⏭️ Skipping segment creation:', {
              nextSegmentExists,
              isCreatingSegment: creatingLiveSegmentRef.current,
              reason: nextSegmentExists ? 'Next segment already exists' : 'Already creating a segment'
            });
          }
        } else if (isLive) {
          console.log('⏭️ Not creating next segment:', {
            hasStreamData: !!state.streamData,
            isAlreadyProcessingNext: processingSegmentsRef.current.has(segment.id + 1),
            completedSegmentId: segment.id,
            nextSegmentId: segment.id + 1
          });
        }

      } else if (state.file) {
        console.log('📁 PROCESSING FILE SEGMENT');
        
        // Original file processing logic
        let mediaChunk: File;
        try {
          console.log('🎵 Using Web Audio API for chunk extraction');
          mediaChunk = await extractAudioChunk(state.file, segment.startTime, segment.endTime);
        } catch (chunkError) {
          console.warn('⚠️ Web Audio API extraction failed, using fallback:', chunkError);
          mediaChunk = createFileWithTimeParams(state.file, segment.startTime, segment.endTime);
        }

        const apiCallStart = Date.now();
        const result: ChunkProcessingResponse = await truthCheckerApi.transcribeAndFactCheckChunk(mediaChunk, {
          fast_mode: true,
          start_time: segment.startTime,
          end_time: segment.endTime,
          provider: 'elevenlabs'
        });
        const apiCallDuration = Date.now() - apiCallStart;

        console.log('✅ FILE SEGMENT PROCESSED');
        console.log('⏱️ API call took:', `${apiCallDuration}ms`);

        const claimsCount = result.fact_check.claims?.length || 0;
        const accuracyScore = result.fact_check.overall_confidence * 100;

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
      }

      console.log('✅ SEGMENT PROCESSING COMPLETED');

    } catch (error) {
      console.error('\n❌ SEGMENT PROCESSING FAILED');
      console.error('💥 Error details:', error);
      
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

      const timeDisplay = isLive ? `chunk #${segment.id + 1}` : `${segment.startTime}-${segment.endTime}s`;
      toast.error(`Failed to process ${timeDisplay}`);
    } finally {
      // Always remove the segment from processing set when done
      processingSegmentsRef.current.delete(segment.id);
      console.log(`🧹 Segment ${segment.id} removed from processing set`);
    }
    
    console.log('🏁 PROCESSING SEGMENT END\n');
  }, [state.file, state.streamData, extractAudioChunk, createFileWithTimeParams, createNextLiveSegment]);

  // Auto-start processing when segments are created
  useEffect(() => {
    console.log('🔄 useEffect triggered:', {
      segmentsLength: state.segments.length,
      hasPendingSegments: state.segments.some(s => s.status === 'pending'),
      processingStarted: processingStartedRef.current,
      streamData: !!state.streamData,
      file: !!state.file
    });

    if (state.segments.length > 0 && 
        state.segments.some(s => s.status === 'pending') && 
        !processingStartedRef.current) {
      
      const streamData = state.streamData;
      const isStreamMode = !!streamData;
      const isLive = isStreamMode ? isLiveStreamSync(streamData) : false;
      const pendingCount = state.segments.filter(s => s.status === 'pending').length;
      
      console.log('\n🎬 SEGMENTS CREATED - READY FOR PROCESSING');
      console.log('📊 Processing setup:', {
        mode: isStreamMode ? (isLive ? 'LIVE_STREAM' : 'STREAM') : 'FILE',
        totalSegments: state.segments.length,
        pendingSegments: pendingCount,
        processingSegments: state.segments.filter(s => s.status === 'processing').length,
        completedSegments: state.segments.filter(s => s.status === 'completed').length,
        strategy: isLive ? 'Real-time Live Processing' : isStreamMode ? 'Regular Stream Processing' : 'Web Audio API + Sequential Processing',
        processingStarted: processingStartedRef.current
      });
      
      if (isStreamMode) {
        console.log('🌊 STREAM PROCESSING MODE');
        console.log('📡 Stream details:', {
          type: streamData?.type,
          url: streamData?.url?.substring(0, 50) + '...',
          isLive: isLive,
          processingMode: isLive ? 'continuous' : 'sequential'
        });
      } else {
        console.log('📁 FILE PROCESSING MODE');
        console.log('🎵 File details:', {
          name: state.file?.name,
          type: state.file?.type,
          size: state.file ? `${(state.file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A',
          realProcessing: true
        });
      }
      
      console.log('🧐 Detailed segment status:');
      state.segments.forEach(s => {
        console.log(`  Segment ${s.id}: ${s.status} (${s.startTime}s-${s.endTime}s)`);
      });
      
      console.log('');
      console.log(`🚀 AUTO-STARTING ${isLive ? 'LIVE STREAM' : isStreamMode ? 'STREAM' : 'FILE'} PROCESSING IN 2 SECONDS...`);
      console.log('💡 Check browser console for detailed progress logs');
      
      // Mark processing as started to prevent duplicates
      processingStartedRef.current = true;
      
      // Clear any existing timeout
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      
      // Capture current segments in closure to avoid stale state
      const segmentsToProcess = state.segments.filter(s => s.status === 'pending');
      
      // Create a stable reference to processSegment to avoid dependency issues
      const processSegmentStable = (segment: EnhancedSegmentData) => {
        // Check if this segment is already being processed
        if (processingSegmentsRef.current.has(segment.id)) {
          console.log(`⚠️ SEGMENT ${segment.id} ALREADY IN PROCESSING SET - SKIPPING`);
          return Promise.resolve();
        }
        
        // Call the actual processSegment function
        return processSegment(segment);
      };
      
      // Simplified timeout approach - directly call the processing function
      processingTimeoutRef.current = setTimeout(() => {
        console.log('⏰ TIMEOUT FIRED - Starting processing now');
        console.log('🔄 Segments to process:', {
          totalSegments: segmentsToProcess.length,
          processingStartedRef: processingStartedRef.current,
          currentlyProcessing: Array.from(processingSegmentsRef.current)
        });
        
        // Process the captured segments
        if (segmentsToProcess.length > 0) {
          console.log('🚀 STARTING SEGMENT PROCESSING');
          
          // For live streams, we might want to process in real-time
          // For regular streams/files, process sequentially
          if (isLive) {
            console.log('🔴 LIVE STREAM: Starting continuous processing');
            
            // Process first segment and set up continuous processing
            const processLiveSegments = async () => {
              for (const segment of segmentsToProcess) {
                console.log(`📦 Processing live segment ${segment.id}...`);
                await processSegmentStable(segment);
                
                // For live streams, after processing first segment, 
                // we should create new segments as time progresses
                if (segment.id === 0 && streamData) {
                  console.log('🔄 Setting up continuous segment creation for live stream');
                  setupContinuousSegmentCreation(streamData, isLive);
                }
                
                // Shorter delay between live segments
                await new Promise(resolve => setTimeout(resolve, 500));
              }
            };
            
            processLiveSegments().catch(error => {
              console.error('❌ Error in live processing:', error);
            });
            
          } else {
            // Regular sequential processing for files and non-live streams
            const processSequentially = async () => {
              for (const segment of segmentsToProcess) {
                console.log(`📦 Processing segment ${segment.id}...`);
                await processSegmentStable(segment);
                
                // Small delay between segments
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
              console.log('🏁 ALL SEGMENTS PROCESSING INITIATED');
            };
            
            processSequentially().catch(error => {
              console.error('❌ Error in sequential processing:', error);
            });
          }
          
        } else {
          console.log('⚠️ NO SEGMENTS TO PROCESS');
        }
      }, 2000);

      // Cleanup timeout if component unmounts or dependencies change
      return () => {
        console.log('🧹 Cleaning up timeout in useEffect');
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
      };
    }
  }, [state.segments.length, state.streamData, state.file]); // REMOVED processSegment from dependencies

  // Auto-process newly created live segments
  useEffect(() => {
    // Only for live streams
    const streamData = state.streamData;
    const isLive = streamData ? isLiveStreamSync(streamData) : false;
    
    if (isLive && state.segments.length > 0) {
      // Find the latest pending segment
      const latestPendingSegment = state.segments
        .filter(s => s.status === 'pending')
        .sort((a, b) => b.id - a.id)[0]; // Get the highest ID pending segment
      
      if (latestPendingSegment && !processingSegmentsRef.current.has(latestPendingSegment.id)) {
        console.log(`🔴 Auto-processing new live segment: ${latestPendingSegment.id}`);
        
        // Small delay to ensure state is stable
        setTimeout(() => {
          processSegment(latestPendingSegment);
        }, 500);
      }
    }
  }, [state.segments.length, state.streamData, processSegment]);

  // Function to set up continuous segment creation for live streams
  const setupContinuousSegmentCreation = useCallback((streamData: StreamData, isLive: boolean) => {
    if (!isLive) return;
    
    console.log('🔴 Live stream setup: Segments will be created automatically as previous ones complete');
    // No need for time-based intervals - segments are created when previous ones complete
    
  }, []);

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
    console.log('🛑 DASHBOARD CLOSING - Stopping all processing');
    
    // Stop any ongoing processing
    processingStartedRef.current = false;
    
    // Reset live segment creation flag
    creatingLiveSegmentRef.current = false;
    
    if (state.mediaUrl) {
      URL.revokeObjectURL(state.mediaUrl);
    }

    // Clear any pending timeouts
    if (processingTimeoutRef.current) {
      clearTimeout(processingTimeoutRef.current);
      processingTimeoutRef.current = null;
    }

    console.log('🧹 Cleanup completed - processing stopped, timeouts cleared, creation flags reset');
    
    // If onClose is provided, use it instead of resetting to upload mode
    if (onClose) {
      onClose();
      return;
    }
    
    setState({
      mode: 'upload',
      file: null,
      streamData: null,
      mediaUrl: null,
      mediaType: 'video',
      duration: 0,
      segments: [],
      processing: {
        totalSegments: 0,
        completedSegments: 0,
        processingSegments: 0,
        errorSegments: 0,
        overallProgress: 0,
        startTime: null,
        isLiveStream: false,
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

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 FactCheckDashboard unmounting - cleaning up');
      processingStartedRef.current = false;
      creatingLiveSegmentRef.current = false;
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

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