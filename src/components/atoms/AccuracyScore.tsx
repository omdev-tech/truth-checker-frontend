import { cn } from '@/lib/utils';

interface AccuracyScoreProps {
  percentage: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AccuracyScore({ percentage, className, size = 'md' }: AccuracyScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    if (score >= 40) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const sizeConfig = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center rounded-full font-semibold',
        getScoreColor(percentage),
        getBgColor(percentage),
        sizeConfig[size],
        className
      )}
    >
      {percentage.toFixed(1)}%
    </div>
  );
} 