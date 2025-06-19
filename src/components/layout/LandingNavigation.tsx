'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Menu, X } from 'lucide-react';
import { NAVIGATION_CONFIG } from '@/lib/config/landing';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/atoms/Logo';

interface LandingNavigationProps {
  onSignIn: () => void;
  onGetStarted: () => void;
  className?: string;
}

/**
 * Landing Page Navigation Component
 * Clean, responsive navigation with mobile support
 * Follows accessibility best practices
 */
export function LandingNavigation({ 
  onSignIn, 
  onGetStarted, 
  className 
}: LandingNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLinkClick = (href: string) => {
    // Smooth scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    // Close mobile menu
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b",
      className
    )}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Logo width={32} height={32} priority className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-foreground">
              {NAVIGATION_CONFIG.logo.text}
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {NAVIGATION_CONFIG.links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link.href)}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onSignIn}
              className="font-medium"
            >
              {NAVIGATION_CONFIG.actions.signIn}
            </Button>
            <Button 
              onClick={onGetStarted}
              className="bg-primary hover:bg-primary/90 font-medium"
            >
              {NAVIGATION_CONFIG.actions.getStarted}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-md">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {NAVIGATION_CONFIG.links.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleLinkClick(link.href)}
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors w-full text-left"
                >
                  {link.label}
                </button>
              ))}
              
              {/* Mobile Actions */}
              <div className="pt-4 pb-2 space-y-2">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    onSignIn();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start font-medium"
                >
                  {NAVIGATION_CONFIG.actions.signIn}
                </Button>
                <Button 
                  onClick={() => {
                    onGetStarted();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 font-medium"
                >
                  {NAVIGATION_CONFIG.actions.getStarted}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 