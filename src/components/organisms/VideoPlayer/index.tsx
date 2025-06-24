'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardState, EnhancedSegmentData } from '@/lib/types';
import PlayerControls from './PlayerControls';
import PlayerOverlay from './PlayerOverlay';
import WaveformDisplay from '../../atoms/WaveformDisplay';
import { motion } from 'framer-motion';

interface VideoPlayerProps {
  mediaUrl: string;
  mediaType: 'video' | 'audio';
  playback: DashboardState['playback'];
  currentSegment?: EnhancedSegmentData;
  onLoadedMetadata: (duration: number) => void;
  onPlaybackChange: (updates: Partial<DashboardState['playback']>) => void;
  isStream?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  mediaUrl,
  mediaType,
  playback,
  currentSegment,
  onLoadedMetadata,
  onPlaybackChange,
  isStream = false,
}) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [clickFeedback, setClickFeedback] = useState<'play' | 'pause' | null>(null);

  // Detect if this is an embed URL (YouTube, Twitch, etc.)
  const isEmbedUrl = useMemo(() => {
    return isStream || 
           mediaUrl.includes('youtube.com/embed/') || 
           mediaUrl.includes('player.twitch.tv/');
  }, [mediaUrl, isStream]);

  // For streams/embeds, simulate duration and metadata
  useEffect(() => {
    if (isEmbedUrl) {
      // Simulate loaded metadata for streams
      setTimeout(() => {
        onLoadedMetadata(3600); // Default to 1 hour for live streams
      }, 1000);
    }
  }, [isEmbedUrl, onLoadedMetadata]);

  // Handle loaded metadata
  const handleLoadedMetadata = useCallback(() => {
    if (mediaRef.current?.duration) {
      onLoadedMetadata(mediaRef.current.duration);
    }
  }, [onLoadedMetadata]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (mediaRef.current?.currentTime !== undefined) {
      onPlaybackChange({ currentTime: mediaRef.current.currentTime });
    }
  }, [onPlaybackChange]);

  // Sync playback state with media element (only for non-embed content)
  useEffect(() => {
    if (!mediaRef.current || isEmbedUrl) return;

    const media = mediaRef.current;
    
    // Sync play/pause
    if (playback.isPlaying && media.paused) {
      media.play().catch(console.error);
    } else if (!playback.isPlaying && !media.paused) {
      media.pause();
    }

    // Sync volume
    media.volume = playback.volume;
    media.muted = playback.isMuted;

    // Sync playback rate
    media.playbackRate = playback.playbackRate;

    // Sync current time (with small threshold to prevent infinite updates)
    if (Math.abs(media.currentTime - playback.currentTime) > 0.5) {
      media.currentTime = playback.currentTime;
    }
  }, [playback, isEmbedUrl]);

  // Handle play/pause
  const handlePlayPause = useCallback(() => {
    onPlaybackChange({ isPlaying: !playback.isPlaying });
  }, [playback.isPlaying, onPlaybackChange]);

  // Handle click on video/audio area to play/pause
  const handleMediaClick = useCallback((e: React.MouseEvent) => {
    // Only handle clicks directly on the media area, not on controls or overlays
    if (e.target === e.currentTarget) {
      const newPlayState = !playback.isPlaying;
      setClickFeedback(newPlayState ? 'play' : 'pause');
      handlePlayPause();
      
      // Clear feedback after animation
      setTimeout(() => setClickFeedback(null), 600);
    }
  }, [handlePlayPause, playback.isPlaying]);

  // Handle seek
  const handleSeek = useCallback((time: number) => {
    onPlaybackChange({ currentTime: time });
  }, [onPlaybackChange]);

  // Handle volume change
  const handleVolumeChange = useCallback((volume: number) => {
    onPlaybackChange({ volume, isMuted: volume === 0 });
  }, [onPlaybackChange]);

  // Handle mute toggle
  const handleMuteToggle = useCallback(() => {
    onPlaybackChange({ isMuted: !playback.isMuted });
  }, [playback.isMuted, onPlaybackChange]);

  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate: number) => {
    onPlaybackChange({ playbackRate: rate });
  }, [onPlaybackChange]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeek(Math.max(0, playback.currentTime - 10));
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeek(playback.currentTime + 10);
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(1, playback.volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, playback.volume - 0.1));
          break;
        case 'KeyM':
          e.preventDefault();
          handleMuteToggle();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, handleSeek, handleVolumeChange, handleMuteToggle, playback.currentTime, playback.volume]);

  // Hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout);
    };
  }, []);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-black rounded-xl overflow-hidden shadow-2xl h-full group"
    >
      {/* Media Element or Iframe */}
      {isEmbedUrl ? (
        // Stream/Embed Content (YouTube, Twitch, etc.)
        <div className="w-full h-full relative">
          <iframe
            ref={iframeRef}
            src={mediaUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Live Stream"
          />
          
          {/* Stream Status Overlay */}
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE STREAM
          </div>

          {/* Stream Info Overlay */}
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm rounded-lg p-3 text-white">
                <div className="text-sm font-medium">{t('dashboard:player.liveFactCheckingActive')}</div>
                <div className="text-xs text-gray-300">{t('dashboard:player.processingAudioRealTime')}</div>
              </div>
        </div>
      ) : mediaType === 'video' ? (
        <video
          ref={mediaRef as React.RefObject<HTMLVideoElement>}
          src={mediaUrl}
          className="w-full h-full object-contain cursor-pointer"
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => onPlaybackChange({ isPlaying: true })}
          onPause={() => onPlaybackChange({ isPlaying: false })}
          onClick={handleMediaClick}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 cursor-pointer" onClick={handleMediaClick}>
          <audio
            ref={mediaRef as React.RefObject<HTMLAudioElement>}
            src={mediaUrl}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => onPlaybackChange({ isPlaying: true })}
            onPause={() => onPlaybackChange({ isPlaying: false })}
          />
          
          {/* Audio Waveform Visualization */}
          <div className="w-full max-w-lg px-8">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
                              <h3 className="text-xl font-semibold text-white mb-2">{t('dashboard:player.audioAnalysis')}</h3>
              <p className="text-gray-400 text-sm">
                {formatTime(playback.currentTime)} / {formatTime(mediaRef.current?.duration || 0)}
              </p>
            </div>
            
            {currentSegment?.waveform && (
              <WaveformDisplay 
                waveform={currentSegment.waveform}
                currentTime={playback.currentTime}
                duration={mediaRef.current?.duration || 0}
                onSeek={handleSeek}
              />
            )}
          </div>
        </div>
      )}

      {/* Segment Status Overlay - Hide for streams since they have their own overlay */}
      {currentSegment && !isEmbedUrl && (
        <PlayerOverlay
          segment={currentSegment}
          isVisible={showControls}
        />
      )}

      {/* Click Feedback Overlay - Hide for streams */}
      {clickFeedback && !isEmbedUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-black/60 rounded-full p-4"
          >
            {clickFeedback === 'play' ? (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            ) : (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Player Controls - Hide for streams as they have their own controls */}
      {!isEmbedUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: showControls ? 1 : 0,
            y: showControls ? 0 : 20
          }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6"
        >
          <PlayerControls
            isPlaying={playback.isPlaying}
            currentTime={playback.currentTime}
            duration={mediaRef.current?.duration || 0}
            volume={playback.volume}
            isMuted={playback.isMuted}
            playbackRate={playback.playbackRate}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onMuteToggle={handleMuteToggle}
            onPlaybackRateChange={handlePlaybackRateChange}
            isFullscreen={isFullscreen}
            onFullscreenToggle={() => setIsFullscreen(!isFullscreen)}
          />
        </motion.div>
      )}

      {/* Loading indicator - Hide for streams */}
      {!mediaRef.current?.duration && !isEmbedUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </motion.div>
  );
};

export default VideoPlayer; 