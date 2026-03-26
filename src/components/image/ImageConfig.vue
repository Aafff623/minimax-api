<script setup lang="ts">
export type ImageSize = '1:1' | '16:9' | '9:16' | '3:4' | '4:3'
export type ImageQuality = 'standard' | 'high'

export interface ImageConfigValue {
  size: ImageSize
  quality: ImageQuality
  numImages: number
}

const modelValue = defineModel<ImageConfigValue>({
  default: () => ({
    size: '1:1',
    quality: 'standard',
    numImages: 1,
  }),
})

const sizeOptions: { value: ImageSize, label: string, icon: string }[] = [
  { value: '1:1', label: '1:1', icon: 'i-ph-square' },
  { value: '16:9', label: '16:9', icon: 'i-ph-video' },
  { value: '9:16', label: '9:16', icon: 'i-ph-device-mobile' },
  { value: '3:4', label: '3:4', icon: 'i-ph-image' },
  { value: '4:3', label: '4:3', icon: 'i-ph-layout' },
]

const qualityOptions: { value: ImageQuality, label: string }[] = [
  { value: 'standard', label: '标准' },
  { value: 'high', label: '高清' },
]

function updateSize(size: ImageSize) {
  modelValue.value = { ...modelValue.value, size }
}

function updateQuality(quality: ImageQuality) {
  modelValue.value = { ...modelValue.value, quality }
}

function updateNumImages(delta: number) {
  const newNum = Math.min(4, Math.max(1, modelValue.value.numImages + delta))
  modelValue.value = { ...modelValue.value, numImages: newNum }
}
</script>

<template>
  <div class="image-config space-y-4">
    <!-- Section label -->
    <div class="label flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
      图片配置
    </div>

    <!-- 尺寸选择 -->
    <div>
      <div class="text-sm font-medium text-text-secondary mb-2">
        尺寸
      </div>
      <div class="flex gap-2">
        <button
          v-for="option in sizeOptions"
          :key="option.value"
          type="button"
          class="px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200" :class="[
            modelValue.size === option.value
              ? 'border-primary bg-primary text-white shadow-button'
              : 'border-border-light bg-white text-text-primary hover:border-primary/50 hover:bg-primary/5',
          ]"
          @click="updateSize(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- 质量选择 -->
    <div>
      <div class="text-sm font-medium text-text-secondary mb-2">
        质量
      </div>
      <div class="flex gap-2">
        <button
          v-for="option in qualityOptions"
          :key="option.value"
          type="button"
          class="px-4 py-2.5 rounded-xl border-2 text-sm font-medium transition-all duration-200" :class="[
            modelValue.quality === option.value
              ? 'border-primary bg-primary text-white shadow-button'
              : 'border-border-light bg-white text-text-primary hover:border-primary/50 hover:bg-primary/5',
          ]"
          @click="updateQuality(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- 数量选择 -->
    <div>
      <div class="text-sm font-medium text-text-secondary mb-2">
        数量
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-200" :class="[
            modelValue.numImages <= 1
              ? 'border-border-light text-text-muted cursor-not-allowed'
              : 'border-border-light bg-white text-text-primary hover:border-primary hover:bg-primary/5',
          ]"
          :disabled="modelValue.numImages <= 1"
          @click="updateNumImages(-1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span class="text-xl w-10 text-center font-bold text-text-primary">{{ modelValue.numImages }}</span>
        <button
          type="button"
          class="w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-200" :class="[
            modelValue.numImages >= 4
              ? 'border-border-light text-text-muted cursor-not-allowed'
              : 'border-border-light bg-white text-text-primary hover:border-primary hover:bg-primary/5',
          ]"
          :disabled="modelValue.numImages >= 4"
          @click="updateNumImages(1)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
