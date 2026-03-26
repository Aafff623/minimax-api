<script setup lang="ts">
import { ref, watch } from 'vue'
import Button from '~/components/common/Button.vue'
import Card from '~/components/common/Card.vue'
import Input from '~/components/common/Input.vue'

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
  <Card>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">
          Lyrics Editor
        </h2>
        <div class="flex gap-2">
          <Button
            size="small"
            :disabled="disabled || !lyrics.trim()"
            @click="generateTimestamp"
          >
            Auto Timestamp
          </Button>
          <Button
            size="small"
            variant="secondary"
            :disabled="disabled || !lyrics.trim()"
            @click="clearLyrics"
          >
            Clear
          </Button>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <!-- Lyrics Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Lyrics Content
        </label>
        <Input
          v-model="lyrics"
          type="textarea"
          :rows="12"
          :disabled="disabled"
          placeholder="Enter lyrics here...&#10;One line per sentence.&#10;Click 'Auto Timestamp' to generate timestamps."
          class="font-mono text-sm"
        />
      </div>

      <!-- Format Guide -->
      <div class="text-xs text-gray-500 space-y-1">
        <p class="font-medium text-gray-600">
          Format Guide:
        </p>
        <ul class="list-disc list-inside space-y-0.5">
          <li>One line per lyric sentence</li>
          <li>Use [mm:ss] format for manual timestamps, e.g., [00:15]</li>
          <li>Leave empty for AI-generated lyrics</li>
        </ul>
      </div>

      <!-- Preview -->
      <div v-if="lyrics.trim()" class="mt-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Preview
        </label>
        <div class="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto">
          <div
            v-for="(line, index) in lyrics.split('\n').filter(l => l.trim())"
            :key="index"
            class="text-sm py-1"
            :class="hasTimestamp(line) ? 'font-mono text-gray-700' : 'text-gray-500'"
          >
            {{ line }}
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>
