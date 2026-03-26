<script setup lang="ts">
import type { LyricLine } from '~/stores/music'
import { computed, ref } from 'vue'

interface Props {
  lyrics: LyricLine[]
  currentTime: number // Current playback time in seconds
  duration: number // Total duration in seconds
  isPlaying: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:lyrics': [lines: LyricLine[]]
  'seek': [time: number]
  'autoAlign': []
}>()

// Drag state
const draggedLineId = ref<string | null>(null)
const dragStartY = ref(0)
const dragStartTime = ref(0)

// Timeline scale: pixels per second
const SCALE = 50 // 50px per second

const timelineWidth = computed(() => props.duration * SCALE)

// Current active line based on playback time
const activeLineId = computed(() => {
  const line = props.lyrics.find(l =>
    props.currentTime >= l.startTime && props.currentTime < l.endTime,
  )
  return line?.id || null
})

// Format time as mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Get line position on timeline
function getLinePosition(time: number): number {
  return time * SCALE
}

// Handle line drag start
function onLineDragStart(event: MouseEvent | TouchEvent, line: LyricLine) {
  event.preventDefault()
  draggedLineId.value = line.id
  dragStartTime.value = line.startTime

  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  dragStartY.value = clientY

  document.addEventListener('mousemove', onLineDragMove)
  document.addEventListener('mouseup', onLineDragEnd)
  document.addEventListener('touchmove', onLineDragMove)
  document.addEventListener('touchend', onLineDragEnd)
}

// Handle line drag move
function onLineDragMove(event: MouseEvent | TouchEvent) {
  if (!draggedLineId.value)
    return

  const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
  const deltaY = clientY - dragStartY.value

  // Convert pixel delta to time delta (40px = 1 second)
  const deltaTime = deltaY / 40

  const newStartTime = Math.max(0, dragStartTime.value + deltaTime)
  const line = props.lyrics.find(l => l.id === draggedLineId.value)

  if (line) {
    const updatedLine = {
      ...line,
      startTime: newStartTime,
      endTime: Math.max(newStartTime + 0.5, line.endTime),
    }

    const updatedLyrics = props.lyrics.map(l =>
      l.id === draggedLineId.value ? updatedLine : l,
    )

    emit('update:lyrics', updatedLyrics)
  }
}

// Handle line drag end
function onLineDragEnd() {
  draggedLineId.value = null
  document.removeEventListener('mousemove', onLineDragMove)
  document.removeEventListener('mouseup', onLineDragEnd)
  document.removeEventListener('touchmove', onLineDragMove)
  document.removeEventListener('touchend', onLineDragEnd)
}

// Handle timeline click to seek
function onTimelineClick(event: MouseEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const x = event.clientX - rect.left
  const time = x / SCALE
  emit('seek', Math.max(0, Math.min(time, props.duration)))
}

// Handle playhead drag
const isDraggingPlayhead = ref(false)

function onPlayheadDragStart(event: MouseEvent | TouchEvent) {
  event.preventDefault()
  isDraggingPlayhead.value = true

  document.addEventListener('mousemove', onPlayheadDragMove)
  document.addEventListener('mouseup', onPlayheadDragEnd)
  document.addEventListener('touchmove', onPlayheadDragMove)
  document.addEventListener('touchend', onPlayheadDragEnd)
}

function onPlayheadDragMove(event: MouseEvent | TouchEvent) {
  if (!isDraggingPlayhead.value)
    return

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
  const x = clientX - rect.left
  const time = x / SCALE
  emit('seek', Math.max(0, Math.min(time, props.duration)))
}

function onPlayheadDragEnd() {
  isDraggingPlayhead.value = false
  document.removeEventListener('mousemove', onPlayheadDragMove)
  document.removeEventListener('mouseup', onPlayheadDragEnd)
  document.removeEventListener('touchmove', onPlayheadDragMove)
  document.removeEventListener('touchend', onPlayheadDragEnd)
}

// Add new lyric line at specific time
function addLineAtTime(time: number) {
  const newLine: LyricLine = {
    id: `lyric-${Date.now()}`,
    text: 'New lyric',
    startTime: time,
    endTime: time + 3,
  }
  const updatedLyrics = [...props.lyrics, newLine].sort((a, b) => a.startTime - b.startTime)
  emit('update:lyrics', updatedLyrics)
}

// Delete lyric line
function deleteLine(id: string) {
  const updatedLyrics = props.lyrics.filter(l => l.id !== id)
  emit('update:lyrics', updatedLyrics)
}

// Update lyric text
function updateLineText(id: string, text: string) {
  const updatedLyrics = props.lyrics.map(l =>
    l.id === id ? { ...l, text } : l,
  )
  emit('update:lyrics', updatedLyrics)
}

// Auto-align: automatically adjust timing based on even distribution
function autoAlign() {
  if (props.lyrics.length === 0)
    return

  const totalDuration = props.duration
  const numLines = props.lyrics.length
  const avgDuration = totalDuration / numLines

  const updatedLyrics = props.lyrics.map((line, index) => ({
    ...line,
    startTime: index * avgDuration,
    endTime: (index + 1) * avgDuration,
  }))

  emit('update:lyrics', updatedLyrics)
  emit('autoAlign')
}

// Expose for parent controls
defineExpose({
  addLineAtTime,
  deleteLine,
  autoAlign,
})
</script>

<template>
  <div class="lyrics-timeline rounded-2xl overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-white/10">
      <div class="flex items-center gap-3">
        <span class="text-lg font-bold text-white font-mono">{{ formatTime(currentTime) }}</span>
        <span class="text-gray-500">/</span>
        <span class="text-sm text-gray-400 font-mono">{{ formatTime(duration) }}</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-200"
          title="自动对齐"
          @click="autoAlign"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="21" y1="10" x2="3" y2="10" />
            <line x1="21" y1="6" x2="3" y2="6" />
            <line x1="21" y1="14" x2="3" y2="14" />
            <line x1="21" y1="18" x2="3" y2="18" />
          </svg>
          自动对齐
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary rounded-xl hover:bg-primary/90 transition-all duration-200 shadow-sm"
          title="添加行"
          @click="addLineAtTime(currentTime)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          添加行
        </button>
      </div>
    </div>

    <!-- Timeline Body -->
    <div
      class="timeline-body relative overflow-x-auto py-5 px-3"
      :style="{ width: `${Math.max(timelineWidth, 800)}px` }"
      @click="onTimelineClick"
    >
      <!-- Time markers -->
      <div class="absolute top-0 left-0 right-0 h-6 pointer-events-none">
        <template v-for="i in Math.ceil(duration / 5)" :key="i">
          <div
            class="absolute flex flex-col items-center"
            :style="{ left: `${i * 5 * SCALE}px` }"
          >
            <span class="w-px h-2 bg-gray-600" />
            <span class="text-xs text-gray-500 mt-1 font-mono">{{ formatTime(i * 5) }}</span>
          </div>
        </template>
      </div>

      <!-- Playhead -->
      <div
        class="playhead absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-400 to-red-600 cursor-ew-resize z-20"
        :style="{ left: `${currentTime * SCALE}px` }"
        @mousedown="onPlayheadDragStart"
        @touchstart="onPlayheadDragStart"
      >
        <div class="absolute -top-1 -left-1.5 w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full shadow-lg" />
      </div>

      <!-- Lyric lines -->
      <div
        v-for="line in lyrics"
        :key="line.id"
        class="lyric-line absolute top-10 h-16 rounded-xl cursor-ns-resize transition-all duration-75"
        :class="{
          'active-line': activeLineId === line.id,
          'dragging-line': draggedLineId === line.id,
        }"
        :style="{
          left: `${getLinePosition(line.startTime)}px`,
          width: `${(line.endTime - line.startTime) * SCALE}px`,
        }"
        @mousedown="onLineDragStart($event, line)"
        @touchstart="onLineDragStart($event, line)"
      >
        <div class="flex items-center gap-2 p-3 h-full">
          <input
            type="text"
            class="flex-1 bg-transparent text-gray-200 text-sm outline-none border-none placeholder-gray-500"
            :value="line.text"
            placeholder="歌词..."
            @input="updateLineText(line.id, ($event.target as HTMLInputElement).value)"
            @click.stop
          >
          <button
            class="p-1.5 text-gray-500 hover:text-red-400 transition-colors duration-200 rounded-lg hover:bg-white/10"
            title="删除"
            @click.stop="deleteLine(line.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
        <div class="absolute bottom-1 right-3 text-xs text-gray-500 font-mono">
          {{ formatTime(line.startTime) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lyrics-timeline {
  @apply flex flex-col w-full h-full bg-gray-900;
}

.timeline-body {
  min-height: 120px;
}

.playhead {
  box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
}

.lyric-line {
  @apply bg-gray-800 border border-gray-700;
}

.lyric-line.active-line {
  @apply bg-primary/20 border-primary/50;
  box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);
}

.lyric-line.dragging-line {
  @apply opacity-80 shadow-xl z-10;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}
</style>
