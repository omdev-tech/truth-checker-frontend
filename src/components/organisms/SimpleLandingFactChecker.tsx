'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { VerificationCard } from '@/components/molecules/VerificationCard';
import { useGuestSession } from '@/hooks/useGuestSession';
import { truthCheckerApi } from '@/lib/api';
import { FactCheckResponse } from '@/lib/types';
import { MAX_TEXT_LENGTH } from '@/lib/constants';
import { Search, Sparkles, ArrowRight, CheckCircle, Clock, Database, Brain, Shield, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface SimpleLandingFactCheckerProps {
  onSignUpClick: () => void;
  className?: string;
}

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
            💡 This comprehensive analysis typically takes 5-15 seconds for accuracy
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Simplified Fact Checker for Landing Page
 * Reuses TextFactChecker logic with streamlined UI for conversion
 */
export function SimpleLandingFactChecker({ 
  onSignUpClick, 
  className = '' 
}: SimpleLandingFactCheckerProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FactCheckResponse | null>(null);
  const [hasTriedFactCheck, setHasTriedFactCheck] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  
  const { 
    hasUsageRemaining, 
    consumeUsage, 
    refundUsage,
    usageStats
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

    // Check guest usage limits
    if (!hasUsageRemaining) {
      toast.error('No free fact-checks remaining. Please sign up to continue.');
      onSignUpClick();
      return;
    }
    
    // Consume guest credit before making API call
    const usageResult = consumeUsage();
    if (!usageResult.success) {
      toast.error(usageResult.message || 'Usage limit reached. Please sign up to continue.');
      onSignUpClick();
      return;
    }

    setIsLoading(true);
    setShowProcessing(true);
    setHasTriedFactCheck(true);
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
        
        // Show appropriate success message
        if (usageResult.remainingUsage === 0) {
          toast.success('Fact-check completed! This was your last free fact-check.');
        } else {
          toast.success(`Fact-check completed! ${usageResult.remainingUsage} free fact-checks remaining.`);
        }
      }, 500);
    } catch (error) {
      console.error('Fact-check error:', error);
      toast.error('Failed to fact-check text. Please try again.');
      setShowProcessing(false);
      
      // Refund credit on failure
      const refundResult = refundUsage();
      if (refundResult.success) {
        toast.info('Credit refunded due to failed request.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpAfterTrial = () => {
    // Track that user tried the feature before signing up
    console.log('User signing up after trying fact-checker');
    onSignUpClick();
  };

  const canSubmit = text.trim() && !isLoading && hasUsageRemaining;

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
      <Card className="shadow-xl border-0 bg-gradient-to-br from-background via-background to-primary/5">
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1.5 bg-primary/10 rounded-full text-sm text-primary font-medium">
              <Sparkles className="w-4 h-4" />
              Try AI Fact-Checking Free
            </div>
            <h3 className="text-xl font-bold mb-2">
              Verify Any Claim Instantly
            </h3>
            <p className="text-muted-foreground text-sm">
              Enter any statement or claim below and see our AI fact-checker in action
            </p>
          </div>

          {/* Fact Check Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter a claim to fact-check... e.g., 'The Earth is flat' or 'Vaccines cause autism'"
                className="min-h-[100px] resize-none text-base"
                maxLength={MAX_TEXT_LENGTH}
                disabled={!hasUsageRemaining || isLoading}
              />
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  {text.length} / {MAX_TEXT_LENGTH} characters
                </span>
                <span className="text-primary font-medium">
                  {usageStats?.remaining || 0} free fact-checks remaining
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!canSubmit}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Processing with AI...
                </>
              ) : hasUsageRemaining ? (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Fact-Check This Claim
                </>
              ) : (
                <>
                  Sign Up for Free Access
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Processing Steps Display */}
          <ProcessingStepDisplay 
            isVisible={showProcessing}
            onComplete={() => {
              // Processing animation completed, results should be ready
            }}
          />

          {/* Results */}
          <AnimatePresence>
            {results && !showProcessing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 space-y-4"
              >
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-lg">Verification Results</h4>
                    <span className="text-sm text-muted-foreground">
                      {results.results.length} result{results.results.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {results.results.length === 0 ? (
                    <div className="p-6 text-center bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">
                        No verifiable claims found in the provided text.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {results.results.slice(0, 2).map((result, index) => (
                        <VerificationCard
                          key={index}
                          result={result}
                          index={index}
                        />
                      ))}
                      
                      {results.results.length > 2 && (
                        <div className="text-center p-3 bg-muted/20 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            + {results.results.length - 2} more results available in full app
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Conversion CTA after showing results */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg p-6 text-center"
                >
                  <h4 className="font-bold text-lg mb-2">
                    🎉 See how powerful AI fact-checking can be?
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Join thousands of users fighting misinformation with unlimited fact-checking, 
                    audio/video analysis, and real-time verification.
                  </p>
                  <Button 
                    onClick={handleSignUpAfterTrial}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 font-semibold"
                  >
                    Get Full Access - Sign Up Free
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    No credit card required • Instant access • Cancel anytime
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Usage exhausted state */}
          {!hasUsageRemaining && !results && !showProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-6 text-center"
            >
              <h4 className="font-semibold text-lg mb-2">
                You've tried all your free fact-checks!
              </h4>
              <p className="text-muted-foreground mb-4 text-sm">
                Ready to unlock unlimited AI-powered fact-checking?
              </p>
              <Button 
                onClick={handleSignUpAfterTrial}
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                Sign Up Free - Unlimited Access
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </div>
  );
} 