<script setup lang="ts">
export interface StyleOption {
  value: string
  label: string
  icon: string
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
    <div class="label flex items-center gap-2 mb-3">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3v18" />
        <rect x="8" y="1" width="8" height="6" rx="1" />
        <path d="m8 7 4-4 4 4" />
      </svg>
      风格选择
    </div>
    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="style in styles"
        :key="style.value"
        type="button"
        class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200" :class="[
          selectedStyle === style.value
            ? 'border-primary bg-primary text-white shadow-button'
            : 'border-border-light bg-white text-text-primary hover:border-primary/50 hover:bg-primary/5',
        ]"
        @click="selectStyle(style.value)"
      >
        <span class="text-2xl" :class="[style.icon || 'i-ph-image']" />
        <span class="text-xs font-medium">{{ style.label }}</span>
      </button>
    </div>
  </div>
</template>
