<script setup lang="ts">
import type { ChatMessage } from '~/types'
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps<{
  messages: ChatMessage[]
  streamingContent?: string
}>()

const listRef = ref<HTMLElement | null>(null)

const displayMessages = computed(() => {
  const msgs = [...props.messages]
  // If there's streaming content, show it as the last assistant message
  if (props.streamingContent) {
    const lastMsg = msgs[msgs.length - 1]
    if (lastMsg?.role === 'assistant') {
      msgs[msgs.length - 1] = {
        ...lastMsg,
        content: lastMsg.content + props.streamingContent,
      }
    }
    else {
      msgs.push({
        role: 'assistant',
        content: props.streamingContent,
      })
    }
  }
  return msgs
})

async function scrollToBottom() {
  await nextTick()
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
}

watch(() => props.messages.length, scrollToBottom)
watch(() => props.streamingContent, scrollToBottom)
</script>

<template>
  <div ref="listRef" class="message-list">
    <div v-if="messages.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p class="empty-text">
        开始和 AI 对话吧
      </p>
    </div>

    <div v-else class="messages">
      <div
        v-for="(msg, index) in displayMessages"
        :key="index"
        class="message" :class="[`message-${msg.role}`]"
      >
        <div class="message-avatar">
          <div v-if="msg.role === 'user'" class="avatar-user">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div v-else class="avatar-ai">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
              <path d="M12 2a10 10 0 0 1 10 10" />
              <circle cx="12" cy="12" r="6" />
            </svg>
          </div>
        </div>
        <div class="message-content">
          <pre class="message-text">{{ msg.content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-list {
  @apply flex-1 overflow-y-auto px-4 py-2;
}

.empty-state {
  @apply h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500;
  @apply select-none;
}

.empty-icon {
  @apply mb-3 opacity-50;
}

.empty-text {
  @apply text-sm;
}

.messages {
  @apply flex flex-col gap-4;
}

.message {
  @apply flex gap-3;
}

.message-user {
  @apply flex-row-reverse;
}

.message-assistant {
  @apply flex-row;
}

.message-avatar {
  @apply flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center;
}

.avatar-user {
  @apply bg-primary-500 text-white;
}

.avatar-ai {
  @apply bg-gray-500 text-white;
}

.message-content {
  @apply max-w-[80%] rounded-lg px-4 py-2;
}

.message-user .message-content {
  @apply bg-primary-500 text-white;
}

.message-assistant .message-content {
  @apply bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100;
}

.message-text {
  @apply text-sm whitespace-pre-wrap break-words m-0;
  @apply font-sans;
}
</style>
