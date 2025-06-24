'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';

interface LegendItem {
  color: string;
  labelKey: string;
  descriptionKey: string;
}

interface ColorLegendProps {
  className?: string;
  compact?: boolean;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ 
  className = '',
  compact = false 
}) => {
  const { t } = useTranslation('common');
  
  const legendItems: LegendItem[] = [
    {
      color: 'bg-green-500',
      labelKey: 'legend.accurate',
      descriptionKey: 'legend.accurateDescription'
    },
    {
      color: 'bg-red-500',
      labelKey: 'legend.inaccurate',
      descriptionKey: 'legend.inaccurateDescription'
    },
    {
      color: 'bg-orange-500',
      labelKey: 'legend.uncertain',
      descriptionKey: 'legend.uncertainDescription'
    },
    {
      color: 'bg-gray-500',
      labelKey: 'legend.noClaims',
      descriptionKey: 'legend.noClaimsDescription'
    },
    {
      color: 'bg-blue-500 animate-pulse',
      labelKey: 'status.processing',
      descriptionKey: 'legend.processingDescription'
    },
    {
      color: 'bg-gray-400',
      labelKey: 'status.pending',
      descriptionKey: 'legend.pendingDescription'
    }
  ];

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1 text-xs">
            <div className={`w-3 h-3 rounded-sm ${item.color}`}></div>
            <span className="text-gray-600">{t(item.labelKey)}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <h3 className="font-semibold text-sm text-gray-800 mb-3">
        {t('legend.title')}
      </h3>
      <div className="space-y-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-sm ${item.color} flex-shrink-0`}></div>
            <div>
              <div className="font-medium text-sm text-gray-800">
                {t(item.labelKey)}
              </div>
              <div className="text-xs text-gray-600">
                {t(item.descriptionKey)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t text-xs text-gray-500">
        {t('legend.realTimeNote')}
      </div>
    </div>
  );
};

export default ColorLegend; 