'use client';

import React, { useState, useEffect } from 'react';
import { PublicContentDetailResponse, PublicContentSegment } from '@/lib/types/public-content';
import { DashboardState, EnhancedSegmentData } from '@/lib/types';
import ProcessingDashboard from '@/components/organisms/ProcessingDashboard';
import ResultsPanel from '@/components/organisms/ResultsPanel';
import SequencerTimeline from '@/components/organisms/SequencerTimeline';
import VideoPlayer from '@/components/organisms/VideoPlayer';
import { PublicContentTransformer } from '@/lib/services/publicContentTransformer';
import { PublicContentApi } from '@/lib/services/publicContentApi';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Users, CheckCircle } from 'lucide-react';

interface PublicProcessingDashboardProps {
  content: PublicContentDetailResponse;
  className?: string;
}

const PublicProcessingDashboard: React.FC<PublicProcessingDashboardProps> = ({
  content,
  className = '',
}) => {
  const { t } = useTranslation('common');
  const [segments, setSegments] = useState<PublicContentSegment[]>([]);
  const [dashboardSegments, setDashboardSegments] = useState<EnhancedSegmentData[]>([]);
  const [processing, setProcessing] = useState<DashboardState['processing']>();
  const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
  const [showProcessingDetails, setShowProcessingDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch segments on mount
  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setIsLoading(true);
        const fetchedSegments = await PublicContentApi.getPublicContentSegments(content.id);
        setSegments(fetchedSegments);

        // Transform data for dashboard components
        const transformedSegments = PublicContentTransformer.transformSegmentsForDashboard(fetchedSegments);
        const transformedProcessing = PublicContentTransformer.transformContentForProcessingState(content, fetchedSegments);

        setDashboardSegments(transformedSegments);
        setProcessing(transformedProcessing);
      } catch (err) {
        console.error('Failed to fetch segments:', err);
        setError('Failed to load content analysis data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSegments();
  }, [content.id]);

  const handleSegmentSelect = (segmentId: number | null) => {
    setSelectedSegment(segmentId);
  };

  const toggleProcessingDetails = () => {
    setShowProcessingDetails(!showProcessingDetails);
  };

  const playableUrl = PublicContentTransformer.getPlayableUrl(content);
  const hasVideo = PublicContentTransformer.hasVideoMedia(content);
  const hasAudio = PublicContentTransformer.hasAudioMedia(content);
  const formattedDuration = PublicContentTransformer.formatDuration(content.duration_seconds);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <LoadingSpinner />
        <span className="ml-2 text-gray-600">{t('loading.analyzing')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-red-600 font-medium">{error}</div>
        <p className="text-gray-500 mt-2">{t('errors.tryRefresh')}</p>
      </div>
    );
  }

  if (!processing || !dashboardSegments.length) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <div className="text-gray-600">{t('content.noAnalysisData')}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Content Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              {t('analysis.title')}
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {content.view_count} {t('content.views')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{content.truth_percentage}%</div>
              <div className="text-sm text-gray-600">{t('analysis.truthPercentage')}</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{content.total_claims}</div>
              <div className="text-sm text-gray-600">{t('analysis.totalClaims')}</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{processing.totalSegments}</div>
              <div className="text-sm text-gray-600">{t('analysis.segments')}</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600 flex items-center justify-center gap-1">
                <Clock className="w-4 h-4" />
                {formattedDuration}
              </div>
              <div className="text-sm text-gray-600">{t('media.duration')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

            {/* Processing Dashboard */}
      <ProcessingDashboard
        processing={processing}
        segments={dashboardSegments}
        onToggleDetails={toggleProcessingDetails}
      />

      {/* Segments Detail */}
      {showProcessingDetails && (
        <Card>
          <CardHeader>
            <CardTitle>{t('segments.details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {dashboardSegments.map((segment) => (
                <Card key={segment.id} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">
                        Segment {segment.id + 1}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {Math.floor(segment.startTime / 60)}:{(segment.startTime % 60).toFixed(0).padStart(2, '0')} - 
                        {Math.floor(segment.endTime / 60)}:{(segment.endTime % 60).toFixed(0).padStart(2, '0')}
                      </span>
                    </div>
                    {segment.transcription && (
                      <p className="text-sm">{segment.transcription}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge variant={segment.accuracyScore && segment.accuracyScore > 70 ? 'default' : 'secondary'}>
                        {segment.accuracyScore?.toFixed(1)}% accuracy
                      </Badge>
                      <Badge variant="outline">
                        {segment.claimsCount} claims
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export { PublicProcessingDashboard }; 