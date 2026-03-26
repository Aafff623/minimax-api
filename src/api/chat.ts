import type { ApiResponse, ChatMessage, ChatRequest } from '~/types'

// MiniMax API Base URL
const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

export interface ChatResponse {
  id: string
  model: string
  choices: Array<{
    index: number
    message: ChatMessage
    finish_reason: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ChatApiReturn {
  sendMessage: (messages: ChatMessage[]) => Promise<ApiResponse<ChatMessage>>
}

/**
 * Chat API - Single message without streaming
 */
export function useChatApi(): ChatApiReturn {
  async function sendMessage(
    messages: ChatMessage[],
  ): Promise<ApiResponse<ChatMessage>> {
    try {
      const params: ChatRequest = {
        model: 'M2.7-highspeed',
        messages,
        stream: false,
      }

      const response = await fetch(`${API_BASE}/v1/chat/completions`, {
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

      const data: ChatResponse = await response.json()

      if (data.choices && data.choices.length > 0) {
        return {
          success: true,
          data: data.choices[0].message,
        }
      }

      return {
        success: false,
        error: {
          code: 'NO_CHOICES',
          message: 'No response choices returned',
        },
      }
    }
    catch (e) {
      return {
        success: false,
        error: {
          code: 'REQUEST_ERROR',
          message: e instanceof Error ? e.message : 'Unknown error occurred',
        },
      }
    }
  }

  return { sendMessage }
}
