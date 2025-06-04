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

export interface ChunkProcessingResponse {
  transcription: {
    text: string;
    confidence: number;
    language: string;
    duration: number;
    metadata: Record<string, unknown>;
  };
  fact_check: {
    status: 'true' | 'false' | 'uncertain' | 'not_checkable' | 'error' | 'no_text';
    claims: Array<{
      text: string;
      status: string;
      confidence: string;
      explanation: string;
    }>;
    overall_confidence: number;
    total_claims?: number;
    processed_claims?: number;
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

export type TabType = 'text' | 'file' | 'audio'; 