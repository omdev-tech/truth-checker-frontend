/**
 * Application Configuration
 * Central place for all configurable values
 */

// Media Processing Configuration
export const MEDIA_CONFIG = {
  // Duration of each audio/video chunk in seconds
  CHUNK_DURATION: 30,
  
  // Maximum number of parallel processing operations
  MAX_PARALLEL_PROCESSING: 2,
  
  // Processing delays and timeouts
  PROCESSING_START_DELAY: 2000, // 2 seconds
  BATCH_DELAY: 1000, // 1 second between batches
} as const;

// API Configuration
export const API_CONFIG = {
  // Default provider for transcription
  DEFAULT_PROVIDER: 'elevenlabs',
  
  // Default processing mode
  DEFAULT_FAST_MODE: true,
} as const;

// UI Configuration
export const UI_CONFIG = {
  // Timeline configuration
  TIMELINE_HEIGHT: 180,
  TIMELINE_SEGMENT_WIDTH: 16,
  TIMELINE_SEGMENT_HEIGHT: 12,
  
  // Panel sizes
  DEFAULT_PANEL_SIZE: 300,
  
  // Playback defaults
  DEFAULT_VOLUME: 0.8,
  DEFAULT_PLAYBACK_RATE: 1.0,
} as const;

// Export all configs
export const CONFIG = {
  MEDIA: MEDIA_CONFIG,
  API: API_CONFIG,
  UI: UI_CONFIG,
} as const; 