import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  X
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
          bg: 'bg-green-50',
          border: 'border-green-200',
          label: t('factCheck:status.true')
        };
      case 'false':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          label: t('factCheck:status.false')
        };
      case 'partially_true':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          label: t('factCheck:status.partiallyTrue')
        };
      case 'misleading':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          label: t('factCheck:status.misleading')
        };
      case 'disputed':
        return {
          icon: HelpCircle,
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          label: t('factCheck:status.disputed')
        };
      default:
        return {
          icon: HelpCircle,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          label: t('factCheck:status.unverifiable')
        };
    }
  };

  const getConfidenceInfo = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return { label: t('factCheck:confidence.high'), color: 'text-green-600', bg: 'bg-green-100' };
      case 'medium':
        return { label: t('factCheck:confidence.medium'), color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'low':
        return { label: t('factCheck:confidence.low'), color: 'text-orange-600', bg: 'bg-orange-100' };
      default:
        return { label: t('factCheck:confidence.insufficient'), color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const statusInfo = getStatusInfo(claim.verification_status);
  const confidenceInfo = getConfidenceInfo(claim.confidence_level);
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] p-0 bg-background border border-border">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold line-clamp-3 pr-8 text-foreground">
                {claim.claim_text}
              </DialogTitle>
              <div className="flex items-center gap-3 mt-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${statusInfo.border}`}>
                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                <Badge variant="outline" className="border-border">
                  {confidenceInfo.label}
                </Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 border-b border-border">
          {/* Claim metadata */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground">{t('factCheck:details.verified')}</div>
                <div className="text-muted-foreground">
                  {formatDate(claim.verified_at)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground">{t('factCheck:details.processingTime')}</div>
                <div className="text-muted-foreground">
                  {formatDuration(claim.processing_time_seconds)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground">{t('factCheck:details.sourceType')}</div>
                <div className="text-muted-foreground capitalize">
                  {claim.source_type.replace('_', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Original Input */}
            {claim.original_input && claim.original_input !== claim.claim_text && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{t('factCheck:details.originalInput')}</h3>
                <div className="bg-muted rounded-lg p-4 text-sm text-foreground">
                  {claim.original_input}
                </div>
              </div>
            )}

            {/* Explanation */}
            {claim.explanation && (
              <div>
                <h3 className="text-lg font-semibold mb-3 text-foreground">{t('factCheck:details.explanation')}</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed">
                    {claim.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Sources */}
            {claim.sources_used && claim.sources_used.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">{t('factCheck:details.sources', { count: claim.sources_used.length })}</h3>
                <div className="space-y-3">
                  {claim.sources_used.map((source, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-muted rounded-lg border border-border">
                      <ExternalLink className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <a
                          href={source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 font-medium text-sm break-all transition-colors"
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
              <div>
                <h3 className="text-lg font-semibold mb-4 text-foreground">{t('factCheck:details.additionalInfo')}</h3>
                <div className="bg-muted rounded-lg p-4 border border-border">
                  <dl className="space-y-3 text-sm">
                    {Object.entries(claim.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="font-medium text-foreground capitalize">
                          {key.replace('_', ' ')}:
                        </dt>
                        <dd className="text-muted-foreground">{String(value)}</dd>
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