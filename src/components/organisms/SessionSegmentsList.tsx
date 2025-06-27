import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { SessionSummary, SessionSegment } from '@/lib/types';
import { 
  Play,
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  BarChart3,
  Eye,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface SessionSegmentsListProps {
  session: SessionSummary | null;
  segments: SessionSegment[];
  isLoading: boolean;
  onSegmentView?: (segment: SessionSegment) => void;
}

export function SessionSegmentsList({
  session,
  segments,
  isLoading,
  onSegmentView
}: SessionSegmentsListProps) {
  const { t } = useTranslation(['dashboard', 'factCheck', 'common']);
  const [expandedSegments, setExpandedSegments] = useState<Set<string>>(new Set());

  const toggleSegmentExpansion = (segmentId: string) => {
    const newExpanded = new Set(expandedSegments);
    if (newExpanded.has(segmentId)) {
      newExpanded.delete(segmentId);
    } else {
      newExpanded.add(segmentId);
    }
    setExpandedSegments(newExpanded);
  };

  const getAccuracyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (percentage >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    return <XCircle className="w-4 h-4 text-red-600" />;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDuration = (startTime: number, endTime: number) => {
    const duration = endTime - startTime;
    return `${formatTime(startTime)} - ${formatTime(endTime)} (${Math.round(duration)}s)`;
  };

  if (!session) {
    return (
      <div className="space-y-4">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-lg font-semibold">
            {t('dashboard:segments.title')}
          </CardTitle>
        </CardHeader>
        <Card className="border-dashed">
          <CardContent className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">
              {t('dashboard:segments.empty.title')}
            </h3>
            <p className="text-muted-foreground">
              {t('dashboard:segments.empty.description')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session Header */}
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          {session.name}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <BarChart3 className="w-4 h-4" />
            <span>{session.total_segments} segments</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            <span>{session.total_claims} claims</span>
          </div>
          {session.status === 'completed' && (
            <div className="flex items-center gap-1">
              <span>Overall accuracy:</span>
              <span className={`font-semibold ${getAccuracyColor(session.overall_accuracy_percentage)}`}>
                {session.overall_accuracy_percentage.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner />
          <span className="ml-2 text-muted-foreground">
            {t('dashboard:segments.loading')}
          </span>
        </div>
      )}

      {/* Segments list */}
      {!isLoading && segments.length > 0 && (
        <div className="space-y-3">
          {segments.map((segment, index) => {
            const isExpanded = expandedSegments.has(segment.fact_check_session_id);
            
            return (
              <Card 
                key={`${segment.fact_check_session_id}-${segment.segment_number}-${index}`}
                className="transition-all duration-200 hover:shadow-md"
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Segment header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1 h-6 w-6"
                          onClick={() => toggleSegmentExpansion(segment.fact_check_session_id)}
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Segment {segment.segment_number}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatDuration(segment.start_time, segment.end_time)}</span>
                          </div>
                        </div>
                        
                        <h4 className="font-medium text-sm truncate" title={segment.name}>
                          {segment.name}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getAccuracyIcon(segment.accuracy_percentage)}
                        <span className={`text-sm font-semibold ${getAccuracyColor(segment.accuracy_percentage)}`}>
                          {segment.accuracy_percentage.toFixed(0)}%
                        </span>
                        {onSegmentView && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => onSegmentView(segment)}
                            className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {t('common:actions.view')}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Compact stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="text-green-600">✓ {segment.true_claims}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-600">✗ {segment.false_claims}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>{t('factCheck:segment.total')}: {segment.total_claims} {t('common:session.claims')}</span>
                      </div>
                    </div>

                    {/* Expanded content */}
                    {isExpanded && (
                      <div className="pt-3 border-t space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                  <div>
                          <h5 className="font-medium mb-2">{t('factCheck:segment.statistics')}</h5>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('factCheck:segment.trueClaims')}:</span>
                              <span className="text-green-600 font-medium">{segment.true_claims}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('factCheck:segment.falseClaims')}:</span>
                              <span className="text-red-600 font-medium">{segment.false_claims}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('factCheck:segment.totalClaims')}:</span>
                              <span className="font-medium">{segment.total_claims}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">{t('factCheck:segment.timing')}</h5>
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('factCheck:segment.start')}:</span>
                              <span className="font-medium">{formatTime(segment.start_time)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('factCheck:segment.end')}:</span>
                              <span className="font-medium">{formatTime(segment.end_time)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">{t('factCheck:segment.duration')}:</span>
                              <span className="font-medium">{Math.round(segment.end_time - segment.start_time)}s</span>
                            </div>
                          </div>
                        </div>
                        </div>

                        {/* Accuracy visualization */}
                        <div>
                          <h5 className="font-medium mb-2 text-sm">{t('factCheck:segment.accuracyBreakdown')}</h5>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{t('factCheck:segment.accuracyScore')}</span>
                              <span className={`font-semibold ${getAccuracyColor(segment.accuracy_percentage)}`}>
                                {segment.accuracy_percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                                style={{ width: `${segment.accuracy_percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty segments state */}
      {!isLoading && segments.length === 0 && session && (
        <Card className="border-dashed">
          <CardContent className="text-center py-8">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <h3 className="font-medium mb-1">
              {t('dashboard:segments.noSegments.title')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('dashboard:segments.noSegments.description')}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 