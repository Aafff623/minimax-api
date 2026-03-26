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
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <div class="label flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        歌词编辑器
      </div>
      <div class="flex gap-2">
        <button
          class="btn btn-secondary text-sm"
          :disabled="disabled || !lyrics.trim()"
          @click="generateTimestamp"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          自动时间戳
        </button>
        <button
          class="btn btn-secondary text-sm"
          :disabled="disabled || !lyrics.trim()"
          @click="clearLyrics"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          清空
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <!-- Lyrics Input -->
      <div>
        <label class="label flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="21" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="21" y1="18" x2="3" y2="18" />
          </svg>
          歌词内容
        </label>
        <textarea
          v-model="lyrics"
          :rows="10"
          :disabled="disabled"
          class="input-base resize-none font-mono text-sm"
          placeholder="在此输入歌词...&#10;每行一句话。&#10;点击"自动时间戳"生成时间戳。"
        />
      </div>

      <!-- Format Guide -->
      <div class="text-xs text-text-muted space-y-1 p-4 rounded-xl bg-gray-50">
        <p class="font-medium text-text-secondary mb-2">
          格式说明：
        </p>
        <ul class="list-disc list-inside space-y-1">
          <li>每行一句歌词</li>
          <li>使用 [mm:ss] 格式手动添加时间戳，例如 [00:15]</li>
          <li>留空则由 AI 生成歌词</li>
        </ul>
      </div>

      <!-- Preview -->
      <div v-if="lyrics.trim()" class="mt-4">
        <label class="label flex items-center gap-2 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          预览
        </label>
        <div class="rounded-xl p-4 max-h-48 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 border border-border-light">
          <div
            v-for="(line, index) in lyrics.split('\n').filter(l => l.trim())"
            :key="index"
            class="text-sm py-1.5 transition-all duration-200"
            :class="hasTimestamp(line) ? 'font-mono text-text-primary bg-white/50 px-2 rounded' : 'text-text-muted'"
          >
            {{ line }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
