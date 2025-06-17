'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Shield, Sun, Moon, Activity, User, LogOut, Settings, CreditCard } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';

export function Header() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);
  const { theme, setTheme } = useTheme();
  const router = useRouter();
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
          Checking...
        </Badge>
      );
    }

    if (!healthStatus) {
      return (
        <Badge variant="destructive" className="gap-1">
          <Activity className="w-3 h-3" />
          Offline
        </Badge>
      );
    }

    const allProvidersHealthy = [
      ...Object.values(healthStatus.ai_providers),
      ...Object.values(healthStatus.mcp_providers)
    ].every(Boolean);

    return (
      <Badge 
        variant={allProvidersHealthy ? "default" : "secondary"} 
        className={`gap-1 ${allProvidersHealthy ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' : ''}`}
      >
        <Activity className="w-3 h-3" />
        {allProvidersHealthy ? 'Online' : 'Partial'}
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

  const handleBillingClick = () => {
    router.push('/plans');
  };

  const handleSettingsClick = () => {
    // For now, redirect to profile until we have a dedicated settings page
    router.push('/profile');
  };

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
          className="flex items-center gap-3"
        >
          <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-xl">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">TruthChecker</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              AI-Powered Fact Verification
            </p>
          </div>
        </motion.div>

        {/* Status and Controls */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {/* Health Status */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            {getHealthBadge()}
          </div>

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
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleBillingClick}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Usage & Billing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer" onClick={handleSettingsClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
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
                  Sign In
                </Button>
              )}
            </>
          )}
        </motion.div>
      </div>
    </motion.header>
  );
} 