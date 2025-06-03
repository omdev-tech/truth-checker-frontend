'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { VerificationCard } from '@/components/molecules/VerificationCard';
import { truthCheckerApi } from '@/lib/api';
import { FactCheckResponse } from '@/lib/types';
import { MAX_TEXT_LENGTH } from '@/lib/constants';
import { Search, Wand2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function TextFactChecker() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FactCheckResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error('Please enter some text to fact-check');
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      toast.error(`Text is too long. Maximum ${MAX_TEXT_LENGTH} characters allowed.`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await truthCheckerApi.checkText({
        text: text.trim(),
        language: 'en',
      });
      setResults(response);
      toast.success('Fact-check completed!');
    } catch (error) {
      console.error('Fact-check error:', error);
      toast.error('Failed to fact-check text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResults(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Text Fact Checker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fact-check-text" className="text-sm font-medium">
                Enter text to fact-check
              </label>
              <Textarea
                id="fact-check-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter any statement, claim, or information you'd like to verify..."
                className="min-h-[120px] resize-none"
                maxLength={MAX_TEXT_LENGTH}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>
                  {text.length} / {MAX_TEXT_LENGTH} characters
                </span>
                {text.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="text-xs"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={isLoading || !text.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Checking Facts...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Check Facts
                  </>
                )}
              </Button>
            </div>
          </form>
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
                No verifiable claims found in the provided text.
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