import { truthCheckerApi } from '@/lib/api';
import { GuestFactCheckRequest, GuestFactCheckResponse, GuestApiSession } from '@/lib/types';
import { GuestSession } from '@/lib/types/landing';
import { guestSessionService } from './GuestSessionService';

/**
 * Guest API Service
 * Handles guest fact-checking API calls and session management
 * Bridges between frontend GuestSession and backend GuestApiSession
 */
export class GuestApiService {
  private static instance: GuestApiService;
  private backendSessionId: string | null = null;

  private constructor() {}

  public static getInstance(): GuestApiService {
    if (!GuestApiService.instance) {
      GuestApiService.instance = new GuestApiService();
    }
    return GuestApiService.instance;
  }

  /**
   * Synchronize frontend session with backend
   */
  private async syncWithBackend(): Promise<string> {
    // Get or create frontend session
    const frontendSession = guestSessionService.getCurrentSession();
    
    // If we don't have a backend session ID, create one
    if (!this.backendSessionId) {
      try {
        const backendSession = await truthCheckerApi.createGuestSession();
        this.backendSessionId = backendSession.session_id;
        console.log('✅ Created backend guest session:', this.backendSessionId);
      } catch (error) {
        console.error('❌ Failed to create backend session:', error);
        throw new Error('Failed to initialize guest session');
      }
    }

    return this.backendSessionId;
  }

  /**
   * Update frontend session based on backend response
   */
  private updateFrontendSession(backendSession: GuestApiSession): void {
    const frontendSession = guestSessionService.getCurrentSession();
    
    // Sync usage counts (backend is authoritative)
    if (frontendSession.usageCount !== backendSession.usage_count) {
      // Update frontend session to match backend
      frontendSession.usageCount = backendSession.usage_count;
      frontendSession.maxUsage = backendSession.max_usage;
      
      // Save updated session
      guestSessionService['saveSession'](frontendSession);
      console.log('🔄 Synced frontend session with backend:', {
        usage: backendSession.usage_count,
        remaining: backendSession.remaining_usage
      });
    }
  }

  /**
   * Check if user can perform fact-check action
   */
  public canPerformFactCheck(): boolean {
    return guestSessionService.canPerformAction('fact_check');
  }

  /**
   * Get current usage statistics
   */
  public getUsageStats() {
    return guestSessionService.getUsageStats();
  }

  /**
   * Perform guest text fact-check
   */
  public async checkText(text: string, language = 'en'): Promise<GuestFactCheckResponse> {
    // Check frontend limits first
    if (!this.canPerformFactCheck()) {
      throw new Error('Guest usage limit reached. Please sign up to continue.');
    }

    // Optimistically consume frontend credit
    const frontendResult = guestSessionService.consumeUsage();
    if (!frontendResult.success) {
      throw new Error(frontendResult.message || 'Usage limit reached');
    }

    try {
      // Sync with backend
      const sessionId = await this.syncWithBackend();

      // Make API call
      const request: GuestFactCheckRequest = {
        text,
        language,
        session_id: sessionId
      };

      const response = await truthCheckerApi.checkTextGuest(request);
      
      // Update frontend session with backend data
      this.updateFrontendSession(response.session);

      console.log('✅ Guest fact-check completed:', {
        claims: response.claims.length,
        results: response.results.length,
        remaining: response.session.remaining_usage
      });

      return response;

    } catch (error) {
      // Refund frontend credit on failure
      const refundResult = guestSessionService.refundUsage();
      console.log('🔄 Refunded guest credit due to error:', refundResult);
      
      // Re-throw the original error
      throw error;
    }
  }

  /**
   * Clear guest session (both frontend and backend)
   */
  public clearSession(): void {
    guestSessionService.clearSession();
    this.backendSessionId = null;
    console.log('🧹 Cleared guest session');
  }

  /**
   * Reset guest session (create new frontend and backend sessions)
   */
  public async resetSession(): Promise<GuestSession> {
    this.clearSession();
    
    // Create new frontend session
    const newSession = guestSessionService.createSession();
    
    // Backend session will be created on next API call
    this.backendSessionId = null;
    
    console.log('🔄 Reset guest session');
    return newSession;
  }
}

// Export singleton instance
export const guestApiService = GuestApiService.getInstance(); 