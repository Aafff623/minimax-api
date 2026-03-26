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

const sizeOptions: { value: ImageSize, label: string }[] = [
  { value: '1:1', label: '1:1' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
  { value: '3:4', label: '3:4' },
  { value: '4:3', label: '4:3' },
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
    <!-- 尺寸选择 -->
    <div>
      <div class="text-sm text-gray-6 mb-2">
        尺寸
      </div>
      <div class="flex gap-2">
        <button
          v-for="option in sizeOptions"
          :key="option.value"
          type="button"
          class="px-4 py-2 rounded-lg border text-sm transition-all" :class="[
            modelValue.size === option.value
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-gray-2 hover:border-gray-4 text-gray-6',
          ]"
          @click="updateSize(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- 质量选择 -->
    <div>
      <div class="text-sm text-gray-6 mb-2">
        质量
      </div>
      <div class="flex gap-2">
        <button
          v-for="option in qualityOptions"
          :key="option.value"
          type="button"
          class="px-4 py-2 rounded-lg border text-sm transition-all" :class="[
            modelValue.quality === option.value
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-gray-2 hover:border-gray-4 text-gray-6',
          ]"
          @click="updateQuality(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- 数量选择 -->
    <div>
      <div class="text-sm text-gray-6 mb-2">
        数量
      </div>
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="w-8 h-8 rounded-lg border flex items-center justify-center transition-all" :class="[
            modelValue.numImages <= 1
              ? 'border-gray-2 text-gray-3 cursor-not-allowed'
              : 'border-gray-2 hover:border-gray-4 text-gray-6',
          ]"
          :disabled="modelValue.numImages <= 1"
          @click="updateNumImages(-1)"
        >
          <span class="i-ph-minus text-sm" />
        </button>
        <span class="text-lg w-8 text-center">{{ modelValue.numImages }}</span>
        <button
          type="button"
          class="w-8 h-8 rounded-lg border flex items-center justify-center transition-all" :class="[
            modelValue.numImages >= 4
              ? 'border-gray-2 text-gray-3 cursor-not-allowed'
              : 'border-gray-2 hover:border-gray-4 text-gray-6',
          ]"
          :disabled="modelValue.numImages >= 4"
          @click="updateNumImages(1)"
        >
          <span class="i-ph-plus text-sm" />
        </button>
      </div>
    </div>
  </div>
</template>
