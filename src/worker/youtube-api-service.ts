/**
 * YouTube Data API v3 Service
 * Wrapper for YouTube API calls to search and retrieve video information
 */

interface YouTubeSearchParams {
  query: string;
  maxResults?: number;
  order?: 'relevance' | 'date' | 'rating' | 'title' | 'viewCount';
  channelId?: string;
}

interface YouTubeVideoResult {
  video_id: string;
  title: string;
  channel_name: string;
  channel_id: string;
  thumbnail_url: string;
  description: string;
  youtube_url: string;
  published_at: string;
  view_count?: number;
  duration?: string;
}

export class YouTubeAPIService {
  private apiKey: string;

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new Error('YouTube API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Search for videos on YouTube
   */
  async searchVideos(params: YouTubeSearchParams): Promise<YouTubeVideoResult[]> {
    const {
      query,
      maxResults = 10,
      order = 'relevance',
      channelId
    } = params;

    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: maxResults.toString(),
      order: order,
      key: this.apiKey,
      ...(channelId && { channelId })
    });

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `YouTube API error: ${response.status} - ${errorData.error?.message || response.statusText}`
        );
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        return [];
      }

      // Get additional video details (statistics, content details)
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
      const videoDetails = await this.getVideoDetails(videoIds);

      // Combine search results with video details
      return data.items.map((item: any, index: number) => {
        const details = videoDetails[index] || {};
        return {
          video_id: item.id.videoId,
          title: item.snippet.title,
          channel_name: item.snippet.channelTitle,
          channel_id: item.snippet.channelId,
          thumbnail_url: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
          description: item.snippet.description || '',
          youtube_url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
          published_at: item.snippet.publishedAt,
          view_count: details.viewCount,
          duration: details.duration
        };
      });
    } catch (error) {
      console.error('YouTube search error:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about specific videos
   */
  private async getVideoDetails(videoIds: string): Promise<any[]> {
    const params = new URLSearchParams({
      part: 'statistics,contentDetails',
      id: videoIds,
      key: this.apiKey
    });

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?${params.toString()}`
      );

      if (!response.ok) {
        // If details fail, return empty array - search results are still valid
        console.warn('Failed to fetch video details, continuing without them');
        return [];
      }

      const data = await response.json();

      return (data.items || []).map((item: any) => ({
        viewCount: parseInt(item.statistics?.viewCount || '0', 10),
        duration: item.contentDetails?.duration || ''
      }));
    } catch (error) {
      console.warn('Video details fetch error:', error);
      return [];
    }
  }

  /**
   * Check if API key is valid by making a test request
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        part: 'snippet',
        q: 'test',
        type: 'video',
        maxResults: '1',
        key: this.apiKey
      });

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?${params.toString()}`
      );

      return response.ok;
    } catch {
      return false;
    }
  }
}


