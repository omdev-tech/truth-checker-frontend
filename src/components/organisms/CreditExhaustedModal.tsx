'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Crown, 
  ArrowRight, 
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditExhaustedModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRemaining?: number;
  creditsNeeded?: number;
  actionType?: string;
  className?: string;
}

export function CreditExhaustedModal({
  isOpen,
  onClose,
  creditsRemaining = 0,
  creditsNeeded = 1,
  actionType = 'fact_check',
  className
}: CreditExhaustedModalProps) {
  const { t } = useTranslation(['common', 'dashboard']);
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push('/plans');
  };

  const handleViewPlans = () => {
    onClose();
    router.push('/plans');
  };

  const getActionName = (action: string) => {
    switch (action) {
      case 'fact_check':
        return t('common:actions.factCheck');
      case 'transcription':
        return t('common:actions.transcription');
      case 'live_stream':
        return t('common:actions.liveStream');
      default:
        return t('common:actions.action');
    }
  };

  const benefits = [
    {
      icon: CheckCircle,
      text: t('common:creditExhausted.benefits.unlimitedChecks')
    },
    {
      icon: Zap,
      text: t('common:creditExhausted.benefits.fasterProcessing')
    },
    {
      icon: Target,
      text: t('common:creditExhausted.benefits.advancedFeatures')
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[500px] p-0 overflow-hidden bg-background border",
        className
      )}>
        {/* Header with clean background */}
        <div className="bg-primary text-primary-foreground p-6 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary-foreground/20 p-2 rounded-lg">
              <Crown className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
              <Clock className="h-3 w-3 mr-1" />
              {t('common:creditExhausted.badges.upgradeNeeded')}
            </Badge>
          </div>
          
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-bold text-primary-foreground">
              {t('common:creditExhausted.title')}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/90 text-base">
              {t('common:creditExhausted.description', {
                action: getActionName(actionType),
                creditsNeeded,
                creditsRemaining
              })}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-6 pt-4 space-y-6">
          {/* Usage Stats */}
          <div className="bg-muted/50 rounded-lg p-4 border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('common:creditExhausted.usage.current')}</span>
              <span className="text-sm text-muted-foreground">
                {creditsRemaining} {t('common:creditExhausted.usage.creditsRemaining')}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-orange-500 h-2.5 rounded-full transition-all duration-300"
                style={{ width: creditsRemaining === 0 ? '100%' : '85%' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('common:creditExhausted.usage.nextAction', { 
                credits: creditsNeeded,
                action: getActionName(actionType)
              })}
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h4 className="font-medium text-center text-foreground">
              {t('common:creditExhausted.upgradeWillUnlock')}
            </h4>
            <div className="space-y-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors border">
                  <div className="bg-primary/10 p-1.5 rounded-full">
                    <benefit.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing hint */}
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/50 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              {t('common:creditExhausted.pricingHint')}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {t('common:creditExhausted.startingFrom')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-0 flex-col sm:flex-col gap-3">
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all duration-200"
            size="lg"
          >
            <Crown className="h-4 w-4 mr-2" />
            {t('common:creditExhausted.actions.upgradeNow')}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              onClick={handleViewPlans}
              className="flex-1"
            >
              {t('common:creditExhausted.actions.viewPlans')}
            </Button>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="flex-1"
            >
              {t('common:creditExhausted.actions.maybeLater')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 