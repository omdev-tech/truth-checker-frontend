'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlanCard } from '@/components/molecules/PlanCard';
import { CurrencyToggle } from '@/components/atoms/CurrencyToggle';
import { truthCheckerApi } from '@/lib/api';
import { PlanConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PlanSelectorProps {
  currentPlan?: string;
  onPlanSelect?: (planId: string, billingCycle: 'monthly' | 'annual') => void;
  className?: string;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  currentPlan,
  onPlanSelect,
  className,
}) => {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<'EUR' | 'USD'>('EUR');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null);

  // Popular plans (can be configured)
  const popularPlans = ['casual', 'independent'];

  useEffect(() => {
    loadPlans();
  }, [currency]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const plansData = await truthCheckerApi.getAvailablePlans(currency);
      setPlans(plansData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanUpgrade = async (planId: string) => {
    if (!onPlanSelect) return;

    try {
      setUpgradingPlan(planId);
      await onPlanSelect(planId, billingCycle);
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setUpgradingPlan(null);
    }
  };

  if (loading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading plans...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="py-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadPlans}
                className="ml-2"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-2xl font-bold">Choose Your Plan</CardTitle>
            <div className="flex items-center gap-4">
              {/* Currency Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Currency:</span>
                <CurrencyToggle
                  currency={currency}
                  onCurrencyChange={setCurrency}
                  size="sm"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center rounded-lg border bg-background p-1">
              <Button
                variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
                className="px-4"
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'annual' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('annual')}
                className="px-4"
              >
                Annual
                <span className="ml-1 text-xs bg-green-100 text-green-700 px-1 rounded">
                  20% OFF
                </span>
              </Button>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={currentPlan === plan.id}
                isPopular={popularPlans.includes(plan.id)}
                billingCycle={billingCycle}
                onUpgrade={() => handlePlanUpgrade(plan.id)}
                upgrading={upgradingPlan === plan.id}
              />
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              All plans include our core fact-checking features and API access.
            </p>
            <p className="text-sm text-muted-foreground">
              Upgrade or downgrade at any time. Unused credits don't expire.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 