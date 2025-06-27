'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  RotateCcw,
  Youtube,
  Video,
  Music,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface MediaInfo {
  media_type: string;
  has_media: boolean;
  youtube_url?: string;
  youtube_video_id?: string;
  uploaded_media_url?: string;
  uploaded_media_filename?: string;
  uploaded_media_size?: number;
  uploaded_media_mime_type?: string;
  media_size_formatted?: string;
  playable_url?: string;
  embed_url?: string;
}

interface PublicMediaPlayerProps {
  contentId: string;
  mediaInfo?: MediaInfo | null;
  autoPlay?: boolean;
  className?: string;
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * Public Media Player Component
 * Supports video, audio, and YouTube content
 * Provides full playback controls and responsive design
 */
export function PublicMediaPlayer({
  contentId,
  mediaInfo: initialMediaInfo,
  autoPlay = false,
  className,
  onLoadStart,
  onLoadEnd,
  onError
}: PublicMediaPlayerProps) {
  
  // State management
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(initialMediaInfo || null);
  const [isLoading, setIsLoading] = useState(!initialMediaInfo);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load media info if not provided
  useEffect(() => {
    if (!initialMediaInfo) {
      loadMediaInfo();
    }
  }, [contentId]);

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && mediaInfo?.has_media) {
      handlePlay();
    }
  }, [autoPlay, mediaInfo]);

  const loadMediaInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      onLoadStart?.();
      
      const response = await fetch(`/api/public/content/${contentId}/media-info`);
      
      if (!response.ok) {
        throw new Error('Failed to load media information');
      }
      
      const data: MediaInfo = await response.json();
      setMediaInfo(data);
      
      onLoadEnd?.();
    } catch (error) {
      console.error('Failed to load media info:', error);
      const errorMessage = 'Failed to load media information';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentMediaElement = () => {
    if (mediaInfo?.media_type === 'uploaded_video') return videoRef.current;
    if (mediaInfo?.media_type === 'uploaded_audio') return audioRef.current;
    return null;
  };

  const handlePlay = () => {
    const mediaElement = getCurrentMediaElement();
    if (mediaElement) {
      mediaElement.play();
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    const mediaElement = getCurrentMediaElement();
    if (mediaElement) {
      mediaElement.pause();
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleSeek = (value: number[]) => {
    const mediaElement = getCurrentMediaElement();
    if (mediaElement && duration > 0) {
      const newTime = (value[0] / 100) * duration;
      mediaElement.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    const mediaElement = getCurrentMediaElement();
    if (mediaElement) {
      mediaElement.volume = newVolume;
    }
  };

  const handleToggleMute = () => {
    const mediaElement = getCurrentMediaElement();
    if (mediaElement) {
      if (isMuted) {
        mediaElement.volume = volume;
        setIsMuted(false);
      } else {
        mediaElement.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleSkip = (seconds: number) => {
    const mediaElement = getCurrentMediaElement();
    if (mediaElement) {
      mediaElement.currentTime = Math.max(0, Math.min(duration, currentTime + seconds));
    }
  };

  const handlePlaybackRateChange = (rate: number) => {
    const mediaElement = getCurrentMediaElement();
    if (mediaElement) {
      mediaElement.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'uploaded_video':
        return <Video className="h-4 w-4" />;
      case 'uploaded_audio':
        return <Music className="h-4 w-4" />;
      case 'youtube_video':
        return <Youtube className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getMediaTypeBadgeColor = (mediaType: string) => {
    switch (mediaType) {
      case 'uploaded_video':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'uploaded_audio':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'youtube_video':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading media...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <Video className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Media Error</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadMediaInfo}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mediaInfo?.has_media) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Video className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No Media Available</p>
              <p className="text-sm text-muted-foreground mt-1">
                This content doesn't have any associated media
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className={cn("w-full", className)}>
      <Card>
        <CardContent className="p-0">
          
          {/* Media Type Header */}
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getMediaTypeIcon(mediaInfo.media_type)}
                <Badge className={getMediaTypeBadgeColor(mediaInfo.media_type)}>
                  {mediaInfo.media_type.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              {/* External Link for YouTube */}
              {mediaInfo.youtube_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(mediaInfo.youtube_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Watch on YouTube
                </Button>
              )}
            </div>
            
            {/* File Info */}
            {mediaInfo.uploaded_media_filename && (
              <div className="mt-2">
                <p className="text-sm font-medium">{mediaInfo.uploaded_media_filename}</p>
                {mediaInfo.media_size_formatted && (
                  <p className="text-xs text-muted-foreground">
                    Size: {mediaInfo.media_size_formatted}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Media Player */}
          <div className="relative">
            
            {/* YouTube Embed */}
            {mediaInfo.media_type === 'youtube_video' && mediaInfo.embed_url && (
              <div className="aspect-video">
                <iframe
                  src={mediaInfo.embed_url}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}

            {/* Video Player */}
            {mediaInfo.media_type === 'uploaded_video' && mediaInfo.playable_url && (
              <div className="aspect-video bg-black">
                <video
                  ref={videoRef}
                  src={mediaInfo.playable_url}
                  className="w-full h-full"
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  controls={false}
                />
              </div>
            )}

            {/* Audio Player */}
            {mediaInfo.media_type === 'uploaded_audio' && mediaInfo.playable_url && (
              <div className="h-64 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 flex items-center justify-center">
                <audio
                  ref={audioRef}
                  src={mediaInfo.playable_url}
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onDurationChange={(e) => setDuration(e.currentTarget.duration)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
                
                {/* Audio Visualization */}
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
                    <Music className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-lg font-medium text-purple-800 dark:text-purple-200">
                    Audio Player
                  </p>
                </div>
              </div>
            )}

          </div>

          {/* Custom Controls for Uploaded Media */}
          {(mediaInfo.media_type === 'uploaded_video' || mediaInfo.media_type === 'uploaded_audio') && (
            <div className="p-4 space-y-4">
              
              {/* Progress Bar */}
              <div className="space-y-2">
                <Slider
                  value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between">
                
                {/* Left Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSkip(-10)}
                    disabled={!duration}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTogglePlay}
                    disabled={!duration}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSkip(10)}
                    disabled={!duration}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                {/* Center Controls */}
                <div className="flex items-center gap-2">
                  {/* Playback Rate */}
                  <select
                    value={playbackRate}
                    onChange={(e) => handlePlaybackRateChange(Number(e.target.value))}
                    className="text-xs bg-background border rounded px-2 py-1"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2">
                  
                  {/* Volume */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleMute}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <div className="w-20">
                      <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        onValueChange={handleVolumeChange}
                        max={100}
                        step={1}
                      />
                    </div>
                  </div>

                  {/* Fullscreen (Video Only) */}
                  {mediaInfo.media_type === 'uploaded_video' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleFullscreen}
                    >
                      {isFullscreen ? (
                        <Minimize className="h-4 w-4" />
                      ) : (
                        <Maximize className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
} 