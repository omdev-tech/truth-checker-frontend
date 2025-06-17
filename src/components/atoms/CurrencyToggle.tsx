'use client';

import { Button } from '@/components/ui/button';
import { Euro, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrencyToggleProps {
  currency: 'EUR' | 'USD';
  onCurrencyChange: (currency: 'EUR' | 'USD') => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export const CurrencyToggle: React.FC<CurrencyToggleProps> = ({
  currency,
  onCurrencyChange,
  size = 'md',
  variant = 'outline',
  className,
}) => {
  const sizeClasses = {
    sm: 'h-8 px-2 text-xs',
    md: 'h-10 px-3 text-sm',
    lg: 'h-12 px-4 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <div className={cn('flex items-center rounded-md border bg-background', className)}>
      <Button
        variant={currency === 'EUR' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onCurrencyChange('EUR')}
        className={cn(
          'rounded-r-none border-r-0',
          sizeClasses[size],
          currency === 'EUR' ? 'bg-primary text-primary-foreground' : ''
        )}
      >
        <Euro className={cn('mr-1', iconSizes[size])} />
        EUR
      </Button>
      <Button
        variant={currency === 'USD' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onCurrencyChange('USD')}
        className={cn(
          'rounded-l-none',
          sizeClasses[size],
          currency === 'USD' ? 'bg-primary text-primary-foreground' : ''
        )}
      >
        <DollarSign className={cn('mr-1', iconSizes[size])} />
        USD
      </Button>
    </div>
  );
}; 