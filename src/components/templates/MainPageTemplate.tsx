'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { TextFactChecker } from '@/components/organisms/TextFactChecker';
import { AudioFactChecker } from '@/components/organisms/AudioFactChecker';
import { LiveRecording } from '@/components/organisms/LiveRecording';
import { StreamFactChecker } from '@/components/organisms/StreamFactChecker';
import FactCheckDashboard from '@/components/pages/FactCheckDashboard';
import { Header } from '@/components/layout/Header';
import { TabType, StreamData, StreamMetadata } from '@/lib/types';
import { MessageSquare, Play, Mic, Radio, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function MainPageTemplate() {
  const { t } = useTranslation(['dashboard', 'common']);
  const [activeTab, setActiveTab] = useState<TabType>('text');
  const [showDashboard, setShowDashboard] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [streamData, setStreamData] = useState<StreamData | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setStreamData(null); // Clear stream data when uploading file
    setShowDashboard(true);
  };

  const handleStreamReady = (streamUrl: string, streamType: string, metadata?: StreamMetadata) => {
    setStreamData({ 
      url: streamUrl, 
      type: streamType as StreamData['type'],
      metadata 
    });
    setUploadedFile(null); // Clear uploaded file when starting stream
    setShowDashboard(true);
  };

  const handleCloseDashboard = () => {
    setShowDashboard(false);
    setUploadedFile(null);
    setStreamData(null);
  };

  const tabVariants = {
    inactive: { scale: 0.95, opacity: 0.7 },
    active: { scale: 1, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary font-medium">
            <Sparkles className="w-4 h-4" />
            {t('dashboard:hero.poweredBy')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            {t('dashboard:hero.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('dashboard:hero.subtitle')}
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur">
            <CardContent className="p-0">
              <Tabs 
                defaultValue="text" 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as TabType)}
                className="w-full"
              >
                <div className="border-b bg-muted/30 px-6 pt-6">
                  <TabsList className="grid w-full grid-cols-4 bg-background/80 backdrop-blur">
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

                <div className="p-6">
                  <TabsContent value="text" className="mt-0">
                    <motion.div
                      key="text"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <TextFactChecker />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="audio" className="mt-0">
                    <motion.div
                      key="audio"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AudioFactChecker onFileUpload={handleFileUpload} />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="stream" className="mt-0">
                    <motion.div
                      key="stream"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <StreamFactChecker onStreamReady={handleStreamReady} />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="live" className="mt-0">
                    <motion.div
                      key="live"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LiveRecording />
                    </motion.div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Section - Updated with Stream feature */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid md:grid-cols-4 gap-6 max-w-5xl mx-auto"
        >
          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">{t('dashboard:features.textAnalysis.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('dashboard:features.textAnalysis.description')}
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">{t('dashboard:features.mediaUpload.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('dashboard:features.mediaUpload.description')}
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Radio className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">{t('dashboard:features.liveStreams.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('dashboard:features.liveStreams.description')}
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mic className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="font-semibold mb-2">{t('dashboard:features.liveRecording.title')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('dashboard:features.liveRecording.description')}
            </p>
          </Card>
        </motion.div>
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
    </div>
  );
} 