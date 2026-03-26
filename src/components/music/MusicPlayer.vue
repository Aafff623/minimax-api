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
const showVolumeSlider = ref(false)

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

// Progress percentage
const progressPercent = computed(() => {
  if (duration.value === 0)
    return 0
  return (currentTime.value / duration.value) * 100
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
  <div class="card border border-border-light/50 overflow-hidden bg-gradient-to-br from-white to-gray-50/50">
    <!-- Header -->
    <div class="flex items-center justify-between p-5 border-b border-border-light/50">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div>
          <h2 class="text-lg font-bold text-text-primary">
            {{ title || '音乐播放器' }}
          </h2>
          <p class="text-xs text-text-secondary">
            Music-2.5 生成
          </p>
        </div>
      </div>

      <!-- Time Display -->
      <div v-if="src" class="text-sm font-mono text-text-secondary bg-gray-100 px-3 py-1.5 rounded-lg">
        {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
      </div>
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

    <div class="p-5 space-y-5">
      <!-- Lyrics Display -->
      <div
        v-if="parsedLyrics.length > 0"
        class="rounded-2xl p-4 max-h-52 overflow-y-auto bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border border-indigo-100/50"
      >
        <div class="space-y-1">
          <div
            v-for="(lyric, index) in parsedLyrics"
            :key="index"
            class="text-sm py-2.5 px-4 rounded-xl transition-all duration-300 cursor-default"
            :class="[
              index === currentLyricIndex
                ? 'text-primary font-bold bg-primary/10 shadow-sm transform scale-[1.02]'
                : index < currentLyricIndex
                  ? 'text-text-muted'
                  : 'text-text-secondary',
            ]"
          >
            <span v-if="index === currentLyricIndex" class="inline-block w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
            {{ lyric.text || '（纯音乐）' }}
          </div>
        </div>
      </div>

      <!-- No Lyrics Message -->
      <div
        v-else-if="lyrics"
        class="rounded-2xl p-6 text-center text-text-muted text-sm bg-gray-50 border border-dashed border-border-light"
      >
        <div class="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        暂无带时间戳的歌词
      </div>

      <!-- Controls -->
      <div v-if="src" class="space-y-5">
        <!-- progress Bar -->
        <div class="space-y-3">
          <!-- Custom progress Bar -->
          <div class="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-100"
              :style="{ width: `${progressPercent}%` }"
            />
            <input
              type="range"
              :value="currentTime"
              :max="duration || 100"
              step="0.1"
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              @input="handleSeek"
            >
          </div>
        </div>

        <!-- Playback Controls -->
        <div class="flex items-center justify-center gap-3">
          <!-- Skip Back -->
          <button
            class="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 hover:text-text-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!src"
            @click="skip(-10)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="11 19 2 12 11 5 11 19" />
              <polygon points="22 19 13 12 22 5 22 19" />
            </svg>
          </button>

          <!-- Play/Pause -->
          <button
            class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!src"
            @click="togglePlay"
          >
            <svg v-if="!isPlaying" xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          </button>

          <!-- Skip Forward -->
          <button
            class="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 hover:text-text-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!src"
            @click="skip(10)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 19 22 12 13 5 13 19" />
              <polygon points="2 19 11 12 2 5 2 19" />
            </svg>
          </button>
        </div>

        <!-- Volume & Speed -->
        <div class="flex items-center justify-between gap-4 pt-4 border-t border-border-light/50">
          <!-- Volume -->
          <div class="relative flex items-center gap-3">
            <button
              class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-text-secondary hover:bg-gray-200 hover:text-text-primary transition-all duration-200"
              @click="showVolumeSlider = !showVolumeSlider"
            >
              <svg v-if="volume > 0.5" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <svg v-else-if="volume > 0" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            </button>

            <!-- Volume Slider (shown on click) -->
            <div
              v-if="showVolumeSlider"
              class="absolute left-0 bottom-full mb-2 p-3 bg-white rounded-xl shadow-lg border border-border-light/50"
            >
              <input
                type="range"
                :value="volume"
                min="0"
                max="1"
                step="0.05"
                class="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                @input="handleVolumeChange"
              >
            </div>
          </div>

          <!-- Playback Speed -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-text-secondary mr-1">速度:</span>
            <div class="flex gap-1">
              <button
                v-for="rate in [0.5, 1, 1.5, 2]"
                :key="rate"
                class="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200"
                :class="[
                  playbackRate === rate
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-sm'
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
        class="text-center py-10"
      >
        <div class="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <p class="text-text-secondary font-medium">
          还没有生成音乐
        </p>
        <p class="text-text-muted text-sm mt-1">
          点击上方按钮开始创作
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom range input styling */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #6366F1;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
}

input[type="range"]::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #6366F1;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.4);
}

/* Custom scrollbar */
div::-webkit-scrollbar {
  width: 6px;
}

div::-webkit-scrollbar-track {
  background: transparent;
}

div::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

div::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
