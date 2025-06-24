'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { VerificationCard } from '@/components/molecules/VerificationCard';
import { useGuestSession } from '@/hooks/useGuestSession';
import { truthCheckerApi } from '@/lib/api';
import { FactCheckResponse } from '@/lib/types';
import { MAX_TEXT_LENGTH } from '@/lib/constants';
import { Search, Sparkles, ArrowRight, CheckCircle, Clock, Database, Brain, Shield, Zap, FileText, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { getApiLanguage } from '@/lib/languageUtils';

interface SimpleLandingFactCheckerProps {
  onSignUpClick: () => void;
  className?: string;
}

const getProcessingSteps = (t: any) => [
  {
    id: 'extract',
    title: t('factCheck:processing.steps.extracting.title'),
    description: t('factCheck:processing.steps.extracting.description'),
    icon: FileText,
    duration: 2000
  },
  {
    id: 'sources',
    title: t('factCheck:processing.steps.accessing.title'),
    description: t('factCheck:processing.steps.accessing.description'),
    icon: Globe,
    duration: 3000
  },
  {
    id: 'crossref',
    title: t('factCheck:processing.steps.crossReferencing.title'),
    description: t('factCheck:processing.steps.crossReferencing.description'),
    icon: Zap,
    duration: 2500
  },
  {
    id: 'reasoning',
    title: t('factCheck:processing.steps.reasoning.title'),
    description: t('factCheck:processing.steps.reasoning.description'),
    icon: Brain,
    duration: 3000
  },
  {
    id: 'generate',
    title: t('factCheck:processing.steps.generating.title'),
    description: t('factCheck:processing.steps.generating.description'),
    icon: CheckCircle,
    duration: 2000
  }
];

interface ProcessingStepDisplayProps {
  isVisible: boolean;
  onComplete?: () => void;
}

function ProcessingStepDisplay({ isVisible, onComplete }: ProcessingStepDisplayProps) {
  const { t } = useTranslation(['factCheck', 'common']);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const PROCESSING_STEPS = useMemo(() => getProcessingSteps(t), [t]);

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
  }, [isVisible, onComplete, PROCESSING_STEPS]);

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
            <h4 className="font-semibold text-lg">{t('factCheck:processing.title')}</h4>
            <p className="text-sm text-muted-foreground">
              {t('factCheck:processing.subtitle')}
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

  const { t } = useTranslation(['factCheck', 'common']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      toast.error(t('factCheck:validation.enterText'));
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      toast.error(t('factCheck:validation.textTooLong', { maxLength: MAX_TEXT_LENGTH }));
      return;
    }

    // Check guest usage limits
    if (!hasUsageRemaining) {
      toast.error(t('factCheck:guest.noUsageRemaining'));
      onSignUpClick();
      return;
    }
    
    // Consume guest credit before making API call
    const usageResult = consumeUsage();
    if (!usageResult.success) {
      toast.error(usageResult.message || t('factCheck:guest.usageLimitReached'));
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
        language: getApiLanguage(),
      });
      
      // Wait for processing animation to complete before showing results
      setTimeout(() => {
        setResults(response);
        setShowProcessing(false);
        
        // Show appropriate success message
        if (usageResult.remainingUsage === 0) {
          toast.success(t('factCheck:guest.lastFactCheck'));
        } else {
          toast.success(t('factCheck:guest.remainingFactChecks', { count: usageResult.remainingUsage }));
        }
      }, 500);
    } catch (error) {
      console.error('Fact-check error:', error);
      toast.error(t('factCheck:errors.failed'));
      setShowProcessing(false);
      
      // Refund credit on failure
      const refundResult = refundUsage();
      if (refundResult.success) {
        toast.info(t('factCheck:guest.creditRefunded'));
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
              {t('factCheck:landing.tryFree')}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {t('factCheck:landing.title')}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t('factCheck:landing.subtitle')}
            </p>
          </div>

          {/* Fact Check Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('factCheck:placeholders.landingInput')}
                className="min-h-[100px] resize-none text-base"
                maxLength={MAX_TEXT_LENGTH}
                disabled={!hasUsageRemaining || isLoading}
              />
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  {t('factCheck:textFactChecker.characterCount', { current: text.length, max: MAX_TEXT_LENGTH })}
                </span>
                <span className="text-primary font-medium">
                  {t('factCheck:landing.remainingChecks', { count: usageStats?.remaining || 0 })}
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
                  {t('factCheck:textFactChecker.processing')}
                </>
              ) : hasUsageRemaining ? (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  {t('factCheck:landing.checkClaim')}
                </>
              ) : (
                <>
                  {t('factCheck:guest.signUpFree')}
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
                    <h4 className="font-semibold text-lg">{t('factCheck:results.title')}</h4>
                    <span className="text-sm text-muted-foreground">
                      {t('factCheck:landing.resultCount', { count: results.results.length })}
                    </span>
                  </div>

                  {results.results.length === 0 ? (
                    <div className="p-6 text-center bg-muted/30 rounded-lg">
                      <p className="text-muted-foreground">
                        {t('factCheck:landing.noClaimsFound')}
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
                            {t('factCheck:landing.moreResultsAvailable', { count: results.results.length - 2 })}
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
                    {t('factCheck:landing.powerfulResultsTitle')}
                  </h4>
                  <p className="text-muted-foreground mb-4 text-sm">
                    {t('factCheck:landing.powerfulResultsDescription')}
                  </p>
                  <Button 
                    onClick={handleSignUpAfterTrial}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 font-semibold"
                  >
                    {t('factCheck:landing.getFullAccess')}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('factCheck:landing.noCardRequired')}
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
                {t('factCheck:landing.triedAllFree')}
              </h4>
              <p className="text-muted-foreground mb-4 text-sm">
                {t('factCheck:landing.readyToUnlock')}
              </p>
              <Button 
                onClick={handleSignUpAfterTrial}
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                {t('factCheck:landing.signUpUnlimited')}
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