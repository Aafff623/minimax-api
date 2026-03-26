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
        <span class="i-icon-park-outline-play text-6xl" />
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
            <span
              v-if="isPlaying"
              class="i-icon-park-outline-pause text-xl"
            />
            <span
              v-else
              class="i-icon-park-outline-play text-xl"
            />
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
              <span
                v-if="isMuted || volume === 0"
                class="i-icon-park-outline-volume-mute text-xl"
              />
              <span
                v-else-if="volume < 0.5"
                class="i-icon-park-outline-volume-low text-xl"
              />
              <span
                v-else
                class="i-icon-park-outline-volume-notice text-xl"
              />
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
            <span class="i-icon-park-outline-download text-xl" />
          </button>

          <!-- Fullscreen -->
          <button
            class="control-btn"
            title="Fullscreen (f)"
            @click="toggleFullscreen"
          >
            <span
              v-if="isFullscreen"
              class="i-icon-park-outline-off-screen text-xl"
            />
            <span
              v-else
              class="i-icon-park-outline-full-screen text-xl"
            />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.video-player {
  @apply relative w-full h-full bg-black rounded-lg overflow-hidden;
  @apply outline-none;
}

.video-element {
  @apply w-full h-full object-contain;
}

.play-overlay {
  @apply absolute inset-0 flex items-center justify-center;
  @apply bg-black/30 cursor-pointer;
}

.play-button {
  @apply w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm;
  @apply flex items-center justify-center;
  @apply text-white hover:bg-white/30 transition-colors;
}

.controls {
  @apply absolute bottom-0 left-0 right-0;
  @apply bg-gradient-to-t from-black/80 to-transparent;
  @apply p-4 transition-opacity duration-300;
  @apply opacity-0 pointer-events-none;
}

.controls.visible {
  @apply opacity-100 pointer-events-auto;
}

.progress-bar {
  @apply h-1 bg-white/30 rounded-full cursor-pointer mb-3;
  @apply hover:h-1.5 transition-all;
}

.progress-filled {
  @apply h-full bg-primary rounded-full;
}

.controls-row {
  @apply flex items-center justify-between;
}

.controls-left,
.controls-right {
  @apply flex items-center gap-2;
}

.control-btn {
  @apply p-2 rounded-lg text-white/80;
  @apply hover:bg-white/20 hover:text-white transition-colors;
}

.time-display {
  @apply text-sm text-white/80 ml-2 font-mono;
}

.volume-control {
  @apply flex items-center gap-1;
}

.volume-slider {
  @apply w-20 h-1 appearance-none bg-white/30 rounded-full;
  @apply cursor-pointer;
}

.volume-slider::-webkit-slider-thumb {
  @apply w-3 h-3 bg-white rounded-full appearance-none cursor-pointer;
}

.download-btn {
  @apply p-2 rounded-lg text-white/80;
  @apply hover:bg-white/20 hover:text-white transition-colors;
}
</style>
