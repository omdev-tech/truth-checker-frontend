'use client';

import { useState, useEffect } from 'react';
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
import { Search, Wand2, AlertTriangle, CheckCircle, Clock, Database, Brain, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Processing steps for engaging loading experience
const PROCESSING_STEPS = [
  {
    id: 1,
    title: "Extracting Claims",
    description: "Identifying verifiable statements using NLP",
    icon: Brain,
    duration: 2500
  },
  {
    id: 2,
    title: "Accessing Data Sources",
    description: "Connecting to 50+ trusted databases",
    icon: Database,
    duration: 3000
  },
  {
    id: 3,
    title: "Cross-Referencing Evidence",
    description: "Analyzing credibility across multiple sources",
    icon: Shield,
    duration: 3000
  },
  {
    id: 4,
    title: "AI Reasoning Analysis",
    description: "Applying advanced logic verification",
    icon: Zap,
    duration: 2500
  },
  {
    id: 5,
    title: "Generating Results",
    description: "Compiling comprehensive fact-check report",
    icon: CheckCircle,
    duration: 1500
  }
];

interface ProcessingStepDisplayProps {
  isVisible: boolean;
  onComplete?: () => void;
}

function ProcessingStepDisplay({ isVisible, onComplete }: ProcessingStepDisplayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let stepIndex = 0;

    const progressToNextStep = () => {
      if (stepIndex < PROCESSING_STEPS.length) {
        setCurrentStep(stepIndex);
        
        timeoutId = setTimeout(() => {
          setCompletedSteps(prev => [...prev, stepIndex]);
          stepIndex++;
          
          if (stepIndex < PROCESSING_STEPS.length) {
            progressToNextStep();
          } else if (onComplete) {
            setTimeout(onComplete, 500);
          }
        }, PROCESSING_STEPS[stepIndex].duration);
      }
    };

    progressToNextStep();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mt-6 space-y-4"
    >
      <div className="border border-primary/20 rounded-lg p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
            <LoadingSpinner size="sm" className="text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-lg">AI Fact-Checking in Progress</h4>
            <p className="text-sm text-muted-foreground">
              Advanced verification using multiple data sources
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {PROCESSING_STEPS.map((step, index) => {
            const isActive = currentStep === index;
            const isCompleted = completedSteps.includes(index);
            const isPending = index > currentStep;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0.3 }}
                animate={{
                  opacity: isPending ? 0.4 : 1,
                  scale: isActive ? 1.02 : 1
                }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                  isActive 
                    ? 'bg-primary/10 border border-primary/30' 
                    : isCompleted 
                    ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800' 
                    : 'bg-muted/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  isCompleted 
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    : isActive 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : isActive ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className={`font-medium transition-colors duration-300 ${
                      isCompleted 
                        ? 'text-green-700 dark:text-green-300' 
                        : isActive 
                        ? 'text-primary' 
                        : 'text-foreground'
                    }`}>
                      {step.title}
                    </h5>
                    {isActive && (
                      <Clock className="w-4 h-4 text-primary animate-pulse" />
                    )}
                  </div>
                  <p className={`text-sm transition-colors duration-300 ${
                    isCompleted 
                      ? 'text-green-600 dark:text-green-400' 
                      : isActive 
                      ? 'text-primary/80' 
                      : 'text-muted-foreground'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            💡 This comprehensive analysis typically takes 10-15 seconds for accuracy
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function TextFactChecker() {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FactCheckResponse | null>(null);
  const [showProcessing, setShowProcessing] = useState(false);
  
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
    setShowProcessing(true);
    setResults(null); // Clear previous results
    
    try {
      const response = await truthCheckerApi.checkText({
        text: text.trim(),
        language: 'en',
      });
      
      // Wait for processing animation to complete before showing results
      setTimeout(() => {
        setResults(response);
        setShowProcessing(false);
        
        if (isAuthenticated) {
          toast.success('Fact-check completed!');
        }
      }, 500);
    } catch (error) {
      console.error('Fact-check error:', error);
      toast.error('Failed to fact-check text. Please try again.');
      setShowProcessing(false);
      
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
                disabled={(!isAuthenticated && !hasUsageRemaining) || isLoading}
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
                    Processing with AI...
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

          {/* Processing Steps Display */}
          <ProcessingStepDisplay 
            isVisible={showProcessing}
            onComplete={() => {
              // Processing animation completed, results should be ready
            }}
          />
        </CardContent>
      </Card>

      {/* Results */}
      {results && !showProcessing && (
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
          {!isAuthenticated && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-6 text-center"
            >
              <h3 className="font-bold text-lg mb-2">
                🚀 Want unlimited fact-checking?
              </h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Join thousands fighting misinformation with unlimited access, 
                audio/video analysis, and priority support.
              </p>
              <Button 
                onClick={() => window.location.href = '/'}
                size="lg"
                className="bg-primary hover:bg-primary/90 font-semibold"
              >
                Sign Up Free - Unlimited Access
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                No credit card required • Instant access • Cancel anytime
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
} 