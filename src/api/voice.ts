import type { ApiResponse, VoiceAsyncRequest, VoiceAsyncResponse } from '~/types'

// MiniMax API Base URL - should be configured via environment variable
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * POST /v1/t2a_async_v2 - Create async voice synthesis task
 */
export async function createVoiceTask(
  params: VoiceAsyncRequest,
): Promise<ApiResponse<VoiceAsyncResponse>> {
  const response = await fetch(`${API_BASE}/v1/t2a_async_v2`, {
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

  const data: VoiceAsyncResponse = await response.json()
  return { success: true, data }
}

/**
 * GET /v1/t2a_async_v2?task_id=xxx - Query task status
 */
export async function getVoiceTaskStatus(
  taskId: string,
): Promise<ApiResponse<VoiceAsyncResponse>> {
  const response = await fetch(`${API_BASE}/v1/t2a_async_v2?task_id=${encodeURIComponent(taskId)}`)

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      code: 'REQUEST_FAILED',
      message: `Request failed with status ${response.status}`,
    }))
    return { success: false, error }
  }

  const data: VoiceAsyncResponse = await response.json()
  return { success: true, data }
}

/**
 * GET /v1/files?file_id=xxx - Get audio file info
 */
export async function getAudioFile(fileId: string): Promise<ApiResponse<{ file_id: string, url: string }>> {
  const response = await fetch(`${API_BASE}/v1/files?file_id=${encodeURIComponent(fileId)}`)

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
