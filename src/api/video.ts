import type { ApiResponse, VideoRequest, VideoResponse } from '~/types'

// MiniMax API Base URL - should be configured via environment variable
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * POST /v1/video_generation - Create video generation task
 */
export async function createVideoTask(
  params: VideoRequest,
): Promise<ApiResponse<VideoResponse>> {
  const response = await fetch(`${API_BASE}/v1/video_generation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      code: 'REQUEST_FAILED',
      message: `Request failed with status ${response.status}`,
    }))
    return { success: false, error }
  }

  const data: VideoResponse = await response.json()
  return { success: true, data }
}

/**
 * GET /v1/video_generation?task_id=xxx - Query video task status
 */
export async function getVideoTaskStatus(
  taskId: string,
): Promise<ApiResponse<VideoResponse>> {
  const response = await fetch(
    `${API_BASE}/v1/video_generation?task_id=${encodeURIComponent(taskId)}`,
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      code: 'REQUEST_FAILED',
      message: `Request failed with status ${response.status}`,
    }))
    return { success: false, error }
  }

  const data: VideoResponse = await response.json()
  return { success: true, data }
}

/**
 * GET /v1/files?file_id=xxx - Get video file info
 */
export async function getVideoFile(
  fileId: string,
): Promise<ApiResponse<{ file_id: string, url: string }>> {
  const response = await fetch(
    `${API_BASE}/v1/files?file_id=${encodeURIComponent(fileId)}`,
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      code: 'REQUEST_FAILED',
      message: `Request failed with status ${response.status}`,
    }))
    return { success: false, error }
  }

  const data = await response.json()
  return { success: true, data }
}
