'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TextFactChecker } from '@/components/organisms/TextFactChecker';
import { AudioFactChecker } from '@/components/organisms/AudioFactChecker';
import { LiveRecording } from '@/components/organisms/LiveRecording';
import { StreamFactChecker } from '@/components/organisms/StreamFactChecker';
import FactCheckDashboard from '@/components/pages/FactCheckDashboard';
import { ClaimDetailsModal } from '@/components/organisms/ClaimDetailsModal';
import { Header } from '@/components/layout/Header';
import { TabType, StreamData, StreamMetadata, FactCheckClaim, SessionSummary } from '@/lib/types';
import { useSessionManagement } from '@/hooks/useSessionManagement';
import { MessageSquare, Play, Mic, Radio, Clock, FileText, ArrowRight, CheckCircle, XCircle, AlertTriangle, Calendar, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';

export function MainPageTemplate() {
  const { t } = useTranslation(['dashboard', 'factCheck', 'common']);
  const router = useRouter();
  
  // Session cleanup hook
  const { completeCurrentSessions } = useSessionCleanup();
  
  const [activeTab, setActiveTab] = useState<TabType>('text');
  const [showDashboard, setShowDashboard] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [streamData, setStreamData] = useState<StreamData | null>(null);
  
  // History state - now with sessions
  const [selectedClaim, setSelectedClaim] = useState<FactCheckClaim | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  
  // Use session management hook to get recent sessions
  const { sessions, isLoadingSessions: historyLoading } = useSessionManagement();
  
  // Get recent sessions (last 10)
  const recentSessions = sessions.slice(0, 10);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setStreamData(null);
    setShowDashboard(true);
  };

  const handleStreamReady = (streamUrl: string, streamType: string, metadata?: StreamMetadata) => {
    setStreamData({ 
      url: streamUrl, 
      type: streamType as StreamData['type'],
      metadata 
    });
    setUploadedFile(null);
    setShowDashboard(true);
  };

  const handleCloseDashboard = () => {
    // Complete current processing sessions when user closes dashboard
    completeCurrentSessions('dashboard_closed');
    
    setShowDashboard(false);
    setUploadedFile(null);
    setStreamData(null);
  };

  const handleSessionClick = (session: SessionSummary) => {
    // Navigate to history page with session ID parameter
    router.push(`/history?sessionId=${session.id}`);
  };



  const handleClaimClick = (claim: FactCheckClaim) => {
    setSelectedClaim(claim);
    setIsClaimModalOpen(true);
  };

  const handleCloseClaimModal = () => {
    setIsClaimModalOpen(false);
    setSelectedClaim(null);
  };

  const getStatusIcon = (status: string, className = "w-4 h-4") => {
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

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return t('common:time.justNow');
    if (diffInMinutes < 60) return t('common:time.minutesAgo', { count: diffInMinutes });
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return t('common:time.hoursAgo', { count: diffInHours });
    
    const diffInDays = Math.floor(diffInHours / 24);
    return t('common:time.daysAgo', { count: diffInDays });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
  };

  const tabVariants = {
    inactive: { scale: 0.95, opacity: 0.7 },
    active: { scale: 1, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-200px)]">
          
          {/* History Sidebar - Now showing sessions */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <Card className="h-full shadow-lg border-0 bg-card/50 backdrop-blur">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" />
                  {t('dashboard:history.recentSessions')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {historyLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : recentSessions.length > 0 ? (
                  <div className="space-y-2">
                    {recentSessions.map((session) => (
                      <motion.div
                        key={session.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-background/60 hover:bg-background/80 rounded-lg border cursor-pointer transition-all duration-200"
                        onClick={() => handleSessionClick(session)}
                      >
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                              {session.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                <span>{session.total_claims}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{session.total_segments} segments</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(new Date(session.created_at))}
                              </span>
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 text-muted-foreground flex-shrink-0 mt-1" />
                        </div>
                      </motion.div>
                    ))}
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-4 text-muted-foreground hover:text-foreground"
                      onClick={() => router.push('/history')}
                    >
                      {t('dashboard:history.viewAll')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {t('dashboard:history.empty.title')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t('dashboard:history.empty.description')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Fact-Checking Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-9"
          >
            <Card className="h-full shadow-2xl border-0 bg-card/50 backdrop-blur">
              <CardContent className="p-0 h-full">
                <Tabs 
                  defaultValue="text" 
                  value={activeTab} 
                  onValueChange={(value) => setActiveTab(value as TabType)}
                  className="h-full flex flex-col"
                >
                  <div className="border-b bg-muted/30 px-6 pt-6 flex-shrink-0">
                    <TabsList className="grid w-full grid-cols-4 bg-background/80 backdrop-blur mb-4">
                      <TabsTrigger 
                        value="text" 
                        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer"
                      >
                        <motion.div
                          variants={tabVariants}
                          animate={activeTab === 'text' ? 'active' : 'inactive'}
                          className="flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('dashboard:tabs.text')}</span>
                        </motion.div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="audio"
                        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer"
                      >
                        <motion.div
                          variants={tabVariants}
                          animate={activeTab === 'audio' ? 'active' : 'inactive'}
                          className="flex items-center gap-2"
                        >
                          <Play className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('dashboard:tabs.media')}</span>
                        </motion.div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="stream"
                        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer"
                      >
                        <motion.div
                          variants={tabVariants}
                          animate={activeTab === 'stream' ? 'active' : 'inactive'}
                          className="flex items-center gap-2"
                        >
                          <Radio className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('dashboard:tabs.stream')}</span>
                        </motion.div>
                      </TabsTrigger>
                      <TabsTrigger 
                        value="live"
                        className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer"
                      >
                        <motion.div
                          variants={tabVariants}
                          animate={activeTab === 'live' ? 'active' : 'inactive'}
                          className="flex items-center gap-2"
                        >
                          <Mic className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('dashboard:tabs.live')}</span>
                        </motion.div>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-6 flex-1 overflow-hidden">
                    <TabsContent value="text" className="mt-0 h-full">
                      <motion.div
                        key="text"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <TextFactChecker />
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="audio" className="mt-0 h-full">
                      <motion.div
                        key="audio"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <AudioFactChecker onFileUpload={handleFileUpload} />
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="stream" className="mt-0 h-full">
                      <motion.div
                        key="stream"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <StreamFactChecker onStreamReady={handleStreamReady} />
                      </motion.div>
                    </TabsContent>

                    <TabsContent value="live" className="mt-0 h-full">
                      <motion.div
                        key="live"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <LiveRecording />
                      </motion.div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Dashboard Overlay */}
      <AnimatePresence>
        {showDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseDashboard}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="fixed inset-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <FactCheckDashboard 
                initialFile={uploadedFile}
                initialStream={streamData}
                onClose={handleCloseDashboard}
                className="h-full"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claim Details Modal */}
      <ClaimDetailsModal
        claim={selectedClaim}
        isOpen={isClaimModalOpen}
        onClose={handleCloseClaimModal}
      />


    </div>
  );
} 