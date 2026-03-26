<script setup lang="ts">
import type { MusicRequest } from '~/types'
import { computed, onUnmounted, ref } from 'vue'
import { createMusicTask, getMusicTaskStatus } from '~/api/music'
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
  { label: 'AI 生成歌词', value: 'ai-generated' },
  { label: '自定义歌词', value: 'custom' },
]

// Status message
const statusMessage = computed(() => {
  if (error.value)
    return error.value
  if (isProcessing.value)
    return `处理中... ${progress.value}%`
  if (musicUrl.value)
    return '音乐已就绪！'
  return ''
})

// Start polling for task status
async function pollTaskStatus(id: string) {
  pollInterval = setInterval(async () => {
    const response = await getMusicTaskStatus(id)

    if (!response.success || !response.data) {
      stopPolling()
      error.value = response.error?.message || '状态检查失败'
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
      error.value = '音乐生成失败'
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
    error.value = '请输入自定义歌词'
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
    error.value = response.error?.message || '任务创建失败'
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
  <div class="music-view p-6 min-h-screen" style="background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-text-primary flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          音乐创作
        </h1>
        <p class="text-text-secondary mt-1">
          使用 AI 创作独特的音乐作品
        </p>
      </div>

      <!-- Lyrics Type Selection -->
      <div class="card">
        <div class="label flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          歌词选项
        </div>

        <div class="space-y-4">
          <select
            v-model="lyricsType"
            :disabled="isProcessing"
            class="input-base"
          >
            <option
              v-for="opt in lyricsTypeOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>

          <p class="text-sm text-text-secondary">
            {{ lyricsType === 'ai-generated'
              ? 'AI 将根据您选择的风格和心情标签生成歌词'
              : '编写您自己的歌词或粘贴现有歌词'
            }}
          </p>
        </div>
      </div>

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
        <button
          class="btn btn-primary w-full py-4 text-lg"
          :disabled="isProcessing || (lyricsType === 'custom' && !lyrics.trim())"
          @click="handleSubmit"
        >
          <svg v-if="!isProcessing" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          {{ isProcessing ? '生成中...' : '生成音乐' }}
        </button>
      </div>

      <!-- Error Message -->
      <div
        v-if="error"
        class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {{ error }}
      </div>

      <!-- Music Player -->
      <MusicPlayer
        v-if="musicUrl"
        :src="musicUrl"
        title="生成的音乐"
        :lyrics="lyrics"
      />

      <!-- Tips -->
      <div class="card">
        <div class="label flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          使用提示
        </div>

        <ul class="text-sm text-text-secondary space-y-3">
          <li class="flex items-start gap-3">
            <span class="text-primary mt-1">•</span>
            <span>选择最多 5 个风格/心情标签以获得更好的效果</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-primary mt-1">•</span>
            <span>自定义歌词最适合简单清晰的句子</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-primary mt-1">•</span>
            <span>根据复杂程度，生成通常需要 1-3 分钟</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-primary mt-1">•</span>
            <span>添加时间戳如 [00:15] 可以使歌词与音乐同步</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
