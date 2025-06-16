'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { VerificationCard } from '@/components/molecules/VerificationCard';
import { useAuth } from '@/hooks/useAuth';
import { useGuestSession } from '@/hooks/useGuestSession';
import { truthCheckerApi } from '@/lib/api';
import { FactCheckResponse } from '@/lib/types';
import { MAX_TEXT_LENGTH } from '@/lib/constants';
import { Search, Wand2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export function TextFactChecker() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FactCheckResponse | null>(null);
  
  const { isAuthenticated } = useAuth();
  const { 
    hasUsageRemaining, 
    consumeUsage, 
    refundUsage,
    usageStats,
    shouldShowUpgradePrompt 
  } = useGuestSession();

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

    // Check guest usage limits before proceeding
    if (!isAuthenticated) {
      if (!hasUsageRemaining) {
        toast.error('No free fact-checks remaining. Please sign up to continue.');
        return;
      }
      
      // Consume guest credit before making API call
      const usageResult = consumeUsage();
      if (!usageResult.success) {
        toast.error(usageResult.message || 'Usage limit reached. Please sign up to continue.');
        return;
      }

      // Show upgrade prompt if this is the last usage
      if (usageResult.remainingUsage === 0) {
        toast.success('Fact-check completed! This was your last free fact-check. Sign up for unlimited access.');
      } else {
        toast.success(`Fact-check completed! ${usageResult.remainingUsage} free fact-checks remaining.`);
      }
    }

    setIsLoading(true);
    try {
      const response = await truthCheckerApi.checkText({
        text: text.trim(),
        language: 'en',
      });
      setResults(response);
      
      if (isAuthenticated) {
        toast.success('Fact-check completed!');
      }
    } catch (error) {
      console.error('Fact-check error:', error);
      toast.error('Failed to fact-check text. Please try again.');
      
      // If API call failed and we're a guest user, refund the credit
      if (!isAuthenticated) {
        const refundResult = refundUsage();
        if (refundResult.success) {
          toast.info('Credit refunded due to failed request.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResults(null);
  };

  const canSubmit = text.trim() && !isLoading && (isAuthenticated || hasUsageRemaining);

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
          {/* Guest Usage Warning */}
          {!isAuthenticated && (
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {hasUsageRemaining 
                    ? `Guest Mode: ${usageStats?.remaining || 0} free fact-checks remaining`
                    : 'No free fact-checks remaining'
                  }
                </span>
              </div>
              {shouldShowUpgradePrompt && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                  Sign up for unlimited fact-checking access!
                </p>
              )}
            </div>
          )}

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
                disabled={!isAuthenticated && !hasUsageRemaining}
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
                disabled={!canSubmit}
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
                    {!isAuthenticated && hasUsageRemaining && (
                      <span className="ml-2 text-xs opacity-75">
                        ({usageStats?.remaining || 0} remaining)
                      </span>
                    )}
                  </>
                )}
              </Button>
              
              {!isAuthenticated && !hasUsageRemaining && (
                <Button
                  type="button"
                  onClick={() => window.location.href = '/'}
                  variant="default"
                  className="px-6"
                >
                  Sign Up Free
                </Button>
              )}
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

          {/* Guest upgrade prompt after results */}
          {!isAuthenticated && shouldShowUpgradePrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-2">
                    Unlock Unlimited Fact-Checking
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You've experienced our AI-powered fact-checking. Sign up for free to get unlimited access!
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/'}
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                  >
                    Sign Up Free - No Credit Card Required
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
} 