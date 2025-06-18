'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlanBadge } from '@/components/atoms/PlanBadge';
import { UpgradeButton } from '@/components/atoms/UpgradeButton';
import { Check, Star, Zap } from 'lucide-react';
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
  earlyDevelopmentDiscount?: number;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  isCurrentPlan = false,
  isPopular = false,
  billingCycle,
  onUpgrade,
  upgrading = false,
  className,
  earlyDevelopmentDiscount = 0,
}) => {
  const originalPrice = billingCycle === 'monthly' ? plan.pricing.monthly : plan.pricing.annual;
  const discountedPrice = earlyDevelopmentDiscount > 0 && originalPrice > 0 
    ? originalPrice * (1 - earlyDevelopmentDiscount / 100) 
    : originalPrice;
  const price = discountedPrice;
  const monthlyPrice = billingCycle === 'annual' ? price / 12 : price;
  const originalMonthlyPrice = billingCycle === 'annual' ? originalPrice / 12 : originalPrice;

  const formatPrice = (amount: number) => {
    if (amount === 0) return 'Free';
    return `${plan.pricing.currency === 'EUR' ? '€' : '$'}${amount.toFixed(2)}`;
  };

  const formatMonthlyPrice = (amount: number) => {
    if (amount === 0) return 'Free';
    return `${plan.pricing.currency === 'EUR' ? '€' : '$'}${amount.toFixed(2)}/month`;
  };

  const hasDiscount = earlyDevelopmentDiscount > 0 && originalPrice > 0;

  return (
    <Card 
      className={cn(
        'relative w-full transition-all duration-200 hover:shadow-lg',
        isPopular && 'border-primary shadow-md',
        isCurrentPlan && 'ring-2 ring-primary ring-offset-2',
        hasDiscount && 'border-orange-300 shadow-orange-100 dark:border-orange-700 dark:shadow-orange-950',
        className
      )}
    >
      {/* Early Development Discount Badge */}
      {hasDiscount && (
        <div className="absolute -top-3 left-4">
          <Badge className="bg-orange-500 text-white px-3 py-1 shadow-lg">
            <Zap className="h-3 w-3 mr-1" />
            {earlyDevelopmentDiscount}% OFF
          </Badge>
        </div>
      )}

      {/* Popular Badge */}
      {isPopular && (
        <div className={cn(
          "absolute -top-3 transform -translate-x-1/2",
          hasDiscount ? "right-4" : "left-1/2"
        )}>
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
          {hasDiscount ? (
            // Discounted pricing display
            <div className="space-y-1">
              <div className="text-lg text-muted-foreground line-through">
                {formatPrice(originalPrice)}
              </div>
              <div className="text-3xl font-bold text-orange-600">
                {formatPrice(price)}
              </div>
              <div className="text-xs text-orange-600 font-medium">
                Save {formatPrice(originalPrice - price)} ({earlyDevelopmentDiscount}% off)
              </div>
            </div>
          ) : (
            // Regular pricing display
            <div className="text-3xl font-bold text-foreground">
              {formatPrice(price)}
            </div>
          )}
          
          {billingCycle === 'annual' && price > 0 && (
            <div className="text-sm text-muted-foreground">
              {hasDiscount ? (
                <div className="space-y-1">
                  <div className="line-through text-xs">
                    {formatMonthlyPrice(originalMonthlyPrice)} billed annually
                  </div>
                  <div className="text-orange-600 font-medium">
                    {formatMonthlyPrice(monthlyPrice)} billed annually
                  </div>
                </div>
              ) : (
                <div>{formatMonthlyPrice(monthlyPrice)} billed annually</div>
              )}
            </div>
          )}
          
          {billingCycle === 'monthly' && price > 0 && !hasDiscount && (
            <div className="text-sm text-muted-foreground">per month</div>
          )}
          
          {billingCycle === 'annual' && plan.pricing.annual_discount > 0 && !hasDiscount && (
            <div className="text-sm text-green-600 font-medium">
              Save {plan.pricing.annual_discount}% annually
            </div>
          )}
          
          {hasDiscount && (
            <div className="text-sm text-orange-600 font-medium bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-md">
              🚀 Early Adopter Price
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

        {/* Early Development Bonus Features */}
        {hasDiscount && (
          <div className="space-y-2 border-t pt-4">
            <div className="text-sm font-medium text-orange-600">🎁 Early Adopter Bonus:</div>
            <ul className="space-y-1">
              <li className="flex items-start gap-2 text-sm text-orange-600">
                <Check className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span>Price locked for life</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-orange-600">
                <Check className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-orange-600">
                <Check className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <span>Exclusive beta features</span>
              </li>
            </ul>
          </div>
        )}

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
              variant={hasDiscount ? 'premium' : isPopular ? 'premium' : 'default'}
              fullWidth
              disabled={!onUpgrade}
            >
              {plan.pricing.monthly === 0 ? 'Get Started' : hasDiscount ? `Get ${earlyDevelopmentDiscount}% Off` : 'Upgrade Now'}
            </UpgradeButton>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 