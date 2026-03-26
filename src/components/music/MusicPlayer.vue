<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'

const props = defineProps<{
  src?: string
  title?: string
  lyrics?: string
}>()

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const playbackRate = ref(1)

// Parse lyrics for synchronization
interface ParsedLyric {
  time: number // in seconds
  text: string
}

const parsedLyrics = computed((): ParsedLyric[] => {
  if (!props.lyrics)
    return []

  const lines = props.lyrics.split('\n')
  const result: ParsedLyric[] = []

  for (const line of lines) {
    const match = line.match(/\[(\d{2}):(\d{2})\]\s*(.*)/)
    if (match) {
      const minutes = Number.parseInt(match[1], 10)
      const seconds = Number.parseInt(match[2], 10)
      const text = match[3].trim()
      result.push({
        time: minutes * 60 + seconds,
        text,
      })
    }
  }

  return result.sort((a, b) => a.time - b.time)
})

// Current lyric index
const currentLyricIndex = computed(() => {
  if (parsedLyrics.value.length === 0)
    return -1

  for (let i = parsedLyrics.value.length - 1; i >= 0; i--) {
    if (currentTime.value >= parsedLyrics.value[i].time)
      return i
  }
  return -1
})

// Current lyric (used for display if needed)
const _currentLyric = computed(() => {
  const idx = currentLyricIndex.value
  return idx >= 0 ? parsedLyrics.value[idx].text : ''
})

// Format time as mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

// Play/Pause toggle
function togglePlay() {
  if (!audioRef.value)
    return

  if (isPlaying.value) {
    audioRef.value.pause()
  }
  else {
    audioRef.value.play()
  }
  isPlaying.value = !isPlaying.value
}

// Seek
function handleSeek(event: Event) {
  if (!audioRef.value)
    return

  const target = event.target as HTMLInputElement
  const time = Number.parseFloat(target.value)
  audioRef.value.currentTime = time
  currentTime.value = time
}

// Volume change
function handleVolumeChange(event: Event) {
  if (!audioRef.value)
    return

  const target = event.target as HTMLInputElement
  const vol = Number.parseFloat(target.value)
  audioRef.value.volume = vol
  volume.value = vol
}

// Playback rate change
function setPlaybackRate(rate: number) {
  if (!audioRef.value)
    return

  audioRef.value.playbackRate = rate
  playbackRate.value = rate
}

// Skip forward/backward
function skip(seconds: number) {
  if (!audioRef.value)
    return

  audioRef.value.currentTime = Math.max(
    0,
    Math.min(duration.value, audioRef.value.currentTime + seconds),
  )
}

// Audio event handlers
function onTimeUpdate() {
  if (audioRef.value)
    currentTime.value = audioRef.value.currentTime
}

function onLoadedMetadata() {
  if (audioRef.value)
    duration.value = audioRef.value.duration
}

function onEnded() {
  isPlaying.value = false
  currentTime.value = 0
}

// Cleanup
onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.src = ''
  }
})
</script>

<template>
  <div class="card">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-lg font-bold text-text-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        {{ title || '音乐播放器' }}
      </h2>
      <span v-if="src" class="text-sm text-text-muted font-mono">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </span>
    </div>

    <!-- Hidden Audio Element -->
    <audio
      v-if="src"
      ref="audioRef"
      :src="src"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    />

    <div class="space-y-6">
      <!-- Lyrics Display -->
      <div
        v-if="parsedLyrics.length > 0"
        class="rounded-xl p-5 max-h-64 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 border border-border-light"
      >
        <div class="space-y-2">
          <div
            v-for="(lyric, index) in parsedLyrics"
            :key="index"
            class="text-sm py-2 px-3 rounded-lg transition-all duration-300"
            :class="[
              index === currentLyricIndex
                ? 'text-primary font-bold scale-105 transform bg-primary/10 shadow-sm'
                : index < currentLyricIndex
                  ? 'text-text-muted'
                  : 'text-text-secondary',
            ]"
          >
            {{ lyric.text || '（纯音乐）' }}
          </div>
        </div>
      </div>

      <!-- No Lyrics Message -->
      <div
        v-else-if="lyrics"
        class="rounded-xl p-6 text-center text-text-muted text-sm bg-gray-50 border border-border-light"
      >
        暂无带时间戳的歌词
      </div>

      <!-- Controls -->
      <div v-if="src" class="space-y-5">
        <!-- Progress Bar -->
        <div class="space-y-2">
          <input
            type="range"
            :value="currentTime"
            :max="duration || 100"
            step="0.1"
            class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
            @input="handleSeek"
          >
        </div>

        <!-- Playback Controls -->
        <div class="flex items-center justify-center gap-4">
          <!-- Skip Back -->
          <button
            class="btn btn-secondary w-12 h-12 p-0 flex items-center justify-center rounded-full"
            :disabled="!src"
            @click="skip(-10)"
          >
            <span class="text-sm font-medium">-10s</span>
          </button>

          <!-- Play/Pause -->
          <button
            class="btn btn-primary w-16 h-16 p-0 flex items-center justify-center rounded-full shadow-lg hover:shadow-xl transition-all"
            :disabled="!src"
            @click="togglePlay"
          >
            <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </button>

          <!-- Skip Forward -->
          <button
            class="btn btn-secondary w-12 h-12 p-0 flex items-center justify-center rounded-full"
            :disabled="!src"
            @click="skip(10)"
          >
            <span class="text-sm font-medium">+10s</span>
          </button>
        </div>

        <!-- Volume & Speed -->
        <div class="flex items-center justify-between gap-4 pt-4 border-t border-border-light">
          <!-- Volume -->
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path v-if="volume > 0.5" d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path v-else-if="volume > 0" d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <line v-if="volume === 0" x1="23" y1="9" x2="17" y2="15" />
              <line v-if="volume === 0" x1="17" y1="9" x2="23" y2="15" />
            </svg>
            <input
              type="range"
              :value="volume"
              min="0"
              max="1"
              step="0.1"
              class="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              @input="handleVolumeChange"
            >
          </div>

          <!-- Playback Speed -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-text-secondary">速度:</span>
            <div class="flex gap-1">
              <button
                v-for="rate in [0.5, 1, 1.5, 2]"
                :key="rate"
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                :class="[
                  playbackRate === rate
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200',
                ]"
                :disabled="!src"
                @click="setPlaybackRate(rate)"
              >
                {{ rate }}x
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Source -->
      <div
        v-else
        class="text-center py-12"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto text-text-muted mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        <p class="text-text-secondary">还没有生成音乐</p>
      </div>
    </div>
  </div>
</template>
