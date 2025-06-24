'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { truthCheckerApi } from '@/lib/api';
import { HealthStatus } from '@/lib/types';
import { Sun, Moon, Activity, User, LogOut, CreditCard, ArrowLeft, FileText } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Logo } from '@/components/atoms/Logo';
import { LanguageSelector } from '@/components/atoms/LanguageSelector';
import { useTranslation } from 'react-i18next';

export function Header() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslation('common');
  const { 
    isAuthenticated, 
    user, 
    signOut, 
    getDisplayName, 
    getUserInitials,
    isLoading: authLoading 
  } = useAuth();

  useEffect(() => {
    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const status = await truthCheckerApi.getHealth();
      setHealthStatus(status);
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const getHealthBadge = () => {
    if (isLoadingHealth) {
      return (
        <Badge variant="outline" className="gap-1">
          <LoadingSpinner size="sm" />
          {t('status.loading')}
        </Badge>
      );
    }

    if (!healthStatus) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Activity className="w-3 h-3" />
          {t('status.offline', 'Offline')}
        </Badge>
      );
    }

    // If we receive a health response, the server is online
    // Provider initialization status should not affect the server health indicator
    const hasAnyProviders = [
      ...Object.values(healthStatus.ai_providers),
      ...Object.values(healthStatus.mcp_providers)
    ].some(Boolean);

    const allProvidersHealthy = [
      ...Object.values(healthStatus.ai_providers),
      ...Object.values(healthStatus.mcp_providers)
    ].every(Boolean);

    // Show "Online" if server responds (regardless of provider status)
    // Show "Partial" only if server is responding but some providers are initialized and others aren't
    // This provides more meaningful status information
    const statusVariant = allProvidersHealthy ? "default" : "secondary";
    const statusText = hasAnyProviders && !allProvidersHealthy ? t('status.partial', 'Partial') : t('status.online', 'Online');
    const statusClass = allProvidersHealthy 
      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' 
      : hasAnyProviders 
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
        : 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';

    return (
      <Badge 
        variant={statusVariant} 
        className={`gap-1 ${statusClass}`}
      >
        <Activity className="w-3 h-3" />
        {statusText}
      </Badge>
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirect to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handlePlansClick = () => {
    router.push('/plans');
  };

  const handleHistoryClick = () => {
    router.push('/history');
  };

  const handleBackToApp = () => {
    router.push('/app');
  };

  // Check if we're on a secondary page that should show "Back to App"
  const isOnSecondaryPage = pathname === '/profile' || pathname === '/plans';

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo and Title */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`flex items-center gap-3 ${isOnSecondaryPage ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
          onClick={isOnSecondaryPage ? handleBackToApp : undefined}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl overflow-hidden">
            <Logo width={56} height={56} priority className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">TruthChecker</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t('app.tagline')}
            </p>
          </div>
        </motion.div>

        {/* Status and Controls */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {/* Back to App Button */}
          {isAuthenticated && isOnSecondaryPage && (
            <>
              {/* Desktop version */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleBackToApp}
                className="hidden sm:flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('actions.back')}
              </Button>
              {/* Mobile version */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToApp}
                className="sm:hidden p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Health Status */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('status.label', 'Status')}:</span>
            {getHealthBadge()}
          </div>

          {/* Language Selector */}
          <LanguageSelector variant="ghost" size="sm" />

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-9 h-9 p-0"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          {!authLoading && (
            <>
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ''} alt={getDisplayName() || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {getDisplayName()}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick}>
                      <User className="mr-2 h-4 w-4" />
                      <span>{t('navigation.profile')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleHistoryClick}>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{t('navigation.history')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={handlePlansClick}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>{t('navigation.plans')}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t('navigation.logout')}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/'}
                  className="text-sm"
                >
                  <User className="mr-2 h-4 w-4" />
                  {t('navigation.login')}
                </Button>
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
} 