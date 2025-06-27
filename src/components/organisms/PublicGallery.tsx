'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicGalleryMediaCard } from '@/components/molecules/PublicGalleryMediaCard';
import { PublicContentSearchFilter } from '@/components/molecules/PublicContentSearchFilter';
import { PublicContentDetailModal } from '@/components/organisms/PublicContentDetailModal';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { 
  PublicContent, 
  PublicContentFilters, 
  PublicContentListResponse,
  FeaturedContentResponse,
  PublicContentDetailResponse 
} from '@/lib/types/public-content';
import PublicContentApi from '@/lib/services/publicContentApi';
import { 
  AlertCircle, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Clock,
  Grid3X3,
  List,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface PublicGalleryProps {
  onContentClick?: (content: PublicContent) => void;
  showFeaturedSection?: boolean;
  showSearchFilter?: boolean;
  initialFilters?: PublicContentFilters;
  variant?: 'full' | 'compact' | 'embedded';
  className?: string;
}

/**
 * Public Gallery Organism Component
 * Complete gallery experience with featured content, search, filtering, and infinite scroll
 * Main component for browsing public fact-checked content
 */
export function PublicGallery({
  onContentClick,
  showFeaturedSection = true,
  showSearchFilter = true,
  initialFilters = { limit: 12, offset: 0, sort_by: 'created_at', sort_direction: 'desc' },
  variant = 'full',
  className,
}: PublicGalleryProps) {
  
  // State management
  const [content, setContent] = useState<PublicContent[]>([]);
  const [featuredContent, setFeaturedContent] = useState<FeaturedContentResponse | null>(null);
  const [filters, setFilters] = useState<PublicContentFilters>(initialFilters);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedContent, setSelectedContent] = useState<PublicContent | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  // Load initial data
  useEffect(() => {
    loadFeaturedContent();
    loadContent(true);
  }, []);

  // Reload content when filters change
  useEffect(() => {
    loadContent(true);
  }, [filters]);

  const loadFeaturedContent = async () => {
    if (!showFeaturedSection) return;
    
    try {
      const featured = await PublicContentApi.getFeaturedContent();
      setFeaturedContent(featured);
    } catch (error) {
      console.error('Failed to load featured content:', error);
    }
  };

  const loadContent = async (reset = false) => {
    const loadingType = reset ? setIsLoading : setIsLoadingMore;
    loadingType(true);
    setError(null);

    try {
      const currentFilters = reset ? { ...filters, offset: 0 } : filters;
      const response = await PublicContentApi.getPublicContent(currentFilters);
      
      if (reset) {
        setContent(response.content);
        setAvailableCategories(response.categories);
      } else {
        setContent(prev => [...prev, ...response.content]);
      }
      
      setHasMore(response.has_more);
      
      if (!reset) {
        setFilters(prev => ({ ...prev, offset: (prev.offset || 0) + (prev.limit || 12) }));
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      setError('Failed to load content. Please try again.');
      toast.error('Failed to load content');
    } finally {
      loadingType(false);
    }
  };

  const handleContentClick = async (selectedContent: PublicContent) => {
    // Track view
    try {
      await PublicContentApi.trackContentView({ content_id: selectedContent.id });
    } catch (error) {
      console.error('Failed to track content view:', error);
    }

    if (onContentClick) {
      onContentClick(selectedContent);
    } else {
      setSelectedContent(selectedContent);
    }
  };

  const handleFiltersChange = useCallback((newFilters: PublicContentFilters) => {
    setFilters(newFilters);
  }, []);

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadContent(false);
    }
  };

  const handleRefresh = () => {
    loadContent(true);
    if (showFeaturedSection) {
      loadFeaturedContent();
    }
  };

  const handleContentView = (contentId: string) => {
    const foundContent = allContent.find(item => item.id === contentId);
    if (foundContent) {
      handleContentClick(foundContent);
    }
  };

  const handleContentPlay = (contentId: string) => {
    // Optional: could add specific play tracking here
    handleContentView(contentId);
  };

  const handleContentAnalyze = (contentId: string) => {
    const foundContent = allContent.find(item => item.id === contentId);
    if (foundContent) {
      // Track view
      PublicContentApi.trackContentView({ content_id: foundContent.id }).catch(error => {
        console.error('Failed to track content view:', error);
      });
      
      // Set content and open analysis mode
      setSelectedContent(foundContent);
      setShowAnalysis(true);
    }
  };

  // Combine all content for easier lookup
  const allContent = [
    ...content,
    ...(featuredContent?.featured || []),
    ...(featuredContent?.recent || []),
    ...(featuredContent?.popular || [])
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-4", className)}>
        {showSearchFilter && (
          <PublicContentSearchFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableCategories={availableCategories}
            showAdvancedFilters={false}
          />
        )}
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {content.map((item) => (
            <motion.div key={item.id} variants={itemVariants}>
              <PublicGalleryMediaCard
                content={item}
                onView={handleContentView}
                onAnalyze={handleContentAnalyze}
                compact={true}
              />
            </motion.div>
          ))}
        </motion.div>

        {isLoading && (
          <div className="flex justify-center p-8">
            <LoadingSpinner size="lg" />
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="flex justify-center">
            <Button onClick={handleLoadMore} disabled={isLoadingMore}>
              {isLoadingMore ? <LoadingSpinner size="sm" className="mr-2" /> : null}
              Load More
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-8", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Public Gallery</h1>
          <p className="text-muted-foreground mt-1">
            Explore fact-checked content from our community
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Featured Content Section */}
      {showFeaturedSection && featuredContent && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                Featured Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {featuredContent.featured.slice(0, 3).map((item) => (
                  <PublicGalleryMediaCard
                    key={item.id}
                    content={item}
                    onView={handleContentView}
                    onAnalyze={handleContentAnalyze}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      )}

      {/* Quick Stats */}
      {featuredContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="flex items-center p-4">
              <TrendingUp className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{featuredContent.popular.length}</div>
                <div className="text-sm text-muted-foreground">Trending</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <Clock className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">{featuredContent.recent.length}</div>
                <div className="text-sm text-muted-foreground">Recent</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center p-4">
              <Eye className="h-8 w-8 text-purple-500 mr-3" />
              <div>
                <div className="text-2xl font-bold">
                  {content.reduce((total, item) => total + item.view_count, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filters */}
      {showSearchFilter && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PublicContentSearchFilter
            filters={filters}
            onFiltersChange={handleFiltersChange}
            availableCategories={availableCategories}
            showAdvancedFilters={true}
          />
        </motion.div>
      )}

      {/* Content Grid */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          <div className="flex justify-center p-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <Card className="p-8">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Content</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        ) : content.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Content Found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or filters
              </p>
              <Button variant="outline" onClick={() => handleFiltersChange(initialFilters)}>
                Clear Filters
              </Button>
            </div>
          </Card>
        ) : (
          <div className={cn(
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          )}>
            {content.map((item) => (
              <motion.div key={item.id} variants={itemVariants}>
                <PublicGalleryMediaCard
                  content={item}
                  onView={handleContentView}
                  onAnalyze={handleContentAnalyze}
                  compact={viewMode === 'list'}
                />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Load More */}
      {hasMore && content.length > 0 && (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            onClick={handleLoadMore} 
            disabled={isLoadingMore}
            className="min-w-32"
          >
            {isLoadingMore ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </Button>
        </motion.div>
      )}

      {/* Content Detail Modal */}
      <PublicContentDetailModal
        content={selectedContent}
        isOpen={!!selectedContent}
        showAnalysis={showAnalysis}
        onClose={() => {
          setSelectedContent(null);
          setShowAnalysis(false);
        }}
      />
    </div>
  );
} 