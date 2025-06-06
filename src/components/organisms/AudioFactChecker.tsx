'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/molecules/FileUpload';
import { VerificationCard } from '@/components/molecules/VerificationCard';
import { truthCheckerApi } from '@/lib/api';
import { FactCheckResponse, TranscriptionResult, UploadedFile } from '@/lib/types';
import { SUPPORTED_FILE_TYPES } from '@/lib/constants';
import { formatDuration } from '@/lib/format';
import { Upload, Video, FileAudio } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface AudioFactCheckerProps {
  onFileUpload?: (file: File) => void;
}

export function AudioFactChecker({ onFileUpload }: AudioFactCheckerProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [factCheckResults, setFactCheckResults] = useState<FactCheckResponse | null>(null);

  const handleFileSelect = async (file: File) => {
    // Check if it's a video or audio file that should use the new dashboard
    const isVideoOrAudio = file.type.startsWith('video/') || 
                          file.type.startsWith('audio/') ||
                          SUPPORTED_FILE_TYPES.video.some(type => file.type === type) ||
                          SUPPORTED_FILE_TYPES.audio.some(type => file.type === type);
    
    if (isVideoOrAudio && onFileUpload) {
      // Use the new dashboard for video/audio files
      onFileUpload(file);
      return;
    }

    // Fallback to original processing for other files or when onFileUpload is not provided
    const uploadedFile: UploadedFile = {
      file,
      progress: 0,
      status: 'uploading',
    };

    setFiles(prev => [...prev, uploadedFile]);

    try {
      // Simulate upload progress
      const updateProgress = (progress: number) => {
        setFiles(prev => prev.map(f => 
          f.file === file ? { ...f, progress } : f
        ));
      };

      for (let i = 0; i <= 100; i += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateProgress(i);
      }

      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'processing' } : f
      ));

      // Transcribe the file
      const transcription = await truthCheckerApi.transcribeFile(file, {
        provider: 'elevenlabs',
        language: 'en'
      });

      setTranscriptionResult(transcription);

      // If transcription successful, fact-check the text
      let factCheck: FactCheckResponse | null = null;
      if (transcription.text) {
        factCheck = await truthCheckerApi.checkText({
          text: transcription.text,
          language: 'en'
        });

        setFactCheckResults(factCheck);
      }

      setFiles(prev => prev.map(f => 
        f.file === file ? { 
          ...f, 
          status: 'completed',
          result: factCheck || undefined
        } : f
      ));

      toast.success('Media fact-check completed!');

    } catch (error) {
      console.error('Media fact-check error:', error);
      
      let errorMessage = 'Failed to process media file. Please try again.';
      
      // Provide more specific error messages based on error type
      if (error instanceof Error) {
        if (error.message.includes('HTTP 400')) {
          errorMessage = 'Invalid file format or corrupted file. Please upload a valid audio/video file.';
        } else if (error.message.includes('HTTP 401')) {
          errorMessage = 'Authentication failed. Please check API configuration.';
        } else if (error.message.includes('HTTP 413')) {
          errorMessage = 'File too large. Please upload a smaller file.';
        } else if (error.message.includes('HTTP 429')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Transcription failed')) {
          errorMessage = 'Failed to transcribe audio. The audio quality might be too low.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setFiles(prev => prev.map(f => 
        f.file === file ? { 
          ...f, 
          status: 'error',
          error: errorMessage
        } : f
      ));
      
      toast.error(errorMessage);
    }
  };

  const handleFileRemove = (file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
    
    // Clear results if removing the file that generated them
    const fileResult = files.find(f => f.file === file);
    if (fileResult?.file === file) {
      setTranscriptionResult(null);
      setFactCheckResults(null);
    }
  };

  const supportedTypes = [...SUPPORTED_FILE_TYPES.audio, ...SUPPORTED_FILE_TYPES.video];

  return (
    <div className="space-y-6">
      {/* Main Upload Card */}
      <Card className="border-2 border-dashed border-primary/20 hover:border-primary/40 transition-colors">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Upload Media Files</h3>
                <p className="text-sm text-muted-foreground">
                  Support for videos, audio files, and more formats
                </p>
            </div>
          </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              acceptedTypes={supportedTypes}
              files={files}
              maxFiles={1}
            />

            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                <span>Video Files</span>
              </div>
              <div className="flex items-center gap-2">
                <FileAudio className="w-4 h-4" />
                <span>Audio Files</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transcription Results */}
      {transcriptionResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{formatDuration(transcriptionResult.end_time - transcriptionResult.start_time)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Language:</span>
                    <p className="font-medium uppercase">{transcriptionResult.language}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <p className="font-medium">{Math.round(transcriptionResult.confidence * 100)}%</p>
                  </div>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm leading-relaxed">
                    {transcriptionResult.text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Fact Check Results */}
      {factCheckResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Verification Results
            </h2>
            <span className="text-sm text-muted-foreground">
              {factCheckResults.results.length} result{factCheckResults.results.length !== 1 ? 's' : ''}
            </span>
          </div>

          {factCheckResults.results.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No verifiable claims found in the transcribed audio.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {factCheckResults.results.map((result, index) => (
                <VerificationCard
                  key={index}
                  result={result}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
} 