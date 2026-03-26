<script setup lang="ts">
import { ref } from 'vue'
import { useChatApi } from '~/api/chat'

interface Props {
  currentLyrics?: string
  musicStyle?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  suggest: [lyrics: string]
  continue: [partialLyrics: string]
}>()

const isLoading = ref(false)
const error = ref<string | null>(null)
const suggestion = ref<string | null>(null)
const mode = ref<'suggest' | 'continue'>('suggest')

// Generate lyrics suggestion based on style/topic
async function generateSuggestion(style?: string) {
  isLoading.value = true
  error.value = null
  suggestion.value = null

  try {
    const userMessage = style
      ? `Write original song lyrics in the style of "${style}". Make them creative and emotionally engaging.`
      : 'Write original, creative song lyrics with good rhythm and rhyme. Make them emotionally engaging and meaningful.'

    const response = await useChatApi().sendMessage([
      { role: 'user', content: userMessage },
    ])

    if (response.success && response.data) {
      suggestion.value = response.data.content
    }
    else {
      error.value = response.error?.message || 'Failed to generate lyrics'
    }
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error occurred'
  }
  finally {
    isLoading.value = false
  }
}

// Continue existing lyrics
async function continueLyrics(partial: string) {
  if (!partial.trim()) {
    error.value = 'Please provide partial lyrics to continue'
    return
  }

  isLoading.value = true
  error.value = null
  suggestion.value = null

  try {
    const userMessage = `Continue the following song lyrics, maintaining the same style, tone, and rhythm:\n\n${partial}`

    const response = await useChatApi().sendMessage([
      { role: 'user', content: userMessage },
    ])

    if (response.success && response.data) {
      suggestion.value = response.data.content
    }
    else {
      error.value = response.error?.message || 'Failed to continue lyrics'
    }
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Unknown error occurred'
  }
  finally {
    isLoading.value = false
  }
}

// Handle form submission
function onSubmit() {
  if (mode.value === 'suggest') {
    generateSuggestion(props.musicStyle)
  }
  else {
    continueLyrics(props.currentLyrics || '')
  }
}

// Apply suggestion
function applySuggestion() {
  if (suggestion.value) {
    if (mode.value === 'suggest') {
      emit('suggest' as const, suggestion.value)
    }
    else {
      emit('continue' as const, suggestion.value)
    }
    suggestion.value = null
  }
}

// Discard suggestion
function discardSuggestion() {
  suggestion.value = null
}
</script>

<template>
  <div class="card border border-border-light/50 overflow-hidden bg-gradient-to-br from-violet-50/50 to-purple-50/50">
    <!-- Header -->
    <div class="flex items-center justify-between p-5 border-b border-border-light/50">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
            <path d="M16 14v2a4 4 0 0 1-8 0v-2" />
            <line x1="12" y1="14" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-text-primary">AI 歌词助手</h3>
          <p class="text-xs text-text-secondary">智能创作歌词</p>
        </div>
      </div>
    </div>

    <div class="p-5 space-y-5">
      <!-- Mode Selection -->
      <div class="flex p-1 bg-white/80 backdrop-blur rounded-xl shadow-sm border border-border-light/50">
        <button
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200"
          :class="mode === 'suggest' ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md' : 'text-text-secondary hover:text-text-primary'"
          @click="mode = 'suggest'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
            <path d="M16 14v2a4 4 0 0 1-8 0v-2" />
            <line x1="12" y1="14" x2="12" y2="22" />
            <line x1="8" y1="22" x2="16" y2="22" />
          </svg>
          生成新歌词
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200"
          :class="mode === 'continue' ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md' : 'text-text-secondary hover:text-text-primary'"
          @click="mode = 'continue'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          继续创作
        </button>
      </div>

      <!-- Description -->
      <p class="text-sm text-text-secondary bg-white/60 rounded-xl p-4 border border-border-light/50">
        <template v-if="mode === 'suggest'">
          基于您选择的风格生成创意歌词，AI 将创作独特且富有情感的作品
        </template>
        <template v-else>
          根据现有歌词继续创作，保持相同的风格、韵律和情感基调
        </template>
      </p>

      <!-- Submit Button -->
      <button
        class="w-full py-3.5 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
        :class="isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white'"
        :disabled="isLoading"
        @click="onSubmit"
      >
        <template v-if="isLoading">
          <svg class="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>AI 创作中...</span>
        </template>
        <template v-else>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          <span>{{ mode === 'suggest' ? '生成歌词' : '继续歌词' }}</span>
        </template>
      </button>

      <!-- Error Display -->
      <div v-if="error" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <span class="font-medium">{{ error }}</span>
      </div>

      <!-- Suggestion Display -->
      <div v-if="suggestion" class="p-5 rounded-xl bg-white border border-border-light shadow-sm space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span class="text-sm font-semibold text-text-primary">生成的歌词</span>
        </div>
        <div class="max-h-48 overflow-y-auto rounded-xl p-4 bg-gradient-to-br from-gray-50 to-gray-100/50">
          <pre class="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed font-sans">{{ suggestion }}</pre>
        </div>
        <div class="flex gap-3 justify-end">
          <button
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 border-border-light text-text-secondary bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            @click="discardSuggestion"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            放弃
          </button>
          <button
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm hover:shadow-md transition-all duration-200"
            @click="applySuggestion"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            应用歌词
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-10 gap-4">
        <div class="relative">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
              <path d="M16 14v2a4 4 0 0 1-8 0v-2" />
              <line x1="12" y1="14" x2="12" y2="22" />
              <line x1="8" y1="22" x2="16" y2="22" />
            </svg>
          </div>
          <div class="absolute -inset-2 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 opacity-30 animate-ping" />
        </div>
        <div class="text-center">
          <p class="text-sm font-semibold text-text-primary">AI 正在创作歌词</p>
          <p class="text-xs text-text-muted mt-1">请稍候片刻...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
pre::-webkit-scrollbar,
div::-webkit-scrollbar {
  width: 6px;
}

pre::-webkit-scrollbar-track,
div::-webkit-scrollbar-track {
  background: transparent;
}

pre::-webkit-scrollbar-thumb,
div::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

pre::-webkit-scrollbar-thumb:hover,
div::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
