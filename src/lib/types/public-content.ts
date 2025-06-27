export interface PublicContent {
  id: string;
  session_id: string;
  admin_user_id: string;
  title: string;
  description: string;
  content_type: 'video' | 'audio' | 'stream' | 'live_recording';
  source_url?: string;
  thumbnail_url?: string;
  duration?: number;
  truth_percentage: number;
  total_claims: number;
  view_count: number;
  status: 'processing' | 'public' | 'private' | 'archived';
  is_featured: boolean;
  is_live_content: boolean;
  content_metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
  published_at?: string;
  // Additional fields
  category: string;
  tags: string[];
  // Media fields
  has_media: boolean;
  media_type: string;
  youtube_url?: string;
  youtube_video_id?: string;
  uploaded_media_url?: string;
  uploaded_media_filename?: string;
  uploaded_media_size?: number;
  uploaded_media_mime_type?: string;
  media_size_formatted?: string;
  playable_url?: string;
  embed_url?: string;
}

export interface PublicContentSegment {
  id: string;
  segment_number: number;
  start_time: number;
  end_time: number;
  transcription?: string;
  thumbnail_url?: string;
  claims: any[];
  verification_results: any[];
  overall_status?: string;
  confidence_level?: string;
  truth_percentage?: number;
  claims_count: number;
  timerange: string;
}

export interface PublicContentFilters {
  limit?: number;
  offset?: number;
  content_type?: 'video' | 'audio' | 'stream' | 'live_recording';
  category?: string;
  search?: string;
  min_truth_percentage?: number;
  max_truth_percentage?: number;
  sort_by?: 'created_at' | 'view_count' | 'truth_percentage' | 'title';
  sort_direction?: 'asc' | 'desc';
}

export interface PublicContentListResponse {
  content: PublicContent[];
  total_count: number;
  page: number;
  page_size: number;
  has_more: boolean;
  categories: string[];
}

export interface PublicContentDetailResponse {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  source_url?: string;
  thumbnail_url?: string;
  truth_percentage: number;
  total_claims: number;
  duration_seconds?: number;
  view_count: number;
  is_live_content: boolean;
  metadata: Record<string, string>;
  created_at: string;
  // Enhanced Media Fields
  media_type: string;
  has_media: boolean;
  is_video_content: boolean;
  is_audio_content: boolean;
  is_youtube_content: boolean;
  is_uploaded_content: boolean;
  playable_url?: string;
  embed_url?: string;
  youtube_video_id?: string;
  uploaded_media_filename?: string;
}

export interface CreatePublicContentRequest {
  session_id: string;
  title: string;
  description: string;
  category?: string;
  tags?: string;
}

export interface FeaturedContentResponse {
  featured: PublicContent[];
  recent: PublicContent[];
  popular: PublicContent[];
}

export type ContentCategory = 'politics' | 'science' | 'health' | 'technology' | 'sports' | 'entertainment' | 'news' | 'education' | 'other';

export interface ContentViewEvent {
  content_id: string;
  view_duration?: number;
  segment_reached?: number;
} 