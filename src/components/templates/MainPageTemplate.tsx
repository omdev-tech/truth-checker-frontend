'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { TextFactChecker } from '@/components/organisms/TextFactChecker';
import { FileFactChecker } from '@/components/organisms/FileFactChecker';
import { AudioFactChecker } from '@/components/organisms/AudioFactChecker';
import { Header } from '@/components/layout/Header';
import { TabType } from '@/lib/types';
import { MessageSquare, FileText, Headphones, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function MainPageTemplate() {
  const [activeTab, setActiveTab] = useState<TabType>('text');

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
            Powered by Advanced AI
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-4">
            Verify Facts in Real-Time
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Our AI-powered fact-checking system analyzes text, documents, and audio to help you 
            verify information instantly with authoritative sources.
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
                  <TabsList className="grid w-full grid-cols-3 bg-background/80 backdrop-blur">
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
                        <span className="hidden sm:inline">Text</span>
                      </motion.div>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="file"
                      className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer"
                    >
                      <motion.div
                        variants={tabVariants}
                        animate={activeTab === 'file' ? 'active' : 'inactive'}
                        className="flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="hidden sm:inline">Files</span>
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
                        <Headphones className="w-4 h-4" />
                        <span className="hidden sm:inline">Audio</span>
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

                  <TabsContent value="file" className="mt-0">
                    <motion.div
                      key="file"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FileFactChecker />
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
                      <AudioFactChecker />
                    </motion.div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold mb-2">Text Analysis</h3>
            <p className="text-sm text-muted-foreground">
              Instantly verify claims in any text input with AI-powered analysis
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold mb-2">Document Processing</h3>
            <p className="text-sm text-muted-foreground">
              Upload documents and get comprehensive fact-checking results
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Audio & Video</h3>
            <p className="text-sm text-muted-foreground">
              Transcribe and fact-check audio recordings and video content
            </p>
          </Card>
        </motion.div>
      </main>
    </div>
  );
} 