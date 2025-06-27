'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Eye, Users } from 'lucide-react';

interface ViewCountDisplayProps {
  count: number;
  variant?: 'default' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

/**
 * View Count Display Atom Component
 * Displays view counts with proper formatting and accessibility
 * Follows design system guidelines
 */
export function ViewCountDisplay({
  count,
  variant = 'default',
  size = 'md',
  showIcon = true,
  showLabel = false,
  className,
  animated = false,
}: ViewCountDisplayProps) {

  const formatViewCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K`;
    }
    return count.toString();
  };

  const getFullCount = (count: number): string => {
    return count.toLocaleString();
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs gap-1';
      case 'lg':
        return 'text-base gap-2';
      default:
        return 'text-sm gap-1.5';
    }
  };

  const getIconSize = (size: string) => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);
  const formattedCount = formatViewCount(count);
  const fullCount = getFullCount(count);

  if (variant === 'minimal') {
    return (
      <span 
        className={cn(
          'inline-flex items-center text-muted-foreground font-medium',
          sizeClasses,
          animated && 'transition-colors duration-200',
          className
        )}
        title={`${fullCount} views`}
      >
        {showIcon && <Eye className={cn(iconSize)} />}
        <span>{formattedCount}</span>
        {showLabel && size !== 'sm' && (
          <span className="hidden sm:inline">
            {count === 1 ? 'view' : 'views'}
          </span>
        )}
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div 
        className={cn(
          'inline-flex flex-col items-center space-y-1 p-2 rounded-lg bg-muted/50',
          animated && 'transition-all duration-200 hover:bg-muted',
          className
        )}
        title={`${fullCount} views`}
      >
        {showIcon && (
          <Users className={cn('h-5 w-5 text-muted-foreground')} />
        )}
        <div className="text-center">
          <div className="font-semibold text-foreground">
            {formattedCount}
          </div>
          <div className="text-xs text-muted-foreground">
            {count === 1 ? 'view' : 'views'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'inline-flex items-center text-muted-foreground font-medium',
        sizeClasses,
        animated && 'transition-colors duration-200 hover:text-foreground',
        className
      )}
      title={`${fullCount} views`}
    >
      {showIcon && <Eye className={cn(iconSize)} />}
      <span>{formattedCount}</span>
      {showLabel && size !== 'sm' && (
        <span className="hidden sm:inline">
          {count === 1 ? 'view' : 'views'}
        </span>
      )}
    </div>
  );
} 