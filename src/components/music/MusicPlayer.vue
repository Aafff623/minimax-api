<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import Button from '~/components/common/Button.vue'
import Card from '~/components/common/Card.vue'

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
  <Card>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">
          {{ title || 'Music Player' }}
        </h2>
        <span v-if="src" class="text-sm text-gray-500">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </span>
      </div>
    </template>

    <!-- Hidden Audio Element -->
    <audio
      v-if="src"
      ref="audioRef"
      :src="src"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    />

    <div class="space-y-4">
      <!-- Lyrics Display -->
      <div
        v-if="parsedLyrics.length > 0"
        class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto"
      >
        <div class="space-y-2">
          <div
            v-for="(lyric, index) in parsedLyrics"
            :key="index"
            class="text-sm py-1 transition-all duration-300"
            :class="[
              index === currentLyricIndex
                ? 'text-primary font-semibold scale-105 transform'
                : index < currentLyricIndex
                  ? 'text-gray-400'
                  : 'text-gray-600',
            ]"
          >
            {{ lyric.text || '(instrumental)' }}
          </div>
        </div>
      </div>

      <!-- No Lyrics Message -->
      <div
        v-else-if="lyrics"
        class="bg-gray-50 rounded-lg p-4 text-center text-gray-500 text-sm"
      >
        No timestamped lyrics available
      </div>

      <!-- Controls -->
      <div v-if="src" class="space-y-4">
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
          <Button
            variant="ghost"
            size="small"
            :disabled="!src"
            @click="skip(-10)"
          >
            <span class="text-lg">-10s</span>
          </Button>

          <!-- Play/Pause -->
          <Button
            type="primary"
            size="medium"
            :disabled="!src"
            @click="togglePlay"
          >
            {{ isPlaying ? 'Pause' : 'Play' }}
          </Button>

          <!-- Skip Forward -->
          <Button
            variant="ghost"
            size="small"
            :disabled="!src"
            @click="skip(10)"
          >
            <span class="text-lg">+10s</span>
          </Button>
        </div>

        <!-- Volume & Speed -->
        <div class="flex items-center justify-between gap-4">
          <!-- Volume -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">
              {{ volume === 0 ? 'Muted' : `${Math.round(volume * 100)}%` }}
            </span>
            <input
              type="range"
              :value="volume"
              min="0"
              max="1"
              step="0.1"
              class="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
              @input="handleVolumeChange"
            >
          </div>

          <!-- Playback Speed -->
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Speed:</span>
            <div class="flex gap-1">
              <Button
                v-for="rate in [0.5, 1, 1.5, 2]"
                :key="rate"
                size="small"
                :variant="playbackRate === rate ? 'primary' : 'secondary'"
                :disabled="!src"
                @click="setPlaybackRate(rate)"
              >
                {{ rate }}x
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- No Source -->
      <div
        v-else
        class="text-center py-8 text-gray-500"
      >
        <div class="text-4xl mb-2">
          🎵
        </div>
        <p>No music generated yet</p>
      </div>
    </div>
  </Card>
</template>
