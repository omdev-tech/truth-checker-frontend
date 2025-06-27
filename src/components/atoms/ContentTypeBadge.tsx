'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Video, Headphones, Radio, Mic, FileText } from 'lucide-react';

export type ContentType = 'video' | 'audio' | 'stream' | 'live_recording' | 'text';

interface ContentTypeBadgeProps {
  type: ContentType;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'minimal';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

/**
 * Content Type Badge Atom Component
 * Displays content type with appropriate icon and styling
 * Used to indicate the type of media content
 */
export function ContentTypeBadge({
  type,
  size = 'md',
  variant = 'default',
  showIcon = true,
  showLabel = true,
  className,
}: ContentTypeBadgeProps) {

  const getTypeConfig = (type: ContentType) => {
    switch (type) {
      case 'video':
        return {
          icon: Video,
          label: 'Video',
          color: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400',
          iconColor: 'text-blue-600',
        };
      case 'audio':
        return {
          icon: Headphones,
          label: 'Audio',
          color: 'bg-purple-500/10 text-purple-700 border-purple-500/20 dark:text-purple-400',
          iconColor: 'text-purple-600',
        };
      case 'stream':
        return {
          icon: Radio,
          label: 'Stream',
          color: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400',
          iconColor: 'text-red-600',
        };
      case 'live_recording':
        return {
          icon: Mic,
          label: 'Live Recording',
          color: 'bg-green-500/10 text-green-700 border-green-500/20 dark:text-green-400',
          iconColor: 'text-green-600',
        };
      case 'text':
        return {
          icon: FileText,
          label: 'Text',
          color: 'bg-gray-500/10 text-gray-700 border-gray-500/20 dark:text-gray-400',
          iconColor: 'text-gray-600',
        };
      default:
        return {
          icon: FileText,
          label: 'Unknown',
          color: 'bg-gray-500/10 text-gray-700 border-gray-500/20 dark:text-gray-400',
          iconColor: 'text-gray-600',
        };
    }
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

  const config = getTypeConfig(type);
  const sizeClasses = getSizeClasses(size);
  const iconSize = getIconSize(size);
  const Icon = config.icon;

  if (variant === 'minimal') {
    return (
      <span className={cn(
        'inline-flex items-center gap-1 font-medium',
        config.color.split(' ').filter(c => c.includes('text')).join(' '),
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm',
        className
      )}>
        {showIcon && <Icon className={cn(iconSize, config.iconColor)} />}
        {showLabel && <span>{config.label}</span>}
      </span>
    );
  }

  const badgeClasses = variant === 'outline' 
    ? `border ${config.color}`
    : config.color;

  return (
    <Badge 
      className={cn(
        'inline-flex items-center font-medium',
        badgeClasses,
        sizeClasses,
        className
      )}
      variant={variant === 'outline' ? 'outline' : 'default'}
    >
      {showIcon && (
        <Icon className={cn(iconSize, config.iconColor)} />
      )}
      {showLabel && <span>{config.label}</span>}
    </Badge>
  );
} 