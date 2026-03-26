<script setup lang="ts">
import { computed } from 'vue'

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
  { label: '流行', value: 'pop', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { label: '摇滚', value: 'rock', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: '爵士', value: 'jazz', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: '电子', value: 'electronic', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: '古典', value: 'classical', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: 'R&B', value: 'rnb', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: '嘻哈', value: 'hiphop', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: '乡村', value: 'country', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: '民谣', value: 'folk', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { label: '独立', value: 'indie', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { label: '金属', value: 'metal', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { label: '灵魂', value: 'soul', color: 'bg-rose-100 text-rose-700 border-rose-200' },
  { label: '蓝调', value: 'blues', color: 'bg-sky-100 text-sky-700 border-sky-200' },
  { label: '雷鬼', value: 'reggae', color: 'bg-lime-100 text-lime-700 border-lime-200' },
  { label: '放克', value: 'funk', color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' },
  { label: '氛围', value: 'ambient', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
]

// Mood tags
const moodOptions: StyleTag[] = [
  { label: '快乐', value: 'happy', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: '悲伤', value: 'sad', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: '活力', value: 'energetic', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: '平静', value: 'calm', color: 'bg-green-100 text-green-700 border-green-200' },
  { label: '浪漫', value: 'romantic', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { label: '黑暗', value: 'dark', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { label: '振奋', value: 'uplifting', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { label: '怀旧', value: 'nostalgic', color: 'bg-purple-100 text-purple-700 border-purple-200' },
]

// Instrument tags
const instrumentOptions: StyleTag[] = [
  { label: '钢琴', value: 'piano', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  { label: '吉他', value: 'guitar', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { label: '鼓', value: 'drums', color: 'bg-red-100 text-red-700 border-red-200' },
  { label: '弦乐', value: 'strings', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: '合成器', value: 'synth', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: '贝斯', value: 'bass', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: '管弦乐', value: 'orchestra', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
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
  <div class="card border border-border-light/50 overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between p-5 border-b border-border-light/50 bg-gradient-to-r from-primary/5 to-transparent">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <div>
          <h3 class="text-base font-bold text-text-primary">风格与心情</h3>
          <p class="text-xs text-text-secondary">选择标签塑造音乐风格</p>
        </div>
      </div>

      <button
        v-if="selectedTags.length > 0"
        class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border-2 border-border-light bg-white hover:border-red-500/50 hover:bg-red-50 text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
        :disabled="disabled"
        @click="clearAll"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
        清空
      </button>
    </div>

    <div class="p-5 space-y-6">
      <!-- Music Style -->
      <div class="space-y-3">
        <label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-100 to-pink-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-pink-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          音乐风格
          <span class="text-xs text-text-muted font-normal">(最多5个)</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in styleOptions"
            :key="tag.value"
            type="button"
            :disabled="disabled"
            class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2"
            :class="[
              isSelected(tag.value)
                ? `${tag.color} ring-2 ring-offset-2 ring-primary shadow-sm transform scale-[1.02]`
                : 'bg-white text-text-secondary border-border-light hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm',
              disabled && 'opacity-50 cursor-not-allowed',
            ]"
            @click="toggleTag(tag.value)"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <!-- Mood -->
      <div class="space-y-3">
        <label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-100 to-orange-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          心情
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in moodOptions"
            :key="tag.value"
            type="button"
            :disabled="disabled"
            class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2"
            :class="[
              isSelected(tag.value)
                ? `${tag.color} ring-2 ring-offset-2 ring-primary shadow-sm transform scale-[1.02]`
                : 'bg-white text-text-secondary border-border-light hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm',
              disabled && 'opacity-50 cursor-not-allowed',
            ]"
            @click="toggleTag(tag.value)"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <!-- Instruments -->
      <div class="space-y-3">
        <label class="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-50 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          乐器
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="tag in instrumentOptions"
            :key="tag.value"
            type="button"
            :disabled="disabled"
            class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border-2"
            :class="[
              isSelected(tag.value)
                ? `${tag.color} ring-2 ring-offset-2 ring-primary shadow-sm transform scale-[1.02]`
                : 'bg-white text-text-secondary border-border-light hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm',
              disabled && 'opacity-50 cursor-not-allowed',
            ]"
            @click="toggleTag(tag.value)"
          >
            {{ tag.label }}
          </button>
        </div>
      </div>

      <!-- Selected Summary -->
      <div v-if="selectedTags.length > 0" class="pt-5 border-t border-border-light/50">
        <label class="flex items-center gap-2 text-sm font-semibold text-text-primary mb-3">
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          已选择标签
          <span class="text-xs text-text-muted font-normal">({{ selectedTags.length }}/5)</span>
        </label>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in selectedTags"
            :key="tag"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary rounded-lg text-xs font-semibold border border-primary/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth hover animations */
button {
  transform: translateY(0);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}
</style>
