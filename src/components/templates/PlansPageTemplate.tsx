'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { truthCheckerApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { PlanSelector } from '@/components/organisms/PlanSelector';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { 
  CheckCircle,
  Zap,
  Timer
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { wasPaymentSuccessful, getCheckoutSessionFromUrl } from '@/lib/stripe';

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
  const { t } = useTranslation(['common', 'dashboard']);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);

  // Check for payment status on component mount
  useEffect(() => {
    const checkPaymentStatus = () => {
      if (wasPaymentSuccessful()) {
        const sessionId = getCheckoutSessionFromUrl();
        toast.success(t('common:plans.success.planUpgraded'), {
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
      }
    };

    checkPaymentStatus();
  }, [t, router]);

  const handlePlanSelect = async (planId: string, billingCycle: 'monthly' | 'annual') => {
    if (!isAuthenticated) {
      toast.error(t('dashboard:profile.loginRequired'));
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
          toast.success(t('common:plans.success.planUpgraded'));
          // Refresh the page or redirect to profile
          router.push('/profile');
        }
      } else {
        toast.error(response.message || t('common:plans.success.failedUpgrade'));
      }
    } catch (error) {
      console.error('Plan upgrade error:', error);
      toast.error(t('common:plans.success.tryAgainLater'));
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
                  {t('dashboard:plans.badges.discount', { percent: EARLY_ADOPTER_DISCOUNT })}
                </Badge>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {t('common:plans.earlyAdopter.title', { percent: EARLY_ADOPTER_DISCOUNT })}
              </h2>
              <p className="text-white/90 max-w-2xl">
                {t('common:plans.earlyAdopter.description', { percent: EARLY_ADOPTER_DISCOUNT })}
              </p>
              <div className="mt-4 text-sm text-white/80">
                {t('common:plans.earlyAdopter.perks')}
              </div>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            {t('common:plans.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('common:plans.subtitle')}
            {IsEarlyDevelopment && (
              <span className="block mt-2 text-orange-600 font-medium">
                {t('common:plans.earlyAdopterDiscount', { percent: EARLY_ADOPTER_DISCOUNT })}
              </span>
            )}
          </p>
        </div>

        {/* Benefits Section */}
        <div className="bg-muted/30 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            {t('common:plans.benefits.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{t('common:plans.benefits.advancedAI')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{t('common:plans.benefits.multipleSourceVerification')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{t('common:plans.benefits.detailedReports')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{t('common:plans.benefits.apiAccess')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{t('common:plans.benefits.realTimeProcessing')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{t('common:plans.benefits.multiLanguage')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{t('common:plans.benefits.usageAnalytics')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>{t('common:plans.benefits.cancelAnytime')}</span>
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
            {t('common:plans.faq.title')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {IsEarlyDevelopment && (
              <div className="space-y-2 md:col-span-2 bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                <h3 className="font-medium text-orange-900 dark:text-orange-100">{t('common:plans.earlyAdopter.faq.title')}</h3>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  {t('common:plans.earlyAdopter.faq.description')}
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <h3 className="font-medium">{t('common:plans.faq.changePlans.question')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('common:plans.faq.changePlans.answer')}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{t('common:plans.faq.unusedRequests.question')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('common:plans.faq.unusedRequests.answer')}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{t('common:plans.faq.refunds.question')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('common:plans.faq.refunds.answer')}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium">{t('common:plans.faq.enterprise.question')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('common:plans.faq.enterprise.answer')}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="text-center space-y-4 pt-8 border-t">
          <h3 className="text-lg font-medium">
            {t('common:plans.contact.title')}
          </h3>
          <p className="text-muted-foreground">
            {t('common:plans.contact.description')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href={`mailto:${t('common:plans.contact.email')}`}
              className="text-primary hover:underline"
            >
              {t('common:plans.contact.email')}
            </a>          
          </div>
        </div>
      </main>
    </div>
  );
}; 