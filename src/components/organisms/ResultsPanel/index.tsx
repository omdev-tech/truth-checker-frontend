'use client';

import React from 'react';
import { EnhancedSegmentData } from '@/lib/types';
import { X, RefreshCw } from 'lucide-react';

interface ResultsPanelProps {
  segment: EnhancedSegmentData;
  onClose: () => void;
  onReprocess: () => void;
}

const ResultsPanel: React.FC<ResultsPanelProps> = ({ segment, onClose, onReprocess }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'true':
        return 'text-green-400 bg-green-400/10';
      case 'false':
        return 'text-red-400 bg-red-400/10';
      case 'uncertain':
        return 'text-orange-400 bg-orange-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="h-full bg-gray-800 border-l border-gray-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div>
          <h3 className="text-white font-medium">Segment {segment.id + 1}</h3>
          <p className="text-sm text-gray-400">
            {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReprocess}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Reprocess segment"
          >
            <RefreshCw className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Transcription */}
        {segment.transcription && (
          <div>
            <h4 className="text-white font-medium mb-2">Transcription</h4>
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-gray-300 text-sm leading-relaxed">
                {segment.transcription}
              </p>
            </div>
          </div>
        )}

        {/* Fact Check Results */}
        {segment.factCheckResult && (
          <div>
            <h4 className="text-white font-medium mb-2">Fact Check Results</h4>
            
            {/* Overall Status */}
            <div className={`rounded-lg p-3 mb-3 ${getStatusColor(segment.factCheckResult.status)}`}>
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize">{segment.factCheckResult.status}</span>
                <span className="text-sm">
                  {Math.round(segment.factCheckResult.overall_confidence * 100)}% confidence
                </span>
              </div>
            </div>

            {/* Individual Claims */}
            {segment.factCheckResult.claims && segment.factCheckResult.claims.length > 0 && (
              <div className="space-y-3">
                <h5 className="text-sm text-gray-400 font-medium">
                  Claims ({segment.factCheckResult.claims.length})
                </h5>
                {segment.factCheckResult.claims.map((claim, index) => (
                  <div key={index} className="bg-gray-700 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                      <span className="text-xs text-gray-400">{claim.confidence}</span>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2">{claim.text}</p>
                    
                    {claim.explanation && (
                      <div className="text-xs text-gray-400 border-t border-gray-600 pt-2">
                        {claim.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Processing Status */}
        {segment.status === 'processing' && (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Processing claims...</p>
            </div>
          </div>
        )}

        {/* Error Status */}
        {segment.status === 'error' && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-lg p-4 text-center">
            <p className="text-red-400 text-sm mb-2">Processing failed</p>
            <button
              onClick={onReprocess}
              className="text-xs text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Metadata */}
        {segment.processingTime && (
          <div className="border-t border-gray-700 pt-4">
            <h5 className="text-sm text-gray-400 font-medium mb-2">Metadata</h5>
            <div className="text-xs text-gray-500 space-y-1">
              <div>Processing time: {segment.processingTime.toFixed(2)}s</div>
              <div>Last updated: {segment.lastUpdated.toLocaleTimeString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel; 