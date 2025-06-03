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
  duration: number;
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

// UI-specific types
export interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  result?: FactCheckResponse | TranscriptionResult;
  error?: string;
}

export type TabType = 'text' | 'file' | 'audio'; 