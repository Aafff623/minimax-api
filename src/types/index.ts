// MiniMax API Types

// ============ Voice ============
export interface VoiceAsyncRequest {
  model: 'speech-2.8-hd' | 'speech-2.6-hd' | 'speech-2.8-turbo' | 'speech-2.6-turbo' | 'speech-02-hd' | 'speech-02-turbo'
  text: string
  voice_id?: string
  pronunciation_dict?: string
  sound_effects?: string
  timestamp?: boolean
}

export interface VoiceAsyncResponse {
  task_id: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  file_id?: string
  progress?: number
}

export interface VoiceStreamRequest {
  model: string
  text: string
  voice_id: string
}

// ============ Image ============
export type ImageSize = '1:1' | '16:9' | '9:16' | '3:4' | '4:3'
export type ImageQuality = 'standard' | 'high'
export type ImageStyle
  = | 'realistic'
    | 'anime'
    | 'illustration'
    | '3d-render'
    | 'oil-painting'
    | 'watercolor'
    | 'sketch'
    | 'digital-art'

export interface ImageRequest {
  model: 'image-01'
  prompt: string
  image_size?: ImageSize
  image_ratio?: string
  num_images?: number
}

export interface ImageResponse {
  task_id: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  progress?: number
  image_urls?: string[]
}

export interface ImageFileResponse {
  file_id: string
  url: string
}

// ============ Video ============
export type VideoMode = 'text-to-video' | 'image-to-video' | 'subject-to-video' | 'subject-reference'

export interface VideoRequest {
  model: 'Hailuo-2.3-Fast' | 'Hailuo-2.3'
  mode: VideoMode
  prompt?: string
  subject?: string
  subject_type?: string
  reference_image?: string
  template_id?: string
}

export interface VideoResponse {
  task_id: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  video_url?: string
  progress?: number
}

// ============ Music ============
export interface MusicRequest {
  model: 'Music-2.5'
  lyrics?: string
  lyrics_type?: 'ai-generated' | 'custom'
  style?: string
  tags?: string[]
}

export interface MusicResponse {
  task_id: string
  status: string
  music_url?: string
}

// ============ Chat ============
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  model: 'M2.7-highspeed'
  messages: ChatMessage[]
  stream?: boolean
}

// ============ Common ============
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export interface TaskStatus {
  task_id: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  progress?: number
  result?: any
}

// ============ Store ============
export interface VoiceState {
  tasks: Record<string, TaskStatus>
  currentVoice: string | null
}

export interface ImageState {
  tasks: Record<string, TaskStatus>
  gallery: string[]
}

export interface HistoryItem {
  id: string
  type: 'voice' | 'image' | 'video' | 'music' | 'chat'
  createdAt: number
  data: any
  favorite?: boolean
}
