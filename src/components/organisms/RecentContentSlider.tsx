'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  PublicContent,
  PublicContentFilters
} from '@/lib/types/public-content';
import PublicContentApi from '@/lib/services/publicContentApi';
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface RecentContentSliderProps {
  limit?: number;
  className?: string;
  onContentClick?: (content: PublicContent) => void;
}

interface ContentVignette {
  id: string;
  title: string;
  thumbnail_url?: string;
  verified_claims: number;
  disputed_claims: number;
  uncertain_claims: number;
  total_claims: number;
  truth_percentage: number;
  view_count: number;
  created_at: string;
}

export function RecentContentSlider({ 
  limit = 20, 
  className,
  onContentClick 
}: RecentContentSliderProps) {
  const { t } = useTranslation(['gallery', 'common']);
  const [recentContent, setRecentContent] = useState<PublicContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4); // Number of items visible at once

  // Responsive visible count
  useEffect(() => {
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1200) {
        setVisibleCount(6);
      } else if (window.innerWidth >= 768) {
        setVisibleCount(4);
      } else if (window.innerWidth >= 640) {
        setVisibleCount(3);
      } else {
        setVisibleCount(2);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  useEffect(() => {
    loadRecentContent();
  }, [limit]);

  const loadRecentContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const filters: PublicContentFilters = {
        limit,
        offset: 0,
        sort_by: 'created_at',
        sort_direction: 'desc'
      };
      
      const response = await PublicContentApi.getPublicContent(filters);
      
      // Filter out featured content and get only recent non-featured content
      const recentNonFeatured = response.content.filter(content => !content.is_featured);
      setRecentContent(recentNonFeatured);
    } catch (error) {
      console.error('Failed to load recent content:', error);
      setError('Failed to load recent content');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    const maxIndex = Math.max(0, recentContent.length - visibleCount);
    setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
  };

  const handleContentClick = (content: PublicContent) => {
    if (onContentClick) {
      onContentClick(content);
    } else {
      window.location.href = `/gallery?content=${content.id}`;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return t('gallery:time.justNow');
    if (diffInHours < 24) return t('gallery:time.hoursAgo', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return t('gallery:time.daysAgo', { count: diffInDays });
    
    return date.toLocaleDateString();
  };

  const getClaimsStatusIcon = (content: PublicContent) => {
    const verified = content.verified_claims || 0;
    const disputed = content.disputed_claims || 0;
    const total = content.total_claims || 1;
    
    if (verified / total > 0.7) {
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    } else if (disputed / total > 0.5) {
      return <XCircle className="h-3 w-3 text-red-500" />;
    } else {
      return <AlertCircle className="h-3 w-3 text-yellow-500" />;
    }
  };

  const getClaimsRatioText = (content: PublicContent) => {
    const verified = content.verified_claims || 0;
    const disputed = content.disputed_claims || 0;
    const total = content.total_claims || 1;
    
    return `${verified}/${total} true`;
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Latest Fact-Checks</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: visibleCount }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-muted rounded-lg aspect-[4/3] mb-2"></div>
              <div className="h-4 bg-muted rounded mb-1"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recentContent.length === 0) {
    return null; // Don't show if there's an error or no content
  }

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < recentContent.length - visibleCount;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Latest Fact-Checks
          </h3>
          <p className="text-sm text-muted-foreground">
            Fresh content from our community
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!canGoNext}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.location.href = '/gallery'}
            className="text-xs"
          >
            View All
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative overflow-hidden">
        <motion.div
          className="flex gap-4"
          animate={{
            x: `${-currentIndex * (100 / visibleCount)}%`
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
          style={{
            width: `${(recentContent.length / visibleCount) * 100}%`
          }}
        >
          {recentContent.map((content) => (
            <motion.div
              key={content.id}
              className="flex-shrink-0"
              style={{ width: `${100 / recentContent.length}%` }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className="cursor-pointer border-0 shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden bg-background"
                onClick={() => handleContentClick(content)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-[4/3] bg-muted overflow-hidden">
                  {content.thumbnail_url ? (
                    <img
                      src={content.thumbnail_url}
                      alt={content.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-primary/60" />
                    </div>
                  )}
                  
                  {/* Overlay with claims info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Claims ratio badge */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant="secondary" 
                        className="bg-black/40 text-white border-0 text-xs backdrop-blur-sm"
                      >
                        <span className="flex items-center gap-1">
                          {getClaimsStatusIcon(content)}
                          {getClaimsRatioText(content)}
                        </span>
                      </Badge>
                      
                      <Badge 
                        variant="outline" 
                        className="bg-black/40 text-white border-white/20 text-xs backdrop-blur-sm"
                      >
                        {content.truth_percentage.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <CardContent className="p-3">
                  <h4 className="font-medium text-sm line-clamp-2 text-foreground mb-2 leading-tight">
                    {content.title}
                  </h4>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(content.created_at)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {content.view_count}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Dots indicator for mobile */}
      <div className="flex justify-center gap-1 sm:hidden">
        {Array.from({ 
          length: Math.ceil(recentContent.length / visibleCount) 
        }).map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              Math.floor(currentIndex / visibleCount) === index
                ? "bg-primary"
                : "bg-muted-foreground/30"
            )}
            onClick={() => setCurrentIndex(index * visibleCount)}
          />
        ))}
      </div>
    </div>
  );
} 