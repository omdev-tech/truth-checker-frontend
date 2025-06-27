import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SessionList } from '@/components/organisms/SessionList';
import { SessionSegmentsList } from '@/components/organisms/SessionSegmentsList';
import { ClaimDetailsModal } from '@/components/organisms/ClaimDetailsModal';
import { SessionDetailsModal } from '@/components/organisms/SessionDetailsModal';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { truthCheckerApi } from '@/lib/api';
import { SessionSummary, SessionSegment, FactCheckClaim, FactCheckSession } from '@/lib/types';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BarChart3,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

export function FactCheckHistoryDashboard() {
  const { t } = useTranslation(['dashboard', 'factCheck', 'common']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    sessions,
    selectedSession,
    sessionSegments,
    statistics,
    isLoadingSessions,
    isLoadingSegments,
    error,
    hasMoreSessions,
    isInitialized,
    loadMoreSessions,
    selectSession,
    clearSelectedSession,
    refreshSessions,
  } = useSessionManagement();

  // Modal state for displaying claim details
  const [selectedClaim, setSelectedClaim] = useState<FactCheckClaim | null>(null);
  const [selectedFactCheckSession, setSelectedFactCheckSession] = useState<FactCheckSession | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isLoadingClaims, setIsLoadingClaims] = useState(false);
  const [claims, setClaims] = useState<FactCheckClaim[]>([]);

  // Auto-select session from URL parameter
  useEffect(() => {
    const sessionId = searchParams.get('sessionId');
    if (sessionId && isInitialized && sessions.length > 0 && !selectedSession) {
      // Find the session with the matching ID
      const targetSession = sessions.find(session => session.id === sessionId);
      if (targetSession) {
        selectSession(targetSession);
        // Update URL to remove the parameter (keeps URL clean)
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('sessionId');
        window.history.replaceState({}, '', newUrl.toString());
      } else {
        // Session not found in current page, might need to load more
        console.log(`Session with ID ${sessionId} not found in current sessions list`);
      }
    }
  }, [isInitialized, sessions, selectedSession, selectSession, searchParams]);

  const handleSessionSelect = (session: SessionSummary) => {
    selectSession(session);
  };

  const handleSegmentView = async (segment: SessionSegment) => {
    try {
      setIsLoadingClaims(true);
      
      // Get the fact-check session details which includes claims
      const sessionResponse = await truthCheckerApi.getSessionDetails(segment.fact_check_session_id);
      
      setSelectedFactCheckSession(sessionResponse.session);
      setClaims(sessionResponse.claims);
      setIsSessionModalOpen(true);
    } catch (error) {
      console.error('Error loading segment details:', error);
      // Fallback: show error or basic info
    } finally {
      setIsLoadingClaims(false);
    }
  };

  const handleClaimClick = (claim: FactCheckClaim) => {
    setSelectedClaim(claim);
    setIsClaimModalOpen(true);
  };

  const handleCloseClaimModal = () => {
    setIsClaimModalOpen(false);
    setSelectedClaim(null);
  };

  const handleCloseSessionModal = () => {
    setIsSessionModalOpen(false);
    setSelectedFactCheckSession(null);
    setClaims([]);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  };

  const getStatusIcon = (status: string, className = "w-5 h-5") => {
    switch (status) {
      case 'true':
        return <CheckCircle className={`${className} text-green-600`} />;
      case 'false':
        return <XCircle className={`${className} text-red-600`} />;
      case 'partially_true':
        return <AlertTriangle className={`${className} text-yellow-600`} />;
      default:
        return <AlertTriangle className={`${className} text-gray-600`} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common:actions.back')}
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('dashboard:history.title')}</h1>
            <p className="text-muted-foreground">{t('dashboard:history.subtitle')}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={refreshSessions}
          disabled={isLoadingSessions}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingSessions ? 'animate-spin' : ''}`} />
          {t('common:actions.refresh')}
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Overview - only show if we have statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:history.stats.totalSessions')}</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{statistics.total_sessions}</div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard:history.stats.claimsProcessed', { count: statistics.total_claims })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:history.stats.processingTime')}</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatDuration(statistics.total_processing_time_seconds)}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('dashboard:history.stats.averagePerClaim', { avg: formatDuration(statistics.average_processing_time_per_claim) })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:history.stats.accuracyTrends')}</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statistics.status_breakdown).slice(0, 3).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status, "w-3 h-3")}
                      <span className="capitalize text-foreground">{t(`factCheck:status.${status}`)}</span>
                    </div>
                    <span className="font-medium text-foreground">{String(count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t('dashboard:history.stats.sourceTypes')}</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statistics.source_type_breakdown).slice(0, 3).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-foreground">{type.replace('_', ' ')}</span>
                    <span className="font-medium text-foreground">{String(count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading state for initial load */}
      {(isLoadingSessions && !isInitialized) && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-2 text-muted-foreground">{t('dashboard:history.loading')}</span>
        </div>
      )}

      {/* Main content - Two column layout */}
      {isInitialized && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column - Sessions list */}
          <div className="space-y-4">
            <SessionList
              sessions={sessions}
              selectedSession={selectedSession}
              isLoading={isLoadingSessions}
              hasMore={hasMoreSessions}
              onSessionSelect={handleSessionSelect}
              onLoadMore={loadMoreSessions}
            />
          </div>

          {/* Right column - Session segments */}
          <div className="space-y-4">
            <SessionSegmentsList
              session={selectedSession}
              segments={sessionSegments}
              isLoading={isLoadingSegments || isLoadingClaims}
              onSegmentView={handleSegmentView}
            />
          </div>
        </div>
      )}

      {/* Empty state - only show when initialized and no data */}
      {isInitialized && !isLoadingSessions && !error && sessions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">{t('dashboard:history.empty.title')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('dashboard:history.empty.description')}
            </p>
            <Button onClick={() => router.push('/')} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {t('dashboard:history.empty.startButton')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Claim Details Modal */}
      <ClaimDetailsModal
        claim={selectedClaim}
        isOpen={isClaimModalOpen}
        onClose={handleCloseClaimModal}
      />

      {/* Session Details Modal */}
      <SessionDetailsModal
        session={selectedFactCheckSession}
        claims={claims}
        isOpen={isSessionModalOpen}
        onClose={handleCloseSessionModal}
        onClaimClick={handleClaimClick}
      />
    </div>
  );
} 