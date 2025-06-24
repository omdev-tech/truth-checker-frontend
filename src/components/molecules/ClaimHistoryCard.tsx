import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { SourceTypeBadge } from '@/components/atoms/SourceTypeBadge';
import { ConfidenceIndicator } from '@/components/atoms/ConfidenceIndicator';
import { FactCheckClaim } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Clock, HardDrive, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ClaimHistoryCardProps {
  claim: FactCheckClaim;
  onClick?: () => void;
  className?: string;
}

export function ClaimHistoryCard({ claim, onClick, className }: ClaimHistoryCardProps) {
  const { t } = useTranslation();
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatProcessingTime = (seconds?: number) => {
    if (!seconds) return null;
    if (seconds < 1) return `${Math.round(seconds * 1000)}ms`;
    return `${seconds.toFixed(1)}s`;
  };

  const formatFileSize = (sizeMb?: number) => {
    if (!sizeMb) return null;
    if (sizeMb < 1) return `${Math.round(sizeMb * 1024)}KB`;
    return `${sizeMb.toFixed(1)}MB`;
  };

  return (
    <Card 
      className={cn(
        'hover:shadow-md transition-shadow duration-200 border-l-4 bg-card border-border',
        claim.verification_status === 'true' && 'border-l-green-500',
        claim.verification_status === 'false' && 'border-l-red-500',
        claim.verification_status === 'partially_true' && 'border-l-yellow-500',
        claim.verification_status === 'misleading' && 'border-l-orange-500',
        claim.verification_status === 'unverifiable' && 'border-l-muted-foreground',
        claim.verification_status === 'disputed' && 'border-l-purple-500',
        onClick && 'cursor-pointer hover:bg-muted/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with badges */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={claim.verification_status} />
              <SourceTypeBadge sourceType={claim.source_type} />
              <ConfidenceIndicator confidence={claim.confidence_level} />
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(claim.created_at)}
            </div>
          </div>

          {/* Claim text */}
          <div className="space-y-2">
            <p className="font-medium text-foreground line-clamp-2">
              {claim.claim_text}
            </p>
            {claim.explanation && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {claim.explanation}
              </p>
            )}
          </div>

          {/* Sources */}
          {claim.sources_used.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t('factCheck:results.sourcesWithCount')}</span>
              <Badge variant="secondary" className="text-xs">
                {t('factCheck:results.resultCount', { count: claim.sources_used.length })}
              </Badge>
            </div>
          )}

          {/* Metadata footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              {claim.processing_time_seconds && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatProcessingTime(claim.processing_time_seconds)}
                </div>
              )}
              {claim.file_size_mb && (
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  {formatFileSize(claim.file_size_mb)}
                </div>
              )}
            </div>
            {claim.original_input !== claim.claim_text && (
              <Badge variant="outline" className="text-xs">
                {t('factCheck:results.extracted')}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 