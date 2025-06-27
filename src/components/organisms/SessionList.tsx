import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { SessionSummary } from '@/lib/types';
import { 
  Video, 
  AudioLines, 
  FileText, 
  Radio, 
  Wifi,
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  BarChart3,
  Calendar
} from 'lucide-react';

interface SessionListProps {
  sessions: SessionSummary[];
  selectedSession: SessionSummary | null;
  isLoading: boolean;
  hasMore: boolean;
  onSessionSelect: (session: SessionSummary) => void;
  onLoadMore: () => void;
}

export function SessionList({
  sessions,
  selectedSession,
  isLoading,
  hasMore,
  onSessionSelect,
  onLoadMore
}: SessionListProps) {
  const { t } = useTranslation(['dashboard', 'common']);

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <AudioLines className="w-4 h-4" />;
      case 'text':
        return <FileText className="w-4 h-4" />;
      case 'live_recording':
        return <Radio className="w-4 h-4" />;
      case 'stream':
        return <Wifi className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      case 'processing':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 7 * 24) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-4">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          {t('dashboard:sessions.title')}
        </CardTitle>
      </CardHeader>

      <div className="space-y-2">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedSession?.id === session.id
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onSessionSelect(session)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header with title and status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getContentTypeIcon(session.content_type)}
                    <h3 className="font-medium text-sm truncate" title={session.name}>
                      {session.name}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {getStatusIcon(session.status)}
                    <Badge 
                      variant={getStatusBadgeVariant(session.status)}
                      className="text-xs"
                    >
                      {t(`dashboard:sessions.status.${session.status}`)}
                    </Badge>
                  </div>
                </div>

                {/* Statistics */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" />
                      <span>{session.total_segments} segments</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>{session.total_claims} claims</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(session.created_at)}</span>
                  </div>
                </div>

                {/* Accuracy indicator */}
                {session.status === 'completed' && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
                          style={{ width: `${session.overall_accuracy_percentage}%` }}
                        />
                      </div>
                      <span className="font-medium">
                        {session.overall_accuracy_percentage.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Source URL preview */}
                {session.source_url && (
                  <div className="text-xs text-muted-foreground truncate">
                    <span className="font-medium">Source:</span> {session.source_url}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Load more button */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">{t('common:actions.loading')}</span>
                </>
              ) : (
                t('common:actions.loadMore')
              )}
            </Button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && sessions.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-muted-foreground">
              {t('dashboard:sessions.loading')}
            </span>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && sessions.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="font-medium mb-1">{t('dashboard:sessions.empty.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('dashboard:sessions.empty.description')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 