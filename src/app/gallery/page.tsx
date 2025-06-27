'use client';

import React from 'react';
import { PublicGallery } from '@/components/organisms/PublicGallery';
import { Header } from '@/components/layout/Header';

/**
 * Public Gallery Page
 * Main page for browsing public fact-checked content
 * Accessible to all users without authentication
 */
export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <PublicGallery
          showFeaturedSection={true}
          showSearchFilter={true}
          variant="full"
        />
      </main>
    </div>
  );
} 