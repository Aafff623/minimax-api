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
  { label: '语音', value: 'voice', color: 'purple' },
  { label: '图片', value: 'image', color: 'emerald' },
  { label: '视频', value: 'video', color: 'red' },
  { label: '音乐', value: 'music', color: 'amber' },
  { label: '对话', value: 'chat', color: 'blue' },
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
  <div class="bg-white rounded-2xl border border-border-light p-5 shadow-sm">
    <!-- Search Header -->
    <div class="flex items-center gap-2 mb-4">
      <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <span class="text-sm font-semibold text-text-primary">筛选搜索</span>
    </div>

    <!-- Search Input -->
    <div class="mb-5">
      <div class="relative">
        <input
          v-model="localSearch"
          type="text"
          placeholder="搜索历史记录..."
          class="w-full pl-11 pr-4 py-3.5 rounded-xl border-2 border-border-light bg-gray-50/50 text-text-primary placeholder-text-muted transition-all duration-200 focus:outline-none focus:border-primary focus:bg-white focus:shadow-lg focus:shadow-primary/5"
          @input="handleSearchInput"
          @keyup.enter="emit('search', localSearch)"
        >
        <svg
          class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted"
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
    <div>
      <span class="text-xs font-medium text-text-muted mb-3 block">内容类型</span>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="option in typeOptions"
          :key="option.value"
          type="button"
          class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
          :class="localFilter === option.value
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/25'
            : 'bg-gray-50 text-text-secondary hover:bg-gray-100 hover:text-text-primary'"
          @click="handleFilterChange(option.value)"
        >
          <span
            v-if="option.value !== ''"
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-purple-500': option.color === 'purple',
              'bg-emerald-500': option.color === 'emerald',
              'bg-red-500': option.color === 'red',
              'bg-amber-500': option.color === 'amber',
              'bg-blue-500': option.color === 'blue',
            }"
          />
          {{ option.label }}
        </button>
      </div>
    </div>
  </div>
</template>
