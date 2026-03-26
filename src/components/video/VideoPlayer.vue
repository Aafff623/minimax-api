<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
  videoUrl: string
  coverUrl?: string
  autoPlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  coverUrl: '',
  autoPlay: false,
})

const emit = defineEmits<{
  close: []
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const isMuted = ref(false)
const isFullscreen = ref(false)
const showControls = ref(true)

let controlsTimer: ReturnType<typeof setTimeout> | null = null

const progress = computed(() => {
  if (duration.value === 0)
    return 0
  return (currentTime.value / duration.value) * 100
})

const formattedCurrentTime = computed(() => formatTime(currentTime.value))
const formattedDuration = computed(() => formatTime(duration.value))

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function togglePlay() {
  if (!videoRef.value)
    return

  if (isPlaying.value) {
    videoRef.value.pause()
  }
  else {
    videoRef.value.play()
  }
}

function handleTimeUpdate() {
  if (videoRef.value) {
    currentTime.value = videoRef.value.currentTime
  }
}

function handleLoadedMetadata() {
  if (videoRef.value) {
    duration.value = videoRef.value.duration
  }
}

function handlePlay() {
  isPlaying.value = true
}

function handlePause() {
  isPlaying.value = false
}

function handleEnded() {
  isPlaying.value = false
  currentTime.value = 0
  if (videoRef.value) {
    videoRef.value.currentTime = 0
  }
}

function seek(event: MouseEvent) {
  if (!videoRef.value)
    return

  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  videoRef.value.currentTime = percent * duration.value
}

function toggleMute() {
  if (!videoRef.value)
    return

  isMuted.value = !isMuted.value
  videoRef.value.muted = isMuted.value
}

function setVolume(event: Event) {
  if (!videoRef.value)
    return

  const target = event.target as HTMLInputElement
  volume.value = Number.parseFloat(target.value)
  videoRef.value.volume = volume.value
  isMuted.value = volume.value === 0
}

function toggleFullscreen() {
  const container = videoRef.value?.parentElement

  if (!container)
    return

  if (!document.fullscreenElement) {
    container.requestFullscreen()
    isFullscreen.value = true
  }
  else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case ' ':
    case 'k':
      event.preventDefault()
      togglePlay()
      break
    case 'm':
      toggleMute()
      break
    case 'f':
      toggleFullscreen()
      break
    case 'ArrowLeft':
      if (videoRef.value) {
        videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 5)
      }
      break
    case 'ArrowRight':
      if (videoRef.value) {
        videoRef.value.currentTime = Math.min(duration.value, videoRef.value.currentTime + 5)
      }
      break
    case 'Escape':
      if (isFullscreen.value) {
        toggleFullscreen()
      }
      else {
        emit('close')
      }
      break
  }
}

function showControlsTemporarily() {
  showControls.value = true
  if (controlsTimer) {
    clearTimeout(controlsTimer)
  }
  controlsTimer = setTimeout(() => {
    if (isPlaying.value) {
      showControls.value = false
    }
  }, 3000)
}

async function downloadVideo() {
  if (!props.videoUrl)
    return

  try {
    const response = await fetch(props.videoUrl)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `video_${Date.now()}.mp4`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }
  catch (error) {
    console.error('Download failed:', error)
  }
}

// Auto-play when videoUrl changes
watch(() => props.videoUrl, (newUrl) => {
  if (newUrl && props.autoPlay && videoRef.value) {
    videoRef.value.play().catch(() => {
      // Autoplay might be blocked by browser
    })
  }
})
</script>

<template>
  <div
    class="video-player"
    tabindex="0"
    @keydown="handleKeydown"
    @mousemove="showControlsTemporarily"
    @mouseleave="isPlaying && (showControls = false)"
  >
    <!-- Video Element -->
    <video
      ref="videoRef"
      :src="videoUrl"
      :poster="coverUrl"
      class="video-element"
      @click="togglePlay"
      @timeupdate="handleTimeUpdate"
      @loadedmetadata="handleLoadedMetadata"
      @play="handlePlay"
      @pause="handlePause"
      @ended="handleEnded"
    />

    <!-- Play/Pause Overlay -->
    <div
      v-if="!isPlaying"
      class="play-overlay"
      @click="togglePlay"
    >
      <button class="play-button">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </button>
    </div>

    <!-- Controls -->
    <div
      class="controls"
      :class="{ visible: showControls || !isPlaying }"
    >
      <!-- Progress Bar -->
      <div
        class="progress-bar"
        @click="seek"
      >
        <div
          class="progress-filled"
          :style="{ width: `${progress}%` }"
        />
      </div>

      <!-- Control Buttons -->
      <div class="controls-row">
        <div class="controls-left">
          <!-- Play/Pause -->
          <button
            class="control-btn"
            :title="isPlaying ? 'Pause (k)' : 'Play (k)'"
            @click="togglePlay"
          >
            <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>

          <!-- Time -->
          <span class="time-display">
            {{ formattedCurrentTime }} / {{ formattedDuration }}
          </span>
        </div>

        <div class="controls-right">
          <!-- Volume -->
          <div class="volume-control">
            <button
              class="control-btn"
              :title="isMuted ? 'Unmute (m)' : 'Mute (m)'"
              @click="toggleMute"
            >
              <svg v-if="isMuted || volume === 0" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
              <svg v-else-if="volume < 0.5" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            </button>
            <input
              type="range"
              class="volume-slider"
              min="0"
              max="1"
              step="0.1"
              :value="volume"
              @input="setVolume"
            >
          </div>

          <!-- Download -->
          <button
            class="control-btn"
            title="Download"
            @click="downloadVideo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>

          <!-- Fullscreen -->
          <button
            class="control-btn"
            title="Fullscreen (f)"
            @click="toggleFullscreen"
          >
            <svg v-if="isFullscreen" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-player {
  @apply relative w-full h-full bg-black rounded-xl overflow-hidden;
  @apply outline-none;
}

.video-element {
  @apply w-full h-full object-contain;
}

.play-overlay {
  @apply absolute inset-0 flex items-center justify-center;
  @apply bg-black/40 cursor-pointer transition-opacity duration-300;
}

.play-button {
  @apply w-20 h-20 rounded-full bg-primary/90 backdrop-blur-sm;
  @apply flex items-center justify-center text-white;
  @apply hover:bg-primary transition-all duration-200 hover:scale-110;
  @apply shadow-lg hover:shadow-xl;
}

.controls {
  @apply absolute bottom-0 left-0 right-0;
  @apply bg-gradient-to-t from-black/90 via-black/60 to-transparent;
  @apply p-4 transition-all duration-300;
  @apply opacity-0 pointer-events-none;
}

.controls.visible {
  @apply opacity-100 pointer-events-auto;
}

.progress-bar {
  @apply h-1.5 bg-white/20 rounded-full cursor-pointer mb-4;
  @apply hover:h-2 transition-all duration-200;
}

.progress-filled {
  @apply h-full bg-gradient-to-r from-primary to-secondary rounded-full;
}

.controls-row {
  @apply flex items-center justify-between;
}

.controls-left,
.controls-right {
  @apply flex items-center gap-3;
}

.control-btn {
  @apply p-2.5 rounded-xl text-white/80;
  @apply hover:bg-white/20 hover:text-white transition-all duration-200;
  @apply hover:scale-110;
}

.time-display {
  @apply text-sm text-white/80 ml-2 font-mono;
}

.volume-control {
  @apply flex items-center gap-2;
}

.volume-slider {
  @apply w-20 h-1.5 appearance-none bg-white/20 rounded-full;
  @apply cursor-pointer;
}

.volume-slider::-webkit-slider-thumb {
  @apply w-4 h-4 bg-white rounded-full appearance-none cursor-pointer;
  @apply shadow-md;
}

.download-btn {
  @apply p-2 rounded-lg text-white/80;
  @apply hover:bg-white/20 hover:text-white transition-colors;
}
</style>
