import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { ConfidenceIndicator } from '@/components/atoms/ConfidenceIndicator';
import { VerificationResult } from '@/lib/types';
import { formatTimestamp } from '@/lib/format';
import { ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerificationCardProps {
  result: VerificationResult;
  index?: number;
}

export function VerificationCard({ result, index = 0 }: VerificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-muted-foreground mb-2">
                Claim
              </h3>
              <p className="text-foreground font-medium leading-relaxed">
                {result.claim_text}
              </p>
            </div>
            <StatusBadge status={result.status} />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <ConfidenceIndicator confidence={result.confidence} />
          
          <div>
            <h4 className="font-medium text-sm text-muted-foreground mb-2">
              Explanation
            </h4>
            <p className="text-sm text-foreground leading-relaxed">
              {result.explanation}
            </p>
          </div>

          {result.sources.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Sources
              </h4>
              <div className="space-y-1">
                {result.sources.map((source, i) => (
                  <a
                    key={i}
                    href={source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors group/link cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate group-hover/link:underline">
                      {new URL(source).hostname}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
            <Clock className="w-3 h-3" />
            <span>Verified at {formatTimestamp(result.timestamp)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 