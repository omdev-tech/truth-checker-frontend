'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/molecules/FileUpload';
import { VerificationCard } from '@/components/molecules/VerificationCard';
import { truthCheckerApi } from '@/lib/api';
import { FactCheckResponse, TranscriptionResult, UploadedFile } from '@/lib/types';
import { SUPPORTED_FILE_TYPES } from '@/lib/constants';
import { formatDuration } from '@/lib/format';
import { Mic, MicOff, Headphones, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function AudioFactChecker() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [factCheckResults, setFactCheckResults] = useState<FactCheckResponse | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleFileSelect = async (file: File) => {
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

      toast.success('Audio fact-check completed!');

    } catch (error) {
      console.error('Audio fact-check error:', error);
      setFiles(prev => prev.map(f => 
        f.file === file ? { 
          ...f, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        } : f
      ));
      toast.error('Failed to process audio file. Please try again.');
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        handleFileSelect(file);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      setIsRecording(false);
      setRecordingTime(0);
      toast.success('Recording stopped');
    }
  };

  const supportedTypes = [...SUPPORTED_FILE_TYPES.audio, ...SUPPORTED_FILE_TYPES.video];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            Audio & Video Fact Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Live Recording */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Mic className="w-4 h-4" />
              Live Recording
            </h3>
            <div className="flex items-center gap-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Start Recording
                  </>
                )}
              </Button>
              
              {isRecording && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-mono">
                    {formatDuration(recordingTime)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Video className="w-4 h-4" />
              Upload Audio/Video
            </h3>
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              acceptedTypes={supportedTypes}
              files={files}
              maxFiles={1}
            />
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
                    <p className="font-medium">{formatDuration(transcriptionResult.duration)}</p>
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