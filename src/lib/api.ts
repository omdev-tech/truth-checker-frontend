import { 
  FactCheckRequest, 
  FactCheckResponse, 
  HealthStatus, 
  TranscriptionResult,
  TranscriptionRequest,
  ChunkProcessingRequest,
  ChunkProcessingResponse,
  StreamProcessingRequest 
} from './types';
import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.truth.omdev.tech';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get authentication headers for API requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const session = await getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }
  
  return headers;
}

/**
 * Make authenticated API request
 */
async function makeAuthenticatedRequest(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const authHeaders = await getAuthHeaders();
  
  // Merge auth headers with existing headers
  const headers = {
    ...authHeaders,
    ...options.headers,
  };
  
  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Make authenticated FormData request (for file uploads)
 */
async function makeAuthenticatedFormDataRequest(
  url: string,
  formData: FormData
): Promise<Response> {
  const session = await getSession();
  const headers: Record<string, string> = {};
  
  if (session?.accessToken) {
    headers['Authorization'] = `Bearer ${session.accessToken}`;
  }
  
  return fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    
    try {
      const errorData = await response.json();
      // Handle different error response formats
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else {
        // If it's an object without known error fields, stringify it properly
        errorMessage = JSON.stringify(errorData);
      }
    } catch {
      // If JSON parsing fails, try to get text
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      } catch {
        // Keep the default HTTP status message
      }
    }
    
    throw new ApiError(errorMessage, response.status);
  }
  return response.json();
}

export const truthCheckerApi = {
  // Health check
  async getHealth(): Promise<HealthStatus> {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<HealthStatus>(response);
  },

  // Text fact checking (with optional authentication)
  async checkText(request: FactCheckRequest): Promise<FactCheckResponse> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/fact-check/text`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return handleResponse<FactCheckResponse>(response);
  },

  // File fact checking (with optional authentication)
  async checkFile(file: File, language = 'en'): Promise<FactCheckResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    const response = await makeAuthenticatedFormDataRequest(`${API_BASE_URL}/fact-check/file`, formData);
    return handleResponse<FactCheckResponse>(response);
  },

  // Audio/Video transcription (with optional authentication)
  async transcribeFile(
    file: File, 
    config: TranscriptionRequest = {}
  ): Promise<TranscriptionResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Send transcription config as form data fields
    if (config.provider) {
      formData.append('provider', config.provider);
    } else {
      formData.append('provider', 'elevenlabs'); // Default provider
    }
    
    if (config.language) {
      formData.append('language', config.language);
    }

    const response = await makeAuthenticatedFormDataRequest(`${API_BASE_URL}/stt/transcribe`, formData);
    return handleResponse<TranscriptionResult>(response);
  },

  // Audio/Video chunk processing for sequencer (with optional authentication)
  async transcribeAndFactCheckChunk(
    file: File,
    config: ChunkProcessingRequest = {}
  ): Promise<ChunkProcessingResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Send chunk processing config as form data fields
    formData.append('provider', config.provider || 'elevenlabs');
    formData.append('fast_mode', String(config.fast_mode ?? true));
    
    if (config.language) {
      formData.append('language', config.language);
    }
    
    if (config.start_time !== undefined) {
      formData.append('start_time', String(config.start_time));
    }
    
    if (config.end_time !== undefined) {
      formData.append('end_time', String(config.end_time));
    }

    const response = await makeAuthenticatedFormDataRequest(`${API_BASE_URL}/stt/transcribe-chunk`, formData);
    return handleResponse<ChunkProcessingResponse>(response);
  },

  // Stream URL processing for live fact-checking (with optional authentication)
  async processStreamSegment(
    request: StreamProcessingRequest
  ): Promise<ChunkProcessingResponse> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/stt/process-stream`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return handleResponse<ChunkProcessingResponse>(response);
  },

  // User-specific API endpoints (requires authentication)
  async getUserProfile(): Promise<any> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/me`);
    return handleResponse<any>(response);
  },

  async getUserUsageStats(): Promise<any> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/api/users/usage-stats`);
    return handleResponse<any>(response);
  },

  // WebSocket connections
  createFactCheckWebSocket(): WebSocket {
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
    return new WebSocket(`${wsUrl}/fact-check/ws`);
  },

  createTranscriptionWebSocket(provider = 'elevenlabs', language = 'en'): WebSocket {
    const wsUrl = API_BASE_URL.replace(/^http/, 'ws');
    return new WebSocket(`${wsUrl}/stt/stream?provider=${provider}&language=${language}`);
  },
};

export { ApiError }; 

export interface VideoInfo {
  duration: number;
  duration_formatted: string;
  chunk_duration: number;
  total_segments: number;
  stream_type: string;
  url: string;
  is_live: boolean;
  live_status: {
    is_live: boolean;
    live_broadcast_content: string;
    method: string;
    title?: string;
    concurrent_viewers?: number;
    error?: string;
  };
  note?: string;
  recommended_chunk_duration?: number;
  processing_mode: "live" | "regular";
}

export async function getVideoInfo(request: StreamProcessingRequest): Promise<VideoInfo> {
  const response = await fetch(`${API_BASE_URL}/stt/video-info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return handleResponse<VideoInfo>(response);
}

export async function processStreamSegment(request: StreamProcessingRequest): Promise<ChunkProcessingResponse> {
  const response = await fetch(`${API_BASE_URL}/stt/process-stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  return handleResponse<ChunkProcessingResponse>(response);
} 