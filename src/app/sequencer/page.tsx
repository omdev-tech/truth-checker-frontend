'use client';

import React from 'react';
import VideoSequencer from '@/components/organisms/VideoSequencer';
import { CONFIG } from '@/lib/config';

export default function SequencerPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <VideoSequencer 
        onError={(error) => console.error('Sequencer error:', error)}
        chunkDuration={CONFIG.MEDIA.CHUNK_DURATION}
        maxParallelProcessing={CONFIG.MEDIA.MAX_PARALLEL_PROCESSING}
      />
    </main>
  );
} 