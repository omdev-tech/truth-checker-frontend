'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { FactCheckHistoryDashboard } from '@/components/pages/FactCheckHistoryDashboard';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { Header } from '@/components/layout/Header';

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session) {
      // Redirect to sign in if not authenticated
      router.push('/api/auth/signin?callbackUrl=/history');
      return;
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4">
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-2 text-gray-600">Loading history...</span>
          </div>
        }>
          <FactCheckHistoryDashboard />
        </Suspense>
      </div>
    </div>
  );
} 