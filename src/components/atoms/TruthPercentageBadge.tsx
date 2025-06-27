'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface TruthPercentageBadgeProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'detailed' | 'minimal';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
  animated?: boolean;
}

/**
 * Truth Percentage Badge Atom Component
 * Displays truth percentage with appropriate colors and styling
 * Follows accessibility and design system guidelines
 */
export function TruthPercentageBadge({
  percentage,
  size = 'md',
  variant = 'default',
  showIcon = true,
  showLabel = false,
  className,
  animated = false,
}: TruthPercentageBadgeProps) {
  
  const getPercentageColor = (percentage: number) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    if (percentage >= 40) return 'destructive';
    return 'secondary';
  };

  const getPercentageIcon = (percentage: number) => {
    if (percentage >= 80) return CheckCircle;
    if (percentage >= 60) return AlertTriangle;
    if (percentage >= 40) return XCircle;
    return HelpCircle;
  };

  const getPercentageText = (percentage: number) => {
    if (percentage >= 80) return 'Highly Accurate';
    if (percentage >= 60) return 'Mostly Accurate';
    if (percentage >= 40) return 'Mixed Results';
    return 'Requires Caution';
  };

  const getColorClasses = (percentage: number) => {
    if (percentage >= 80) {
      return {
        bg: 'bg-green-500/10 hover:bg-green-500/20',
        text: 'text-green-700 dark:text-green-400',
        border: 'border-green-500/20',
        icon: 'text-green-600',
      };
    }
    if (percentage >= 60) {
      return {
        bg: 'bg-yellow-500/10 hover:bg-yellow-500/20',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-500/20',
        icon: 'text-yellow-600',
      };
    }
    if (percentage >= 40) {
      return {
        bg: 'bg-orange-500/10 hover:bg-orange-500/20',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-500/20',
        icon: 'text-orange-600',
      };
    }
    return {
      bg: 'bg-red-500/10 hover:bg-red-500/20',
      text: 'text-red-700 dark:text-red-400',
      border: 'border-red-500/20',
      icon: 'text-red-600',
    };
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1 gap-1';
      case 'lg':
        return 'text-base px-4 py-2 gap-2';
      default:
        return 'text-sm px-3 py-1.5 gap-1.5';
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

  const colors = getColorClasses(percentage);
  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);
  const Icon = getPercentageIcon(percentage);

  if (variant === 'minimal') {
    return (
      <span 
        className={cn(
          'inline-flex items-center font-semibold',
          colors.text,
          size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
          className
        )}
      >
        {percentage}%
      </span>
    );
  }

  if (variant === 'detailed') {
    return (
      <div 
        className={cn(
          'inline-flex flex-col items-center rounded-lg border p-3 space-y-1',
          colors.bg,
          colors.border,
          animated && 'transition-all duration-200 hover:scale-105',
          className
        )}
      >
        {showIcon && (
          <Icon className={cn('h-6 w-6', colors.icon)} />
        )}
        <div className={cn('text-2xl font-bold', colors.text)}>
          {percentage}%
        </div>
        {showLabel && (
          <div className={cn('text-xs text-center', colors.text, 'opacity-80')}>
            {getPercentageText(percentage)}
          </div>
        )}
      </div>
    );
  }

  return (
    <Badge
      className={cn(
        'inline-flex items-center font-semibold border',
        colors.bg,
        colors.text,
        colors.border,
        sizeClasses,
        animated && 'transition-all duration-200 hover:scale-105',
        className
      )}
    >
      {showIcon && (
        <Icon className={cn(iconSize, colors.icon)} />
      )}
      <span>{percentage}%</span>
      {showLabel && size !== 'sm' && (
        <span className="hidden sm:inline ml-1 opacity-80">
          {getPercentageText(percentage)}
        </span>
      )}
    </Badge>
  );
} 