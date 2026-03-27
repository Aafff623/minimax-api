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

export interface StreamChatResponse {
  id: string
  model: string
  choices: Array<{
    index: number
    delta: {
      content?: string
      role?: string
    }
    finish_reason?: string
  }>
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

/**
 * Chat API - Streaming message
 */
export async function sendMessageStream(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const params: ChatRequest = {
    model: 'M2.7-highspeed',
    messages,
    stream: true,
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
      signal,
    })
  }
  catch (e) {
    throw new Error(e instanceof Error ? e.message : 'Network error occurred')
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      code: 'REQUEST_FAILED',
      message: `Request failed with status ${response.status}`,
    }))
    throw new Error(error.message || 'Request failed')
  }

  if (!response.body) {
    throw new Error('Response body is null')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()

      if (done)
        break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]')
            continue

          try {
            const parsed: StreamChatResponse = JSON.parse(data)
            const content = parsed.choices[0]?.delta?.content
            if (content) {
              onChunk(content)
            }
          }
          catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }
  finally {
    reader.releaseLock()
  }
}
