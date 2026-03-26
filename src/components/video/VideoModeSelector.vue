<script setup lang="ts">
import type { VideoMode } from '~/types'

export interface ModeOption {
  value: VideoMode
  label: string
  icon: string
  description: string
}

const modes: ModeOption[] = [
  {
    value: 'text-to-video',
    label: '文字生视频',
    icon: 'i-ph-text-aa',
    description: '输入文字描述生成视频',
  },
  {
    value: 'image-to-video',
    label: '图片生视频',
    icon: 'i-ph-image',
    description: '上传图片生成视频',
  },
  {
    value: 'subject-to-video',
    label: '主体驱动',
    icon: 'i-ph-user',
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
    <div class="text-sm text-gray-6 mb-2">
      生成模式
    </div>
    <div class="flex gap-2">
      <button
        v-for="mode in modes"
        :key="mode.value"
        type="button"
        class="flex-1 flex flex-col items-center gap-1 p-4 rounded-lg border transition-all"
        :class="[
          selectedMode === mode.value
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-gray-2 hover:border-gray-4 text-gray-6',
        ]"
        @click="selectMode(mode.value)"
      >
        <span class="text-xl" :class="[mode.icon]" />
        <span class="text-sm font-medium">{{ mode.label }}</span>
      </button>
    </div>
  </div>
</template>
