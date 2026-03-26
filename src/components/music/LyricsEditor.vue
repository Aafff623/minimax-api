<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'generateTimestamp': []
}>()

const lyrics = ref(props.modelValue)

// Parse lyrics into lines for timestamp generation
interface LyricLine {
  time: string
  text: string
}

// Watch for external changes
watch(() => props.modelValue, (newVal) => {
  lyrics.value = newVal
})

watch(lyrics, (newVal) => {
  emit('update:modelValue', newVal)
})

// Generate timestamps automatically
function generateTimestamp() {
  const lines = lyrics.value.split('\n').filter(line => line.trim())
  const timestampedLines: LyricLine[] = []

  let currentTime = 0
  const minutes = Math.floor(currentTime / 60)
  const seconds = currentTime % 60

  lines.forEach((line) => {
    const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
    timestampedLines.push({ time: timeStr, text: line.trim() })

    // Estimate 4 seconds per line
    currentTime += 4
  })

  // Format output with timestamps
  lyrics.value = timestampedLines
    .map(l => `[${l.time}] ${l.text}`)
    .join('\n')

  emit('generateTimestamp')
}

// Check if lyrics have timestamps
const hasTimestamp = (line: string) => /^\[\d{2}:\d{2}\]/.test(line)

// Clear all
function clearLyrics() {
  lyrics.value = ''
}
</script>

<template>
  <div class="card border border-border-light/50 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between p-5 border-b border-border-light/50 bg-gradient-to-r from-primary/5 to-transparent">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-text-primary">
            自定义歌词
          </h3>
          <p class="text-xs text-text-secondary">
            编写或粘贴您的歌词
          </p>
        </div>
      </div>

      <!-- Toolbar Buttons -->
      <div class="flex gap-2">
        <button
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 border-border-light bg-white hover:border-primary/50 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-border-light"
          :disabled="disabled || !lyrics.trim()"
          @click="generateTimestamp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span class="hidden sm:inline">自动时间戳</span>
        </button>
        <button
          class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 border-border-light bg-white hover:border-red-500/50 hover:bg-red-50 text-red-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-border-light disabled:hover:text-red-500"
          :disabled="disabled || !lyrics.trim()"
          @click="clearLyrics"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span class="hidden sm:inline">清空</span>
        </button>
      </div>
    </div>

    <!-- Lyrics Input Area -->
    <div class="p-5 space-y-4">
      <!-- Main Textarea -->
      <div class="relative group">
        <textarea
          v-model="lyrics"
          :rows="12"
          :disabled="disabled"
          class="w-full px-5 py-4 rounded-2xl border-2 border-border-light bg-gradient-to-b from-gray-50 to-white text-text-primary placeholder-text-muted resize-none transition-all duration-200 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm leading-relaxed"
          placeholder="在此输入歌词...

每行一句话，建议 4-8 行歌词

示例：
[00:00] 第一句歌词
[00:04] 第二句歌词
[00:08] 第三句歌词"
        />
        <!-- Character count -->
        <div class="absolute bottom-3 right-3 text-xs text-text-muted">
          {{ lyrics.length }} 字符
        </div>
      </div>

      <!-- Format Guide Card -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-100">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-semibold text-text-primary mb-2">
              格式说明
            </p>
            <ul class="space-y-1.5 text-xs text-text-secondary">
              <li class="flex items-start gap-2">
                <span class="text-primary mt-0.5">•</span>
                <span>每行一句歌词，建议 4-8 行</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary mt-0.5">•</span>
                <span>使用 <code class="px-1.5 py-0.5 bg-white/60 rounded text-primary font-mono">[mm:ss]</code> 格式添加时间戳</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary mt-0.5">•</span>
                <span>点击"自动时间戳"可自动生成</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Preview Section -->
      <div v-if="lyrics.trim()" class="space-y-3">
        <div class="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span class="text-sm font-semibold text-text-primary">歌词预览</span>
        </div>
        <div class="rounded-2xl p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 border border-border-light/50 max-h-56 overflow-y-auto">
          <div class="space-y-1">
            <div
              v-for="(line, index) in lyrics.split('\n').filter(l => l.trim())"
              :key="index"
              class="text-sm py-2 px-3 rounded-xl transition-all duration-200"
              :class="hasTimestamp(line)
                ? 'font-mono text-text-primary bg-white/80 border border-border-light/50 shadow-sm'
                : 'text-text-secondary'"
            >
              <span v-if="hasTimestamp(line)" class="text-primary/70 mr-2">{{ line.match(/^\[\d{2}:\d{2}\]/)?.[0] }}</span>
              <span :class="hasTimestamp(line) ? '' : 'pl-6'">{{ line.replace(/^\[\d{2}:\d{2}\]\s*/, '') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
textarea::-webkit-scrollbar,
div::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

textarea::-webkit-scrollbar-track,
div::-webkit-scrollbar-track {
  background: transparent;
}

textarea::-webkit-scrollbar-thumb,
div::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

textarea::-webkit-scrollbar-thumb:hover,
div::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
