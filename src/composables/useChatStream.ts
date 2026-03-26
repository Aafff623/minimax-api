import type { Ref } from 'vue'
import type { ChatMessage } from '~/types'
import { onUnmounted, readonly, ref } from 'vue'
import { sendMessageStream } from '~/api/chat'

export interface UseChatStreamOptions {
  onChunk?: (chunk: string) => void
  onComplete?: () => void
  onError?: (error: Error) => void
}

export interface UseChatStreamReturn {
  isStreaming: Ref<boolean>
  error: Ref<Error | null>
  fullContent: Ref<string>
  startStream: (messages: ChatMessage[]) => void
  abort: () => void
}

export function useChatStream(options: UseChatStreamOptions = {}): UseChatStreamReturn {
  const { onChunk, onComplete, onError } = options

  const isStreaming = ref(false)
  const error = ref<Error | null>(null)
  const fullContent = ref('')
  const abortController = ref<AbortController | null>(null)

  const abort = () => {
    if (abortController.value) {
      abortController.value.abort()
      abortController.value = null
      isStreaming.value = false
    }
  }

  const startStream = (messages: ChatMessage[]) => {
    // Abort any existing stream
    abort()

    // Reset state
    error.value = null
    fullContent.value = ''
    isStreaming.value = true

    // Create new abort controller
    abortController.value = new AbortController()

    sendMessageStream(
      messages,
      (chunk) => {
        fullContent.value += chunk
        onChunk?.(chunk)
      },
      abortController.value.signal,
    )
      .then(() => {
        isStreaming.value = false
        onComplete?.()
      })
      .catch((e) => {
        if (e.name !== 'AbortError') {
          error.value = e instanceof Error ? e : new Error('Stream error')
          onError?.(error.value)
        }
        isStreaming.value = false
      })
  }

  onUnmounted(() => {
    abort()
  })

  return {
    isStreaming: readonly(isStreaming) as Ref<boolean>,
    error: readonly(error) as Ref<Error | null>,
    fullContent: readonly(fullContent) as Ref<string>,
    startStream,
    abort,
  }
}
