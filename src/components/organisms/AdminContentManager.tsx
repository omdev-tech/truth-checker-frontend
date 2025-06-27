'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from '@/components/ui/dialog';
import { PublicContentCard } from '@/components/molecules/PublicContentCard';
import { TruthPercentageBadge } from '@/components/atoms/TruthPercentageBadge';
import { ContentTypeBadge } from '@/components/atoms/ContentTypeBadge';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { AdminMediaManager } from '@/components/organisms/AdminMediaManager';
import { AdminThumbnailManager } from '@/components/organisms/AdminThumbnailManager';
import { 
  PublicContent, 
  PublicContentListResponse,
  CreatePublicContentRequest 
} from '@/lib/types/public-content';
import { SessionSummary } from '@/lib/types';
import PublicContentApi from '@/lib/services/publicContentApi';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  StarOff, 
  Eye,
  Calendar,
  BarChart3,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Upload,
  Video,
  Music,
  Youtube,
  ChevronDown,
  ChevronUp,
  FileText,
  TrendingUp,
  Play,
  Pause,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { getSession } from 'next-auth/react';

interface AdminContentManagerProps {
  className?: string;
}

interface CreateContentFormData {
  session_id: string;
  title: string;
  description: string;
  category: string;
  tags: string;
}

/**
 * Admin Content Manager Organism Component
 * Complete administrative interface for managing public content
 * Allows creating, editing, and managing public content
 */
export function AdminContentManager({ className }: AdminContentManagerProps) {
  
  // State management
  const [adminContent, setAdminContent] = useState<PublicContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<PublicContent | null>(null);
  const [selectedSession, setSelectedSession] = useState<SessionSummary | null>(null);
  const [expandedMediaPanels, setExpandedMediaPanels] = useState<Set<string>>(new Set());
  const [expandedThumbnailPanels, setExpandedThumbnailPanels] = useState<Set<string>>(new Set());
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  
  // Use session management hook
  const { sessions: availableSessions, isLoadingSessions, refreshSessions } = useSessionManagement();
  const [createFormData, setCreateFormData] = useState<CreateContentFormData>({
    session_id: '',
    title: '',
    description: '',
    category: 'general',
    tags: ''
  });
  const [editFormData, setEditFormData] = useState<CreateContentFormData>({
    session_id: '',
    title: '',
    description: '',
    category: 'general',
    tags: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get auth headers
  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const session = await getSession();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }
    
    return headers;
  };

  // Load data on mount
  useEffect(() => {
    loadAdminContent();
  }, []);

  // Filter available sessions to show only completed ones not already used
  const filteredAvailableSessions = availableSessions.filter((session: SessionSummary) => 
    session.status === 'completed' && 
    session.total_claims > 0 &&
    !adminContent.some(content => content.session_id === session.id)
  );

  const loadAdminContent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await PublicContentApi.getAdminPublicContent(50, 0);
      setAdminContent(response.content);
    } catch (error) {
      console.error('Failed to load admin content:', error);
      setError('Failed to load content. Please try again.');
      toast.error('Failed to load admin content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!selectedSession || !createFormData.title || !createFormData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    
    try {
      const request: CreatePublicContentRequest = {
        session_id: selectedSession.id,
        title: createFormData.title,
        description: createFormData.description,
        category: createFormData.category || undefined,
        tags: createFormData.tags || undefined
      };

      const newContent = await PublicContentApi.createPublicContent(request);
      setAdminContent(prev => [newContent, ...prev]);
      
      // Reset form and close modal
      setCreateFormData({
        session_id: '',
        title: '',
        description: '',
        category: 'general',
        tags: ''
      });
      setSelectedSession(null);
      setIsCreateModalOpen(false);
      
      toast.success('Public content created successfully!');
      
      // Refresh sessions
      refreshSessions();
    } catch (error) {
      console.error('Failed to create content:', error);
      toast.error('Failed to create content. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditContent = (content: PublicContent) => {
    setEditingContent(content);
    setEditFormData({
      session_id: content.session_id,
      title: content.title,
      description: content.description,
      category: content.content_metadata?.category || 'general',
      tags: content.content_metadata?.tags 
        ? Array.isArray(content.content_metadata.tags) 
          ? content.content_metadata.tags.join(', ')
          : content.content_metadata.tags
        : ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateContent = async () => {
    if (!editingContent || !editFormData.title || !editFormData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsEditing(true);
    
    try {
      const updates = {
        title: editFormData.title,
        description: editFormData.description,
        category: editFormData.category || undefined,
        tags: editFormData.tags || undefined
      };

      const updatedContent = await PublicContentApi.updatePublicContent(editingContent.id, updates);
      
      // Update local state
      setAdminContent(prev => 
        prev.map(content => 
          content.id === editingContent.id ? updatedContent : content
        )
      );
      
      // Reset form and close modal
      setEditFormData({
        session_id: '',
        title: '',
        description: '',
        category: 'general',
        tags: ''
      });
      setEditingContent(null);
      setIsEditModalOpen(false);
      
      toast.success('Content updated successfully!');
    } catch (error) {
      console.error('Failed to update content:', error);
      toast.error('Failed to update content. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      await PublicContentApi.deletePublicContent(contentId);
      setAdminContent(prev => prev.filter(content => content.id !== contentId));
      toast.success('Content deleted successfully');
    } catch (error) {
      console.error('Failed to delete content:', error);
      toast.error('Failed to delete content');
    }
  };

  const handleSessionSelect = (session: SessionSummary) => {
    setSelectedSession(session);
    setCreateFormData(prev => ({
      ...prev,
      session_id: session.id,
      title: session.name || `Fact-check from ${new Date(session.created_at).toLocaleDateString()}`,
      description: `Comprehensive fact-check analysis with ${session.total_claims} claims verified. Accuracy: ${session.overall_accuracy_percentage.toFixed(1)}%`
    }));
  };

  const getStatusStats = () => {
    const stats = {
      total: adminContent.length,
      public: adminContent.filter(c => c.status === 'public').length,
      featured: 0, // Backend determines featured content algorithmically
      totalViews: adminContent.reduce((total, content) => total + content.view_count, 0)
    };
    return stats;
  };

  const toggleMediaPanel = (contentId: string) => {
    setExpandedMediaPanels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const toggleThumbnailPanel = (contentId: string) => {
    setExpandedThumbnailPanels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(contentId)) {
        newSet.delete(contentId);
      } else {
        newSet.add(contentId);
      }
      return newSet;
    });
  };

  const handleMediaUpdate = (contentId: string, mediaInfo: any) => {
    // Update local content state if needed
    setAdminContent(prev => 
      prev.map(content => 
        content.id === contentId 
          ? { ...content, has_media: mediaInfo.has_media, media_type: mediaInfo.media_type }
          : content
      )
    );
    toast.success('Media updated successfully');
  };

  const handleThumbnailUpdate = (contentId: string, thumbnailInfo: any) => {
    // Update local content state if needed
    setAdminContent(prev => 
      prev.map(content => 
        content.id === contentId 
          ? { ...content, thumbnail_url: thumbnailInfo.thumbnail_url }
          : content
      )
    );
    toast.success('Thumbnail updated successfully');
  };

  const getMediaIcon = (content: PublicContent) => {
    if (!content.has_media) return null;
    
    switch (content.media_type) {
      case 'uploaded_video':
        return <Video className="h-4 w-4 text-blue-500" />;
      case 'uploaded_audio':
        return <Music className="h-4 w-4 text-green-500" />;
      case 'youtube_video':
        return <Youtube className="h-4 w-4 text-red-500" />;
      default:
        return <Upload className="h-4 w-4 text-gray-500" />;
    }
  };

  const stats = getStatusStats();

  // Cleanup stale sessions function
  const handleCleanupStaleSessions = async () => {
    setIsCleaningUp(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:8000/api/admin/cleanup-stale-sessions', {
        method: 'POST',
        headers: await getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Show detailed results
      const message = `✅ ${result.message}\n\n` +
                     `📊 Statistics:\n` +
                     `• Total checked: ${result.total_checked}\n` +
                     `• Completed: ${result.completed_sessions}\n` +
                     `• Skipped (live): ${result.skipped_live_sessions}\n` +
                     `• Errors: ${result.errors}\n` +
                     `• Processing time: ${result.processing_time.toFixed(2)}s`;
      
      toast.success('Stale session cleanup completed', {
        description: message
      });
      
      // Refresh sessions to show updated status
      await refreshSessions();
      
    } catch (error) {
      console.error('Failed to cleanup stale sessions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to cleanup stale sessions: ${errorMessage}`);
      toast.error('Cleanup failed', {
        description: errorMessage
      });
    } finally {
      setIsCleaningUp(false);
    }
  };

  // View session stats function
  const handleViewSessionStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/session-stats', {
        method: 'GET',
        headers: await getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const stats = await response.json();
      
      // Show detailed session statistics
      const message = `📊 Session Statistics:\n\n` +
                     `• Total sessions: ${stats.total_sessions}\n` +
                     `• Processing: ${stats.processing_sessions}\n` +
                     `• Completed: ${stats.completed_sessions}\n` +
                     `• Failed: ${stats.failed_sessions}\n\n` +
                                           (stats.processing_sessions > 0 ? 
                        `🔄 Processing Sessions:\n${stats.processing_session_details.slice(0, 5).map((s: any) => 
                          `• ${s.session_name} (${s.updated_minutes_ago}min ago)`
                        ).join('\n')}` : 
                        '✅ No processing sessions');
      
      toast.info('Session Statistics', {
        description: message,
        duration: 8000
      });
      
    } catch (error) {
      console.error('Failed to get session stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to get session stats', {
        description: errorMessage
      });
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Stats and Actions */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Content Management</h1>
          <p className="text-muted-foreground">
            Create and manage public content from your fact-check sessions
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Session Stats Button */}
          <Button
            onClick={handleViewSessionStats}
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800"
          >
            <TrendingUp className="h-4 w-4" />
            Session Stats
          </Button>
          
          {/* Cleanup Button */}
          <Button
            onClick={handleCleanupStaleSessions}
            disabled={isCleaningUp}
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800"
          >
            {isCleaningUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isCleaningUp ? 'Cleaning...' : 'Cleanup Stale Sessions'}
          </Button>
          
          {/* Create Content Button */}
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={isLoading || filteredAvailableSessions.length === 0}
            className="inline-flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Create Public Content
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Content</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.public}</div>
              <div className="text-sm text-muted-foreground">Public</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Star className="h-8 w-8 text-yellow-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.featured}</div>
              <div className="text-sm text-muted-foreground">Featured</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <Eye className="h-8 w-8 text-purple-500 mr-3" />
            <div>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Public Content</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-8">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="text-center p-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error Loading Content</h3>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={loadAdminContent}>Try Again</Button>
            </div>
          ) : adminContent.length === 0 ? (
            <div className="text-center p-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Public Content Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first public content to share fact-checked information with the community.
              </p>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Content
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {adminContent.map((content) => (
                <div key={content.id} className="space-y-0">
                  {/* Main Content Row */}
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-12 bg-muted rounded overflow-hidden flex-shrink-0">
                        {content.thumbnail_url ? (
                          <img 
                            src={content.thumbnail_url} 
                            alt={content.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <Eye className="h-4 w-4 text-primary" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm line-clamp-1">
                            {content.title}
                          </h3>
                          <Badge 
                            variant={content.status === 'public' ? 'default' : 'secondary'}
                          >
                            {content.status}
                          </Badge>
                          {content.has_media && (
                            <Badge variant="outline" className="gap-1">
                              {getMediaIcon(content)}
                              Media
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <TruthPercentageBadge 
                            percentage={content.truth_percentage} 
                            size="sm" 
                            variant="minimal"
                          />
                          <ContentTypeBadge 
                            type={content.content_type}
                            size="sm"
                            variant="minimal"
                          />
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {content.view_count} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(content.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleMediaPanel(content.id)}
                        className="gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Media
                        {expandedMediaPanels.has(content.id) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleThumbnailPanel(content.id)}
                        className="gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Thumbnail
                        {expandedThumbnailPanels.has(content.id) ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditContent(content)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteContent(content.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Expandable Media Management Panel */}
                  {expandedMediaPanels.has(content.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-l border-r border-b rounded-b-lg bg-muted/20"
                    >
                      <div className="p-4">
                        <AdminMediaManager
                          contentId={content.id}
                          onMediaUpdate={(mediaInfo) => handleMediaUpdate(content.id, mediaInfo)}
                          className="bg-background rounded-lg"
                        />
                      </div>
                    </motion.div>
                  )}

                  {/* Expandable Thumbnail Management Panel */}
                  {expandedThumbnailPanels.has(content.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-l border-r border-b rounded-b-lg bg-muted/20"
                    >
                      <div className="p-4">
                        <AdminThumbnailManager
                          contentId={content.id}
                          onThumbnailUpdate={(thumbnailInfo) => handleThumbnailUpdate(content.id, thumbnailInfo)}
                          className="bg-background rounded-lg"
                        />
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Content Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Public Content</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Session Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Fact-Check Session
              </label>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {isLoadingSessions ? (
                  <div className="flex justify-center p-4">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading sessions...</span>
                  </div>
                ) : filteredAvailableSessions.length === 0 ? (
                  <div className="text-center p-4 text-sm text-muted-foreground">
                    No completed sessions available for public content creation.
                  </div>
                ) : (
                  filteredAvailableSessions.map((session) => (
                    <Card 
                      key={session.id}
                      className={cn(
                        "cursor-pointer transition-all",
                        selectedSession?.id === session.id 
                          ? "border-primary bg-primary/5" 
                          : "hover:border-muted-foreground/50"
                      )}
                      onClick={() => handleSessionSelect(session)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm line-clamp-1">
                              {session.name || `Session ${session.id.slice(-8)}`}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <TruthPercentageBadge 
                                percentage={session.overall_accuracy_percentage} 
                                size="sm"
                                variant="minimal"
                              />
                              <span className="text-xs text-muted-foreground">
                                {session.total_claims} claims
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(session.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {selectedSession?.id === session.id && (
                            <CheckCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Content Details Form */}
            {selectedSession && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Title *
                  </label>
                  <Input
                    value={createFormData.title}
                    onChange={(e) => setCreateFormData(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    placeholder="Enter a descriptive title..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description *
                  </label>
                  <Textarea
                    value={createFormData.description}
                    onChange={(e) => setCreateFormData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    placeholder="Describe what was fact-checked and the results..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Category
                  </label>
                  <Input
                    value={createFormData.category}
                    onChange={(e) => setCreateFormData(prev => ({
                      ...prev,
                      category: e.target.value
                    }))}
                    placeholder="e.g., politics, science, health..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tags (optional)
                  </label>
                  <Input
                    value={createFormData.tags}
                    onChange={(e) => setCreateFormData(prev => ({
                      ...prev,
                      tags: e.target.value
                    }))}
                    placeholder="e.g., climate,environment,news (comma-separated)"
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateContent}
              disabled={!selectedSession || isCreating}
            >
              {isCreating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Content'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Content Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Public Content</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Content Details Form */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Title *
                </label>
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  placeholder="Enter a descriptive title..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description *
                </label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    description: e.target.value
                  }))}
                  placeholder="Describe what was fact-checked and the results..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Category
                </label>
                <Input
                  value={editFormData.category}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    category: e.target.value
                  }))}
                  placeholder="e.g., politics, science, health..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tags (optional)
                </label>
                <Input
                  value={editFormData.tags}
                  onChange={(e) => setEditFormData(prev => ({
                    ...prev,
                    tags: e.target.value
                  }))}
                  placeholder="e.g., climate,environment,news (comma-separated)"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateContent}
              disabled={!editingContent || isEditing}
            >
              {isEditing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Content'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 