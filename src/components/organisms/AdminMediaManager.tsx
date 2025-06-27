'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  Youtube,
  Video,
  Music,
  FileText,
  Trash2,
  Check,
  AlertCircle,
  Download,
  Eye,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

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

interface MediaUploadResponse {
  success: boolean;
  media_info: MediaInfo;
  message: string;
}

interface AdminMediaManagerProps {
  contentId: string;
  initialMediaInfo?: MediaInfo | null;
  onMediaUpdate?: (mediaInfo: MediaInfo) => void;
  className?: string;
}

/**
 * Admin Media Manager Component
 * Comprehensive media management for public content
 * Supports file uploads and YouTube integration
 */
export function AdminMediaManager({
  contentId,
  initialMediaInfo,
  onMediaUpdate,
  className
}: AdminMediaManagerProps) {
  
  // Session for authentication
  const { data: session } = useSession();
  
  // State management
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(initialMediaInfo || null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'video' | 'audio'>('video');

  // Load media info on mount
  useEffect(() => {
    if (!initialMediaInfo) {
      loadMediaInfo();
    }
  }, [contentId]);

  const loadMediaInfo = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const headers: Record<string, string> = {};
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
      
      console.log('🔍 Loading media info with headers:', headers);
      
      const response = await fetch(`/api/admin/public-content/${contentId}/media`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to load media info');
      }
      
      const data: MediaInfo = await response.json();
      setMediaInfo(data);
      
      if (onMediaUpdate) {
        onMediaUpdate(data);
      }
    } catch (error) {
      console.error('Failed to load media info:', error);
      setError('Failed to load media information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');
    
    if (!isVideo && !isAudio) {
      toast.error('Please select a video or audio file');
      return;
    }
    
    // Set upload type based on file
    setUploadType(isVideo ? 'video' : 'audio');
    setSelectedFile(file);
    setError(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const uploadFile = async () => {
    if (!selectedFile) return;
    
    try {
      setIsLoading(true);
      setUploadProgress(0);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const endpoint = uploadType === 'video' 
        ? `/api/admin/public-content/${contentId}/upload-video`
        : `/api/admin/public-content/${contentId}/upload-audio`;
      
      const headers: Record<string, string> = {};
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
      
      console.log('📤 Uploading with headers:', headers);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }
      
      const data: MediaUploadResponse = await response.json();
      
      setMediaInfo(data.media_info);
      setSelectedFile(null);
      setUploadProgress(100);
      
      toast.success(data.message);
      
      if (onMediaUpdate) {
        onMediaUpdate(data.media_info);
      }
      
    } catch (error) {
      console.error('Upload failed:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
      toast.error('Failed to upload file');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const attachYouTube = async () => {
    if (!youtubeUrl.trim()) {
      toast.error('Please enter a YouTube URL');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
      
      console.log('🎬 Attaching YouTube with headers:', headers);
      
      const response = await fetch(`/api/admin/public-content/${contentId}/attach-youtube`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ youtube_url: youtubeUrl })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to attach YouTube video');
      }
      
      const data: MediaUploadResponse = await response.json();
      
      setMediaInfo(data.media_info);
      setYoutubeUrl('');
      
      toast.success(data.message);
      
      if (onMediaUpdate) {
        onMediaUpdate(data.media_info);
      }
      
    } catch (error) {
      console.error('YouTube attach failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to attach YouTube video');
      toast.error('Failed to attach YouTube video');
    } finally {
      setIsLoading(false);
    }
  };

  const removeMedia = async () => {
    if (!confirm('Are you sure you want to remove this media?')) {
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const headers: Record<string, string> = {};
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
      
      console.log('🗑️ Removing media with headers:', headers);
      
      const response = await fetch(`/api/admin/public-content/${contentId}/media`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove media');
      }
      
      setMediaInfo(null);
      toast.success('Media removed successfully');
      
      if (onMediaUpdate) {
        onMediaUpdate({
          media_type: 'no_media',
          has_media: false
        } as MediaInfo);
      }
      
    } catch (error) {
      console.error('Remove media failed:', error);
      setError('Failed to remove media');
      toast.error('Failed to remove media');
    } finally {
      setIsLoading(false);
    }
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
        return <FileText className="h-4 w-4" />;
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

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Media Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Media Info */}
          {mediaInfo?.has_media && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Current Media</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeMedia}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  {getMediaTypeIcon(mediaInfo.media_type)}
                  <Badge className={getMediaTypeBadgeColor(mediaInfo.media_type)}>
                    {mediaInfo.media_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                
                {mediaInfo.uploaded_media_filename && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{mediaInfo.uploaded_media_filename}</p>
                    {mediaInfo.media_size_formatted && (
                      <p className="text-xs text-muted-foreground">
                        Size: {mediaInfo.media_size_formatted}
                      </p>
                    )}
                  </div>
                )}
                
                {mediaInfo.youtube_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">YouTube Video</p>
                    <a
                      href={mediaInfo.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {mediaInfo.youtube_url}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                
                {mediaInfo.playable_url && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(mediaInfo.playable_url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    
                    {mediaInfo.uploaded_media_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(mediaInfo.uploaded_media_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          <Separator />

          {/* File Upload Section */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Media File
            </h4>
            
            {/* Upload Type Selection */}
            <div className="flex gap-2">
              <Button
                variant={uploadType === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadType('video')}
              >
                <Video className="h-4 w-4 mr-2" />
                Video
              </Button>
              <Button
                variant={uploadType === 'audio' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadType('audio')}
              >
                <Music className="h-4 w-4 mr-2" />
                Audio
              </Button>
            </div>
            
            {/* Drop Zone */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                selectedFile && "border-green-500 bg-green-50 dark:bg-green-950"
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {selectedFile ? (
                <div className="space-y-2">
                  <Check className="h-8 w-8 text-green-600 mx-auto" />
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={uploadFile} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload {uploadType}
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setSelectedFile(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Drag and drop your {uploadType} file here, or{' '}
                    <button
                      className="text-primary hover:underline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = uploadType === 'video' ? 'video/*' : 'audio/*';
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files && files[0]) {
                            handleFileSelect(files[0]);
                          }
                        };
                        input.click();
                      }}
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {uploadType === 'video' 
                      ? 'Supports: MP4, AVI, MOV, WMV, WebM (max 500MB)'
                      : 'Supports: MP3, WebM, M4A, AAC, OGG (max 100MB)'
                    }
                  </p>
                </>
              )}
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                <Progress value={uploadProgress} />
                <p className="text-sm text-center text-muted-foreground">
                  Uploading... {uploadProgress}%
                </p>
              </motion.div>
            )}
          </div>

          <Separator />

          {/* YouTube URL Section */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              Attach YouTube Video
            </h4>
            
            <div className="space-y-2">
              <label htmlFor="youtube-url" className="text-sm font-medium">YouTube URL</label>
              <Input
                id="youtube-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button
              onClick={attachYouTube}
              disabled={isLoading || !youtubeUrl.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Attaching...
                </>
              ) : (
                <>
                  <Youtube className="h-4 w-4 mr-2" />
                  Attach YouTube Video
                </>
              )}
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Supports YouTube.com and Youtu.be URLs
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
} 