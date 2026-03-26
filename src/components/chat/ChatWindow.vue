<script setup lang="ts">
import type { ChatMessage } from '~/types'
import { ref } from 'vue'
import { useChatStream } from '~/composables/useChatStream'
import MessageInput from './MessageInput.vue'
import MessageList from './MessageList.vue'

const messages = ref<ChatMessage[]>([])
const inputValue = ref('')
const isStreaming = ref(false)
const streamingContent = ref('')

const { startStream, abort, error } = useChatStream({
  onChunk: (chunk) => {
    streamingContent.value += chunk
  },
  onComplete: () => {
    // Add the complete message to history
    if (streamingContent.value) {
      messages.value.push({
        role: 'assistant',
        content: streamingContent.value,
      })
      streamingContent.value = ''
    }
    isStreaming.value = false
  },
  onError: (e) => {
    console.error('Chat error:', e)
    isStreaming.value = false
    streamingContent.value = ''
  },
})

function handleSend() {
  const text = inputValue.value.trim()
  if (!text || isStreaming.value)
    return

  // Add user message
  messages.value.push({
    role: 'user',
    content: text,
  })

  // Clear input
  inputValue.value = ''

  // Start streaming
  isStreaming.value = true
  streamingContent.value = ''

  startStream(messages.value)
}

function handleClear() {
  inputValue.value = ''
}

function handleStop() {
  abort()
  // If we have partial content, add it as an assistant message
  if (streamingContent.value) {
    messages.value.push({
      role: 'assistant',
      content: streamingContent.value,
    })
    streamingContent.value = ''
  }
  isStreaming.value = false
}
</script>

<template>
  <div class="chat-window">
    <div class="chat-header">
      <h2 class="chat-title">
        AI 对话
      </h2>
      <span class="chat-model">M2.7-highspeed</span>
    </div>

    <MessageList
      :messages="messages"
      :streaming-content="isStreaming ? streamingContent : ''"
    />

    <div class="chat-footer">
      <div v-if="isStreaming" class="streaming-indicator">
        <span class="streaming-dot" />
        <span>AI 正在输入...</span>
        <button class="btn-stop" @click="handleStop">
          停止
        </button>
      </div>
      <div v-if="error" class="error-message">
        {{ error.message }}
      </div>
      <MessageInput
        v-model="inputValue"
        :loading="isStreaming"
        @send="handleSend"
        @clear="handleClear"
      />
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  @apply flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700;
  @apply overflow-hidden;
}

.chat-header {
  @apply flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700;
  @apply bg-gray-50 dark:bg-gray-800;
}

.chat-title {
  @apply text-base font-semibold text-gray-800 dark:text-gray-100 m-0;
}

.chat-model {
  @apply text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300;
}

.chat-footer {
  @apply p-3 border-t border-gray-200 dark:border-gray-700;
}

.streaming-indicator {
  @apply flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400;
}

.streaming-dot {
  @apply w-2 h-2 rounded-full bg-primary-500;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}

.btn-stop {
  @apply ml-auto px-2 py-1 text-xs rounded bg-gray-200 dark:bg-gray-700;
  @apply hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors;
}

.error-message {
  @apply text-xs text-red-500 mb-2 px-2 py-1 rounded bg-red-50 dark:bg-red-900/20;
}
</style>
