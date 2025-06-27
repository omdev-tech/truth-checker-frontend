import { Badge } from '@/components/ui/badge';
import { VERIFICATION_STATUS_CONFIG } from '@/lib/constants';
import { VerificationResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: VerificationResult['status'];
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation(['gallery', 'common']);
  const config = VERIFICATION_STATUS_CONFIG[status];

  const getStatusLabel = (status: string) => {
    // Try gallery namespace first, then common namespace as fallback
    const galleryKey = `gallery:verificationStatus.${status}`;
    const commonKey = `common:statuses.${status}`;
    
    // Check if translation exists in gallery
    const galleryTranslation = t(galleryKey, { defaultValue: null });
    if (galleryTranslation !== null) {
      return galleryTranslation;
    }
    
    // Try common namespace
    const commonTranslation = t(commonKey, { defaultValue: null });
    if (commonTranslation !== null) {
      return commonTranslation;
    }
    
    // Final fallback to config label or status
    return config?.label || status;
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium',
        config?.color || 'text-gray-600',
        config?.bg || 'bg-gray-50',
        config?.border || 'border-gray-200',
        className
      )}
    >
      <span className="mr-1 text-sm">{config?.icon || '?'}</span>
      {getStatusLabel(status)}
    </Badge>
  );
} 