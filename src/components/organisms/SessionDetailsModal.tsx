import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { ScrollArea } from '@/components/ui/scroll-area';
import { SourceTypeBadge } from '@/components/atoms/SourceTypeBadge';
import { AccuracyScore } from '@/components/atoms/AccuracyScore';
import { ClaimHistoryCard } from '@/components/molecules/ClaimHistoryCard';
import { FactCheckSession, FactCheckClaim } from '@/lib/types';
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SessionDetailsModalProps {
  session: FactCheckSession | null;
  claims: FactCheckClaim[];
  isOpen: boolean;
  onClose: () => void;
  onClaimClick?: (claim: FactCheckClaim) => void;
}

export function SessionDetailsModal({
  session,
  claims,
  isOpen,
  onClose,
  onClaimClick
}: SessionDetailsModalProps) {
  const { t } = useTranslation(['factCheck', 'common']);
  if (!session) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
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

  const getStatusIcon = (count: number, Icon: React.ElementType, colorClass: string) => {
    if (count === 0) return null;
    return (
      <div className="flex items-center gap-2 text-sm">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className="font-medium">{count}</span>
      </div>
    );
  };

  const sessionClaims = claims.filter(claim => claim.session_id === session.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 bg-background border border-border">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold line-clamp-2 pr-8 text-foreground">
                {session.title}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-3">
                <SourceTypeBadge sourceType={session.source_type} />
                <Badge variant={session.is_completed ? "secondary" : "outline"}>
                  {session.is_completed ? t('common:status.completed') : t('common:status.processing')}
                </Badge>
                {session.is_completed && (
                  <AccuracyScore percentage={session.accuracy_percentage} size="sm" />
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-border">
          {/* Session metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{session.total_claims}</span>
              <span className="text-muted-foreground">{t('common:ui.claims')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDuration(session.total_processing_time_seconds)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                {formatDate(session.created_at)}
              </span>
            </div>
            {session.completed_at && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-muted-foreground">
                  {formatDate(session.completed_at)}
                </span>
              </div>
            )}
          </div>

          {/* Verification breakdown */}
          {session.is_completed && session.verified_claims > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">{t('common:ui.verificationResults')}</h4>
              <div className="flex items-center gap-6 flex-wrap">
                {getStatusIcon(session.true_claims, CheckCircle, "text-green-600")}
                {getStatusIcon(session.false_claims, XCircle, "text-red-600")}
                {getStatusIcon(session.partially_true_claims, AlertTriangle, "text-yellow-600")}
                {getStatusIcon(session.misleading_claims, AlertTriangle, "text-orange-600")}
                {getStatusIcon(session.unverifiable_claims, HelpCircle, "text-muted-foreground")}
                {getStatusIcon(session.disputed_claims, HelpCircle, "text-purple-600")}
              </div>
            </div>
          )}

          {/* File information */}
          {(session.original_file_name || session.original_file_size_mb) && (
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">{t('common:ui.fileInformation')}</h4>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
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
        </div>

        {/* Claims list */}
        <div className="flex-1 min-h-0">
          <div className="p-6 pb-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {t('factCheck:session.claimsCount', { count: sessionClaims.length })}
            </h3>
          </div>
          
          <div className="h-[400px] px-6 pb-6 overflow-y-auto">
            {sessionClaims.length > 0 ? (
              <div className="space-y-4">
                {sessionClaims.map((claim) => (
                  <ClaimHistoryCard
                    key={claim.id}
                    claim={claim}
                    onClick={() => onClaimClick?.(claim)}
                    className="border border-border hover:border-primary/50 transition-colors"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-lg font-medium mb-2 text-foreground">{t('factCheck:session.noClaimsTitle')}</p>
                <p className="text-sm">
                  {t('factCheck:session.noClaimsDescription')}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 