'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanBadge } from '@/components/atoms/PlanBadge';
import { UpgradeButton } from '@/components/atoms/UpgradeButton';
import { Check, Star } from 'lucide-react';
import { PlanConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PlanCardProps {
  plan: PlanConfig;
  isCurrentPlan?: boolean;
  isPopular?: boolean;
  billingCycle: 'monthly' | 'annual';
  onUpgrade?: () => void;
  upgrading?: boolean;
  className?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrentPlan = false,
  isPopular = false,
  billingCycle,
  onUpgrade,
  upgrading = false,
  className,
}) => {
  const price = billingCycle === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
  const monthlyPrice = billingCycle === 'annual' ? price / 12 : price;

  const formatPrice = (amount: number) => {
    if (amount === 0) return 'Free';
    return `${plan.pricing.currency === 'EUR' ? '€' : '$'}${amount.toFixed(2)}`;
  };

  const formatMonthlyPrice = (amount: number) => {
    if (amount === 0) return 'Free';
    return `${plan.pricing.currency === 'EUR' ? '€' : '$'}${amount.toFixed(2)}/month`;
  };

  return (
    <Card 
      className={cn(
        'relative w-full transition-all duration-200 hover:shadow-lg',
        isPopular && 'border-primary shadow-md',
        isCurrentPlan && 'ring-2 ring-primary ring-offset-2',
        className
      )}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary">Current Plan</Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <PlanBadge plan={plan.type} size="lg" />
        </div>
        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
        
        {/* Pricing */}
        <div className="space-y-1">
          <div className="text-3xl font-bold text-foreground">
            {formatPrice(price)}
          </div>
          {billingCycle === 'annual' && price > 0 && (
            <div className="text-sm text-muted-foreground">
              {formatMonthlyPrice(monthlyPrice)} billed annually
            </div>
          )}
          {billingCycle === 'monthly' && price > 0 && (
            <div className="text-sm text-muted-foreground">per month</div>
          )}
          {billingCycle === 'annual' && plan.pricing.annual_discount > 0 && (
            <div className="text-sm text-green-600 font-medium">
              Save {plan.pricing.annual_discount}% annually
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Limits */}
        <div className="space-y-2">
          <div className="text-sm font-medium">What's included:</div>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span>{plan.limits.requests_per_month.toLocaleString()} requests/month</span>
            </div>
            {plan.limits.hours_per_month > 0 && (
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <span>{plan.limits.hours_per_month.toLocaleString()} hours processing</span>
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <div className="text-sm font-medium">Features:</div>
          <ul className="space-y-1">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {isCurrentPlan ? (
            <div className="text-center py-2 text-sm text-muted-foreground">
              Your current plan
            </div>
          ) : (
            <UpgradeButton
              onClick={onUpgrade || (() => {})}
              loading={upgrading}
              variant={isPopular ? 'premium' : 'default'}
              fullWidth
              disabled={!onUpgrade}
            >
              {plan.pricing.monthly === 0 ? 'Get Started' : 'Upgrade Now'}
            </UpgradeButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 