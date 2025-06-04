import { 
  FactCheckRequest, 
  FactCheckResponse, 
  HealthStatus, 
  TranscriptionResult,
  TranscriptionRequest,
  ChunkProcessingRequest,
  ChunkProcessingResponse 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
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

  // Text fact checking
  async checkText(request: FactCheckRequest): Promise<FactCheckResponse> {
    const response = await fetch(`${API_BASE_URL}/fact-check/text`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });
    return handleResponse<FactCheckResponse>(response);
  },

  // File fact checking
  async checkFile(file: File, language = 'en'): Promise<FactCheckResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    const response = await fetch(`${API_BASE_URL}/fact-check/file`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<FactCheckResponse>(response);
  },

  // Audio/Video transcription
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

    const response = await fetch(`${API_BASE_URL}/stt/transcribe`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<TranscriptionResult>(response);
  },

  // Audio/Video chunk processing for sequencer
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

    const response = await fetch(`${API_BASE_URL}/stt/transcribe-chunk`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<ChunkProcessingResponse>(response);
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