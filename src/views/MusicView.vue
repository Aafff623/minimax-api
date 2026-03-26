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
  <div class="music-view min-h-screen" style="background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);">
    <!-- Header Section -->
    <div class="relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div class="absolute -bottom-24 -left-24 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div class="relative max-w-5xl mx-auto px-6 pt-10 pb-8">
        <!-- Title -->
        <div class="flex items-center gap-4 mb-3">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-text-primary" style="font-family: 'Plus Jakarta Sans', sans-serif;">
              音乐创作
            </h1>
            <p class="text-text-secondary mt-0.5">
              使用 AI 创作独特的音乐作品
            </p>
          </div>
        </div>

        <!-- Stats Row -->
        <div class="flex items-center gap-6 mt-6">
          <div class="flex items-center gap-2 text-sm text-text-secondary">
            <div class="w-2 h-2 rounded-full bg-cta animate-pulse" />
            <span>Music-2.5 模型</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            <span>支持自定义歌词</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>15首/天免费额度</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-5xl mx-auto px-6 pb-12">
      <!-- Main Grid Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Lyrics & Style (2/3 width on large screens) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Lyrics Type Selection Card -->
          <div class="card border border-border-light/50">
            <div class="flex items-center justify-between mb-5">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-text-primary">
                    歌词设置
                  </h2>
                  <p class="text-sm text-text-secondary">
                    选择或编写歌词
                  </p>
                </div>
              </div>
            </div>

            <!-- Lyrics Type Toggle -->
            <div class="flex p-1 bg-gray-100 rounded-xl mb-5">
              <button
                v-for="opt in lyricsTypeOptions"
                :key="opt.value"
                class="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200"
                :class="lyricsType === opt.value ? 'bg-white text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'"
                @click="lyricsType = opt.value as 'ai-generated' | 'custom'"
              >
                <svg v-if="opt.value === 'ai-generated'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
                  <path d="M16 14v2a4 4 0 0 1-8 0v-2" />
                  <line x1="12" y1="14" x2="12" y2="22" />
                  <line x1="8" y1="22" x2="16" y2="22" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                {{ opt.label }}
              </button>
            </div>

            <p class="text-sm text-text-secondary bg-primary/5 rounded-xl p-4 border border-primary/10">
              <template v-if="lyricsType === 'ai-generated'">
                AI 将根据您选择的风格和心情标签智能生成歌词，打造独特的音乐作品
              </template>
              <template v-else>
                编写您自己的歌词或粘贴现有歌词，每行一句话效果最佳
              </template>
            </p>
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
          <button
            class="relative w-full py-4 text-base font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
            :class="isProcessing || (lyricsType === 'custom' && !lyrics.trim())
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-secondary text-white'"
            :disabled="isProcessing || (lyricsType === 'custom' && !lyrics.trim())"
            @click="handleSubmit"
          >
            <template v-if="isProcessing">
              <svg class="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>生成中... {{ progress }}%</span>
              <!-- Progress Bar -->
              <div class="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
                <div
                  class="h-full bg-white transition-all duration-300"
                  :style="{ width: `${progress}%` }"
                />
              </div>
            </template>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
              <span>生成音乐</span>
            </template>
          </button>

          <!-- Error Message -->
          <div
            v-if="error"
            class="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-3"
          >
            <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <span class="font-medium">{{ error }}</span>
          </div>
        </div>

        <!-- Right Column: Player & Tips (1/3 width on large screens) -->
        <div class="space-y-6">
          <!-- Music Player -->
          <MusicPlayer
            v-if="musicUrl"
            :src="musicUrl"
            title="生成的音乐"
            :lyrics="lyrics"
          />

          <!-- Empty Player State -->
          <div
            v-else
            class="card border-2 border-dashed border-border-light bg-gradient-to-br from-gray-50 to-gray-100/50"
          >
            <div class="flex flex-col items-center justify-center py-10 text-center">
              <div class="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-5">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-text-primary mb-2">
                准备创作
              </h3>
              <p class="text-sm text-text-secondary max-w-xs">
                选择风格标签，开始生成您独特的音乐作品
              </p>
            </div>
          </div>

          <!-- Tips Card -->
          <div class="card bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div>
                <h3 class="text-base font-bold text-text-primary">
                  使用提示
                </h3>
                <p class="text-xs text-text-secondary">
                  获得更好的创作效果
                </p>
              </div>
            </div>

            <ul class="space-y-3">
              <li class="flex items-start gap-3 text-sm">
                <div class="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-amber-700 text-xs font-bold">1</span>
                </div>
                <span class="text-text-secondary">选择最多 5 个风格/心情标签以获得更好的效果</span>
              </li>
              <li class="flex items-start gap-3 text-sm">
                <div class="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-amber-700 text-xs font-bold">2</span>
                </div>
                <span class="text-text-secondary">自定义歌词最适合简单清晰的句子</span>
              </li>
              <li class="flex items-start gap-3 text-sm">
                <div class="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-amber-700 text-xs font-bold">3</span>
                </div>
                <span class="text-text-secondary">根据复杂程度，生成通常需要 1-3 分钟</span>
              </li>
              <li class="flex items-start gap-3 text-sm">
                <div class="w-5 h-5 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-amber-700 text-xs font-bold">4</span>
                </div>
                <span class="text-text-secondary">添加时间戳如 [00:15] 可以使歌词与音乐同步</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth animations */
.music-view {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Progress bar animation */
@keyframes progressStripe {
  0% {
    background-position: 1rem 0;
  }
  100% {
    background-position: 0 0;
  }
}
</style>
