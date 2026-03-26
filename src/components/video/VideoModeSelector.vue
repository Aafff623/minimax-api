<script setup lang="ts">
import type { VideoMode } from '~/types'

export interface ModeOption {
  value: VideoMode
  label: string
  description: string
}

const modes: ModeOption[] = [
  {
    value: 'text-to-video',
    label: '文字生视频',
    description: '输入文字描述生成视频',
  },
  {
    value: 'image-to-video',
    label: '图片生视频',
    description: '上传图片生成视频',
  },
  {
    value: 'subject-to-video',
    label: '主体驱动',
    description: '主体动作驱动视频生成',
  },
]

const selectedMode = defineModel<VideoMode>({
  default: 'text-to-video',
})

function selectMode(mode: VideoMode) {
  selectedMode.value = mode
}
</script>

<template>
  <div class="mode-selector">
    <div class="label flex items-center gap-2 mb-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3v18" />
        <rect x="8" y="1" width="8" height="6" rx="1" />
        <path d="m8 7 4-4 4 4" />
      </svg>
      生成模式
    </div>
    <div class="grid grid-cols-3 gap-4">
      <button
        v-for="mode in modes"
        :key="mode.value"
        type="button"
        class="flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 text-center" :class="[
          selectedMode === mode.value
            ? 'border-primary bg-primary text-white shadow-button'
            : 'border-border-light bg-white text-text-primary hover:border-primary/50 hover:bg-primary/5',
        ]"
        @click="selectMode(mode.value)"
      >
        <div
          class="w-12 h-12 rounded-full flex items-center justify-center" :class="[
            selectedMode === mode.value
              ? 'bg-white/20'
              : 'bg-primary/10',
          ]"
        >
          <svg v-if="mode.value === 'text-to-video'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          <svg v-else-if="mode.value === 'image-to-video'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div>
          <span class="text-sm font-bold block">{{ mode.label }}</span>
          <span class="text-xs opacity-70 mt-1 block">{{ mode.description }}</span>
        </div>
      </button>
    </div>
  </div>
</template>
