import { Progress } from '@/components/ui/progress';
import { CONFIDENCE_CONFIG } from '@/lib/constants';
import { VerificationResult } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ConfidenceIndicatorProps {
  confidence: VerificationResult['confidence'];
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceIndicator({ 
  confidence, 
  showLabel = true, 
  className 
}: ConfidenceIndicatorProps) {
  const config = CONFIDENCE_CONFIG[confidence];

  return (
    <div className={cn('space-y-1', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Confidence</span>
          <span className={cn('font-medium', config.color)}>
            {config.label}
          </span>
        </div>
      )}
      <Progress 
        value={config.value} 
        className="h-2"
      />
    </div>
  );
} 