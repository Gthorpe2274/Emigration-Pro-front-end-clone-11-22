/**
 * Gemini Smart Curation Service for YouTube Videos
 * Uses Gemini AI to intelligently match and select the best video replacements
 */

interface VideoUpdateRequest {
  assessment_id: number;
  currentVideo: {
    video_id?: string;
    title: string;
    channel_name?: string;
    description: string;
    video_slot: number; // 1-6
  };
  country: string;
  city?: string;
}

interface CandidateVideo {
  video_id: string;
  title: string;
  channel_name: string;
  channel_id: string;
  thumbnail_url: string;
  description: string;
  youtube_url: string;
  published_at?: string;
  view_count?: number;
}

interface CuratedVideo {
  video_id: string;
  title: string;
  channel_name: string;
  channel_id: string;
  thumbnail_url: string;
  description: string;
  youtube_url: string;
  confidence_score: number;
  match_reason: string;
}

interface GeminiCurationResponse {
  selected_video_id: string;
  confidence_score: number; // 0-100
  match_reason: string;
  evaluation_criteria: {
    semantic_relevance: number;
    channel_quality_match: number;
    content_format_match: number;
    recency_quality_balance: number;
  };
}

export async function findBestVideoReplacement(
  request: VideoUpdateRequest,
  candidateVideos: CandidateVideo[],
  geminiApiKey: string | undefined
): Promise<CuratedVideo | null> {
  if (!geminiApiKey) {
    console.warn('Gemini API key not configured, using fallback selection');
    return selectBestVideoFallback(request, candidateVideos);
  }

  if (candidateVideos.length === 0) {
    return null;
  }

  try {
    // Prepare the prompt for Gemini
    const prompt = buildCurationPrompt(request, candidateVideos);

    // Call Gemini API
    const geminiResponse = await callGeminiAPI(prompt, geminiApiKey);

    // Parse Gemini response
    const curationResult = parseGeminiResponse(geminiResponse);

    // Find the selected video from candidates
    const selectedVideo = candidateVideos.find(
      v => v.video_id === curationResult.selected_video_id
    );

    if (!selectedVideo) {
      console.warn('Gemini selected video not found in candidates, using fallback');
      return selectBestVideoFallback(request, candidateVideos);
    }

    return {
      ...selectedVideo,
      confidence_score: curationResult.confidence_score,
      match_reason: curationResult.match_reason
    };
  } catch (error) {
    console.error('Gemini curation error:', error);
    console.log('Falling back to simple selection');
    return selectBestVideoFallback(request, candidateVideos);
  }
}

function buildCurationPrompt(
  request: VideoUpdateRequest,
  candidates: CandidateVideo[]
): string {
  const { currentVideo, country, city } = request;

  const candidatesJson = JSON.stringify(candidates.map(v => ({
    video_id: v.video_id,
    title: v.title,
    channel_name: v.channel_name,
    description: v.description.substring(0, 200) // Truncate for token efficiency
  })), null, 2);

  return `You are a video curation expert specializing in expat relocation content. Your task is to select the best video replacement that maintains quality and relevance.

CURRENT VIDEO TO REPLACE:
- Title: "${currentVideo.title}"
- Channel: "${currentVideo.channel_name || 'Unknown'}"
- Description: "${currentVideo.description}"
- Location: ${city ? `${city}, ` : ''}${country}
- Video Slot: ${currentVideo.video_slot} (This determines the content type/topic)

CANDIDATE REPLACEMENT VIDEOS:
${candidatesJson}

YOUR TASK:
Evaluate each candidate video and select the ONE best replacement based on:

1. SEMANTIC RELEVANCE: Does it cover the same topic/subject matter as the original?
2. CHANNEL QUALITY MATCH: Is it from the same channel or a similarly professional/trusted channel?
3. CONTENT FORMAT MATCH: Does it match the format (guide, vlog, comparison, etc.)?
4. RECENCY vs QUALITY: Prefer recent videos, but prioritize quality over pure recency
5. TARGET AUDIENCE: Must be relevant for US expats/emigrants, not general tourists

IMPORTANT:
- Prioritize videos from the SAME CHANNEL if available and recent
- Filter out clickbait titles, low-quality content, or off-topic videos
- The video must maintain the same educational/informational value
- Location context (${city ? `${city}, ` : ''}${country}) must match

RESPOND IN VALID JSON ONLY (no markdown, no code blocks):
{
  "selected_video_id": "video_id_of_best_match",
  "confidence_score": 85,
  "match_reason": "Brief explanation of why this video is the best match",
  "evaluation_criteria": {
    "semantic_relevance": 90,
    "channel_quality_match": 85,
    "content_format_match": 80,
    "recency_quality_balance": 85
  }
}

If no good match exists (confidence < 60), respond with:
{
  "selected_video_id": null,
  "confidence_score": 0,
  "match_reason": "No suitable replacement found",
  "evaluation_criteria": {
    "semantic_relevance": 0,
    "channel_quality_match": 0,
    "content_format_match": 0,
    "recency_quality_balance": 0
  }
}`;
}

async function callGeminiAPI(prompt: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more deterministic, analytical responses
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No text in Gemini response');
    }

    return text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

function parseGeminiResponse(responseText: string): GeminiCurationResponse {
  try {
    // Try to extract JSON from response (in case it's wrapped in markdown)
    let jsonText = responseText.trim();
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON object in response
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonText);

    // Validate response structure
    if (!parsed.selected_video_id && parsed.selected_video_id !== null) {
      throw new Error('Invalid response: missing selected_video_id');
    }

    return {
      selected_video_id: parsed.selected_video_id || '',
      confidence_score: parsed.confidence_score || 0,
      match_reason: parsed.match_reason || 'No reason provided',
      evaluation_criteria: parsed.evaluation_criteria || {
        semantic_relevance: 0,
        channel_quality_match: 0,
        content_format_match: 0,
        recency_quality_balance: 0
      }
    };
  } catch (error) {
    console.error('Failed to parse Gemini response:', error);
    throw new Error(`Invalid Gemini response format: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function selectBestVideoFallback(
  request: VideoUpdateRequest,
  candidates: CandidateVideo[]
): CuratedVideo | null {
  if (candidates.length === 0) {
    return null;
  }

  // Fallback: Select first candidate that matches channel name if available
  // Otherwise, select the first candidate (assumes YouTube API sorted by relevance)
  const { currentVideo } = request;

  if (currentVideo.channel_name) {
    const sameChannelMatch = candidates.find(
      v => v.channel_name.toLowerCase() === currentVideo.channel_name!.toLowerCase()
    );
    if (sameChannelMatch) {
      return {
        ...sameChannelMatch,
        confidence_score: 70,
        match_reason: 'Same channel match (fallback selection)'
      };
    }
  }

  // Default: first candidate
  return {
    ...candidates[0],
    confidence_score: 50,
    match_reason: 'First result (fallback selection - no Gemini available)'
  };
}

