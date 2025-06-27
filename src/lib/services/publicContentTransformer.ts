import { PublicContentDetailResponse, PublicContentSegment } from '@/lib/types/public-content';
import { DashboardState, EnhancedSegmentData } from '@/lib/types';

export class PublicContentTransformer {
  /**
   * Transform public content segments into EnhancedSegmentData format for ProcessingDashboard
   */
  static transformSegmentsForDashboard(
    segments: PublicContentSegment[]
  ): EnhancedSegmentData[] {
    return segments.map((segment, index) => ({
      id: index, // Use array index for dashboard compatibility
      startTime: segment.start_time,
      endTime: segment.end_time,
      duration: segment.end_time - segment.start_time,
      status: 'completed' as const, // All public content segments are completed
      transcription: segment.transcription || '',
      factCheckResult: {
        status: this.getOverallStatus(segment.overall_status),
        claims: this.transformClaimsForDashboard(segment.claims || []),
        overall_confidence: (segment.truth_percentage || 0) / 100,
        total_claims: segment.claims_count,
        processed_claims: segment.claims_count,
        sources: this.extractSourcesFromClaims(segment.claims || []),
      },
      thumbnail: segment.thumbnail_url,
      claimsCount: segment.claims_count,
      accuracyScore: segment.truth_percentage || 0,
      lastUpdated: new Date(), // Use current time since we don't have this data
      metadata: {
        chunkNumber: segment.segment_number + 1,
        displayTime: segment.timerange,
        actualProcessingTime: segment.timerange,
        overallStatus: segment.overall_status,
        confidenceLevel: segment.confidence_level,
      },
    }));
  }

  /**
   * Transform public content into processing state for ProcessingDashboard
   */
  static transformContentForProcessingState(
    content: PublicContentDetailResponse,
    segments: PublicContentSegment[]
  ): DashboardState['processing'] {
    const totalSegments = segments.length;
    const completedSegments = segments.filter(s => s.claims_count > 0).length;
    
    return {
      totalSegments,
      completedSegments,
      processingSegments: 0, // All processing is complete for public content
      errorSegments: totalSegments - completedSegments,
      overallProgress: 100, // Always 100% for public content
      estimatedTimeRemaining: 0,
      startTime: new Date(content.created_at),
      isLiveStream: content.is_live_content,
    };
  }

  /**
   * Get overall status from segment status
   */
  private static getOverallStatus(status?: string): 'true' | 'false' | 'partially_true' | 'misleading' | 'unverifiable' | 'disputed' | 'uncertain' | 'not_checkable' | 'error' | 'no_text' {
    if (!status) return 'uncertain';
    
    const normalizedStatus = status.toLowerCase();
    if (['true', 'verified'].includes(normalizedStatus)) return 'true';
    if (['false', 'false_claim'].includes(normalizedStatus)) return 'false';
    if (['partially_true', 'partial'].includes(normalizedStatus)) return 'partially_true';
    if (['misleading'].includes(normalizedStatus)) return 'misleading';
    if (['unverifiable'].includes(normalizedStatus)) return 'unverifiable';
    if (['disputed'].includes(normalizedStatus)) return 'disputed';
    if (['error', 'failed'].includes(normalizedStatus)) return 'error';
    if (['no_text', 'empty'].includes(normalizedStatus)) return 'no_text';
    
    return 'uncertain';
  }

  /**
   * Transform claims to dashboard format
   */
  private static transformClaimsForDashboard(claims: any[]): Array<{
    text: string;
    status: 'true' | 'false' | 'partially_true' | 'misleading' | 'unverifiable' | 'disputed' | 'uncertain';
    confidence: 'high' | 'medium' | 'low' | 'insufficient';
    explanation: string;
    sources?: string[];
  }> {
    return claims.map(claim => ({
      text: claim.text || claim.claim_text || '',
      status: this.normalizeClaimStatus(claim.status || claim.verification_status),
      confidence: this.normalizeConfidence(claim.confidence || claim.confidence_level),
      explanation: claim.explanation || '',
      sources: claim.sources || claim.sources_used || [],
    }));
  }

  /**
   * Extract sources from claims
   */
  private static extractSourcesFromClaims(claims: any[]): string[] {
    const allSources: string[] = [];
    claims.forEach(claim => {
      const sources = claim.sources || claim.sources_used || [];
      allSources.push(...sources);
    });
    return [...new Set(allSources)]; // Remove duplicates
  }

  /**
   * Normalize claim status
   */
  private static normalizeClaimStatus(status?: string): 'true' | 'false' | 'partially_true' | 'misleading' | 'unverifiable' | 'disputed' | 'uncertain' {
    if (!status) return 'uncertain';
    
    const normalizedStatus = status.toLowerCase();
    if (['true', 'verified'].includes(normalizedStatus)) return 'true';
    if (['false', 'false_claim'].includes(normalizedStatus)) return 'false';
    if (['partially_true', 'partial'].includes(normalizedStatus)) return 'partially_true';
    if (['misleading'].includes(normalizedStatus)) return 'misleading';
    if (['unverifiable'].includes(normalizedStatus)) return 'unverifiable';
    if (['disputed'].includes(normalizedStatus)) return 'disputed';
    
    return 'uncertain';
  }

  /**
   * Normalize confidence level
   */
  private static normalizeConfidence(confidence?: string): 'high' | 'medium' | 'low' | 'insufficient' {
    if (!confidence) return 'medium';
    
    const normalizedConfidence = confidence.toLowerCase();
    if (['high'].includes(normalizedConfidence)) return 'high';
    if (['medium'].includes(normalizedConfidence)) return 'medium';
    if (['low'].includes(normalizedConfidence)) return 'low';
    if (['insufficient', 'very_low'].includes(normalizedConfidence)) return 'insufficient';
    
    return 'medium';
  }

  /**
   * Check if content has video media for UI decisions
   */
  static hasVideoMedia(content: PublicContentDetailResponse): boolean {
    return content.is_video_content || content.media_type === 'video';
  }

  /**
   * Check if content has audio media for UI decisions
   */
  static hasAudioMedia(content: PublicContentDetailResponse): boolean {
    return content.is_audio_content || content.media_type === 'audio';
  }

  /**
   * Get media URL for playback
   */
  static getPlayableUrl(content: PublicContentDetailResponse): string | null {
    if (content.is_youtube_content && content.embed_url) {
      return content.embed_url;
    }
    
    if (content.playable_url) {
      return content.playable_url;
    }
    
    return null;
  }

  /**
   * Format duration for display
   */
  static formatDuration(durationInSeconds?: number): string {
    if (!durationInSeconds || durationInSeconds <= 0) {
      return '00:00';
    }

    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
} 