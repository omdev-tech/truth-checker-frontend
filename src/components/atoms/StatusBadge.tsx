import { Badge } from '@/components/ui/badge';
import { VERIFICATION_STATUS_CONFIG } from '@/lib/constants';
import { VerificationResult } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: VerificationResult['status'];
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = VERIFICATION_STATUS_CONFIG[status];

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium',
        config.color,
        config.bg,
        config.border,
        className
      )}
    >
      <span className="mr-1 text-sm">{config.icon}</span>
      {config.label}
    </Badge>
  );
} 