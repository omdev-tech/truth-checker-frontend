'use client';

import { useState } from 'react';
import { PlanSelector } from '@/components/organisms/PlanSelector';
import { truthCheckerApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface PlansPageTemplateProps {
  className?: string;
}

export const PlansPageTemplate: React.FC<PlansPageTemplateProps> = ({
  className,
}) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isUpgrading, setIsUpgrading] = useState(false);

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
          // Redirect to Stripe checkout
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
    <div className={cn('container mx-auto px-4 py-6 space-y-8', className)}>
      {/* Page Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock the full power of AI-powered fact-checking with flexible plans 
          designed for everyone from casual users to large organizations.
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
      />

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-semibold text-center">
          Frequently Asked Questions
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            href="mailto:sales@truthchecker.ai" 
            className="text-primary hover:underline"
          >
            sales@truthchecker.ai
          </a>
          <span className="text-muted-foreground">•</span>
          <a 
            href="tel:+1-555-0123" 
            className="text-primary hover:underline"
          >
            +1 (555) 012-3456
          </a>
        </div>
      </div>
    </div>
  );
}; 