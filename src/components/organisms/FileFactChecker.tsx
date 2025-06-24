'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/molecules/FileUpload';
import { VerificationCard } from '@/components/molecules/VerificationCard';
import { truthCheckerApi } from '@/lib/api';
import { FactCheckResponse, UploadedFile } from '@/lib/types';
import { SUPPORTED_FILE_TYPES } from '@/lib/constants';
import { getApiLanguage } from '@/lib/languageUtils';
import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function FileFactChecker() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [results, setResults] = useState<FactCheckResponse | null>(null);

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

      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 50));
        updateProgress(i);
      }

      // Update status to processing
      setFiles(prev => prev.map(f => 
        f.file === file ? { ...f, status: 'processing' } : f
      ));

      // Perform fact check with correct language
      const response = await truthCheckerApi.checkFile(file, getApiLanguage());
      
      setFiles(prev => prev.map(f => 
        f.file === file ? { 
          ...f, 
          status: 'completed',
          result: response 
        } : f
      ));

      setResults(response);
      toast.success('File fact-check completed!');

    } catch (error) {
      console.error('File fact-check error:', error);
      setFiles(prev => prev.map(f => 
        f.file === file ? { 
          ...f, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        } : f
      ));
      toast.error('Failed to fact-check file. Please try again.');
    }
  };

  const handleFileRemove = (file: File) => {
    setFiles(prev => prev.filter(f => f.file !== file));
    
    // Clear results if removing the file that generated them
    const fileResult = files.find(f => f.file === file);
    if (fileResult?.result === results) {
      setResults(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            File Fact Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileSelect={handleFileSelect}
            onFileRemove={handleFileRemove}
            acceptedTypes={[...SUPPORTED_FILE_TYPES.text]}
            files={files}
            maxFiles={3}
          />
        </CardContent>
      </Card>

      {results && (
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
              {results.results.length} result{results.results.length !== 1 ? 's' : ''}
            </span>
          </div>

          {results.results.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                No verifiable claims found in the uploaded file.
              </p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {results.results.map((result, index) => (
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