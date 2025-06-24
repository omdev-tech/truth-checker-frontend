import { truthCheckerApi } from './api';

// Type for any async function
type AsyncFunction = (...args: any[]) => Promise<any>;

// Credit error handler type
type CreditErrorHandler = (error: any) => boolean;

// Global credit error handler - will be set by components using the context
let globalCreditErrorHandler: CreditErrorHandler | null = null;

export function setCreditErrorHandler(handler: CreditErrorHandler) {
  globalCreditErrorHandler = handler;
}

export function clearCreditErrorHandler() {
  globalCreditErrorHandler = null;
}

// Wrapper function to handle credit errors for any API call
export async function withCreditHandling<T extends AsyncFunction>(
  apiCall: T,
  ...args: Parameters<T>
): Promise<ReturnType<T>> {
  try {
    const result = await apiCall(...args);
    return result;
  } catch (error: any) {
    // Check if this is a credit error (402 status)
    const isCreditError = error?.status === 402 || 
                         error?.response?.status === 402 ||
                         (error?.message && error.message.includes('INSUFFICIENT_CREDITS'));

    if (isCreditError && globalCreditErrorHandler) {
      const wasHandled = globalCreditErrorHandler(error);
      if (wasHandled) {
        // Don't re-throw the error if it was handled by the credit modal
        throw new Error('CREDIT_ERROR_HANDLED');
      }
    }
    
    // Re-throw the original error if not handled
    throw error;
  }
}

// Create wrapped versions of credit-consuming API functions
const creditProtectedMethods = {
  // Text fact-checking
  checkText: (...args: Parameters<typeof truthCheckerApi.checkText>) =>
    withCreditHandling(truthCheckerApi.checkText, ...args),

  // File fact-checking
  checkFile: (...args: Parameters<typeof truthCheckerApi.checkFile>) =>
    withCreditHandling(truthCheckerApi.checkFile, ...args),

  // Transcription
  transcribeFile: (...args: Parameters<typeof truthCheckerApi.transcribeFile>) =>
    withCreditHandling(truthCheckerApi.transcribeFile, ...args),

  // Chunk processing for sequencer
  transcribeAndFactCheckChunk: (...args: Parameters<typeof truthCheckerApi.transcribeAndFactCheckChunk>) =>
    withCreditHandling(truthCheckerApi.transcribeAndFactCheckChunk, ...args),

  // Stream processing
  processStreamSegment: (...args: Parameters<typeof truthCheckerApi.processStreamSegment>) =>
    withCreditHandling(truthCheckerApi.processStreamSegment, ...args),
};

// Wrapped API with credit handling - overrides credit-consuming methods
export const apiWithCreditHandling = {
  ...truthCheckerApi,
  ...creditProtectedMethods
}; 