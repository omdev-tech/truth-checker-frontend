'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Radio, 
  AlertCircle, 
  CheckCircle2,
  Loader2,
  Youtube,
  Twitch,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface StreamFactCheckerProps {
  onStreamReady: (streamUrl: string, streamType: StreamType, metadata?: StreamMetadata) => void;
  className?: string;
}

export type StreamType = 'youtube' | 'twitch' | 'direct-url' | 'hls' | 'dash';

export interface StreamMetadata {
  title?: string;
  duration?: number;
  quality?: string;
  isLive?: boolean;
  thumbnail?: string;
}

interface StreamValidationResult {
  isValid: boolean;
  streamType: StreamType;
  extractedUrl?: string;
  metadata?: StreamMetadata;
  error?: string;
}

export function StreamFactChecker({ onStreamReady, className = '' }: StreamFactCheckerProps) {
  const [streamUrl, setStreamUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<StreamValidationResult | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [manualLiveOverride, setManualLiveOverride] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Supported stream patterns
  const streamPatterns = {
    youtube: [
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]+)/,
      /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    ],
    twitch: [
      /(?:https?:\/\/)?(?:www\.)?twitch\.tv\/([a-zA-Z0-9_]+)/,
    ],
    direct: [
      /\.m3u8(\?.*)?$/i, // HLS
      /\.mpd(\?.*)?$/i,  // DASH
      /\.mp4(\?.*)?$/i,  // Direct MP4
      /\.webm(\?.*)?$/i, // WebM
    ]
  };

  const detectStreamType = useCallback((url: string): StreamType | null => {
    // YouTube detection
    if (streamPatterns.youtube.some(pattern => pattern.test(url))) {
      return 'youtube';
    }
    
    // Twitch detection
    if (streamPatterns.twitch.some(pattern => pattern.test(url))) {
      return 'twitch';
    }
    
    // Direct stream detection
    if (streamPatterns.direct.some(pattern => pattern.test(url))) {
      if (url.includes('.m3u8')) return 'hls';
      if (url.includes('.mpd')) return 'dash';
      return 'direct-url';
    }
    
    return null;
  }, [streamPatterns.youtube, streamPatterns.twitch, streamPatterns.direct]);

  const validateStreamUrl = useCallback(async (url: string): Promise<StreamValidationResult> => {
    try {
      const streamType = detectStreamType(url);
      
      if (!streamType) {
        return {
          isValid: false,
          streamType: 'direct-url',
          error: 'Unsupported stream format. Please provide a YouTube, Twitch, or direct stream URL.'
        };
      }

      let extractedUrl = url;
      let metadata: StreamMetadata = {
        title: 'Stream Preview',
        isLive: false,
        quality: 'Unknown'
      };

      // Handle YouTube URLs - convert to embed format
      if (streamType === 'youtube') {
        const videoId = extractYouTubeVideoId(url);
        if (!videoId) {
          return {
            isValid: false,
            streamType: 'youtube',
            error: 'Invalid YouTube URL format.'
          };
        }
        
        // Check if the ORIGINAL URL indicates this is a live stream
        const isLiveStream = url.includes('/live/') || 
                           url.includes('/live?') ||
                           url.includes('live=1') ||
                           url.includes('live=true') ||
                           url.includes('isLive=true') ||
                           url.includes('&live') ||
                           url.includes('?live') ||
                           // Check for common live indicators in the full URL
                           url.toLowerCase().includes('live') ||
                           // Manual override by user
                           manualLiveOverride;
        
        // Use YouTube embed URL which bypasses CORS issues
        // Add live indicator to embed URL if this is a live stream
        let embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
        if (isLiveStream) {
          embedUrl += '&live=1&autoplay=0';
          console.log('🔴 LIVE STREAM DETECTED - Added live=1 to embed URL');
        }
        
        extractedUrl = embedUrl;
        metadata = {
          title: `YouTube ${isLiveStream ? 'Live Stream' : 'Video'}: ${videoId}`,
          isLive: isLiveStream,
          quality: 'HD',
          thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
        
        console.log('🎥 YouTube URL conversion:', {
          originalUrl: url,
          videoId,
          isLive: isLiveStream,
          embedUrl: extractedUrl,
          preservedLiveStatus: isLiveStream ? 'YES' : 'NO',
          manualOverride: manualLiveOverride ? 'YES' : 'NO',
          detectionMethod: manualLiveOverride ? 'Manual Override' : 'URL Analysis'
        });
      }

      // Handle Twitch URLs
      if (streamType === 'twitch') {
        const channelMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
        const channel = channelMatch?.[1];
        if (!channel) {
          return {
            isValid: false,
            streamType: 'twitch',
            error: 'Invalid Twitch URL format.'
          };
        }
        
        // Use Twitch embed URL
        extractedUrl = `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`;
        metadata = {
          title: `Twitch Stream: ${channel}`,
          isLive: true,
          quality: 'Variable'
        };
      }

      // Mock validation delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return {
        isValid: true,
        streamType,
        extractedUrl,
        metadata
      };
    } catch {
      return {
        isValid: false,
        streamType: 'direct-url',
        error: 'Failed to validate stream URL'
      };
    }
  }, [detectStreamType, manualLiveOverride]);

  // Extract YouTube video ID from various URL formats
  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  const convertToEmbedUrl = (url: string, isLive: boolean): string => {
    const streamType = detectStreamType(url);
    
    if (streamType === 'youtube') {
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) return url;
      
      let embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;
      if (isLive) {
        embedUrl += '&live=1&autoplay=0';
      }
      return embedUrl;
    }
    
    if (streamType === 'twitch') {
      const channelMatch = url.match(/twitch\.tv\/([a-zA-Z0-9_]+)/);
      const channel = channelMatch?.[1];
      if (channel) {
        return `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`;
      }
    }
    
    return url;
  };

  interface StreamData {
    url: string;
    originalUrl: string;
    title: string;
    streamType: StreamType;
    metadata: StreamMetadata & {
      detectionMethod?: string;
      apiStatus?: any;
      manualOverride?: boolean;
    };
  }

  const handleUrlValidation = useCallback(async () => {
    if (!streamUrl.trim()) {
      toast.error('Please enter a stream URL');
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const result = await validateStreamUrl(streamUrl.trim());
      setValidationResult(result);

      if (result.isValid) {
        toast.success('Stream URL validated successfully!');
      } else {
        toast.error(result.error || 'Invalid stream URL');
      }
    } catch {
      toast.error('Failed to validate stream');
      setValidationResult({
        isValid: false,
        streamType: 'direct-url',
        error: 'Validation failed'
      });
    } finally {
      setIsValidating(false);
    }
  }, [streamUrl, validateStreamUrl]);

  const handleStartFactChecking = useCallback(() => {
    if (!validationResult?.isValid || !validationResult.extractedUrl) {
      toast.error('Please validate a stream URL first');
      return;
    }

    onStreamReady(
      validationResult.extractedUrl,
      validationResult.streamType,
      validationResult.metadata
    );
  }, [validationResult, onStreamReady]);

  const getStreamTypeBadge = (type: StreamType) => {
    const config = {
      youtube: { label: 'YouTube', className: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' },
      twitch: { label: 'Twitch', className: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' },
      hls: { label: 'HLS Stream', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300' },
      dash: { label: 'DASH Stream', className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' },
      'direct-url': { label: 'Direct Stream', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300' }
    };
    
    const { label, className } = config[type] || config['direct-url'];
    return <Badge className={className}>{label}</Badge>;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!streamUrl.trim()) {
      setError('Please enter a valid stream URL');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Step 1: Check live status using YouTube Data API (if YouTube)
      let apiLiveStatus = null;
      const streamType = detectStreamType(streamUrl);
      
      if (!streamType) {
        throw new Error('Unsupported stream format. Please provide a YouTube, Twitch, or direct stream URL.');
      }
      
      if (streamType === 'youtube') {
        try {
          console.log('🔍 Checking live status via YouTube Data API...');
          const liveResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/stt/check-live-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url: streamUrl,
              stream_type: streamType
            })
          });
          
          if (liveResponse.ok) {
            apiLiveStatus = await liveResponse.json();
            console.log('📡 YouTube API live status:', apiLiveStatus);
          } else {
            console.warn('⚠️ Live status check failed, using fallback detection');
          }
        } catch (error) {
          console.warn('⚠️ Live status API error, using fallback detection:', error);
        }
      }

      // Step 2: Enhanced live detection logic
      let isLive = false;
      let detectionMethod = 'url_fallback';
      
      if (manualLiveOverride) {
        isLive = true;
        detectionMethod = 'manual_override';
        console.log('🔧 Manual live override enabled - treating as live stream');
      } else if (apiLiveStatus && apiLiveStatus.method === 'youtube_data_api') {
        // Use authoritative YouTube Data API result
        isLive = apiLiveStatus.is_live;
        detectionMethod = 'youtube_data_api';
        console.log(`✅ Using YouTube Data API result: isLive=${isLive}, status=${apiLiveStatus.live_broadcast_content}`);
      } else {
        // Fallback to URL-based detection for YouTube embed URLs or other platforms
        const urlLower = streamUrl.toLowerCase();
        isLive = (
          urlLower.includes('/live/') ||
          urlLower.includes('live=1') ||
          urlLower.includes('live=true') ||
          urlLower.includes('&live') ||
          urlLower.includes('?live')
        );
        console.log(`🔗 URL-based detection: isLive=${isLive}`);
      }

      // Step 3: Convert URL to embed format if needed
      const convertedUrl = convertToEmbedUrl(streamUrl, isLive);
      console.log('🔄 URL conversion completed:', {
        original: streamUrl,
        converted: convertedUrl,
        preservedLiveStatus: isLive ? 'YES' : 'NO',
        detectionMethod,
        videoId: extractYouTubeVideoId(streamUrl)
      });

      // Step 4: Create stream data with live status
      const streamData: StreamData = {
        url: convertedUrl,
        originalUrl: streamUrl,
        title: apiLiveStatus?.title || `${streamType.charAt(0).toUpperCase() + streamType.slice(1)} Stream`,
        streamType: streamType,
        metadata: { 
          isLive,
          detectionMethod,
          apiStatus: apiLiveStatus,
          manualOverride: manualLiveOverride
        }
      };

      // Log final stream data for debugging
      console.log('📊 Final stream data:', streamData);

      onStreamReady(
        streamData.url,
        streamData.streamType,
        streamData.metadata
      );
    } catch (err) {
      console.error('❌ Stream validation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to validate stream URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      <Card className="shadow-lg border-0 bg-gradient-to-br from-background via-background to-primary/5">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Radio className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl font-bold">Live Stream Fact-Checker</CardTitle>
          </div>
          <p className="text-muted-foreground">
            Enter a live stream URL to start real-time fact-checking
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* URL Input Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Stream URL</label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://youtube.com/watch?v=... or https://twitch.tv/..."
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  className="flex-1"
                  disabled={isValidating}
                />
                <Button 
                  onClick={handleSubmit}
                  disabled={isValidating || !streamUrl.trim()}
                  className="px-6"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Validate'
                  )}
                </Button>
              </div>
            </div>

            {/* Manual Live Override Toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <input
                type="checkbox"
                id="liveOverride"
                checked={manualLiveOverride}
                onChange={(e) => setManualLiveOverride(e.target.checked)}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
              />
              <label htmlFor="liveOverride" className="text-sm font-medium cursor-pointer">
                Force Live Stream Mode
              </label>
              <div className="text-xs text-muted-foreground ml-auto">
                Use when URL doesn't show live indicators
              </div>
            </div>

            {/* Supported Formats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube Live & Videos</span>
              </div>
              <div className="flex items-center gap-2">
                <Twitch className="w-4 h-4 text-purple-500" />
                <span>Twitch Streams</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Direct HLS/DASH URLs</span>
              </div>
            </div>
          </div>

          {/* Validation Result */}
          <AnimatePresence>
            {validationResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <Alert className={validationResult.isValid ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30'}>
                  <div className="flex items-center gap-2">
                    {validationResult.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    )}
                    <AlertDescription className="flex-1">
                      {validationResult.isValid ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Stream validated successfully!</span>
                            {getStreamTypeBadge(validationResult.streamType)}
                          </div>
                          {validationResult.metadata && (
                            <div className="text-sm space-y-1">
                              {validationResult.metadata.title && (
                                <div>Title: {validationResult.metadata.title}</div>
                              )}
                              <div className="flex items-center gap-4">
                                {validationResult.metadata.isLive && (
                                  <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                                    🔴 LIVE {manualLiveOverride ? '(Manual)' : '(Auto)'}
                                  </Badge>
                                )}
                                {validationResult.metadata.quality && (
                                  <span>Quality: {validationResult.metadata.quality}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        validationResult.error
                      )}
                    </AlertDescription>
                  </div>
                </Alert>

                {validationResult.isValid && (
                  <div className="flex justify-center">
                    <Button 
                      onClick={handleStartFactChecking}
                      size="lg"
                      className="px-8 py-3 text-lg font-medium"
                    >
                      <Radio className="w-5 h-5 mr-2" />
                      Start Live Fact-Checking
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Advanced Options */}
          <div className="border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-muted-foreground"
            >
              Advanced Options {showAdvanced ? '−' : '+'}
            </Button>

            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4 text-sm"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-medium">Chunk Duration</label>
                      <p className="text-muted-foreground text-xs">Time segments for processing (seconds)</p>
                      <Input type="number" defaultValue="30" min="15" max="120" />
                    </div>
                    <div>
                      <label className="font-medium">Processing Quality</label>
                      <p className="text-muted-foreground text-xs">Balance between speed and accuracy</p>
                      <select className="w-full p-2 border rounded">
                        <option value="fast">Fast (Real-time focus)</option>
                        <option value="balanced" selected>Balanced</option>
                        <option value="accurate">Accurate (Quality focus)</option>
                      </select>
                    </div>
                  </div>
                  
                  <Alert>
                    <AlertCircle className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      Live stream fact-checking requires significant processing power. 
                      Performance may vary based on stream quality and connection speed.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sample URLs for Testing */}
          <div className="border-t pt-4">
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Sample URLs for Testing
              </summary>
              <div className="mt-3 space-y-2 text-xs">
                <div className="space-y-1">
                  <div className="font-medium">YouTube:</div>
                  <code className="block bg-muted p-2 rounded text-xs">
                    https://youtube.com/watch?v=dQw4w9WgXcQ
                  </code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">Twitch:</div>
                  <code className="block bg-muted p-2 rounded text-xs">
                    https://twitch.tv/example_channel
                  </code>
                </div>
                <div className="space-y-1">
                  <div className="font-medium">HLS Stream:</div>
                  <code className="block bg-muted p-2 rounded text-xs">
                    https://example.com/stream/playlist.m3u8
                  </code>
                </div>
              </div>
            </details>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 