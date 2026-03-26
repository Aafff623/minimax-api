<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  filter: string
  searchQuery: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:filter': [value: string]
  'update:searchQuery': [value: string]
  'search': [query: string]
  'filterChange': [type: string]
}>()

const localSearch = ref(props.searchQuery)
const localFilter = ref(props.filter)

const typeOptions = [
  { label: '全部', value: '' },
  { label: '语音', value: 'voice' },
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '音乐', value: 'music' },
  { label: '对话', value: 'chat' },
]

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleSearchInput() {
  if (debounceTimer)
    clearTimeout(debounceTimer)

  debounceTimer = setTimeout(() => {
    emit('update:searchQuery', localSearch.value)
    emit('search', localSearch.value)
  }, 300)
}

function handleFilterChange(type: string) {
  localFilter.value = type
  emit('update:filter', type)
  emit('filterChange', type)
}

watch(() => props.searchQuery, (val) => {
  localSearch.value = val
})

watch(() => props.filter, (val) => {
  localFilter.value = val
})
</script>

<template>
  <div class="card mb-5">
    <div class="flex items-center gap-3 mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <span class="text-sm font-medium text-text-primary">筛选</span>
    </div>

    <!-- Search Input -->
    <div class="mb-4">
      <div class="relative">
        <input
          v-model="localSearch"
          type="text"
          placeholder="搜索历史记录..."
          class="input-base pl-10 pr-4 py-2.5 rounded-xl"
          @input="handleSearchInput"
          @keyup.enter="emit('search', localSearch)"
        >
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <!-- Type Filter -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="option in typeOptions"
        :key="option.value"
        type="button"
        class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        :class="localFilter === option.value
          ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
          : 'bg-gray-100 text-text-secondary hover:bg-gray-200'"
        @click="handleFilterChange(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
