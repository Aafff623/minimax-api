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
  <div class="chat-window rounded-2xl overflow-hidden border border-border-light shadow-sm">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border-light">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
            <path d="M16 14v2a4 4 0 0 1-8 0v-2" />
            <line x1="12" y1="14" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-text-primary flex items-center gap-2">
            AI 对话
          </h2>
          <p class="text-xs text-text-muted">M2.7-highspeed</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span class="px-3 py-1.5 text-xs font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
          在线
        </span>
      </div>
    </div>

    <!-- Message List -->
    <MessageList
      :messages="messages"
      :streaming-content="isStreaming ? streamingContent : ''"
    />

    <!-- Footer -->
    <div class="p-4 border-t border-border-light bg-gradient-to-t from-gray-50/50 to-white">
      <!-- Streaming Indicator -->
      <div v-if="isStreaming" class="flex items-center gap-3 mb-3 px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
        <div class="flex gap-1">
          <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0ms" />
          <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 150ms" />
          <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 300ms" />
        </div>
        <span class="text-sm text-primary font-medium">AI 正在输入...</span>
        <button
          class="ml-auto px-3 py-1.5 text-xs font-medium rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-200"
          @click="handleStop"
        >
          停止
        </button>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="mb-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ error.message }}
      </div>

      <!-- Input -->
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
  @apply flex flex-col h-full bg-white;
}
</style>
