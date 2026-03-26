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
  <div class="ai-lyrics-helper">
    <div class="helper-header">
      <h3 class="helper-title">
        <span class="i-carbon-artificial-intelligence mr-2" />
        AI Lyrics Helper
      </h3>
    </div>

    <!-- Mode Selection -->
    <div class="mode-tabs">
      <button
        class="mode-tab"
        :class="{ active: mode === 'suggest' }"
        @click="mode = 'suggest'"
      >
        <span class="i-carbon-light mr-1" />
        Generate New
      </button>
      <button
        class="mode-tab"
        :class="{ active: mode === 'continue' }"
        @click="mode = 'continue'"
      >
        <span class="i-carbon-forward mr-1" />
        Continue Existing
      </button>
    </div>

    <!-- Input Section -->
    <div class="input-section">
      <p class="input-hint">
        <template v-if="mode === 'suggest'">
          Generate creative lyrics based on your selected style
        </template>
        <template v-else>
          Continue from your existing lyrics
        </template>
      </p>

      <button
        class="generate-btn"
        :disabled="isLoading"
        @click="onSubmit"
      >
        <span v-if="isLoading" class="i-carbon-loading animate-spin mr-2" />
        <span v-else class="i-carbon-rocket mr-2" />
        {{ isLoading ? 'Generating...' : (mode === 'suggest' ? 'Generate Lyrics' : 'Continue Lyrics') }}
      </button>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="error-message">
      <span class="i-carbon-warning mr-2" />
      {{ error }}
    </div>

    <!-- Suggestion Display -->
    <div v-if="suggestion" class="suggestion-section">
      <div class="suggestion-header">
        <span class="suggestion-label">Generated Lyrics:</span>
      </div>
      <div class="suggestion-content">
        <pre class="lyrics-text">{{ suggestion }}</pre>
      </div>
      <div class="suggestion-actions">
        <button class="action-btn primary" @click="applySuggestion">
          <span class="i-carbon-checkmark mr-1" />
          Apply
        </button>
        <button class="action-btn secondary" @click="discardSuggestion">
          <span class="i-carbon-close mr-1" />
          Discard
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner" />
      <p class="loading-text">
        AI is crafting your lyrics...
      </p>
    </div>
  </div>
</template>

<style scoped>
.ai-lyrics-helper {
  @apply flex flex-col w-full bg-gray-800 rounded-lg p-4 gap-4;
}

.helper-header {
  @apply flex items-center justify-between;
}

.helper-title {
  @apply flex items-center text-lg font-semibold text-gray-100;
}

.mode-tabs {
  @apply flex gap-2 bg-gray-900 rounded-lg p-1;
}

.mode-tab {
  @apply flex items-center px-4 py-2 text-sm text-gray-400 rounded-md transition-all;
}

.mode-tab.active {
  @apply bg-gray-700 text-gray-100;
}

.mode-tab:hover:not(.active) {
  @apply text-gray-300;
}

.input-section {
  @apply flex flex-col gap-3;
}

.input-hint {
  @apply text-sm text-gray-400;
}

.generate-btn {
  @apply flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.error-message {
  @apply flex items-center px-4 py-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm;
}

.suggestion-section {
  @apply flex flex-col gap-3 p-4 bg-gray-900 rounded-lg;
}

.suggestion-header {
  @apply flex items-center justify-between;
}

.suggestion-label {
  @apply text-sm font-medium text-gray-300;
}

.suggestion-content {
  @apply max-h-60 overflow-y-auto;
}

.lyrics-text {
  @apply text-sm text-gray-300 whitespace-pre-wrap font-sans leading-relaxed;
}

.suggestion-actions {
  @apply flex gap-2 justify-end;
}

.action-btn {
  @apply flex items-center px-3 py-1.5 text-sm rounded-md transition-colors;
}

.action-btn.primary {
  @apply bg-green-600 text-white hover:bg-green-500;
}

.action-btn.secondary {
  @apply bg-gray-700 text-gray-300 hover:bg-gray-600;
}

.loading-state {
  @apply flex flex-col items-center justify-center py-8 gap-3;
}

.loading-spinner {
  @apply w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin;
}

.loading-text {
  @apply text-sm text-gray-400;
}
</style>
