import { 
  PublicContent, 
  PublicContentSegment, 
  PublicContentFilters, 
  PublicContentListResponse, 
  PublicContentDetailResponse,
  CreatePublicContentRequest,
  FeaturedContentResponse,
  ContentViewEvent
} from '@/lib/types/public-content';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

class PublicContentApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'PublicContentApiError';
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    try {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error);
    }
  }

  return headers;
}

async function makeRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new PublicContentApiError(
      errorData.detail || `HTTP error! status: ${response.status}`,
      response.status
    );
  }

  return response.json();
}

export class PublicContentApi {
  // Public Gallery Endpoints
  
  /**
   * Get paginated list of public content with optional filtering
   */
  static async getPublicContent(filters: PublicContentFilters = {}): Promise<PublicContentListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const queryString = params.toString();
    const endpoint = `/api/public/content${queryString ? `?${queryString}` : ''}`;
    
    return makeRequest<PublicContentListResponse>(endpoint);
  }

  /**
   * Get detailed view of specific public content with segments
   */
  static async getPublicContentDetail(contentId: string): Promise<PublicContentDetailResponse> {
    return makeRequest<PublicContentDetailResponse>(`/api/public/content/${contentId}`);
  }

  /**
   * Get segments for specific public content
   */
  static async getPublicContentSegments(contentId: string): Promise<PublicContentSegment[]> {
    return makeRequest<PublicContentSegment[]>(`/api/public/content/${contentId}/segments`);
  }

  /**
   * Get featured content for landing page
   */
  static async getFeaturedContent(): Promise<FeaturedContentResponse> {
    return makeRequest<FeaturedContentResponse>('/api/public/content/featured');
  }

  /**
   * Track content view (analytics)
   */
  static async trackContentView(event: ContentViewEvent): Promise<void> {
    return makeRequest<void>(`/api/public/content/${event.content_id}/view`, {
      method: 'POST',
      body: JSON.stringify(event),
    });
  }

  /**
   * Get segments for public content
   */
  static async getPublicContentSegments(contentId: string): Promise<PublicContentSegment[]> {
    return makeRequest<PublicContentSegment[]>(`/api/public/content/${contentId}/segments`);
  }

  /**
   * Search public content
   */
  static async searchPublicContent(
    query: string, 
    filters: Omit<PublicContentFilters, 'search'> = {}
  ): Promise<PublicContentListResponse> {
    return this.getPublicContent({ ...filters, search: query });
  }

  /**
   * Get content by category
   */
  static async getContentByCategory(
    category: string,
    filters: Omit<PublicContentFilters, 'category'> = {}
  ): Promise<PublicContentListResponse> {
    return this.getPublicContent({ ...filters, category });
  }

  // Admin Endpoints (require authentication and admin permissions)

  /**
   * Create public content from existing session (Admin only)
   */
  static async createPublicContent(request: CreatePublicContentRequest): Promise<PublicContent> {
    return makeRequest<PublicContent>('/api/admin/public-content', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  /**
   * Get admin's public content list (Admin only)
   */
  static async getAdminPublicContent(
    limit: number = 20,
    offset: number = 0
  ): Promise<PublicContentListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return makeRequest<PublicContentListResponse>(`/api/admin/public-content?${params}`);
  }

  /**
   * Delete public content (Admin only)
   */
  static async deletePublicContent(contentId: string): Promise<void> {
    return makeRequest<void>(`/api/admin/public-content/${contentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Update public content (Admin only)
   */
  static async updatePublicContent(
    contentId: string, 
    updates: Partial<CreatePublicContentRequest>
  ): Promise<PublicContent> {
    return makeRequest<PublicContent>(`/api/admin/public-content/${contentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  /**
   * Toggle featured status (Admin only)
   */
  static async toggleFeaturedStatus(contentId: string): Promise<PublicContent> {
    return makeRequest<PublicContent>(`/api/admin/public-content/${contentId}/featured`, {
      method: 'POST',
    });
  }

  /**
   * Check if current user is admin
   */
  static async isCurrentUserAdmin(): Promise<boolean> {
    try {
      await makeRequest<void>('/api/admin/public-content');
      return true;
    } catch (error) {
      if (error instanceof PublicContentApiError && error.status === 403) {
        return false;
      }
      throw error;
    }
  }
}

export default PublicContentApi; 