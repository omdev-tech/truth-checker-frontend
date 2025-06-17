'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsageProgressBar } from '@/components/atoms/UsageProgressBar';
import { PlanBadge } from '@/components/atoms/PlanBadge';
import { Activity, Clock, CreditCard } from 'lucide-react';
import { UsageStats } from '@/lib/types';
import { cn } from '@/lib/utils';

interface UsageOverviewProps {
  usageStats: UsageStats;
  className?: string;
}

export const UsageOverview: React.FC<UsageOverviewProps> = ({
  usageStats,
  className,
}) => {
  const { current_period, usage_percentage, plan_info } = usageStats;

  const formatNextReset = (resetDate: string | null) => {
    if (!resetDate) return 'N/A';
    const date = new Date(resetDate);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Usage Overview</CardTitle>
        <PlanBadge plan={plan_info.tier} size="sm" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Requests Usage */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Requests</span>
          </div>
          <UsageProgressBar
            value={current_period.requests_used}
            max={current_period.requests_limit}
            showValues
            showPercentage
            size="md"
          />
        </div>

        {/* Hours Usage (if applicable) */}
        {current_period.hours_limit > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Processing Hours</span>
            </div>
            <UsageProgressBar
              value={current_period.hours_used}
              max={current_period.hours_limit}
              showValues
              showPercentage
              size="md"
            />
          </div>
        )}

        {/* Credits Remaining */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Credits Remaining</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-foreground">
              {current_period.credits_remaining.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              of {current_period.requests_limit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Plan Info */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium capitalize">{plan_info.name}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Billing Cycle</span>
            <span className="font-medium capitalize">{plan_info.billing_cycle}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next Reset</span>
            <span className="font-medium">{formatNextReset(plan_info.next_reset)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Currency</span>
            <span className="font-medium">{plan_info.currency}</span>
          </div>
        </div>

        {/* Recommendations */}
        {usageStats.recommendations.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Recommendations
            </h4>
            <ul className="space-y-1">
              {usageStats.recommendations.map((recommendation, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 