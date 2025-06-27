'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { TruthPercentageBadge } from '@/components/atoms/TruthPercentageBadge';
import { ClaimHistoryCard } from '@/components/molecules/ClaimHistoryCard';
import { ClaimDetailsModal } from '@/components/organisms/ClaimDetailsModal';
import { PublicContent, PublicContentDetailResponse, PublicContentSegment } from '@/lib/types/public-content';
import { FactCheckClaim } from '@/lib/types';
import PublicContentApi from '@/lib/services/publicContentApi';
import PublicAnalysisViewer from '@/components/organisms/PublicAnalysisViewer';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Clock, 
  FileText, 
  Play,
  Eye,
  ExternalLink,
  Info,
  Shield,
  BarChart3,
  Youtube,
  Video,
  Music,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PublicContentDetailModalProps {
  content: PublicContent | null;
  isOpen: boolean;
  showAnalysis?: boolean;
  onClose: () => void;
}

export function PublicContentDetailModal({
  content,
  isOpen,
  showAnalysis: externalShowAnalysis = false,
  onClose
}: PublicContentDetailModalProps) {
  const { t } = useTranslation(['gallery', 'common']);
  const [detailData, setDetailData] = useState<PublicContentDetailResponse | null>(null);
  const [segments, setSegments] = useState<PublicContentSegment[]>([]);
  const [claims, setClaims] = useState<FactCheckClaim[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(externalShowAnalysis);
  const [selectedClaim, setSelectedClaim] = useState<FactCheckClaim | null>(null);

  // Sync with external showAnalysis prop
  useEffect(() => {
    setShowAnalysis(externalShowAnalysis);
  }, [externalShowAnalysis]);

  useEffect(() => {
    if (isOpen && content) {
      loadDetailData();
    } else {
      setDetailData(null);
      setSegments([]);
      setClaims([]);
      setError(null);
      setShowPlayer(false);
      if (!externalShowAnalysis) {
        setShowAnalysis(false);
      }
    }
  }, [isOpen, content, externalShowAnalysis]);

  // Auto-load detail data when analysis is requested
  useEffect(() => {
    if (showAnalysis && !detailData && !isLoading && !error) {
      loadDetailData();
    }
  }, [showAnalysis, detailData, isLoading, error]);

  const loadDetailData = async () => {
    if (!content) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load detail data and segments in parallel
      const [detail, fetchedSegments] = await Promise.all([
        PublicContentApi.getPublicContentDetail(content.id),
        PublicContentApi.getPublicContentSegments(content.id)
      ]);
      
      setDetailData(detail);
      setSegments(fetchedSegments);
      
      // Extract claims from segments
      const allClaims: FactCheckClaim[] = [];
      fetchedSegments.forEach(segment => {
        if (segment.claims && Array.isArray(segment.claims)) {
          const transformedClaims = segment.claims.map(claim => 
            transformSegmentClaim(claim, segment.segment_number)
          );
          allClaims.push(...transformedClaims);
        }
      });
      setClaims(allClaims);
      
    } catch (error) {
      console.error('Failed to load content details:', error);
      setError('Failed to load content details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return t('gallery:unknown');
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  const getMediaIcon = (mediaType: string) => {
    switch (mediaType) {
      case 'youtube_video':
        return <Youtube className="h-4 w-4 text-red-500" />;
      case 'uploaded_video':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'uploaded_audio':
        return <Music className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
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
      default:
        return mediaType.replace('_', ' ').toUpperCase();
    }
  };

  const handleClose = () => {
    setShowAnalysis(false);
    setShowPlayer(false);
    setSelectedClaim(null);
    onClose();
  };

  const handleClaimClick = (claim: FactCheckClaim) => {
    setSelectedClaim(claim);
  };

  // Transform segment claims to match FactCheckClaim interface
  const transformSegmentClaim = (segmentClaim: any, segmentNumber: number): FactCheckClaim => {
    return {
      id: segmentClaim.id,
      session_id: content?.session_id || '',
      claim_text: segmentClaim.text || '',
      original_input: segmentClaim.text || '',
      verification_status: segmentClaim.verification_status || 'unverifiable',
      confidence_level: segmentClaim.confidence || 'low',
      explanation: segmentClaim.explanation || '',
      sources_used: segmentClaim.sources || [], // Transform sources to sources_used
      metadata: {
        segment_number: segmentNumber.toString(),
        ...segmentClaim.metadata
      },
      source_type: 'media_file', // Use valid source type
      processing_time_seconds: 0, // Not available in segment data
      file_size_mb: 0, // Not available in segment data
      created_at: new Date().toISOString(), // Fallback timestamp
      verified_at: new Date().toISOString() // Fallback timestamp
    };
  };

  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="!w-screen !max-w-none !h-screen !p-0 !m-0 !rounded-none !top-0 !left-0 !translate-x-0 !translate-y-0 bg-background border-0 shadow-2xl overflow-hidden flex flex-col">
        {/* Compact header for analysis mode, normal header for info mode */}
        {showAnalysis ? (
          // Minimal header for analysis mode
          <DialogHeader className="p-3 pb-2 border-b border-border/50 flex-shrink-0 bg-background/95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-semibold text-foreground truncate flex-1 mr-4">
                {content.title} - {t('gallery:actions.analysisDashboard')}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAnalysis(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Info className="h-4 w-4 mr-1" />
                  {t('gallery:actions.info')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </Button>
              </div>
            </div>
          </DialogHeader>
        ) : (
          // Full header for info mode
          <DialogHeader className="p-6 pb-4 border-b border-border/50 flex-shrink-0">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-8">
                <DialogTitle className="text-2xl font-bold line-clamp-3 text-foreground mb-4">
                  {content.title}
                </DialogTitle>
                
                {/* Description - moved to header */}
                {content.description && (
                  <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {content.description}
                  </p>
                )}
                
                <div className="flex items-center gap-3 flex-wrap mb-4">
                  <TruthPercentageBadge 
                    percentage={content.truth_percentage} 
                    size="lg" 
                    variant="detailed"
                  />
                  <Badge variant="outline" className="gap-1">
                    {getMediaIcon(content.media_type)}
                    {getMediaTypeLabel(content.media_type)}
                  </Badge>
                  {content.category && (
                    <Badge variant="secondary">
                      {content.category}
                    </Badge>
                  )}
                </div>

                {/* Tags - moved to header */}
                {content.tags && content.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {content.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {/* Analysis Toggle */}
                <div className="mt-4">
                                      <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAnalysis(true)}
                      className="w-full sm:w-auto"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {t('gallery:actions.showAnalysisDashboard')}
                    </Button>
                </div>
              </div>
            </div>
          </DialogHeader>
        )}

        {/* Content area - no scrolling for analysis mode */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {/* Analysis View - Full Screen Mode */}
          {showAnalysis && detailData && (
            <PublicAnalysisViewer 
              content={detailData}
              className="w-full h-full"
            />
          )}

          {/* Analysis Loading/Error States */}
          {showAnalysis && !detailData && (
            <div className="h-full flex items-center justify-center">
              {isLoading ? (
                <div className="flex items-center">
                  <LoadingSpinner size="lg" />
                  <span className="ml-3 text-muted-foreground">{t('gallery:status.loadingAnalysis')}</span>
                </div>
              ) : error ? (
                <Card className="border-destructive/50 bg-destructive/5">
                  <CardContent className="flex items-center gap-3 p-6">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="text-destructive">{error}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={loadDetailData}
                    >
                      {t('gallery:actions.retry')}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
                    <p className="text-yellow-800 font-medium">{t('gallery:status.loadingDetailedAnalysis')}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={loadDetailData}
                      className="mt-3"
                    >
                      {t('gallery:actions.loadAnalysis')}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Info View - Only show when NOT in analysis mode */}
          {!showAnalysis && (
            <div className="h-full overflow-y-auto">
              <div className="p-6 space-y-6">
                
                {isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" />
                    <span className="ml-3 text-muted-foreground">{t('gallery:status.loadingContentDetails')}</span>
                  </div>
                )}

                {error && (
                  <Card className="border-destructive/50 bg-destructive/5">
                    <CardContent className="flex items-center gap-3 p-4">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <span className="text-destructive">{error}</span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={loadDetailData}
                      >
                        {t('gallery:actions.retry')}
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {/* Content Statistics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-green-500" />
                      {t('gallery:sections.contentStatistics')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="text-2xl font-bold text-foreground">{content.truth_percentage.toFixed(1)}%</div>
                          <div className="text-sm text-muted-foreground">{t('gallery:metadata.truthScore')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <div className="text-2xl font-bold text-foreground">{content.total_claims || detailData?.total_claims || 0}</div>
                          <div className="text-sm text-muted-foreground">{t('gallery:metadata.claimsChecked')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                        <Eye className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold text-foreground">{content.view_count}</div>
                          <div className="text-sm text-muted-foreground">{t('gallery:metadata.views')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <div>
                          <div className="text-lg font-bold text-foreground">
                            {formatDuration(content.duration || detailData?.duration_seconds)}
                          </div>
                          <div className="text-sm text-muted-foreground">{t('gallery:metadata.duration')}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Claims List */}
                {claims && claims.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Eye className="h-5 w-5 text-blue-500" />
                        {t('gallery:claims.claimsAnalysis', { count: claims.length })}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {claims.map((claim: FactCheckClaim) => (
                          <ClaimHistoryCard
                            key={claim.id}
                            claim={claim}
                            onClick={() => handleClaimClick(claim)}
                            className="border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Content Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('gallery:sections.contentInformation')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-foreground">{t('gallery:metadata.published')}</span>
                        <div className="text-muted-foreground flex items-center gap-1 mt-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(content.created_at)}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{t('gallery:metadata.contentType')}</span>
                        <div className="text-muted-foreground mt-1 capitalize">
                          {content.has_media ? t('gallery:mediaTypes.mediaFile') : content.content_type.replace('_', ' ')}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-foreground">{t('gallery:metadata.status')}</span>
                        <div className="mt-1">
                          <Badge variant={content.status === 'public' ? 'default' : 'secondary'}>
                            {content.status === 'public' ? t('gallery:status.public') : t('gallery:status.private')}
                          </Badge>
                        </div>
                      </div>
                      {content.is_live_content && (
                        <div>
                          <span className="font-medium text-foreground">{t('gallery:metadata.liveContent')}</span>
                          <div className="mt-1">
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              {t('gallery:metadata.liveRecording')}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* Footer - only show in info mode */}
        {!showAnalysis && (
                      <div className="p-6 border-t border-border/50 flex-shrink-0">
              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  {t('gallery:actions.close')}
                </Button>
              </div>
            </div>
        )}
      </DialogContent>
      
      {/* Claim Details Modal */}
      <ClaimDetailsModal
        claim={selectedClaim}
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </Dialog>
  );
} 