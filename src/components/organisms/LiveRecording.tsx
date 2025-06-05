'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VerificationCard } from '@/components/molecules/VerificationCard';
import { truthCheckerApi } from '@/lib/api';
import { FactCheckResponse } from '@/lib/types';
import { formatDuration } from '@/lib/format';
import { 
  Mic, 
  MicOff, 
  Square,
  Play,
  Pause,
  Volume2,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface LiveRecordingProps {
  className?: string;
}

export function LiveRecording({ className = '' }: LiveRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [factCheckResults, setFactCheckResults] = useState<FactCheckResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Audio level monitoring
  useEffect(() => {
    if (!isRecording || isPaused) return;

    const updateAudioLevel = () => {
      if (analyserRef.current) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
      }
      
      if (isRecording && !isPaused) {
        requestAnimationFrame(updateAudioLevel);
      }
    };

    updateAudioLevel();
  }, [isRecording, isPaused]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      
      // Set up audio analysis
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);
      
      // Set up media recorder
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        if (chunksRef.current.length > 0) {
          await processRecording();
        }
      };

      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Live recording started');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        toast.success('Recording resumed');
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        toast.success('Recording paused');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
      }

      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setAudioLevel(0);
      toast.success('Recording stopped');
    }
  };

  const processRecording = async () => {
    if (chunksRef.current.length === 0) return;

    setIsProcessing(true);
    
    try {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      const file = new File([blob], `live-recording-${Date.now()}.webm`, { type: 'audio/webm' });

      console.log('🎙️ Processing live recording:', {
        duration: `${recordingTime}s`,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        chunks: chunksRef.current.length
      });

      // Transcribe the recording
      const transcription = await truthCheckerApi.transcribeFile(file, {
        provider: 'elevenlabs',
        language: 'en'
      });

      setCurrentTranscript(transcription.text || '');

      // If transcription successful, fact-check the text
      if (transcription.text) {
        const factCheck = await truthCheckerApi.checkText({
          text: transcription.text,
          language: 'en'
        });

        setFactCheckResults(factCheck);
        toast.success('Live recording processed and fact-checked!');
      }

    } catch (error) {
      console.error('Live recording processing error:', error);
      toast.error('Failed to process live recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearSession = () => {
    setCurrentTranscript('');
    setFactCheckResults(null);
    chunksRef.current = [];
    toast.success('Session cleared');
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Recording Controls */}
      <Card className="border-2 border-dashed border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 transition-colors">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Live Recording & Fact-Check</h3>
                <p className="text-sm text-muted-foreground">
                  Record audio in real-time with automatic transcription and fact-checking
                </p>
              </div>
            </div>

            {/* Audio Level Indicator */}
            {isRecording && !isPaused && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-4"
              >
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-red-500 rounded-full"
                    style={{ width: `${audioLevel * 100}%` }}
                    animate={{ width: `${audioLevel * 100}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {Math.round(audioLevel * 100)}%
                </span>
              </motion.div>
            )}

            {/* Control Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className="flex items-center gap-2 h-12 px-8"
                disabled={isProcessing}
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </>
                )}
              </Button>

              {isRecording && (
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 h-12"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5" />
                      Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5" />
                      Pause
                    </>
                  )}
                </Button>
              )}

              {(currentTranscript || factCheckResults) && !isRecording && (
                <Button
                  onClick={clearSession}
                  variant="outline"
                  size="lg"
                  className="flex items-center gap-2 h-12"
                >
                  Clear Session
                </Button>
              )}
            </div>

            {/* Recording Status */}
            <AnimatePresence>
              {isRecording && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800"
                >
                  <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`} />
                  <span className="font-mono text-lg font-bold text-red-700 dark:text-red-300">
                    {formatDuration(recordingTime)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {isPaused ? 'PAUSED' : 'RECORDING'}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Processing Status */}
            {isProcessing && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <span className="font-medium text-blue-700 dark:text-blue-300">
                  Processing recording...
                </span>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Transcript */}
      {currentTranscript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Transcription</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm leading-relaxed">
                  {currentTranscript}
                </p>
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
              Live Fact-Check Results
            </h2>
            <span className="text-sm text-muted-foreground">
              {factCheckResults.results.length} result{factCheckResults.results.length !== 1 ? 's' : ''}
            </span>
          </div>

          {factCheckResults.results.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No verifiable claims found in the live recording.
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