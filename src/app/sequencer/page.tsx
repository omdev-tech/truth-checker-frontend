'use client';

import React from 'react';
import VideoSequencer from '@/components/organisms/VideoSequencer';

export default function SequencerPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <VideoSequencer 
        onError={(error) => console.error('Sequencer error:', error)}
        chunkDuration={20}
        maxParallelProcessing={2}
      />
    </main>
  );
} 