 'use client';

import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UsageProgressBarProps {
  value: number;
  max: number;
  label?: string;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  showValues?: boolean;
  className?: string;
}

const variantColors = {
  default: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
};

const getVariantFromPercentage = (percentage: number): keyof typeof variantColors => {
  if (percentage >= 90) return 'danger';
  if (percentage >= 75) return 'warning';
  if (percentage >= 50) return 'default';
  return 'success';
};

export const UsageProgressBar: React.FC<UsageProgressBarProps> = ({
  value,
  max,
  label,
  variant,
  size = 'md',
  showPercentage = true,
  showValues = false,
  className,
}) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const autoVariant = variant || getVariantFromPercentage(percentage);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {(label || showPercentage || showValues) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className={cn('font-medium text-muted-foreground', textSizes[size])}>
              {label}
            </span>
          )}
          <div className={cn('text-right', textSizes[size])}>
            {showValues && (
              <span className="text-muted-foreground">
                {value.toLocaleString()} / {max.toLocaleString()}
              </span>
            )}
            {showPercentage && (
              <span className={cn('font-medium ml-2', {
                'text-red-600': autoVariant === 'danger',
                'text-yellow-600': autoVariant === 'warning',
                'text-blue-600': autoVariant === 'default',
                'text-green-600': autoVariant === 'success',
              })}>
                {percentage.toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      )}
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className={cn('w-full', sizeClasses[size])}
        />
        <div 
          className={cn(
            'absolute top-0 left-0 h-full rounded-full transition-all duration-300',
            variantColors[autoVariant]
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};