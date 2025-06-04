'use client';

import React from 'react';

interface LegendItem {
  color: string;
  label: string;
  description: string;
}

interface ColorLegendProps {
  className?: string;
  compact?: boolean;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ 
  className = '',
  compact = false 
}) => {
  const legendItems: LegendItem[] = [
    {
      color: 'bg-green-500',
      label: 'Accurate',
      description: 'Factually correct claims'
    },
    {
      color: 'bg-red-500',
      label: 'Inaccurate',
      description: 'False or misleading claims'
    },
    {
      color: 'bg-orange-500',
      label: 'Uncertain',
      description: 'Conflicting or disputed information'
    },
    {
      color: 'bg-gray-300',
      label: 'Not checkable',
      description: 'Opinions, questions, or no claims'
    },
    {
      color: 'bg-blue-500 animate-pulse',
      label: 'Processing',
      description: 'Currently being analyzed'
    },
    {
      color: 'bg-gray-400',
      label: 'Pending',
      description: 'Waiting to be processed'
    }
  ];

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
            <span className="text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <h3 className="font-semibold text-sm text-gray-800 mb-3">
        Fact-Check Status Legend
      </h3>
      <div className="space-y-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-sm ${item.color} flex-shrink-0`}></div>
            <div>
              <div className="font-medium text-sm text-gray-800">
                {item.label}
              </div>
              <div className="text-xs text-gray-600">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        Segments are processed in real-time as the video plays
      </div>
    </div>
  );
};

export default ColorLegend; 