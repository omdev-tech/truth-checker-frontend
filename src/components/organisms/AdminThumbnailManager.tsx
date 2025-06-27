'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  ImageIcon, 
  Trash2, 
  Eye,
  Check,
  AlertCircle,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface ThumbnailInfo {
  thumbnail_url?: string;
  has_thumbnail: boolean;
  thumbnail_filename?: string;
  thumbnail_size?: number;
  thumbnail_size_formatted?: string;
}

interface ThumbnailUploadResponse {
  message: string;
  thumbnail_info: ThumbnailInfo;
}

interface AdminThumbnailManagerProps {
  contentId: string;
  initialThumbnailInfo?: ThumbnailInfo | null;
  onThumbnailUpdate?: (thumbnailInfo: ThumbnailInfo) => void;
  className?: string;
}

export function AdminThumbnailManager({
  contentId,
  initialThumbnailInfo,
  onThumbnailUpdate,
  className
}: AdminThumbnailManagerProps) {
  
  const { data: session } = useSession();
  
  // State management
  const [thumbnailInfo, setThumbnailInfo] = useState<ThumbnailInfo | null>(initialThumbnailInfo || null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const isImage = file.type.startsWith('image/');
    
    if (!isImage) {
      toast.error('Please select an image file (JPG, PNG, WEBP, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image file must be smaller than 5MB');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
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

  const uploadThumbnail = async () => {
    if (!selectedFile) return;
    
    try {
      setIsLoading(true);
      setUploadProgress(0);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      const headers: Record<string, string> = {};
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
      
      console.log('📸 Uploading thumbnail with headers:', headers);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/public-content/${contentId}/upload-thumbnail`, {
        method: 'POST',
        headers,
        body: formData
      });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Thumbnail upload failed');
      }
      
      const data: ThumbnailUploadResponse = await response.json();
      
      setThumbnailInfo(data.thumbnail_info);
      setSelectedFile(null);
      setPreviewUrl(null);
      
      toast.success(data.message);
      
      if (onThumbnailUpdate) {
        onThumbnailUpdate(data.thumbnail_info);
      }
      
    } catch (error) {
      console.error('Thumbnail upload failed:', error);
      setError(error instanceof Error ? error.message : 'Thumbnail upload failed');
      toast.error('Failed to upload thumbnail');
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const removeThumbnail = async () => {
    if (!thumbnailInfo?.has_thumbnail) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const headers: Record<string, string> = {};
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/admin/public-content/${contentId}/remove-thumbnail`, {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to remove thumbnail');
      }
      
      const data = await response.json();
      
      setThumbnailInfo(null);
      toast.success(data.message);
      
      if (onThumbnailUpdate) {
        onThumbnailUpdate({ has_thumbnail: false });
      }
      
    } catch (error) {
      console.error('Failed to remove thumbnail:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove thumbnail');
      toast.error('Failed to remove thumbnail');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Thumbnail Management
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

          {/* Current Thumbnail */}
          {thumbnailInfo?.has_thumbnail && thumbnailInfo.thumbnail_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Current Thumbnail</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeThumbnail}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                {/* Thumbnail Preview */}
                <div className="aspect-[4/3] max-w-xs rounded-lg overflow-hidden bg-muted">
                  <img
                    src={thumbnailInfo.thumbnail_url}
                    alt="Current thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Thumbnail Info */}
                <div className="space-y-2">
                  {thumbnailInfo.thumbnail_filename && (
                    <p className="text-sm font-medium">{thumbnailInfo.thumbnail_filename}</p>
                  )}
                  {thumbnailInfo.thumbnail_size_formatted && (
                    <p className="text-xs text-muted-foreground">
                      Size: {thumbnailInfo.thumbnail_size_formatted}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(thumbnailInfo.thumbnail_url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(thumbnailInfo.thumbnail_url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Upload Section */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Thumbnail Image
            </h4>
            
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
                <div className="space-y-4">
                  <Check className="h-8 w-8 text-green-600 mx-auto" />
                  
                  {/* Preview */}
                  {previewUrl && (
                    <div className="aspect-[4/3] max-w-xs mx-auto rounded-lg overflow-hidden bg-muted">
                      <img
                        src={previewUrl}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  
                  <div className="flex gap-2 justify-center">
                    <Button onClick={uploadThumbnail} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Thumbnail
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={clearSelectedFile}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Drag and drop your thumbnail image here, or{' '}
                    <button
                      className="text-primary hover:underline"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
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
                    Supports: JPG, PNG, WEBP, GIF (max 5MB) • Recommended: 800×600px (4:3 aspect ratio)
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
                  Uploading thumbnail... {uploadProgress}%
                </p>
              </motion.div>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
} 