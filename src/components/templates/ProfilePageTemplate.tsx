'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UsageOverview } from '@/components/molecules/UsageOverview';
import { UsageAnalyticsChart } from '@/components/organisms/UsageAnalyticsChart';
import { PlanBadge } from '@/components/atoms/PlanBadge';
import { UpgradeButton } from '@/components/atoms/UpgradeButton';
import { Header } from '@/components/layout/Header';
import { truthCheckerApi } from '@/lib/api';
import { UsageStats, UserProfile } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { 
  User, 
  Mail, 
  Calendar, 
  Activity, 
  TrendingUp, 
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { wasPaymentSuccessful, getCheckoutSessionFromUrl } from '@/lib/stripe';

interface ProfilePageTemplateProps {
  className?: string;
}

export const ProfilePageTemplate: React.FC<ProfilePageTemplateProps> = ({
  className,
}) => {
  const { t } = useTranslation(['common', 'dashboard']);
  const router = useRouter();
  const { user: authUser, isAuthenticated, isLoading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

  // Check for successful payment on component mount
  useEffect(() => {
    const checkPaymentSuccess = () => {
      if (wasPaymentSuccessful()) {
        const sessionId = getCheckoutSessionFromUrl();
        toast.success(t('dashboard:profile.paymentSuccess'), {
          duration: 5000,
        });
        
        // Clean up URL parameters
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        url.searchParams.delete('session_id');
        window.history.replaceState({}, '', url.toString());
        
        // Reload user data to reflect the upgrade
        if (isAuthenticated) {
          setTimeout(() => {
            loadUserData();
          }, 1000);
        }
      }
    };

    checkPaymentSuccess();
  }, [isAuthenticated, t]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load both user profile and usage stats in parallel
      const [profile, stats] = await Promise.all([
        truthCheckerApi.getUserProfile(),
        truthCheckerApi.getUserUsageStats()
      ]);
      
      setUserProfile(profile);
      setUsageStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common:errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleUpgradePlan = () => {
    router.push('/plans');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <main className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">{t('dashboard:profile.loginRequired')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <main className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('dashboard:profile.loading')}</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <main className="flex items-center justify-center min-h-[400px]">
          <Alert variant="destructive" className="max-w-md">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || t('dashboard:profile.loadError')}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadUserData}
                className="ml-2"
              >
                {t('common:actions.tryAgain')}
              </Button>
            </AlertDescription>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className={cn('container mx-auto px-4 py-6 space-y-6', className)}>
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{t('dashboard:profile.title')}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Info Card */}
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userProfile.avatar_url || authUser?.image || undefined} alt={userProfile.name} />
                    <AvatarFallback className="text-lg">
                      {getInitials(userProfile.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{userProfile.name}</CardTitle>
                <div className="flex justify-center">
                  <PlanBadge plan={userProfile.plan} size="md" />
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{userProfile.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{t('dashboard:profile.memberSince', { date: formatDate(authUser?.id || new Date().toISOString()) })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>{t('dashboard:profile.currentPlan', { plan: userProfile.plan })}</span>
                  </div>
                </div>

                {/* Account Status */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('dashboard:profile.accountStatus')}</span>
                    <Badge variant="default">
                      {t('dashboard:profile.statusActive')}
                    </Badge>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t pt-4 space-y-2">
                  <h4 className="text-sm font-medium">{t('dashboard:profile.quickActions')}</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <Download className="h-4 w-4 mr-2" />
                      {t('dashboard:profile.exportData')}
                    </Button>
                    <UpgradeButton
                      onClick={handleUpgradePlan}
                      variant="default"
                      size="sm"
                      fullWidth
                    >
                      {t('dashboard:profile.upgradePlan')}
                    </UpgradeButton>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Statistics */}
            {usageStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {t('dashboard:profile.statistics.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-primary">
                        {usageStats.current_period.requests_used}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('dashboard:profile.statistics.requestsThisMonth')}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold text-purple-600">
                        {usageStats.current_period.hours_used}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {t('dashboard:profile.statistics.hoursProcessed')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Usage Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>{t('dashboard:profile.loadingUsage')}</span>
                  </div>
                </CardContent>
              </Card>
            ) : error ? (
              <Card>
                <CardContent className="py-6">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={loadUserData}
                        className="ml-2"
                      >
                        {t('common:actions.tryAgain')}
                      </Button>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            ) : usageStats ? (
              <UsageOverview usageStats={usageStats} />
            ) : null}

            {/* Usage History Chart */}
            <UsageAnalyticsChart />

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('dashboard:profile.billing.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usageStats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">{t('dashboard:profile.billing.currentPlan')}</div>
                        <div className="font-medium capitalize">{usageStats.plan_info.name}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">{t('dashboard:profile.billing.billingCycle')}</div>
                        <div className="font-medium capitalize">{usageStats.plan_info.billing_cycle}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">{t('dashboard:profile.billing.nextReset')}</div>
                        <div className="font-medium">
                          {usageStats.plan_info.next_reset 
                            ? formatDate(usageStats.plan_info.next_reset)
                            : t('common:notApplicable')
                          }
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm text-muted-foreground">{t('dashboard:profile.billing.currency')}</div>
                        <div className="font-medium">{usageStats.plan_info.currency}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <Button variant="outline" className="w-full sm:w-auto">
                      {t('dashboard:profile.billing.viewHistory')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}; 