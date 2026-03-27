<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Track {
  id: string
  title: string
  artist: string
  cover: string
  src: string
  duration: number // 秒
}

interface Props {
  tracks?: Track[]
  defaultVolume?: number
}

const props = withDefaults(defineProps<Props>(), {
  tracks: () => [
    { id: 'peaceful-morning', title: 'Peaceful Morning', artist: 'MiniMax BGM', cover: '', src: '/bgm/peaceful-morning.wav', duration: 180 },
    { id: 'focus-flow', title: 'Focus Flow', artist: 'MiniMax BGM', cover: '', src: '/bgm/focus-flow.wav', duration: 240 },
    { id: 'creative-vibes', title: 'Creative Vibes', artist: 'MiniMax BGM', cover: '', src: '/bgm/creative-vibes.wav', duration: 200 },
  ],
  defaultVolume: 0.7,
})

const emit = defineEmits<{
  (e: 'trackChange', track: Track): void
}>()

const isMinimized = ref(false)
const isPlaying = ref(false)
const currentTrackIndex = ref(0)
const volume = ref(props.defaultVolume)
const currentTime = ref(0)
const isDragging = ref(false)
const showPlaylist = ref(false)

let audioElement: HTMLAudioElement | null = null
let updateInterval: number | null = null

const currentTrack = computed(() => props.tracks[currentTrackIndex.value])

const progressPercent = computed(() => {
  if (!currentTrack.value) return 0
  return (currentTime.value / currentTrack.value.duration) * 100
})

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(currentTrack.value?.duration || 0))

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function toggleMinimize() {
  isMinimized.value = !isMinimized.value
  if (isMinimized.value) {
    showPlaylist.value = false
  }
}

function togglePlay() {
  if (isPlaying.value) {
    pauseTrack()
  } else {
    playTrack()
  }
}

function playTrack() {
  if (!audioElement) {
    initAudio()
  }
  audioElement?.play()
  isPlaying.value = true
  startProgressUpdate()
}

function pauseTrack() {
  audioElement?.pause()
  isPlaying.value = false
  stopProgressUpdate()
}

function initAudio() {
  if (!audioElement) {
    audioElement = new Audio()
  }
  audioElement.src = currentTrack.value?.src || ''
  audioElement.volume = volume.value
  audioElement.addEventListener('ended', handleTrackEnded)
  audioElement.addEventListener('timeupdate', handleTimeUpdate)
}

function startProgressUpdate() {
  updateInterval = window.setInterval(() => {
    if (audioElement && !isDragging.value) {
      currentTime.value = audioElement.currentTime
    }
  }, 100)
}

function stopProgressUpdate() {
  if (updateInterval) {
    clearInterval(updateInterval)
    updateInterval = null
  }
}

function handleTimeUpdate() {
  if (audioElement && !isDragging.value) {
    currentTime.value = audioElement.currentTime
  }
}

function handleTrackEnded() {
  nextTrack()
}

function prevTrack() {
  currentTrackIndex.value = (currentTrackIndex.value - 1 + props.tracks.length) % props.tracks.length
  playCurrentTrack()
  emit('trackChange', currentTrack.value)
}

function nextTrack() {
  currentTrackIndex.value = (currentTrackIndex.value + 1) % props.tracks.length
  playCurrentTrack()
  emit('trackChange', currentTrack.value)
}

function playCurrentTrack() {
  if (audioElement) {
    audioElement.src = currentTrack.value?.src || ''
    audioElement.load()
    if (isPlaying.value) {
      audioElement.play()
    }
  }
}

function selectTrack(index: number) {
  currentTrackIndex.value = index
  playCurrentTrack()
  emit('trackChange', currentTrack.value)
}

function handleProgressClick(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  const newTime = percent * currentTrack.value.duration

  if (audioElement) {
    audioElement.currentTime = newTime
    currentTime.value = newTime
  }
}

function handleVolumeChange(event: Event) {
  const target = event.target as HTMLInputElement
  volume.value = parseFloat(target.value)
  if (audioElement) {
    audioElement.volume = volume.value
  }
}

function togglePlaylist() {
  showPlaylist.value = !showPlaylist.value
}

onMounted(() => {
  initAudio()
})

onUnmounted(() => {
  if (audioElement) {
    audioElement.pause()
    audioElement.removeEventListener('ended', handleTrackEnded)
    audioElement.removeEventListener('timeupdate', handleTimeUpdate)
  }
  stopProgressUpdate()
})
</script>

<template>
  <div
    class="fixed right-4 bottom-4 z-50 select-none transition-all duration-300"
    :class="[
      isMinimized ? 'w-16 h-16' : 'w-80'
    ]"
  >
    <!-- 最小化状态 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isMinimized"
        class="w-16 h-16 bg-surface/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border-light/50 flex items-center justify-center cursor-pointer hover:shadow-2xl transition-shadow duration-200"
        @click="toggleMinimize"
      >
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary p-0.5">
            <div class="w-full h-full rounded-full bg-surface flex items-center justify-center overflow-hidden">
              <span class="text-xl">🎵</span>
            </div>
          </div>
          <!-- 播放指示器 -->
          <div
            v-if="isPlaying"
            class="absolute -top-1 -right-1 w-4 h-4 bg-cta rounded-full flex items-center justify-center"
          >
            <div class="flex gap-0.5 items-end h-1.5">
              <div class="w-0.5 bg-white rounded-full animate-pulse"></div>
              <div class="w-0.5 bg-white rounded-full animate-pulse" style="animation-delay: 0.15s"></div>
              <div class="w-0.5 bg-white rounded-full animate-pulse" style="animation-delay: 0.3s"></div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 展开状态 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 translate-y-2"
    >
      <div
        v-if="!isMinimized"
        class="bg-surface/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border-light/50 overflow-hidden"
      >
        <!-- 头部 -->
        <div class="px-4 py-3 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border-light/30 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary p-0.5">
              <div class="w-full h-full rounded-xl bg-surface flex items-center justify-center overflow-hidden">
                <span class="text-lg">🎵</span>
              </div>
            </div>
            <div>
              <h4 class="font-semibold text-text-primary text-sm">BGM 播放器</h4>
              <p class="text-xs text-text-muted truncate max-w-[180px]">
                {{ currentTrack?.title }} - {{ currentTrack?.artist }}
              </p>
            </div>
          </div>
          <button
            @click="toggleMinimize"
            class="w-8 h-8 rounded-lg bg-surface hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
          >
            <svg class="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- 进度条 -->
        <div class="px-4 pt-3 pb-1">
          <div
            class="h-1.5 bg-gray-100 rounded-full cursor-pointer overflow-hidden"
            @click="handleProgressClick"
          >
            <div
              class="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-100"
              :style="{ width: `${progressPercent}%` }"
            ></div>
          </div>
          <div class="flex justify-between mt-1">
            <span class="text-xs text-text-muted">{{ formattedCurrentTime }}</span>
            <span class="text-xs text-text-muted">{{ formattedDuration }}</span>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="px-4 py-2 flex items-center justify-center gap-4">
          <button
            @click="prevTrack"
            class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            <svg class="w-5 h-5 text-text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          <button
            @click="togglePlay"
            class="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary text-white shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg v-if="!isPlaying" class="w-7 h-7 ml-1" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            <svg v-else class="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>

          <button
            @click="nextTrack"
            class="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            <svg class="w-5 h-5 text-text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        <!-- 音量 + 播放列表 -->
        <div class="px-4 py-2 border-t border-border-light/30">
          <div class="flex items-center gap-3">
            <svg class="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              :value="volume"
              @input="handleVolumeChange"
              class="flex-1 h-1 bg-gray-200 rounded-full appearance-none cursor-pointer"
              style="accent-color: #6366F1"
            >
            <button
              @click="togglePlaylist"
              class="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              :class="{ 'bg-primary/10': showPlaylist }"
            >
              <svg class="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 10h12v2H4v-2zm0-4h12v2H4V6zm0 8h8v2H4v-2z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 播放列表 -->
        <Transition
          enter-active-class="transition-all duration-200 ease-out"
          enter-from-class="max-h-0 opacity-0"
          enter-to-class="max-h-96 opacity-100"
          leave-active-class="transition-all duration-150 ease-in"
          leave-from-class="max-h-96 opacity-100"
          leave-to-class="max-h-0 opacity-0"
        >
          <div v-if="showPlaylist" class="border-t border-border-light/30 max-h-64 overflow-y-auto">
            <div
              v-for="(track, index) in tracks"
              :key="track.id"
              @click="selectTrack(index)"
              class="px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
              :class="{ 'bg-primary/5': index === currentTrackIndex }"
            >
              <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                <span class="text-sm">{{ index + 1 }}</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-text-primary truncate">{{ track.title }}</p>
                <p class="text-xs text-text-muted truncate">{{ track.artist }}</p>
              </div>
              <span class="text-xs text-text-muted flex-shrink-0">{{ formatTime(track.duration) }}</span>
              <div
                v-if="index === currentTrackIndex"
                class="w-2 h-2 rounded-full bg-primary flex-shrink-0"
              ></div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>
