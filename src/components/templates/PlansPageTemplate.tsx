'use client';

import { useState, useEffect } from 'react';
import { PlanSelector } from '@/components/organisms/PlanSelector';
import { Header } from '@/components/layout/Header';
import { truthCheckerApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { CheckCircle, Zap, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { wasPaymentCancelled, wasPaymentSuccessful, getCheckoutSessionFromUrl } from '@/lib/stripe';

// ========================================
// 🚀 EARLY DEVELOPMENT FEATURE FLAG
// ========================================
// Set to false to disable early adopter discount
const IsEarlyDevelopment = false;
const EARLY_ADOPTER_DISCOUNT = 30; // 30% discount for early adopters
// ========================================

interface PlansPageTemplateProps {
  className?: string;
}

export const PlansPageTemplate: React.FC<PlansPageTemplateProps> = ({
  className,
}) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Check for payment status on component mount
  useEffect(() => {
    const checkPaymentStatus = () => {
      if (wasPaymentSuccessful()) {
        const sessionId = getCheckoutSessionFromUrl();
        toast.success('🎉 Payment successful! Your plan has been upgraded.', {
          duration: 5000,
        });
        
        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('session_id');
        window.history.replaceState({}, '', url.toString());
        
        // Redirect to profile after a short delay
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else if (wasPaymentCancelled()) {
        toast.error('Payment was cancelled. You can try again anytime.');
        
        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        window.history.replaceState({}, '', url.toString());
      }
    };

    checkPaymentStatus();
  }, [router]);

  const handlePlanSelect = async (planId: string, billingCycle: 'monthly' | 'annual') => {
    if (!isAuthenticated) {
      toast.error('Please sign in to upgrade your plan');
      return;
    }

    try {
      setIsUpgrading(true);
      
      // Call the upgrade API
      const response = await truthCheckerApi.upgradePlan(planId, billingCycle);
      
      if (response.success) {
        if (response.checkout_url) {
          // Redirect directly to Stripe checkout URL
          window.location.href = response.checkout_url;
        } else {
          toast.success('Plan upgraded successfully!');
          // Refresh the page or redirect to profile
          router.push('/profile');
        }
      } else {
        toast.error(response.message || 'Failed to upgrade plan');
      }
    } catch (error) {
      console.error('Plan upgrade error:', error);
      toast.error('Failed to upgrade plan. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className={cn('container mx-auto px-4 py-6 space-y-8', className)}>
        {/* Early Development Discount Banner */}
        {IsEarlyDevelopment && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Zap className="h-6 w-6" />
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Timer className="h-3 w-3 mr-1" />
                  Limited Time
                </Badge>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                🚀 Early Adopter Special - {EARLY_ADOPTER_DISCOUNT}% OFF!
              </h2>
              <p className="text-white/90 max-w-2xl">
                As we're still in development, we're offering our early supporters an exclusive <strong>{EARLY_ADOPTER_DISCOUNT}% discount</strong> on all plans. 
                Help us shape the future of AI-powered fact-checking and enjoy premium features at early adopter prices!
              </p>
              <div className="mt-4 text-sm text-white/80">
                ⚡ All features included • 🔒 Price locked for life • 🎯 Priority support
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of AI-powered fact-checking with flexible plans 
            designed for everyone from casual users to large organizations.
            {IsEarlyDevelopment && (
              <span className="block mt-2 text-orange-600 font-medium">
                💥 Limited time: Save {EARLY_ADOPTER_DISCOUNT}% as an early adopter!
              </span>
            )}
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-muted/30 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            What You Get With Every Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Advanced AI fact-checking</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Multiple source verification</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Detailed accuracy reports</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>API access included</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Real-time processing</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Multi-language support</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Usage analytics</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        {/* Plan Selector */}
        <PlanSelector
          currentPlan={user?.id ? 'free' : undefined} // We'll get this from user profile later
          onPlanSelect={handlePlanSelect}
          className="max-w-7xl mx-auto"
          earlyDevelopmentDiscount={IsEarlyDevelopment ? EARLY_ADOPTER_DISCOUNT : 0}
        />

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {IsEarlyDevelopment && (
              <div className="space-y-2 md:col-span-2 bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <h3 className="font-medium text-orange-900 dark:text-orange-100">🎯 Why the early adopter discount?</h3>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  We're still refining our platform and want to reward early supporters who help us improve. 
                  Your feedback is invaluable, and this discount is our way of saying thanks! 
                  <strong>Once you subscribe at the discounted rate, your price is locked for life.</strong>
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-medium">Can I change plans anytime?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. 
                Changes take effect at your next billing cycle.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">What happens to unused requests?</h3>
              <p className="text-sm text-muted-foreground">
                Unused requests don't roll over to the next month, but you can 
                purchase additional credits if needed.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Do you offer refunds?</h3>
              <p className="text-sm text-muted-foreground">
                We offer a 30-day money-back guarantee for new subscriptions. 
                Contact support for assistance.
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">Is there an enterprise plan?</h3>
              <p className="text-sm text-muted-foreground">
                Yes! Contact our sales team for custom enterprise solutions 
                with volume discounts and dedicated support.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center space-y-4 pt-8 border-t">
          <h3 className="text-lg font-medium">
            Need a custom solution?
          </h3>
          <p className="text-muted-foreground">
            Contact our team to discuss enterprise pricing and custom integrations.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href="mailto:omdev.tech@gmail.com" 
              className="text-primary hover:underline"
            >
              omdev.tech@gmail.com
            </a>          
          </div>
        </div>
      </main>
    </div>
  );
}; 