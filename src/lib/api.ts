import { 
  FactCheckRequest, 
  FactCheckResponse, 
  HealthStatus, 
  TranscriptionResult,
  TranscriptionRequest 
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://109.238.11.43:8001';

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(error.detail || `HTTP ${response.status}`, response.status);
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
    formData.append('request', JSON.stringify(config));

    const response = await fetch(`${API_BASE_URL}/stt/transcribe`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<TranscriptionResult>(response);
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