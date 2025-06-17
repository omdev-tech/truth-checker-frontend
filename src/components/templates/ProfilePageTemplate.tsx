'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UsageOverview } from '@/components/molecules/UsageOverview';
import { PlanBadge } from '@/components/atoms/PlanBadge';
import { UpgradeButton } from '@/components/atoms/UpgradeButton';
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
  Settings, 
  Download,
  Loader2,
  AlertCircle 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfilePageTemplateProps {
  className?: string;
}

export const ProfilePageTemplate: React.FC<ProfilePageTemplateProps> = ({
  className,
}) => {
  const { user: authUser, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    }
  }, [isAuthenticated]);

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
      setError(err instanceof Error ? err.message : 'Failed to load user data');
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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error || !userProfile) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Failed to load profile'}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadUserData}
              className="ml-2"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn('container mx-auto px-4 py-6 space-y-6', className)}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profile</h1>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Account Settings
        </Button>
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
                  <span>Member since {formatDate(authUser?.id || new Date().toISOString())}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>Current plan: {userProfile.plan}</span>
                </div>
              </div>

              {/* Account Status */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Account Status</span>
                  <Badge variant="default">
                    Active
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-4 space-y-2">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <UpgradeButton
                    onClick={() => {/* Navigate to plans */}}
                    variant="default"
                    size="sm"
                    fullWidth
                  >
                    Upgrade Plan
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
                  Account Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-primary">
                      {usageStats.current_period.requests_used}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Requests This Month
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-purple-600">
                      {usageStats.current_period.hours_used}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Hours Processed
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
                  <span>Loading usage statistics...</span>
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
                      Try Again
                    </Button>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          ) : usageStats ? (
            <UsageOverview usageStats={usageStats} />
          ) : null}

          {/* Usage History Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                  <p>Usage analytics chart</p>
                  <p className="text-sm">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Billing Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Billing Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageStats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Current Plan</div>
                      <div className="font-medium capitalize">{usageStats.plan_info.name}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Billing Cycle</div>
                      <div className="font-medium capitalize">{usageStats.plan_info.billing_cycle}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Next Reset</div>
                      <div className="font-medium">
                        {usageStats.plan_info.next_reset 
                          ? formatDate(usageStats.plan_info.next_reset)
                          : 'N/A'
                        }
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Currency</div>
                      <div className="font-medium">{usageStats.plan_info.currency}</div>
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4">
                  <Button variant="outline" className="w-full sm:w-auto">
                    View Billing History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 