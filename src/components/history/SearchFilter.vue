<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  filter: string
  searchQuery: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:filter', value: string): void
  (e: 'update:searchQuery', value: string): void
  (e: 'search', query: string): void
  (e: 'filterChange', type: string): void
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
  <div class="search-filter p-4 bg-white rounded-lg shadow-sm border border-gray-200">
    <!-- Search Input -->
    <div class="mb-4">
      <div class="relative">
        <input
          v-model="localSearch"
          type="text"
          placeholder="搜索历史记录..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg transition-colors duration-200
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          @input="handleSearchInput"
          @keyup.enter="emit('search', localSearch)"
        >
        <svg
          class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
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
        class="px-3 py-1.5 rounded-full text-sm font-medium transition-colors duration-200" :class="[
          localFilter === option.value
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
        ]"
        @click="handleFilterChange(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
