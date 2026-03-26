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
  <div ref="listRef" class="message-list flex-1 overflow-y-auto px-5 py-4">
    <!-- Empty State -->
    <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center">
      <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-text-primary mb-2">
        开始和 AI 对话
      </h3>
      <p class="text-sm text-text-muted max-w-xs">
        使用 M2.7-highspeed 模型进行智能对话，体验超快响应速度
      </p>
    </div>

    <!-- Messages -->
    <div v-else class="flex flex-col gap-5">
      <div
        v-for="(msg, index) in displayMessages"
        :key="index"
        class="flex gap-4"
        :class="msg.role === 'user' ? 'flex-row-reverse' : ''"
      >
        <!-- Avatar -->
        <div
          class="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          :class="msg.role === 'user'
            ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-sm'
            : 'bg-gradient-to-br from-primary to-secondary shadow-sm'"
        >
          <svg v-if="msg.role === 'user'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
            <path d="M16 14v2a4 4 0 0 1-8 0v-2" />
            <line x1="12" y1="14" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </div>

        <!-- Message Bubble -->
        <div
          class="max-w-[75%] rounded-2xl px-5 py-3"
          :class="msg.role === 'user'
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-tr-sm'
            : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-border-light text-text-primary rounded-tl-sm'"
        >
          <pre class="text-sm whitespace-pre-wrap break-words leading-relaxed font-sans m-0">{{ msg.content }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-list {
  background: linear-gradient(180deg, #FAFAFA 0%, #F5F3FF 100%);
}
</style>
