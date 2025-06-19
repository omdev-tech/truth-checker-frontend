'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

/**
 * Logo Component
 * Displays the appropriate logo based on current theme
 * Light theme: black logo, Dark theme: white logo (when available)
 * Future-ready: will automatically switch when dark theme logo is added
 */
export function Logo({ 
  className, 
  width = 32, 
  height = 32, 
  priority = false 
}: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div 
        className={cn('animate-pulse bg-muted rounded', className)}
        style={{ width, height }}
      />
    );
  }

  // Use appropriate logo for each theme
  // Light theme: black logo, Dark theme: white logo
  const logoSrc = resolvedTheme === 'dark' 
    ? '/truth_logo_darkTheme.png'
    : '/truth_logo_lightTheme.png';

  return (
    <Image
      src={logoSrc}
      alt="TruthChecker Logo"
      width={width}
      height={height}
      priority={priority}
      className={cn('object-contain', className)}
    />
  );
} 