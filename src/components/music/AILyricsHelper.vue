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
  <div class="card">
    <div class="flex items-center justify-between mb-5">
      <h3 class="label flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
          <path d="M16 14v2a4 4 0 0 1-8 0v-2" />
          <line x1="12" y1="14" x2="12" y2="22" />
          <line x1="8" y1="22" x2="16" y2="22" />
        </svg>
        AI 歌词助手
      </h3>
    </div>

    <!-- Mode Selection -->
    <div class="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
      <button
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
        :class="mode === 'suggest' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'"
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
        class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
        :class="mode === 'continue' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'"
        @click="mode = 'continue'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        继续创作
      </button>
    </div>

    <!-- Input Section -->
    <div class="space-y-4">
      <p class="text-sm text-text-secondary">
        <template v-if="mode === 'suggest'">
          基于您选择的风格生成创意歌词
        </template>
        <template v-else>
          根据现有歌词继续创作
        </template>
      </p>

      <button
        class="btn btn-primary w-full py-3"
        :disabled="isLoading"
        @click="onSubmit"
      >
        <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 2L11 13" />
          <path d="M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        {{ isLoading ? '生成中...' : (mode === 'suggest' ? '生成歌词' : '继续歌词') }}
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      {{ error }}
    </div>

    <!-- Suggestion Display -->
    <div v-if="suggestion" class="mt-5 p-5 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-border-light">
      <div class="flex items-center justify-between mb-3">
        <span class="text-sm font-medium text-text-primary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          生成的歌词
        </span>
      </div>
      <div class="max-h-60 overflow-y-auto mb-4">
        <pre class="text-sm text-text-secondary whitespace-pre-wrap leading-relaxed">{{ suggestion }}</pre>
      </div>
      <div class="flex gap-2 justify-end">
        <button class="btn btn-secondary text-sm" @click="discardSuggestion">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          放弃
        </button>
        <button class="btn btn-primary text-sm" @click="applySuggestion">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          应用
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex flex-col items-center justify-center py-10 gap-3">
      <div class="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p class="text-sm text-text-muted">
        AI 正在创作歌词...
      </p>
    </div>
  </div>
</template>
