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
  <div class="lyrics-timeline">
    <!-- Header -->
    <div class="timeline-header">
      <div class="timeline-info">
        <span class="time-display">{{ formatTime(currentTime) }}</span>
        <span class="separator">/</span>
        <span class="time-display">{{ formatTime(duration) }}</span>
      </div>
      <div class="timeline-actions">
        <button
          class="action-btn"
          title="Auto Align"
          @click="autoAlign"
        >
          <span class="i-carbon-align-horizontal-center" />
          Auto Align
        </button>
        <button
          class="action-btn"
          title="Add Line"
          @click="addLineAtTime(currentTime)"
        >
          <span class="i-carbon-add" />
          Add Line
        </button>
      </div>
    </div>

    <!-- Timeline Body -->
    <div
      class="timeline-body"
      :style="{ width: `${Math.max(timelineWidth, 800)}px` }"
      @click="onTimelineClick"
    >
      <!-- Time markers -->
      <div class="time-markers">
        <template v-for="i in Math.ceil(duration / 5)" :key="i">
          <div
            class="time-marker"
            :style="{ left: `${i * 5 * SCALE}px` }"
          >
            <span class="marker-line" />
            <span class="marker-label">{{ formatTime(i * 5) }}</span>
          </div>
        </template>
      </div>

      <!-- Playhead -->
      <div
        class="playhead"
        :style="{ left: `${currentTime * SCALE}px` }"
        @mousedown="onPlayheadDragStart"
        @touchstart="onPlayheadDragStart"
      >
        <div class="playhead-handle" />
      </div>

      <!-- Lyric lines -->
      <div
        v-for="line in lyrics"
        :key="line.id"
        class="lyric-line"
        :class="{
          active: activeLineId === line.id,
          dragging: draggedLineId === line.id,
        }"
        :style="{
          left: `${getLinePosition(line.startTime)}px`,
          width: `${(line.endTime - line.startTime) * SCALE}px`,
        }"
        @mousedown="onLineDragStart($event, line)"
        @touchstart="onLineDragStart($event, line)"
      >
        <div class="line-content">
          <input
            type="text"
            class="lyric-input"
            :value="line.text"
            placeholder="Lyrics..."
            @input="updateLineText(line.id, ($event.target as HTMLInputElement).value)"
            @click.stop
          >
          <button
            class="delete-btn"
            title="Delete"
            @click.stop="deleteLine(line.id)"
          >
            <span class="i-carbon-close" />
          </button>
        </div>
        <div class="line-time">
          {{ formatTime(line.startTime) }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lyrics-timeline {
  @apply flex flex-col w-full h-full bg-gray-900 rounded-lg overflow-hidden;
}

.timeline-header {
  @apply flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700;
}

.timeline-info {
  @apply flex items-center gap-2 font-mono text-sm;
}

.time-display {
  @apply text-gray-300;
}

.separator {
  @apply text-gray-600;
}

.timeline-actions {
  @apply flex items-center gap-2;
}

.action-btn {
  @apply flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors;
}

.timeline-body {
  @apply relative flex-1 overflow-x-auto overflow-y-hidden py-4 px-2;
  min-height: 120px;
}

.time-markers {
  @apply absolute top-0 left-0 right-0 h-6 pointer-events-none;
}

.time-marker {
  @apply absolute flex flex-col items-center;
}

.marker-line {
  @apply w-px h-2 bg-gray-600;
}

.marker-label {
  @apply text-xs text-gray-500 mt-0.5 font-mono;
}

.playhead {
  @apply absolute top-0 bottom-0 w-0.5 bg-red-500 cursor-ew-resize z-20;
}

.playhead-handle {
  @apply absolute -top-1 -left-1.5 w-3 h-3 bg-red-500 rounded-full shadow-lg;
}

.lyric-line {
  @apply absolute top-8 h-16 bg-gray-800 border border-gray-700 rounded-lg cursor-ns-resize transition-all duration-75;
}

.lyric-line.active {
  @apply bg-blue-900 border-blue-500;
}

.lyric-line.dragging {
  @apply opacity-80 shadow-lg z-10;
}

.line-content {
  @apply flex items-center gap-2 p-2 h-full;
}

.lyric-input {
  @apply flex-1 bg-transparent text-gray-200 text-sm outline-none border-none placeholder-gray-500;
}

.line-time {
  @apply absolute bottom-0.5 right-2 text-xs text-gray-500 font-mono;
}

.delete-btn {
  @apply p-1 text-gray-500 hover:text-red-400 transition-colors;
}
</style>
