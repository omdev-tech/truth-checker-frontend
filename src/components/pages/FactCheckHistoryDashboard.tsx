import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FactCheckHistoryList } from '@/components/organisms/FactCheckHistoryList';
import { SessionDetailsModal } from '@/components/organisms/SessionDetailsModal';
import { ClaimDetailsModal } from '@/components/organisms/ClaimDetailsModal';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { useFactCheckHistory } from '@/hooks/useFactCheckHistory';
import { FactCheckSession, FactCheckClaim } from '@/lib/types';
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
  const router = useRouter();
  const {
    sessions,
    claims,
    statistics,
    isLoading,
    error,
    hasMore,
    loadMore,
    refreshHistory,
    setFilters,
  } = useFactCheckHistory();

  const [selectedSession, setSelectedSession] = useState<FactCheckSession | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<FactCheckClaim | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  const handleSessionClick = (session: FactCheckSession) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  const handleCloseSessionModal = () => {
    setIsSessionModalOpen(false);
    setSelectedSession(null);
  };

  const handleClaimClick = (claim: FactCheckClaim) => {
    setSelectedClaim(claim);
    setIsClaimModalOpen(true);
  };

  const handleCloseClaimModal = () => {
    setIsClaimModalOpen(false);
    setSelectedClaim(null);
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
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Fact-Check History</h1>
            <p className="text-muted-foreground">Review your past fact-checking sessions and results</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={refreshHistory}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Overview */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{statistics.total_sessions}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.total_claims} claims processed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatDuration(statistics.total_processing_time_seconds)}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatDuration(statistics.average_processing_time_per_claim)} per claim
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accuracy Trends</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(statistics.status_breakdown).slice(0, 3).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status, "w-3 h-3")}
                      <span className="capitalize text-foreground">{status.replace('_', ' ')}</span>
                    </div>
                    <span className="font-medium text-foreground">{String(count)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Source Types</CardTitle>
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
      {isLoading && sessions.length === 0 && claims.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
          <span className="ml-2 text-muted-foreground">Loading your history...</span>
        </div>
      )}

      {/* History List */}
      {(sessions.length > 0 || claims.length > 0 || (!isLoading && !error)) && (
        <FactCheckHistoryList
          sessions={sessions}
          claims={claims}
          isLoading={isLoading}
          onLoadMore={hasMore ? loadMore : undefined}
          onSessionClick={handleSessionClick}
          onClaimClick={handleClaimClick}
          onFiltersChange={setFilters}
          hasMore={hasMore}
        />
      )}

      {/* Empty state when no data and not loading */}
      {!isLoading && !error && sessions.length === 0 && claims.length === 0 && statistics && (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No History Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start fact-checking to build your history and track your accuracy over time.
            </p>
            <Button onClick={() => router.push('/')} className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Start Fact-Checking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Session Details Modal */}
      <SessionDetailsModal
        session={selectedSession}
        claims={claims}
        isOpen={isSessionModalOpen}
        onClose={handleCloseSessionModal}
        onClaimClick={handleClaimClick}
      />

      {/* Claim Details Modal */}
      <ClaimDetailsModal
        claim={selectedClaim}
        isOpen={isClaimModalOpen}
        onClose={handleCloseClaimModal}
      />
    </div>
  );
} 