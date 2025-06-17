export interface Claim {
  text: string;
  source?: string;
  context?: string;
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface VerificationResult {
  claim_text: string;
  status: "true" | "false" | "partially_true" | "misleading" | "unverifiable" | "disputed";
  confidence: "high" | "medium" | "low" | "insufficient";
  explanation: string;
  sources: string[];
  timestamp: string;
  metadata: Record<string, unknown>;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  start_time: number;
  end_time: number;
  metadata: Record<string, unknown>;
}

export interface FactCheckResponse {
  claims: Claim[];
  results: VerificationResult[];
}

export interface HealthStatus {
  ai_providers: Record<string, boolean>;
  mcp_providers: Record<string, boolean>;
}

export interface FactCheckRequest {
  text: string;
  context?: {
    domain?: string;
  };
  language?: string;
}

export interface TranscriptionRequest {
  provider?: string;
  language?: string;
}

export interface ChunkProcessingRequest {
  provider?: string;
  language?: string;
  fast_mode?: boolean;
  start_time?: number;
  end_time?: number;
}

export interface StreamProcessingRequest {
  url: string;
  stream_type: string; // 'youtube', 'twitch', 'direct-url'
  start_time?: number;
  duration?: number;
  provider?: string;
  language?: string;
  fast_mode?: boolean;
}

export interface ChunkProcessingResponse {
  transcription: {
    text: string;
    confidence: number;
    language: string;
    duration: number;
    metadata: Record<string, unknown>;
  };
  fact_check: {
    status: 'true' | 'false' | 'partially_true' | 'misleading' | 'unverifiable' | 'disputed' | 'uncertain' | 'not_checkable' | 'error' | 'no_text';
    claims: Array<{
      text: string;
      status: 'true' | 'false' | 'partially_true' | 'misleading' | 'unverifiable' | 'disputed' | 'uncertain';
      confidence: 'high' | 'medium' | 'low' | 'insufficient';
      explanation: string;
      sources?: string[]; // Added sources to match backend response
    }>;
    overall_confidence: number;
    total_claims?: number;
    processed_claims?: number;
    sources?: string[]; // Added overall sources field
    error?: string;
  };
  processing_time: number;
  chunk_info: {
    start_time?: number;
    end_time?: number;
    fast_mode: boolean;
    provider: string;
  };
}

// Enhanced segment data for the new dashboard
export interface EnhancedSegmentData {
  id: number;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  transcription?: string;
  factCheckResult?: ChunkProcessingResponse['fact_check'];
  thumbnail?: string;
  waveform?: number[];
  processingTime?: number;
  claimsCount: number;
  accuracyScore?: number;
  lastUpdated: Date;
  metadata?: {
    isLiveChunk?: boolean;
    chunkNumber?: number;
    actualProcessingTime?: string;
    displayTime?: string;
  };
}

// Dashboard state management
export interface DashboardState {
  mode: 'upload' | 'analysis' | 'stream';
  file: File | null;
  streamData: StreamData | null;
  mediaUrl: string | null;
  mediaType: 'video' | 'audio' | null;
  duration: number;
  segments: EnhancedSegmentData[];
  processing: {
    totalSegments: number;
    completedSegments: number;
    processingSegments: number;
    errorSegments: number;
    overallProgress: number;
    estimatedTimeRemaining?: number;
    startTime: Date | null;
    isLiveStream?: boolean;
  };
  playback: {
    currentTime: number;
    isPlaying: boolean;
    volume: number;
    playbackRate: number;
    isMuted: boolean;
  };
  ui: {
    selectedSegment: number | null;
    showResultsPanel: boolean;
    timelineZoom: number;
    panelSize: number;
    viewMode: 'timeline' | 'grid';
    showProcessingDetails: boolean;
  };
}

// Processing progress tracking
export interface ProcessingProgress {
  total: number;
  completed: number;
  processing: number;
  error: number;
  pending: number;
  percentage: number;
  estimatedTimeRemaining?: number;
}

// Segment data for original sequencer (keep for backward compatibility)
export interface SegmentData {
  id: number;
  startTime: number;
  endTime: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  transcription?: string;
  factCheckResult?: ChunkProcessingResponse['fact_check'];
  thumbnail?: string;
  processingTime?: number;
}

export interface SequencerState {
  file: File | null;
  duration: number;
  segments: SegmentData[];
  currentTime: number;
  isPlaying: boolean;
  processingQueue: number[];
  selectedSegment: number | null;
  videoUrl?: string;
}

// UI-specific types
export interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  result?: FactCheckResponse | TranscriptionResult;
  error?: string;
}

export type TabType = 'text' | 'file' | 'audio' | 'live' | 'stream';

// Stream-related types for live fact-checking
export type StreamType = 'youtube' | 'twitch' | 'direct-url' | 'hls' | 'dash';

export interface StreamMetadata {
  title?: string;
  duration?: number;
  quality?: string;
  isLive?: boolean;
  thumbnail?: string;
}

export interface StreamData {
  url: string;
  type: StreamType;
  metadata?: StreamMetadata;
} 

// Plans and Subscription Types
export interface PlanConfig {
  id: string;
  name: string;
  type: string;
  pricing: {
    monthly: number;
    annual: number;
    annual_discount: number;
    currency: string;
  };
  limits: {
    requests_per_month: number;
    hours_per_month: number;
  };
  features: string[];
  stripe_ids: {
    monthly: string;
    annual: string;
  };
}

export interface UsageStats {
  current_period: {
    requests_used: number;
    requests_limit: number;
    hours_used: number;
    hours_limit: number;
    credits_remaining: number;
  };
  usage_percentage: {
    requests: number;
    hours: number;
    credits: number;
  };
  plan_info: {
    name: string;
    tier: string;
    billing_cycle: string;
    next_reset: string | null;
    currency: string;
  };
  recommendations: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  plan: string;
  credits_remaining: number;
  subscription_status: string;
  billing_cycle: string;
  preferred_currency: string;
  usage_percentage: {
    requests: number;
    hours: number;
    credits: number;
  };
}

export interface PlanComparisonResponse {
  current_plan: {
    name: string;
    limits: {
      requests: number;
      hours: number;
    };
  };
  upgrade_options: Array<{
    plan_id: string;
    name: string;
    price_difference: number;
    additional_features: string[];
  }>;
}

export interface UpgradeResponse {
  success: boolean;
  checkout_url?: string;
  message: string;
}

export interface UsagePermissionResponse {
  can_perform: boolean;
  reasons: {
    has_credits: boolean;
    within_request_limit: boolean;
    within_hours_limit: boolean;
    subscription_valid: boolean;
  };
  limits: {
    credits_remaining: number;
    requests_remaining: number;
    hours_remaining: number;
  };
}

export interface UsageTrackingResponse {
  success: boolean;
  usage_log_id?: string;
  remaining_limits: {
    credits_remaining: number;
    requests_remaining: number;
    hours_remaining: number;
  };
  error?: string;
} 

// Re-export landing page types for convenience
export type { 
  HeroSectionProps,
  FeatureItem,
  ProcessStep,
  TrustMetric,
  FeaturesSectionProps,
  HowItWorksSectionProps,
  TrustSectionProps,
  CTASectionProps,
  GuestSession,
  LandingPageProps,
  LandingPageConfig
} from './types/landing';