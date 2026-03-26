<script setup lang="ts">
import type { MusicRequest } from '~/types'
import { computed, onUnmounted, ref } from 'vue'
import { createMusicTask, getMusicTaskStatus } from '~/api/music'
import Button from '~/components/common/Button.vue'
import Card from '~/components/common/Card.vue'
import Loading from '~/components/common/Loading.vue'
import Select from '~/components/common/Select.vue'
import LyricsEditor from '~/components/music/LyricsEditor.vue'
import MusicPlayer from '~/components/music/MusicPlayer.vue'

import StyleTags from '~/components/music/StyleTags.vue'

// Form state
const lyricsType = ref<'ai-generated' | 'custom'>('ai-generated')
const lyrics = ref('')
const selectedTags = ref<string[]>([])
const isProcessing = ref(false)
const error = ref<string | null>(null)
const musicUrl = ref<string | null>(null)
const taskId = ref<string | null>(null)
const progress = ref(0)

// Polling state
let pollInterval: ReturnType<typeof setInterval> | null = null

// Model options
const lyricsTypeOptions = [
  { label: 'AI Generate Lyrics', value: 'ai-generated' },
  { label: 'Use Custom Lyrics', value: 'custom' },
]

// Status message
const statusMessage = computed(() => {
  if (error.value)
    return error.value
  if (isProcessing.value)
    return `Processing... ${progress.value}%`
  if (musicUrl.value)
    return 'Music ready!'
  return ''
})

// Start polling for task status
async function pollTaskStatus(id: string) {
  pollInterval = setInterval(async () => {
    const response = await getMusicTaskStatus(id)

    if (!response.success || !response.data) {
      stopPolling()
      error.value = response.error?.message || 'Failed to check status'
      isProcessing.value = false
      return
    }

    const { status, music_url } = response.data

    if (status === 'success' && music_url) {
      stopPolling()
      musicUrl.value = music_url
      isProcessing.value = false
      progress.value = 100
    }
    else if (status === 'failed') {
      stopPolling()
      error.value = 'Music generation failed'
      isProcessing.value = false
    }
    else if (status === 'processing') {
      progress.value = Math.min(progress.value + 10, 90)
    }
  }, 2000)
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

// Handle submit
async function handleSubmit() {
  // Validate
  if (lyricsType.value === 'custom' && !lyrics.value.trim()) {
    error.value = 'Please enter custom lyrics'
    return
  }

  // Reset state
  error.value = null
  isProcessing.value = true
  progress.value = 0
  musicUrl.value = null

  const params: MusicRequest = {
    model: 'Music-2.5',
    lyrics: lyricsType.value === 'custom' ? lyrics.value : undefined,
    lyrics_type: lyricsType.value,
    tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
  }

  const response = await createMusicTask(params)

  if (!response.success || !response.data) {
    error.value = response.error?.message || 'Failed to create task'
    isProcessing.value = false
    return
  }

  taskId.value = response.data.task_id

  // Start polling
  pollTaskStatus(response.data.task_id)
}

// Cleanup on unmount
onUnmounted(() => {
  stopPolling()
})
</script>

<template>
  <div class="music-view p-6 max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-800">
        Music Creation
      </h1>
      <p class="text-gray-600 mt-1">
        Create unique music with AI-powered generation
      </p>
    </div>

    <!-- Lyrics Type Selection -->
    <Card>
      <template #header>
        <h2 class="text-lg font-semibold text-gray-800">
          Lyrics Option
        </h2>
      </template>

      <div class="space-y-4">
        <Select
          v-model="lyricsType"
          :options="lyricsTypeOptions"
          :disabled="isProcessing"
        />

        <p class="text-sm text-gray-500">
          {{ lyricsType === 'ai-generated'
            ? 'AI will generate lyrics based on your style and mood tags'
            : 'Write your own lyrics or paste existing ones'
          }}
        </p>
      </div>
    </Card>

    <!-- Lyrics Editor (only show for custom) -->
    <LyricsEditor
      v-if="lyricsType === 'custom'"
      v-model="lyrics"
      :disabled="isProcessing"
    />

    <!-- Style Tags -->
    <StyleTags
      v-model="selectedTags"
      :disabled="isProcessing"
    />

    <!-- Generate Button -->
    <div class="flex items-center gap-4">
      <Button
        type="primary"
        size="large"
        :loading="isProcessing"
        :disabled="lyricsType === 'custom' && !lyrics.trim()"
        @click="handleSubmit"
      >
        {{ isProcessing ? 'Generating...' : 'Generate Music' }}
      </Button>

      <span
        v-if="statusMessage"
        class="text-sm"
        :class="[error ? 'text-red-500' : 'text-gray-600']"
      >
        {{ statusMessage }}
      </span>
    </div>

    <!-- Music Player -->
    <MusicPlayer
      v-if="musicUrl"
      :src="musicUrl"
      title="Generated Music"
      :lyrics="lyrics"
    />

    <!-- Loading State -->
    <div v-if="isProcessing && !musicUrl" class="flex justify-center py-8">
      <Loading size="large" />
    </div>

    <!-- Tips -->
    <Card>
      <template #header>
        <h2 class="text-lg font-semibold text-gray-800">
          Tips
        </h2>
      </template>

      <ul class="text-sm text-gray-600 space-y-2">
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          <span>Select up to 5 style/mood tags for better results</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          <span>Custom lyrics work best with simple, clear sentences</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          <span>Generation typically takes 1-3 minutes depending on complexity</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary">•</span>
          <span>Add timestamps like [00:15] to sync lyrics with music</span>
        </li>
      </ul>
    </Card>
  </div>
</template>
