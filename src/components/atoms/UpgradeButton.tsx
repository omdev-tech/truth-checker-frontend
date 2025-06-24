'use client';

import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Crown, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpgradeButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'default' | 'premium' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const UpgradeButton: React.FC<UpgradeButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  children,
  className,
}) => {
  const { t } = useTranslation(['common']);

  const getIcon = () => {
    switch (variant) {
      case 'premium':
        return <Crown className="h-4 w-4" />;
      case 'default':
        return <Zap className="h-4 w-4" />;
      default:
        return <ArrowRight className="h-4 w-4" />;
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg';
      case 'default':
        return 'bg-primary hover:bg-primary/90 text-primary-foreground';
      case 'outline':
        return 'border-primary text-primary hover:bg-primary hover:text-primary-foreground';
      case 'ghost':
        return 'text-primary hover:bg-primary/10';
      default:
        return '';
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center gap-2 font-semibold transition-all duration-200',
        getVariantClasses(),
        sizeClasses[size],
        fullWidth && 'w-full',
        loading && 'opacity-70 cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        getIcon()
      )}
      {children || (loading ? t('common:actions.processing') : t('common:plans.upgradePlan'))}
    </Button>
  );
}; 