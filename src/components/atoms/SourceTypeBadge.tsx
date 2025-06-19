import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileText, Upload, Radio, Video } from 'lucide-react';

export type SourceType = 'text_prompt' | 'media_file' | 'live_stream' | 'live_recording';

interface SourceTypeBadgeProps {
  sourceType: SourceType;
  className?: string;
}

const SOURCE_TYPE_CONFIG = {
  text_prompt: {
    label: 'Text',
    icon: FileText,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
  },
  media_file: {
    label: 'File',
    icon: Upload,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
  },
  live_stream: {
    label: 'Stream',
    icon: Radio,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
  },
  live_recording: {
    label: 'Recording',
    icon: Video,
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
  },
} as const;

export function SourceTypeBadge({ sourceType, className }: SourceTypeBadgeProps) {
  const config = SOURCE_TYPE_CONFIG[sourceType];
  const Icon = config.icon;

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
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </Badge>
  );
} 