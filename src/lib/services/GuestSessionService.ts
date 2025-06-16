import { GuestSession } from '@/lib/types/landing';
import { GUEST_CONFIG } from '@/lib/config/landing';

/**
 * Guest Session Service
 * Manages guest user sessions with usage tracking and limits
 * Follows SOLID principles with clear separation of concerns
 */
export class GuestSessionService {
  private static readonly STORAGE_KEY = 'truthchecker_guest_session';
  private static instance: GuestSessionService;

  private constructor() {}

  /**
   * Singleton pattern for service instance
   */
  public static getInstance(): GuestSessionService {
    if (!GuestSessionService.instance) {
      GuestSessionService.instance = new GuestSessionService();
    }
    return GuestSessionService.instance;
  }

  /**
   * Create a new guest session
   */
  public createSession(): GuestSession {
    const now = new Date();
    const session: GuestSession = {
      id: this.generateSessionId(),
      usageCount: 0,
      maxUsage: GUEST_CONFIG.MAX_USAGE,
      startTime: now,
      expiresAt: new Date(now.getTime() + GUEST_CONFIG.SESSION_DURATION)
    };

    this.saveSession(session);
    return session;
  }

  /**
   * Get current guest session or create new one
   */
  public getCurrentSession(): GuestSession {
    const existing = this.loadSession();
    
    if (!existing || this.isSessionExpired(existing)) {
      return this.createSession();
    }

    return existing;
  }

  /**
   * Check if user can perform an action
   */
  public canPerformAction(action: string = 'fact_check'): boolean {
    const session = this.getCurrentSession();
    return session.usageCount < session.maxUsage && !this.isSessionExpired(session);
  }

  /**
   * Consume usage credit
   */
  public consumeUsage(): { success: boolean; remainingUsage: number; message?: string } {
    const session = this.getCurrentSession();

    if (this.isSessionExpired(session)) {
      return {
        success: false,
        remainingUsage: 0,
        message: 'Session expired. Please refresh the page.'
      };
    }

    if (session.usageCount >= session.maxUsage) {
      return {
        success: false,
        remainingUsage: 0,
        message: 'Usage limit reached. Sign up to continue fact-checking.'
      };
    }

    session.usageCount++;
    this.saveSession(session);

    return {
      success: true,
      remainingUsage: session.maxUsage - session.usageCount
    };
  }

  /**
   * Refund usage credit (for failed API calls)
   */
  public refundUsage(): { success: boolean; remainingUsage: number; message?: string } {
    const session = this.getCurrentSession();

    if (session.usageCount <= 0) {
      return {
        success: false,
        remainingUsage: session.maxUsage - session.usageCount,
        message: 'No usage to refund.'
      };
    }

    session.usageCount--;
    this.saveSession(session);

    return {
      success: true,
      remainingUsage: session.maxUsage - session.usageCount,
      message: 'Credit refunded due to failed request.'
    };
  }

  /**
   * Get session usage statistics
   */
  public getUsageStats(): {
    used: number;
    remaining: number;
    total: number;
    percentUsed: number;
  } {
    const session = this.getCurrentSession();
    const used = session.usageCount;
    const total = session.maxUsage;
    const remaining = Math.max(0, total - used);
    const percentUsed = (used / total) * 100;

    return { used, remaining, total, percentUsed };
  }

  /**
   * Clear current session
   */
  public clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(GuestSessionService.STORAGE_KEY);
    }
  }

  /**
   * Check if session is expired
   */
  private isSessionExpired(session: GuestSession): boolean {
    return new Date() > new Date(session.expiresAt);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save session to localStorage
   */
  private saveSession(session: GuestSession): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(GuestSessionService.STORAGE_KEY, JSON.stringify(session));
      } catch (error) {
        console.warn('Failed to save guest session:', error);
      }
    }
  }

  /**
   * Load session from localStorage
   */
  private loadSession(): GuestSession | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(GuestSessionService.STORAGE_KEY);
      if (!stored) return null;

      const session = JSON.parse(stored);
      // Convert date strings back to Date objects
      session.startTime = new Date(session.startTime);
      session.expiresAt = new Date(session.expiresAt);

      return session;
    } catch (error) {
      console.warn('Failed to load guest session:', error);
      return null;
    }
  }
}

// Export singleton instance
export const guestSessionService = GuestSessionService.getInstance(); 