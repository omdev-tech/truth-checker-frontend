'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LandingNavigation } from '@/components/layout/LandingNavigation';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { TrustSection } from './TrustSection';
import { CTASection } from './CTASection';
import { GuestAccessModal } from '@/components/molecules/GuestAccessModal';
import { SimpleLandingFactChecker } from '@/components/organisms/SimpleLandingFactChecker';
import { LANDING_PAGE_CONFIG } from '@/lib/config/landing';
import { LandingPageProps } from '@/lib/types/landing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

/**
 * Main Landing Page Component
 * Orchestrates all landing page sections with clean state management
 * Implements conversion flow with guest access and authentication
 */
export function LandingPage({ className }: LandingPageProps) {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Handle different CTA actions
  const handleTryDemo = useCallback(() => {
    setShowGuestModal(true);
  }, []);

  const handleSignUp = useCallback(async () => {
    setIsAuthenticating(true);
    
    try {
      const { signIn } = await import('next-auth/react');
      const result = await signIn('google', {
        callbackUrl: '/app',
        redirect: false,
      });

      if (result?.error) {
        toast.error('Authentication failed. Please try again.');
        console.error('Sign up error:', result.error);
      } else if (result?.url) {
        toast.success('Welcome! Redirecting to your dashboard...');
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Sign-up error:', error);
      toast.error('Authentication error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const handleGetStarted = useCallback(() => {
    handleSignUp();
  }, [handleSignUp]);

  const handleSignIn = useCallback(async () => {
    setIsAuthenticating(true);
    
    try {
      const { signIn } = await import('next-auth/react');
      const result = await signIn('google', {
        callbackUrl: '/app',
        redirect: false,
      });

      if (result?.error) {
        toast.error('Authentication failed. Please try again.');
        console.error('Sign in error:', result.error);
      } else if (result?.url) {
        toast.success('Welcome back! Redirecting to your dashboard...');
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      toast.error('Authentication error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  }, []);



  const closeGuestModal = useCallback(() => {
    setShowGuestModal(false);
  }, []);

  // Page scroll effect handler
  const handleSmoothScroll = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Navigation */}
      <LandingNavigation 
        onSignIn={handleSignIn}
        onGetStarted={handleGetStarted}
      />

      {/* Page Content */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Hero Section */}
        <HeroSection 
          onTryDemo={handleTryDemo}
          onSignUp={handleSignUp}
        />

        {/* Simple Landing Fact Checker */}
        <section className="py-16 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4">
            <SimpleLandingFactChecker onSignUpClick={handleSignUp} />
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection 
          features={LANDING_PAGE_CONFIG.features}
        />

        {/* How It Works Section */}
        <HowItWorksSection 
          steps={LANDING_PAGE_CONFIG.howItWorks}
        />

        {/* Trust Section */}
        <TrustSection 
          metrics={LANDING_PAGE_CONFIG.trust}
        />

        {/* Final CTA Section */}
        <CTASection 
          onGetStarted={handleGetStarted}
          onTryDemo={handleTryDemo}
        />
      </motion.main>

      {/* Footer */}
      <footer className="py-12 bg-muted/30 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <span>&copy; 2024 Truth Checker. All rights reserved.</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <button 
                onClick={() => handleSmoothScroll('features')}
                className="hover:text-foreground transition-colors"
              >
                Features
              </button>
              <button 
                onClick={() => handleSmoothScroll('how-it-works')}
                className="hover:text-foreground transition-colors"
              >
                How It Works
              </button>
              <button 
                onClick={() => handleSmoothScroll('trust')}
                className="hover:text-foreground transition-colors"
              >
                Trust & Safety
              </button>
            </div>
          </div>
          
          {/* Additional footer content */}
          <div className="mt-8 pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Truth Checker is committed to fighting misinformation through AI-powered fact-checking. 
              Our mission is to make accurate information accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </footer>

      {/* Guest Access Modal */}
      <GuestAccessModal 
        isOpen={showGuestModal}
        onClose={closeGuestModal}
        onSignUp={handleSignUp}
      />

      {/* Loading overlay for authentication */}
      {isAuthenticating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <div className="bg-background rounded-lg p-8 shadow-lg border text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Connecting to authentication...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
} 