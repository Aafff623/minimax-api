<script setup lang="ts">
import { computed } from 'vue'
import Button from '~/components/common/Button.vue'
import Card from '~/components/common/Card.vue'

export interface StyleTag {
  label: string
  value: string
  color?: string
}

const props = defineProps<{
  modelValue: string[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

// Preset style tags
const styleOptions: StyleTag[] = [
  { label: 'Pop', value: 'pop', color: 'bg-pink-100 text-pink-700' },
  { label: 'Rock', value: 'rock', color: 'bg-red-100 text-red-700' },
  { label: 'Jazz', value: 'jazz', color: 'bg-amber-100 text-amber-700' },
  { label: 'Electronic', value: 'electronic', color: 'bg-purple-100 text-purple-700' },
  { label: 'Classical', value: 'classical', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'R&B', value: 'rnb', color: 'bg-blue-100 text-blue-700' },
  { label: 'Hip-Hop', value: 'hiphop', color: 'bg-orange-100 text-orange-700' },
  { label: 'Country', value: 'country', color: 'bg-green-100 text-green-700' },
  { label: 'Folk', value: 'folk', color: 'bg-teal-100 text-teal-700' },
  { label: 'Indie', value: 'indie', color: 'bg-indigo-100 text-indigo-700' },
  { label: 'Metal', value: 'metal', color: 'bg-gray-200 text-gray-800' },
  { label: 'Soul', value: 'soul', color: 'bg-rose-100 text-rose-700' },
  { label: 'Blues', value: 'blues', color: 'bg-sky-100 text-sky-700' },
  { label: 'Reggae', value: 'reggae', color: 'bg-lime-100 text-lime-700' },
  { label: 'Funk', value: 'funk', color: 'bg-fuchsia-100 text-fuchsia-700' },
  { label: 'Ambient', value: 'ambient', color: 'bg-cyan-100 text-cyan-700' },
]

// Mood tags
const moodOptions: StyleTag[] = [
  { label: 'Happy', value: 'happy', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Sad', value: 'sad', color: 'bg-blue-100 text-blue-700' },
  { label: 'Energetic', value: 'energetic', color: 'bg-red-100 text-red-700' },
  { label: 'Calm', value: 'calm', color: 'bg-green-100 text-green-700' },
  { label: 'Romantic', value: 'romantic', color: 'bg-pink-100 text-pink-700' },
  { label: 'Dark', value: 'dark', color: 'bg-gray-200 text-gray-800' },
  { label: 'Uplifting', value: 'uplifting', color: 'bg-orange-100 text-orange-700' },
  { label: 'Nostalgic', value: 'nostalgic', color: 'bg-purple-100 text-purple-700' },
]

// Instrument tags
const instrumentOptions: StyleTag[] = [
  { label: 'Piano', value: 'piano', color: 'bg-gray-100 text-gray-700' },
  { label: 'Guitar', value: 'guitar', color: 'bg-amber-100 text-amber-700' },
  { label: 'Drums', value: 'drums', color: 'bg-red-100 text-red-700' },
  { label: 'Strings', value: 'strings', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Synth', value: 'synth', color: 'bg-purple-100 text-purple-700' },
  { label: 'Bass', value: 'bass', color: 'bg-blue-100 text-blue-700' },
  { label: 'Orchestra', value: 'orchestra', color: 'bg-emerald-100 text-emerald-700' },
]

// Selected tags (from props)
const selectedTags = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

// Toggle tag selection
function toggleTag(value: string) {
  if (props.disabled)
    return

  const current = [...selectedTags.value]
  const index = current.indexOf(value)

  if (index === -1) {
    // Add tag (max 5)
    if (current.length < 5)
      current.push(value)
  }
  else {
    // Remove tag
    current.splice(index, 1)
  }

  selectedTags.value = current
}

// Check if tag is selected
function isSelected(value: string): boolean {
  return selectedTags.value.includes(value)
}

// Clear all
function clearAll() {
  selectedTags.value = []
}
</script>

<template>
  <Card>
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-gray-800">
          Style & Mood
        </h2>
        <Button
          v-if="selectedTags.length > 0"
          size="small"
          variant="secondary"
          :disabled="disabled"
          @click="clearAll"
        >
          Clear All
        </Button>
      </div>
    </template>

    <div class="space-y-5">
      <!-- Music Style -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Music Style
          <span class="text-gray-400 text-xs ml-1">(max 5)</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in styleOptions"
            :key="tag.value"
            type="button"
            :disabled="disabled"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="[
              isSelected(tag.value)
                ? `${tag.color} ring-2 ring-offset-1 ring-gray-300`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              disabled && 'opacity-50 cursor-not-allowed',
            ]"
            @click="toggleTag(tag.value)"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <!-- Mood -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Mood
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in moodOptions"
            :key="tag.value"
            type="button"
            :disabled="disabled"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="[
              isSelected(tag.value)
                ? `${tag.color} ring-2 ring-offset-1 ring-gray-300`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              disabled && 'opacity-50 cursor-not-allowed',
            ]"
            @click="toggleTag(tag.value)"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <!-- Instruments -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Instruments
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in instrumentOptions"
            :key="tag.value"
            type="button"
            :disabled="disabled"
            class="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            :class="[
              isSelected(tag.value)
                ? `${tag.color} ring-2 ring-offset-1 ring-gray-300`
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              disabled && 'opacity-50 cursor-not-allowed',
            ]"
            @click="toggleTag(tag.value)"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <!-- Selected Summary -->
      <div v-if="selectedTags.length > 0" class="pt-3 border-t border-gray-200">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Selected Tags
        </label>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in selectedTags"
            :key="tag"
            class="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </Card>
</template>
