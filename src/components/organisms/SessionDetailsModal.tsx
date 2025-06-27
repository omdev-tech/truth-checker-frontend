import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  Download,
  Eye,
  BarChart3
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
      <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
        <Icon className={`w-4 h-4 ${colorClass}`} />
        <span className="font-semibold text-foreground">{count}</span>
      </div>
    );
  };

  const sessionClaims = claims.filter(claim => claim.session_id === session.id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="!w-[90vw] sm:!w-[75vw] md:!w-[65vw] lg:!w-[55vw] xl:!w-[50vw] !max-w-none h-[90vh] p-0 bg-background border border-border shadow-2xl flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold line-clamp-2 pr-8 text-foreground mb-3">
                {session.title}
              </DialogTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <SourceTypeBadge sourceType={session.source_type} />
                <Badge 
                  variant={session.is_completed ? "default" : "secondary"}
                  className="px-3 py-1"
                >
                  <div className="flex items-center gap-2">
                    {session.is_completed ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {session.is_completed ? t('common:status.completed') : t('common:status.processing')}
                  </div>
                </Badge>
                {session.is_completed && (
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    <AccuracyScore percentage={session.accuracy_percentage} size="sm" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="px-6 py-4">
            {/* Session metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/30">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <div className="text-2xl font-bold text-foreground">{session.total_claims}</div>
                  <div className="text-sm text-muted-foreground">{t('common:ui.claims')}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/30">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-lg font-semibold text-foreground">
                    {formatDuration(session.total_processing_time_seconds)}
                  </div>
                  <div className="text-sm text-muted-foreground">Processing Time</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/30">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {formatDate(session.created_at).split(' at ')[0]}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDate(session.created_at).split(' at ')[1]}
                  </div>
                </div>
              </div>
              {session.completed_at && (
                <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-sm font-semibold text-foreground">Completed</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(session.completed_at).split(' at ')[1]}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Verification breakdown */}
            {session.is_completed && session.verified_claims > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  {t('common:ui.verificationResults')}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {getStatusIcon(session.true_claims, CheckCircle, "text-green-600")}
                  {getStatusIcon(session.false_claims, XCircle, "text-red-600")}
                  {getStatusIcon(session.partially_true_claims, AlertTriangle, "text-yellow-600")}
                  {getStatusIcon(session.misleading_claims, AlertTriangle, "text-orange-600")}
                  {getStatusIcon(session.unverifiable_claims, HelpCircle, "text-gray-600")}
                  {getStatusIcon(session.disputed_claims, HelpCircle, "text-purple-600")}
                </div>
              </div>
            )}

            {/* File information */}
            {(session.original_file_name || session.original_file_size_mb) && (
              <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/30">
                <h4 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  {t('common:ui.fileInformation')}
                </h4>
                <div className="flex items-center justify-between text-sm">
                  {session.original_file_name && (
                    <span className="font-medium text-foreground truncate">{session.original_file_name}</span>
                  )}
                  {session.original_file_size_mb && (
                    <Badge variant="outline" className="ml-3">
                      {session.original_file_size_mb < 1 
                        ? `${Math.round(session.original_file_size_mb * 1024)}KB`
                        : `${session.original_file_size_mb.toFixed(1)}MB`
                      }
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* Claims list */}
            <div className="pb-4">
              <h3 className="text-xl font-bold mb-6 text-foreground flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t('factCheck:session.claimsCount', { count: sessionClaims.length })}
              </h3>
              
              {sessionClaims.length > 0 ? (
                <div className="space-y-3">
                  {sessionClaims.map((claim) => (
                    <ClaimHistoryCard
                      key={claim.id}
                      claim={claim}
                      onClick={() => onClaimClick?.(claim)}
                      className="border border-border hover:border-primary/50 hover:shadow-md transition-all duration-200 cursor-pointer"
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-xl font-semibold mb-2 text-foreground">{t('factCheck:session.noClaimsTitle')}</p>
                  <p className="text-sm max-w-md mx-auto">
                    {t('factCheck:session.noClaimsDescription')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 