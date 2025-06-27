import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FactCheckClaim } from '@/lib/types';
import { 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  ExternalLink,
  Info,
  Shield,
  BookOpen,
  Database
} from 'lucide-react';

interface ClaimDetailsModalProps {
  claim: FactCheckClaim | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ClaimDetailsModal({
  claim,
  isOpen,
  onClose
}: ClaimDetailsModalProps) {
  const { t } = useTranslation(['factCheck', 'common']);

  if (!claim) return null;

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

  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case 'true':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          label: t('factCheck:status.true')
        };
      case 'false':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          label: t('factCheck:status.false')
        };
      case 'partially_true':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-800',
          label: t('factCheck:status.partiallyTrue')
        };
      case 'misleading':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bg: 'bg-orange-50 dark:bg-orange-900/20',
          border: 'border-orange-200 dark:border-orange-800',
          label: t('factCheck:status.misleading')
        };
      case 'disputed':
        return {
          icon: HelpCircle,
          color: 'text-purple-600',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          border: 'border-purple-200 dark:border-purple-800',
          label: t('factCheck:status.disputed')
        };
      default:
        return {
          icon: HelpCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-50 dark:bg-gray-900/20',
          border: 'border-gray-200 dark:border-gray-800',
          label: t('factCheck:status.unverifiable')
        };
    }
  };

  const getConfidenceInfo = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return { 
          label: t('factCheck:confidence.high'), 
          color: 'text-green-600', 
          bg: 'bg-green-100 dark:bg-green-900/30',
          border: 'border-green-300 dark:border-green-700'
        };
      case 'medium':
        return { 
          label: t('factCheck:confidence.medium'), 
          color: 'text-yellow-600', 
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          border: 'border-yellow-300 dark:border-yellow-700'
        };
      case 'low':
        return { 
          label: t('factCheck:confidence.low'), 
          color: 'text-orange-600', 
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          border: 'border-orange-300 dark:border-orange-700'
        };
      default:
        return { 
          label: t('factCheck:confidence.insufficient'), 
          color: 'text-gray-600', 
          bg: 'bg-gray-100 dark:bg-gray-900/30',
          border: 'border-gray-300 dark:border-gray-700'
        };
    }
  };

  const statusInfo = getStatusInfo(claim.verification_status);
  const confidenceInfo = getConfidenceInfo(claim.confidence_level);
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-none h-[90vh] p-0 bg-background border border-border shadow-2xl overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-4 border-b border-border/50 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-bold line-clamp-3 pr-8 text-foreground mb-4">
                {claim.claim_text}
              </DialogTitle>
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${statusInfo.border} ${statusInfo.bg}`}>
                  <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                  <span className={`text-sm font-semibold ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${confidenceInfo.border} ${confidenceInfo.bg}`}>
                  <Shield className={`w-4 h-4 ${confidenceInfo.color}`} />
                  <span className={`text-sm font-medium ${confidenceInfo.color}`}>
                    {confidenceInfo.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 flex-shrink-0">
          {/* Claim metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/30">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-semibold text-foreground">{t('factCheck:details.verified')}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(claim.verified_at)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/30">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-semibold text-foreground">{t('factCheck:details.processingTime')}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDuration(claim.processing_time_seconds)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border/30">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-semibold text-foreground">{t('factCheck:details.sourceType')}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {claim.source_type.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="flex-shrink-0" />

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-6">
            {/* Explanation */}
            {claim.explanation && (
              <div className="p-5 bg-muted/30 rounded-lg border border-border/30">
                <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  {t('factCheck:details.explanation')}
                </h3>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="text-foreground leading-relaxed text-base">
                    {claim.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Sources */}
            {claim.sources_used && claim.sources_used.length > 0 && (
              <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200/50 dark:border-blue-800/30">
                <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                  <ExternalLink className="w-5 h-5 text-blue-600" />
                  {t('factCheck:details.sources', { count: claim.sources_used.length })}
                  <Badge variant="secondary" className="ml-2">
                    {claim.sources_used.length}
                  </Badge>
                </h3>
                <div className="space-y-3">
                  {claim.sources_used.map((source, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                      <ExternalLink className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm break-all transition-colors hover:underline"
                        >
                          {source}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            {claim.metadata && Object.keys(claim.metadata).length > 0 && (
              <div className="p-5 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-200/50 dark:border-green-800/30">
                <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-2">
                  <Database className="w-5 h-5 text-green-600" />
                  {t('factCheck:details.additionalInfo')}
                </h3>
                <div className="bg-background rounded-lg p-4 border border-border">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {Object.entries(claim.metadata).map(([key, value]) => (
                      <div key={key} className="flex flex-col">
                        <dt className="font-semibold text-foreground capitalize mb-1">
                          {key.replace('_', ' ')}:
                        </dt>
                        <dd className="text-muted-foreground bg-muted/50 px-3 py-2 rounded border">
                          {String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 