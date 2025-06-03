'use client';

import React, { useCallback, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { UploadedFile } from '@/lib/types';
import { formatFileSize, isValidFileType } from '@/lib/format';
import { MAX_FILE_SIZE } from '@/lib/constants';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: (file: File) => void;
  acceptedTypes: string[];
  files?: UploadedFile[];
  maxFiles?: number;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  acceptedTypes,
  files = [],
  maxFiles = 1,
  className
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = useCallback((newFiles: File[]) => {
    newFiles.forEach(file => {
      // Validate file type
      if (!isValidFileType(file.name, acceptedTypes)) {
        // TODO: Show error toast
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        // TODO: Show error toast
        return;
      }

      // Check max files limit
      if (files.length >= maxFiles) {
        // TODO: Show error toast
        return;
      }

      onFileSelect(file);
    });
  }, [acceptedTypes, files.length, maxFiles, onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      processFiles(selectedFiles);
    }
  }, [processFiles]);

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <LoadingSpinner size="sm" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <File className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      <Card
        className={cn(
          'border-2 border-dashed transition-all duration-200 cursor-pointer',
          'hover:border-primary/50 hover:bg-primary/5',
          isDragOver && 'border-primary bg-primary/10',
          files.length >= maxFiles && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => files.length < maxFiles && document.getElementById('file-upload')?.click()}
      >
        <div className="p-8 text-center">
          <input
            type="file"
            multiple={maxFiles > 1}
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            disabled={files.length >= maxFiles}
          />
          
          <motion.div
            animate={{ scale: isDragOver ? 1.05 : 1 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">
                Drop files here or click to upload
              </h3>
              <p className="text-sm text-muted-foreground">
                Supports {acceptedTypes.join(', ')} up to {formatFileSize(MAX_FILE_SIZE)}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                document.getElementById('file-upload')?.click();
              }}
              disabled={files.length >= maxFiles}
              className="cursor-pointer"
            >
              Choose Files
            </Button>
          </motion.div>
        </div>
      </Card>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">
            Uploaded Files
          </h4>
          {files.map((uploadedFile, index) => (
            <motion.div
              key={uploadedFile.file.name + index}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {getStatusIcon(uploadedFile.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)}
                      </p>
                    </div>
                  </div>

                  {onFileRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFileRemove(uploadedFile.file)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {uploadedFile.status === 'uploading' && (
                  <div className="mt-3">
                    <Progress value={uploadedFile.progress} className="h-1" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {uploadedFile.progress}% uploaded
                    </p>
                  </div>
                )}

                {uploadedFile.status === 'processing' && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">
                      Processing file...
                    </p>
                  </div>
                )}

                {uploadedFile.status === 'error' && uploadedFile.error && (
                  <div className="mt-3">
                    <p className="text-xs text-red-600">
                      {uploadedFile.error}
                    </p>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
} 