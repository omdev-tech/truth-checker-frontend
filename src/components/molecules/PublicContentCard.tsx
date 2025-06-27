'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TruthPercentageBadge } from '@/components/atoms/TruthPercentageBadge';
import { ContentTypeBadge } from '@/components/atoms/ContentTypeBadge';
import { ViewCountDisplay } from '@/components/atoms/ViewCountDisplay';
import { PublicContent } from '@/lib/types/public-content';
import { Play, Clock, Calendar, Star } from 'lucide-react';

interface PublicContentCardProps {
  content: PublicContent;
  onClick?: (content: PublicContent) => void;
  variant?: 'default' | 'compact' | 'featured';
  showThumbnail?: boolean;
  showMetadata?: boolean;
  className?: string;
  animated?: boolean;
}

/**
 * Public Content Card Molecule Component
 * Beautiful card displaying public content with all metadata
 * Combines multiple atoms for cohesive presentation
 */
export function PublicContentCard({
  content,
  onClick,
  variant = 'default',
  showThumbnail = true,
  showMetadata = true,
  className,
  animated = true,
}: PublicContentCardProps) {

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategory = (): string => {
    return content.content_metadata?.category || 'General';
  };

  const getThumbnailUrl = (): string => {
    return content.thumbnail_url || `/api/placeholder/400/240?text=${encodeURIComponent(content.title)}`;
  };

  const handleClick = () => {
    if (onClick) {
      onClick(content);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    hover: { 
      y: -4,
      transition: { duration: 0.2, ease: "easeOut" }
    }
  };

  if (variant === 'compact') {
    return (
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        whileHover={animated ? "hover" : undefined}
        className={cn("cursor-pointer", className)}
        onClick={handleClick}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
          <div className="flex">
            {showThumbnail && (
              <div className="relative w-24 h-16 flex-shrink-0">
                <img
                  src={getThumbnailUrl()}
                  alt={content.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
            <CardContent className="flex-1 p-3">
              <div className="space-y-1">
                <h3 className="font-semibold text-sm line-clamp-1">
                  {content.title}
                </h3>
                <div className="flex items-center justify-between">
                  <TruthPercentageBadge 
                    percentage={content.truth_percentage} 
                    size="sm" 
                    variant="minimal"
                  />
                  <ViewCountDisplay 
                    count={content.view_count} 
                    size="sm" 
                    variant="minimal"
                  />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  if (variant === 'featured') {
    return (
      <motion.div
        variants={animated ? cardVariants : undefined}
        initial={animated ? "hidden" : undefined}
        animate={animated ? "visible" : undefined}
        whileHover={animated ? "hover" : undefined}
        className={cn("cursor-pointer", className)}
        onClick={handleClick}
      >
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-primary/20">
          <div className="relative">
            {content.is_featured && (
              <Badge className="absolute top-3 left-3 z-10 bg-yellow-500 text-yellow-900">
                <Star className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {showThumbnail && (
              <div className="relative h-48 overflow-hidden">
                <img
                  src={getThumbnailUrl()}
                  alt={content.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <TruthPercentageBadge 
                    percentage={content.truth_percentage} 
                    size="lg" 
                    variant="detailed"
                    animated
                  />
                </div>
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="h-12 w-12 text-white" />
                </div>
              </div>
            )}
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-xl line-clamp-2 flex-1">
                    {content.title}
                  </h3>
                  <ContentTypeBadge 
                    type={content.content_type} 
                    size="sm"
                    variant="outline"
                  />
                </div>
                
                <p className="text-muted-foreground line-clamp-3">
                  {content.description}
                </p>

                {showMetadata && (
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(content.created_at)}
                      </div>
                      {content.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(content.duration)}
                        </div>
                      )}
                    </div>
                    <ViewCountDisplay 
                      count={content.view_count} 
                      size="sm"
                      animated
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Default variant
  return (
    <motion.div
      variants={animated ? cardVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
      whileHover={animated ? "hover" : undefined}
      className={cn("cursor-pointer", className)}
      onClick={handleClick}
    >
      <Card className="overflow-hidden hover:shadow-lg transition-all duration-200">
        {showThumbnail && (
          <div className="relative h-40 overflow-hidden">
            <img
              src={getThumbnailUrl()}
              alt={content.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3">
              <TruthPercentageBadge 
                percentage={content.truth_percentage} 
                size="sm"
                animated
              />
            </div>
            <div className="absolute top-3 right-3">
              <ContentTypeBadge 
                type={content.content_type} 
                size="sm"
                variant="outline"
              />
            </div>
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Play className="h-8 w-8 text-white" />
            </div>
          </div>
        )}
        
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-2 mb-1">
                {content.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {content.description}
              </p>
            </div>

            {showMetadata && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{formatDate(content.created_at)}</span>
                  {content.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(content.duration)}
                    </span>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {getCategory()}
                  </Badge>
                </div>
                <ViewCountDisplay 
                  count={content.view_count} 
                  size="sm" 
                  variant="minimal"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 