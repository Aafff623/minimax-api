import type { ApiResponse, MusicRequest, MusicResponse } from '~/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * POST /v1/music_generation - Create music generation task
 */
export async function createMusicTask(
  params: MusicRequest,
): Promise<ApiResponse<MusicResponse>> {
  const response = await fetch(`${API_BASE}/v1/music_generation`, {
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

  const data: MusicResponse = await response.json()
  return { success: true, data }
}

/**
 * GET /v1/music_generation?task_id=xxx - Query music task status
 */
export async function getMusicTaskStatus(
  taskId: string,
): Promise<ApiResponse<MusicResponse>> {
  const response = await fetch(
    `${API_BASE}/v1/music_generation?task_id=${encodeURIComponent(taskId)}`,
  )

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      code: 'REQUEST_FAILED',
      message: `Request failed with status ${response.status}`,
    }))
    return { success: false, error }
  }

  const data: MusicResponse = await response.json()
  return { success: true, data }
}
