import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { SessionSummaryCard } from '@/components/molecules/SessionSummaryCard';
import { ClaimHistoryCard } from '@/components/molecules/ClaimHistoryCard';
import { FactCheckSession, FactCheckClaim, HistoryFilters } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Search, Filter, Calendar, FileText, Users } from 'lucide-react';

interface FactCheckHistoryListProps {
  sessions: FactCheckSession[];
  claims: FactCheckClaim[];
  isLoading: boolean;
  onLoadMore?: () => void;
  onSessionClick?: (session: FactCheckSession) => void;
  onClaimClick?: (claim: FactCheckClaim) => void;
  onFiltersChange?: (filters: HistoryFilters) => void;
  hasMore?: boolean;
  className?: string;
}

type ViewMode = 'sessions' | 'claims' | 'all';

export function FactCheckHistoryList({
  sessions,
  claims,
  isLoading,
  onLoadMore,
  onSessionClick,
  onClaimClick,
  onFiltersChange,
  hasMore,
  className,
}: FactCheckHistoryListProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('sessions');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Filter data based on search and filters
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = searchQuery === '' || 
      session.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === 'all' || session.source_type === sourceFilter;
    return matchesSearch && matchesSource;
  });

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = searchQuery === '' || 
      claim.claim_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = sourceFilter === 'all' || claim.source_type === sourceFilter;
    const matchesStatus = statusFilter === 'all' || claim.verification_status === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  // Apply filters when they change
  useEffect(() => {
    if (onFiltersChange) {
      const filters: HistoryFilters = {};
      if (sourceFilter !== 'all') filters.source_type_filter = sourceFilter;
      if (statusFilter !== 'all') filters.status_filter = statusFilter;
      onFiltersChange(filters);
    }
  }, [sourceFilter, statusFilter, onFiltersChange]);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Fact-Check History
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Search and filters */}
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions or claims..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background border-border"
            />
          </div>

          {/* View mode selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">View:</span>
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'sessions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('sessions')}
                className="text-xs"
              >
                Sessions ({filteredSessions.length})
              </Button>
              <Button
                variant={viewMode === 'claims' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('claims')}
                className="text-xs"
              >
                Claims ({filteredClaims.length})
              </Button>
              <Button
                variant={viewMode === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('all')}
                className="text-xs"
              >
                All
              </Button>
            </div>
          </div>

          {/* Advanced filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Source Type</label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-background border-border">
                      {sourceFilter === 'all' ? 'All Sources' : 
                       sourceFilter === 'text_prompt' ? 'Text Prompt' :
                       sourceFilter === 'media_file' ? 'Media File' :
                       sourceFilter === 'live_stream' ? 'Live Stream' :
                       sourceFilter === 'live_recording' ? 'Live Recording' : 'All Sources'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuItem onClick={() => setSourceFilter('all')}>All Sources</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSourceFilter('text_prompt')}>Text Prompt</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSourceFilter('media_file')}>Media File</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSourceFilter('live_stream')}>Live Stream</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSourceFilter('live_recording')}>Live Recording</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {viewMode !== 'sessions' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Verification Status</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between bg-background border-border">
                        {statusFilter === 'all' ? 'All Statuses' : 
                         statusFilter === 'true' ? 'True' :
                         statusFilter === 'false' ? 'False' :
                         statusFilter === 'partially_true' ? 'Partially True' :
                         statusFilter === 'misleading' ? 'Misleading' :
                         statusFilter === 'unverifiable' ? 'Unverifiable' :
                         statusFilter === 'disputed' ? 'Disputed' : 'All Statuses'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuItem onClick={() => setStatusFilter('all')}>All Statuses</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('true')}>True</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('false')}>False</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('partially_true')}>Partially True</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('misleading')}>Misleading</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('unverifiable')}>Unverifiable</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('disputed')}>Disputed</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && sessions.length === 0 && claims.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
            <span className="ml-2 text-muted-foreground">Loading history...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sessions view */}
            {(viewMode === 'sessions' || viewMode === 'all') && (
              <div className="space-y-4">
                {viewMode === 'all' && filteredSessions.length > 0 && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Users className="w-4 h-4" />
                    Sessions ({filteredSessions.length})
                  </div>
                )}
                <div className="grid gap-4">
                  {filteredSessions.map((session) => (
                    <SessionSummaryCard
                      key={session.id}
                      session={session}
                      onClick={() => onSessionClick?.(session)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Claims view */}
            {(viewMode === 'claims' || viewMode === 'all') && (
              <div className="space-y-4">
                {viewMode === 'all' && filteredClaims.length > 0 && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <FileText className="w-4 h-4" />
                    Individual Claims ({filteredClaims.length})
                  </div>
                )}
                <div className="grid gap-3">
                  {filteredClaims.map((claim) => (
                    <ClaimHistoryCard
                      key={claim.id}
                      claim={claim}
                      onClick={() => onClaimClick?.(claim)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {((viewMode === 'sessions' && filteredSessions.length === 0) ||
              (viewMode === 'claims' && filteredClaims.length === 0) ||
              (viewMode === 'all' && filteredSessions.length === 0 && filteredClaims.length === 0)) && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">No history found</p>
                <p className="text-sm">
                  {searchQuery || sourceFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Start fact-checking to build your history'}
                </p>
              </div>
            )}

            {/* Load more button */}
            {hasMore && onLoadMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={onLoadMore}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 