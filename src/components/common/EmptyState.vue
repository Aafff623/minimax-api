<script setup lang="ts">
/**
 * EmptyState - 空状态组件
 * 显示模块的空状态插图和提示信息
 */

import { computed } from 'vue'
import type { ModuleName } from '~/composables/useAssets'

interface Props {
  module: ModuleName
  title?: string
  description?: string
  action?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'No Data',
  description: 'There is no content here yet',
  action: '',
})

const emit = defineEmits<{
  action: []
}>()

// 模块中文描述
const moduleNames: Record<ModuleName, string> = {
  voice: 'Voice',
  image: 'Image',
  video: 'Video',
  music: 'Music',
  chat: 'Chat',
  history: 'History',
}

const moduleName = computed(() => moduleNames[props.module] || props.module)

// Empty state image path
const emptyImagePath = computed(() => `/images/empty/${props.module}.svg`)

// Handle action click
function handleAction() {
  emit('action')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
    <!-- Empty state illustration -->
    <div class="w-48 h-36 mb-6">
      <img
        :src="emptyImagePath"
        :alt="`${moduleName} empty state`"
        class="w-full h-full object-contain"
        loading="lazy"
      >
    </div>

    <!-- Title -->
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
      {{ description }}
    </p>

    <!-- Action button (optional) -->
    <button
      v-if="action"
      class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
      @click="handleAction"
    >
      {{ action }}
    </button>
  </div>
</template>
