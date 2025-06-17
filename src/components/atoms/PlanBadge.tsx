'use client';

import { Badge } from '@/components/ui/badge';
import { Crown, Zap, Star, Building, Rocket, Users } from 'lucide-react';

interface PlanBadgeProps {
  plan: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'secondary';
}

const planIcons: Record<string, typeof Crown> = {
  free: Star,
  starter: Zap,
  casual: Rocket,
  independent: Crown,
  professional: Building,
  business: Users,
};

const planColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-700 border-gray-300',
  starter: 'bg-green-100 text-green-700 border-green-300',
  casual: 'bg-blue-100 text-blue-700 border-blue-300',
  independent: 'bg-purple-100 text-purple-700 border-purple-300',
  professional: 'bg-orange-100 text-orange-700 border-orange-300',
  business: 'bg-red-100 text-red-700 border-red-300',
};

export const PlanBadge: React.FC<PlanBadgeProps> = ({ 
  plan, 
  size = 'md', 
  variant = 'default' 
}) => {
  const Icon = planIcons[plan.toLowerCase()] || Star;
  const colorClass = planColors[plan.toLowerCase()] || planColors.free;
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Badge 
      variant={variant as any}
      className={`
        ${sizeClasses[size]} 
        ${variant === 'default' ? colorClass : ''} 
        inline-flex items-center gap-1 font-medium capitalize
      `}
    >
      <Icon className={iconSizes[size]} />
      {plan}
    </Badge>
  );
}; 