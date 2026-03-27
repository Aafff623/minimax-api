// Voice Clone API
import type { ApiResponse, TaskStatus } from '@/types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export interface VoiceCloneCreateResponse {
  task_id: string
  status: 'pending' | 'processing' | 'success' | 'failed'
  clone_id?: string
}

export interface VoiceCloneStatusResponse extends TaskStatus {
  clone_id?: string
  preview_url?: string
}

// POST /v1/voice_clone - 创建克隆任务
export async function createVoiceClone(audioFile: File): Promise<ApiResponse<VoiceCloneCreateResponse>> {
  const formData = new FormData()
  formData.append('audio', audioFile)

  const response = await fetch(`${API_BASE}/v1/voice_clone`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Upload failed' }))
    return {
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: errorData.message || `HTTP ${response.status}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    data,
  }
}

// GET /v1/voice_clone?task_id=xxx - 查询克隆状态
export async function getCloneStatus(taskId: string): Promise<ApiResponse<VoiceCloneStatusResponse>> {
  const response = await fetch(`${API_BASE}/v1/voice_clone?task_id=${encodeURIComponent(taskId)}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Query failed' }))
    return {
      success: false,
      error: {
        code: 'QUERY_ERROR',
        message: errorData.message || `HTTP ${response.status}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    data,
  }
}

// GET /v1/voice_clone - 获取克隆音色列表
export async function getCloneList(): Promise<ApiResponse<VoiceCloneStatusResponse[]>> {
  const response = await fetch(`${API_BASE}/v1/voice_clone`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'List fetch failed' }))
    return {
      success: false,
      error: {
        code: 'LIST_ERROR',
        message: errorData.message || `HTTP ${response.status}`,
      },
    }
  }

  const data = await response.json()
  return {
    success: true,
    data,
  }
}
