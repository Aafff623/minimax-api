<script setup lang="ts">
export interface StyleOption {
  value: string
  label: string
  icon?: string
}

const styles: StyleOption[] = [
  { value: 'realistic', label: '写实', icon: 'i-ph-camera' },
  { value: 'anime', label: '动漫', icon: 'i-ph-star' },
  { value: 'illustration', label: '插画', icon: 'i-ph-paint-brush' },
  { value: '3d-render', label: '3D渲染', icon: 'i-ph-cube' },
  { value: 'oil-painting', label: '油画', icon: 'i-ph-palette' },
  { value: 'watercolor', label: '水彩', icon: 'i-ph-drop' },
  { value: 'sketch', label: '素描', icon: 'i-ph-pencil' },
  { value: 'digital-art', label: '数字艺术', icon: 'i-ph-desktop' },
]

const selectedStyle = defineModel<string>({
  default: 'realistic',
})

function selectStyle(value: string) {
  selectedStyle.value = value
}
</script>

<template>
  <div class="style-selector">
    <div class="text-sm text-gray-6 mb-2">
      风格
    </div>
    <div class="grid grid-cols-4 gap-2">
      <button
        v-for="style in styles"
        :key="style.value"
        type="button"
        class="flex flex-col items-center gap-1 p-3 rounded-lg border transition-all" :class="[
          selectedStyle === style.value
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-gray-2 hover:border-gray-4 text-gray-6',
        ]"
        @click="selectStyle(style.value)"
      >
        <span class="text-lg" :class="[style.icon || 'i-ph-image']" />
        <span class="text-xs">{{ style.label }}</span>
      </button>
    </div>
  </div>
</template>
