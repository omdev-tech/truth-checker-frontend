import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SourceTypeBadge } from '@/components/atoms/SourceTypeBadge';
import { AccuracyScore } from '@/components/atoms/AccuracyScore';
import { FactCheckSession } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Calendar, Clock, FileText, CheckCircle, XCircle, AlertTriangle, HelpCircle, ChevronRight } from 'lucide-react';

interface SessionSummaryCardProps {
  session: FactCheckSession;
  onClick?: () => void;
  className?: string;
}

export function SessionSummaryCard({ session, onClick, className }: SessionSummaryCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  const getClaimsBreakdown = () => {
    const total = session.verified_claims;
    if (total === 0) return null;
    
    return [
      { label: 'True', count: session.true_claims, color: 'text-green-600', icon: CheckCircle },
      { label: 'False', count: session.false_claims, color: 'text-red-600', icon: XCircle },
      { label: 'Partial', count: session.partially_true_claims, color: 'text-yellow-600', icon: AlertTriangle },
      { label: 'Disputed', count: session.disputed_claims, color: 'text-purple-600', icon: HelpCircle },
    ].filter(item => item.count > 0);
  };

  const claimsBreakdown = getClaimsBreakdown();

  return (
    <Card 
      className={cn(
        'hover:shadow-lg transition-all duration-200 bg-card border-border',
        onClick && 'cursor-pointer hover:bg-muted/50 hover:border-primary/50 hover:scale-[1.02]',
        !session.is_completed && 'border-yellow-400/50 bg-yellow-50/10 dark:bg-yellow-950/10',
        session.is_completed && 'hover:border-muted-foreground/30',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold line-clamp-2 flex-1 text-foreground">
            {session.title}
          </CardTitle>
          <div className="flex items-center gap-2 shrink-0">
            <SourceTypeBadge sourceType={session.source_type} />
            {session.is_completed ? (
              <Badge variant="secondary" className="text-xs">
                Complete
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-400/50 bg-yellow-50/20 dark:bg-yellow-950/20">
                Processing
              </Badge>
            )}
            {onClick && (
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{session.total_claims} Claims</span>
            </div>
            {session.is_completed && session.verified_claims > 0 && (
              <div className="flex items-center gap-2">
                <AccuracyScore percentage={session.accuracy_percentage} size="sm" />
                <span className="text-xs text-muted-foreground">
                  {session.accuracy_percentage.toFixed(1)}% accurate
                </span>
              </div>
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {formatDuration(session.total_processing_time_seconds)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {formatDate(session.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Claims breakdown */}
        {claimsBreakdown && claimsBreakdown.length > 0 && (
          <div className="space-y-3">
            <span className="text-sm font-medium text-foreground">Verification Results</span>
            <div className="flex items-center gap-4 flex-wrap">
              {claimsBreakdown.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-1">
                    <Icon className={cn('w-4 h-4', item.color)} />
                    <span className="text-sm text-muted-foreground">
                      {item.count} {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* File info for media sessions */}
        {(session.original_file_name || session.original_file_size_mb) && (
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {session.original_file_name && (
                <span className="truncate">{session.original_file_name}</span>
              )}
              {session.original_file_size_mb && (
                <span>
                  {session.original_file_size_mb < 1 
                    ? `${Math.round(session.original_file_size_mb * 1024)}KB`
                    : `${session.original_file_size_mb.toFixed(1)}MB`
                  }
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 