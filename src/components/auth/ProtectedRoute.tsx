'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

/**
 * Protected Route Component
 * Handles authentication state and provides appropriate UI feedback
 * Redirects unauthenticated users or shows fallback content
 */
export function ProtectedRoute({ 
  children, 
  fallback,
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, signIn } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Checking authentication...</p>
        </motion.div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Use custom fallback if provided
    if (fallback) {
      return <>{fallback}</>;
    }

    // Default authentication required UI
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center space-y-6 p-8"
        >
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">
              Authentication Required
            </h2>
            <p className="text-muted-foreground">
              Please sign in to access this page. We'll redirect you back here after authentication.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={signIn}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Sign In with Google
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle className="h-3 w-3" />
              <span>Secure authentication powered by Google</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // User is authenticated or authentication is not required
  return <>{children}</>;
} 