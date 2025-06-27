'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PublicContentCard } from '@/components/molecules/PublicContentCard';
import { TruthPercentageBadge } from '@/components/atoms/TruthPercentageBadge';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { 
  PublicContent, 
  FeaturedContentResponse 
} from '@/lib/types/public-content';
import PublicContentApi from '@/lib/services/publicContentApi';
import { 
  ArrowRight, 
  Eye, 
  Sparkles, 
  CheckCircle,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PublicGallerySectionProps {
  className?: string;
}

/**
 * Public Gallery Landing Section Component
 * Showcases featured public content on the landing page
 * Encourages users to explore the full gallery
 */
export function PublicGallerySection({ className }: PublicGallerySectionProps) {
  const { t } = useTranslation(['common', 'factCheck']);
  const [featuredContent, setFeaturedContent] = useState<FeaturedContentResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeaturedContent();
  }, []);

  const loadFeaturedContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PublicContentApi.getFeaturedContent();
      setFeaturedContent(response);
    } catch (error) {
      console.error('Failed to load featured content:', error);
      setError('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewGallery = () => {
    window.location.href = '/gallery';
  };

  const handleContentClick = (content: PublicContent) => {
    // Track view and navigate to gallery with content selected
    PublicContentApi.trackContentView({ content_id: content.id })
      .catch(error => console.error('Failed to track view:', error));
    
    window.location.href = `/gallery?content=${content.id}`;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4 }
    }
  };

  if (isLoading) {
    return (
      <section className={`py-20 bg-gradient-to-b from-background to-muted/30 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </section>
    );
  }

  if (error || !featuredContent || featuredContent.featured.length === 0) {
    return null; // Don't show section if there's no content
  }

  const totalViews = [
    ...featuredContent.featured,
    ...featuredContent.popular,
    ...featuredContent.recent
  ].reduce((total, content) => total + content.view_count, 0);

  const averageTruth = Math.round(
    [...featuredContent.featured].reduce((total, content) => total + content.truth_percentage, 0) / 
    featuredContent.featured.length
  );

  return (
    <section className={`py-20 bg-gradient-to-b from-background to-muted/30 ${className}`}>
      <div className="container mx-auto px-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              Public Gallery
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Explore Fact-Checked Content
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover verified information from our community. Browse through fact-checked videos, 
              audio, and live streams with transparency ratings.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto"
          >
            <motion.div variants={statsVariants}>
              <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
                <CardContent className="p-6">
                  <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {featuredContent.featured.length + featuredContent.popular.length}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    Verified Content
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={statsVariants}>
              <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
                <CardContent className="p-6">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {averageTruth}%
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Avg. Truth Rating
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={statsVariants}>
              <Card className="text-center border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
                <CardContent className="p-6">
                  <Eye className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {Math.round(totalViews / 1000)}K+
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">
                    Community Views
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Featured Content */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Featured Content
                </CardTitle>
                <p className="text-muted-foreground">
                  Hand-picked fact-checks showcasing our community's work
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredContent.featured.slice(0, 3).map((content, index) => (
                    <motion.div
                      key={content.id}
                      variants={itemVariants}
                      transition={{ delay: index * 0.1 }}
                    >
                      <PublicContentCard
                        content={content}
                        onClick={handleContentClick}
                        variant="featured"
                        animated={true}
                      />
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Popular & Recent */}
          {(featuredContent.popular.length > 0 || featuredContent.recent.length > 0) && (
            <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Popular Content */}
              {featuredContent.popular.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Trending
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {featuredContent.popular.slice(0, 2).map((content) => (
                      <div 
                        key={content.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleContentClick(content)}
                      >
                        <div className="w-12 h-8 bg-muted rounded overflow-hidden flex-shrink-0">
                          {content.thumbnail_url ? (
                            <img 
                              src={content.thumbnail_url} 
                              alt={content.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Eye className="h-3 w-3 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {content.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <TruthPercentageBadge 
                              percentage={content.truth_percentage} 
                              size="sm" 
                              variant="minimal"
                            />
                            <span className="text-xs text-muted-foreground">
                              {content.view_count} views
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Recent Content */}
              {featuredContent.recent.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-blue-500" />
                      Latest
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {featuredContent.recent.slice(0, 2).map((content) => (
                      <div 
                        key={content.id}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleContentClick(content)}
                      >
                        <div className="w-12 h-8 bg-muted rounded overflow-hidden flex-shrink-0">
                          {content.thumbnail_url ? (
                            <img 
                              src={content.thumbnail_url} 
                              alt={content.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Eye className="h-3 w-3 text-primary" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {content.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <TruthPercentageBadge 
                              percentage={content.truth_percentage} 
                              size="sm" 
                              variant="minimal"
                            />
                            <span className="text-xs text-muted-foreground">
                              {new Date(content.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Call to Action */}
          <motion.div variants={itemVariants} className="text-center">
            <Button
              size="lg"
              onClick={handleViewGallery}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              Explore Full Gallery
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              Browse hundreds of fact-checked videos and audio content
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 