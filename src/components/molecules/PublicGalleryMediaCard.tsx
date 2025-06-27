'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import {
  Play,
  Youtube,
  Video,
  Music,
  Calendar,
  Clock,
  Eye,
  ExternalLink,
  Star,
  Shield,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { PublicMediaPlayer } from '@/components/organisms/PublicMediaPlayer';

interface PublicContent {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  created_at: string;
  view_count: number;
  media_type: string;
  has_media: boolean;
  thumbnail_url?: string;
  youtube_url?: string;
  uploaded_media_filename?: string;
  media_size_formatted?: string;
  playable_url?: string;
  embed_url?: string;
  total_claims?: number;
  verified_claims?: number;
  disputed_claims?: number;
  uncertain_claims?: number;
}

interface PublicGalleryMediaCardProps {
  content: PublicContent;
  onView?: (contentId: string) => void;
  onPlay?: (contentId: string) => void;
  onAnalyze?: (contentId: string) => void;
  className?: string;
  showPlayer?: boolean;
  compact?: boolean;
}

/**
 * Public Gallery Media Card Component
 * Displays public content with media preview and controls
 * Supports different layouts and interactive features
 */

interface ContentStatsVignetteProps {
  content: PublicContent;
  onViewAllClaims?: () => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

function ContentStatsVignette({ content, onViewAllClaims, isExpanded, onToggleExpanded }: ContentStatsVignetteProps) {
  const { t } = useTranslation(['gallery', 'common']);
  const totalClaims = content.total_claims || 0;
  const verifiedClaims = content.verified_claims || 0;
  const disputedClaims = content.disputed_claims || 0;
  const uncertainClaims = content.uncertain_claims || 0;

  if (totalClaims === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="font-medium text-blue-900 dark:text-blue-100">
            {t('gallery:claims.claimsAnalyzed', { count: totalClaims })}
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleExpanded}
          className="h-6 w-6 p-0"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span className="text-xs font-medium text-green-700 dark:text-green-400">{t('gallery:claims.verified')}</span>
            </div>
            <div className="text-lg font-bold text-green-800 dark:text-green-300">{verifiedClaims}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <XCircle className="h-3 w-3 text-red-600" />
              <span className="text-xs font-medium text-red-700 dark:text-red-400">{t('gallery:claims.disputed')}</span>
            </div>
            <div className="text-lg font-bold text-red-800 dark:text-red-300">{disputedClaims}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <AlertTriangle className="h-3 w-3 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-400">{t('gallery:claims.uncertain')}</span>
            </div>
            <div className="text-lg font-bold text-yellow-800 dark:text-yellow-300">{uncertainClaims}</div>
          </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                {t('gallery:claims.clickToView')}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewAllClaims}
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/20"
              >
                {t('gallery:claims.viewAllClaims')}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PublicGalleryMediaCard({
  content,
  onView,
  onPlay,
  onAnalyze,
  className,
  showPlayer = false,
  compact = false
}: PublicGalleryMediaCardProps) {
  const { t } = useTranslation(['gallery', 'common']);
  const [isPlayerVisible, setIsPlayerVisible] = useState(showPlayer);
  const [isHovered, setIsHovered] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  const getMediaTypeIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'video':
      case 'youtube':
      case 'youtube_video':
      case 'uploaded_video':
        return <Video className="h-4 w-4" />;
      case 'audio':
      case 'uploaded_audio':
        return <Music className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const getMediaTypeLabel = (mediaType: string) => {
    switch (mediaType) {
      case 'youtube_video':
        return t('gallery:mediaTypes.youtube');
      case 'uploaded_video':
        return t('gallery:mediaTypes.uploadedVideo');
      case 'uploaded_audio':
        return t('gallery:mediaTypes.uploadedAudio');
      case 'video':
        return t('gallery:mediaTypes.video');
      case 'audio':
        return t('gallery:mediaTypes.audio');
      default:
        return mediaType.replace('_', ' ').toUpperCase();
    }
  };

  const getMediaTypeBadgeColor = (mediaType: string) => {
    switch (mediaType) {
      case 'video':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'youtube':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'audio':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'politics':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'health':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'technology':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'science':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handlePlayClick = () => {
    if (content.has_media) {
      onAnalyze?.(content.id);
    } else {
      setIsPlayerVisible(!isPlayerVisible);
      onPlay?.(content.id);
    }
  };

  const handleViewDetails = () => {
    onView?.(content.id);
  };

  const handleViewAllClaims = () => {
    onAnalyze?.(content.id);
  };

  const handleVignetteClick = () => {
    if (content.has_media) {
      onAnalyze?.(content.id);
    } else {
      onView?.(content.id);
    }
  };

  if (compact) {
    return (
      <motion.div
        className={cn("group", className)}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full transition-shadow group-hover:shadow-md">
          <CardContent className="p-4">
            
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                  {content.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {content.description}
                </p>
              </div>
              
              {content.is_featured && (
                <Star className="h-4 w-4 text-yellow-500 ml-2 flex-shrink-0" />
              )}
            </div>

            {/* Thumbnail for compact view */}
            {content.thumbnail_url && (
              <div className="mb-3">
                <div className="relative w-full h-24 bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={content.thumbnail_url}
                    alt={content.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
            )}

            {/* Media Info */}
            {content.has_media && (
              <div className="flex items-center gap-2 mb-3">
                {getMediaTypeIcon(content.media_type)}
                <Badge className={getMediaTypeBadgeColor(content.media_type)} variant="secondary">
                  {getMediaTypeLabel(content.media_type)}
                </Badge>
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(content.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-3 w-3" />
                <span>{formatViewCount(content.view_count)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {content.has_media && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayClick}
                  className="flex-1"
                >
                  <Play className="h-3 w-3 mr-1" />
                  {t('gallery:actions.play')}
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewDetails}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                {t('gallery:actions.view')}
              </Button>
            </div>

          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn("group", className)}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full transition-all duration-300 group-hover:shadow-lg">
        
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-2 mb-2">
                {content.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {content.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {content.is_featured && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                    <Star className="h-3 w-3 mr-1" />
                    {t('gallery:badges.featured')}
                  </Badge>
                </motion.div>
              )}
            </div>
          </div>
          
          {/* Categories and Tags */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={getCategoryColor(content.category)}>
              {content.category}
            </Badge>
            {(content.tags || []).slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {(content.tags || []).length > 3 && (
              <Badge variant="outline" className="text-xs">
                {t('gallery:badges.moreTags', { count: (content.tags || []).length - 3 })}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          
          {/* Thumbnail for full view */}
          {content.thumbnail_url && (
            <div className="mb-4">
              <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden cursor-pointer" onClick={handleVignetteClick}>
                <Image
                  src={content.thumbnail_url}
                  alt={content.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
                {content.is_featured && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-yellow-500/90 text-white border-0">
                      <Star className="h-3 w-3 mr-1" />
                      {t('gallery:badges.featured')}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Media Preview */}
          {content.has_media && !isPlayerVisible && (
            <div className="mb-4">
              <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMediaTypeIcon(content.media_type)}
                    <Badge className={getMediaTypeBadgeColor(content.media_type)}>
                      {getMediaTypeLabel(content.media_type)}
                    </Badge>
                  </div>
                  
                                      <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePlayClick}
                      className="transition-all duration-200 hover:scale-105"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {t('gallery:actions.playMedia')}
                    </Button>
                </div>
                
                {content.uploaded_media_filename && (
                  <div>
                    <p className="text-sm font-medium">{content.uploaded_media_filename}</p>
                    {content.media_size_formatted && (
                      <p className="text-xs text-muted-foreground">
                        {t('gallery:metadata.size')} {content.media_size_formatted}
                      </p>
                    )}
                  </div>
                )}
                
                {content.youtube_url && (
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{t('gallery:mediaTypes.youtubeVideo')}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(content.youtube_url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      {t('gallery:external.youtube')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Media Player */}
          {isPlayerVisible && content.has_media && (
            <div className="mb-4">
              <PublicMediaPlayer
                contentId={content.id}
                mediaInfo={{
                  media_type: content.media_type,
                  has_media: content.has_media,
                  youtube_url: content.youtube_url,
                  uploaded_media_filename: content.uploaded_media_filename,
                  media_size_formatted: content.media_size_formatted,
                  playable_url: content.playable_url,
                  embed_url: content.embed_url
                }}
                className="mb-2"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPlayerVisible(false)}
                className="w-full"
              >
                {t('gallery:actions.hidePlayer')}
              </Button>
            </div>
          )}

          {/* Content Stats Vignette */}
          {(content.total_claims && content.total_claims > 0) && (
            <div className="mb-4">
              <ContentStatsVignette
                content={content}
                onViewAllClaims={handleViewAllClaims}
                isExpanded={isStatsExpanded}
                onToggleExpanded={() => setIsStatsExpanded(!isStatsExpanded)}
              />
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(content.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{formatViewCount(content.view_count)} {t('gallery:metadata.views').toLowerCase()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {content.has_media ? (
              <Button
                onClick={handlePlayClick}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-2" />
                {t('gallery:actions.watchAndAnalyze')}
              </Button>
            ) : (
              <Button
                onClick={handleViewDetails}
                className="flex-1"
              >
                <Shield className="h-4 w-4 mr-2" />
                {t('gallery:actions.viewDetails')}
              </Button>
            )}
            
            {content.has_media && (
              <Button
                variant="outline"
                onClick={handleViewDetails}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                {t('gallery:actions.info')}
              </Button>
            )}
          </div>

        </CardContent>
      </Card>
    </motion.div>
  );
} 