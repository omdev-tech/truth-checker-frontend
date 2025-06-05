'use client';

import React from 'react';
import { DashboardState, EnhancedSegmentData } from '@/lib/types';

interface ProcessingDashboardProps {
  processing: DashboardState['processing'];
  segments: EnhancedSegmentData[];
  onToggleDetails: () => void;
}

const ProcessingDashboard: React.FC<ProcessingDashboardProps> = ({
  processing,
  segments,
  onToggleDetails,
}) => {
  const { totalSegments, completedSegments, processingSegments, errorSegments, overallProgress } = processing;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">Processing Status</h3>
        <button 
          onClick={onToggleDetails}
          className="text-gray-400 hover:text-white text-sm"
        >
          Details
        </button>
      </div>
      
      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Overall Progress</span>
            <span className="text-sm text-white font-medium">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        </div>
        
        {/* Status Counts */}
        <div className="grid grid-cols-4 gap-4 text-center">
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-lg font-bold text-green-400">{completedSegments}</div>
            <div className="text-xs text-gray-400">Completed</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-lg font-bold text-blue-400">{processingSegments}</div>
            <div className="text-xs text-gray-400">Processing</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-lg font-bold text-red-400">{errorSegments}</div>
            <div className="text-xs text-gray-400">Errors</div>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-400">{totalSegments - completedSegments - processingSegments - errorSegments}</div>
            <div className="text-xs text-gray-400">Pending</div>
          </div>
        </div>
        
        {/* Summary Stats */}
        <div className="text-sm text-gray-300">
          {totalSegments > 0 && (
            <div className="flex justify-between">
              <span>Segments: {completedSegments} / {totalSegments}</span>
              <span>
                Claims: {segments.reduce((sum, seg) => sum + seg.claimsCount, 0)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingDashboard; 