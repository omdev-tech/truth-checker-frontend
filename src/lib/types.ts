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
  chunk_index?: number;
  total_chunks?: number;
  session_name?: string;
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
  created_at: string;
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

// Fact-Check History Types
export interface FactCheckClaim {
  id: string;
  session_id: string;
  claim_text: string;
  original_input: string;
  source_type: 'text_prompt' | 'media_file' | 'live_stream' | 'live_recording';
  verification_status: 'true' | 'false' | 'partially_true' | 'misleading' | 'unverifiable' | 'disputed';
  confidence_level: 'high' | 'medium' | 'low' | 'insufficient';
  explanation: string;
  sources_used: string[];
  metadata: Record<string, string>;
  processing_time_seconds?: number;
  file_size_mb?: number;
  created_at: string;
  verified_at: string;
}

export interface FactCheckSession {
  id: string;
  user_id: string;
  title: string;
  source_type: 'text_prompt' | 'media_file' | 'live_stream' | 'live_recording';
  total_claims: number;
  verified_claims: number;
  true_claims: number;
  false_claims: number;
  partially_true_claims: number;
  misleading_claims: number;
  unverifiable_claims: number;
  disputed_claims: number;
  total_processing_time_seconds?: number;
  original_file_name?: string;
  original_file_size_mb?: number;
  stream_url?: string;
  metadata: Record<string, string>;
  accuracy_percentage: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface FactCheckHistoryResponse {
  sessions: FactCheckSession[];
  claims: FactCheckClaim[];
  statistics: {
    total_sessions: number;
    total_claims: number;
    total_processing_time_seconds: number;
    average_processing_time_per_claim: number;
    status_breakdown: Record<string, number>;
    source_type_breakdown: Record<string, number>;
  };
}

export interface SessionDetailsResponse {
  session: FactCheckSession;
  claims: FactCheckClaim[];
}

export interface HistoryFilters {
  limit?: number;
  offset?: number;
  source_type_filter?: string;
  status_filter?: string;
  date_from?: string;
  date_to?: string;
}

// Session Management Types
export interface SessionListResponse {
  sessions: SessionSummary[];
  statistics: {
    total_sessions: number;
    completed_sessions: number;
    processing_sessions: number;
    failed_sessions: number;
    total_claims: number;
    average_accuracy: number;
    sessions_by_type: Record<string, number>;
  };
}

export interface SessionSummary {
  id: string;
  user_id: string;
  name: string;
  content_type: 'text' | 'video' | 'audio' | 'live_recording' | 'stream';
  source_url?: string;
  source_metadata: Record<string, any>;
  total_segments: number;
  total_claims: number;
  overall_accuracy_percentage: number;
  status: 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface SessionSegment {
  session_id: string;
  fact_check_session_id: string;
  segment_number: number;
  start_time: number;
  end_time: number;
  name: string;
  accuracy_percentage: number;
  total_claims: number;
  true_claims: number;
  false_claims: number;
  created_at: string;
}

export interface SessionDetailsWithSegments {
  session: SessionSummary;
  segments: SessionSegment[];
}

// Guest API types for unauthenticated users
export interface GuestApiSession {
  session_id: string;
  usage_count: number;
  max_usage: number;
  remaining_usage: number;
}

export interface GuestFactCheckRequest {
  text: string;
  language?: string;
  session_id?: string;
}

export interface GuestFactCheckResponse {
  claims: Claim[];
  results: VerificationResult[];
  session: GuestApiSession;
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