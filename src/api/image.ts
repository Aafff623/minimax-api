import type { ApiResponse, ImageRequest, ImageResponse } from '~/types'

// MiniMax API Base URL - should be configured via environment variable
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * POST /v1/image_generation - Create image generation task
 */
export async function createImageTask(
  params: ImageRequest,
): Promise<ApiResponse<ImageResponse>> {
  const response = await fetch(`${API_BASE}/v1/image_generation`, {
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

  const data: ImageResponse = await response.json()
  return { success: true, data }
}

/**
 * GET /v1/image_generation?task_id=xxx - Query image task status
 */
export async function getImageTaskStatus(
  taskId: string,
): Promise<ApiResponse<ImageResponse>> {
  const response = await fetch(
    `${API_BASE}/v1/image_generation?task_id=${encodeURIComponent(taskId)}`,
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      code: 'REQUEST_FAILED',
      message: `Request failed with status ${response.status}`,
    }))
    return { success: false, error }
  }

  const data: ImageResponse = await response.json()
  return { success: true, data }
}

/**
 * GET /v1/files?file_id=xxx - Get image file info
 */
export async function getImageFile(
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
