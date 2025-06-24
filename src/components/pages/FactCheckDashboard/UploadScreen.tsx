'use client';

import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, FileVideo, FileAudio, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ColorLegend from '../../molecules/ColorLegend';

interface UploadScreenProps {
  onFileUpload: (file: File) => void;
}

const UploadScreen: React.FC<UploadScreenProps> = ({ onFileUpload }) => {
  const { t } = useTranslation(['dashboard', 'common']);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.type.startsWith('video/') || file.type.startsWith('audio/'))) {
      setIsUploading(true);
      onFileUpload(file);
    } else {
      alert(t('dashboard:upload.invalidFileType'));
    }
  }, [onFileUpload, t]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-blue-100 rounded-full text-sm text-blue-700 font-medium">
            <Sparkles className="w-4 h-4" />
            {t('dashboard:upload.aiPowered')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
            {t('dashboard:upload.title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {t('dashboard:upload.subtitle')}
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300
              ${isDragOver 
                ? 'border-blue-500 bg-blue-50 scale-105' 
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
              }
              ${isUploading ? 'pointer-events-none opacity-75' : 'cursor-pointer'}
            `}
          >
            <input
              type="file"
              accept="video/*,audio/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            
            <div className="space-y-4">
              {isUploading ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-lg font-medium text-gray-700">{t('dashboard:upload.processing')}</p>
                  <p className="text-sm text-gray-500">{t('dashboard:upload.preparingAnalysis')}</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex justify-center space-x-4 mb-6">
                    <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                      <FileVideo className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FileAudio className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-gray-800">
                      {t('dashboard:upload.dropZoneTitle')}
                    </h3>
                    <p className="text-gray-600">
                      {t('dashboard:upload.dropZoneSubtitle')}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-center mt-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      {t('dashboard:upload.chooseFile')}
                    </motion.button>
                  </div>
                  
                  <div className="mt-6 text-sm text-gray-500">
                    <p>{t('dashboard:upload.supportedFormats')}</p>
                    <p>{t('dashboard:upload.maxFileSize')}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Color Legend */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <ColorLegend />
        </motion.div>

        {/* Features Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 grid md:grid-cols-3 gap-6"
        >
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileVideo className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">{t('dashboard:upload.features.timeline.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('dashboard:upload.features.timeline.description')}
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">{t('dashboard:upload.features.analysis.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('dashboard:upload.features.analysis.description')}
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileAudio className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">{t('dashboard:upload.features.formats.title')}</h3>
            <p className="text-sm text-gray-600">
              {t('dashboard:upload.features.formats.description')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UploadScreen; 