<script setup lang="ts">
import { useImageStore } from '~/stores/image'

export interface ImageActionsProps {
  imageUrl: string
  disabled?: boolean
}

const props = defineProps<ImageActionsProps>()
const emit = defineEmits<{
  favorite: [url: string]
}>()

const imageStore = useImageStore()

async function handleDownload() {
  if (!props.imageUrl || props.disabled)
    return

  try {
    const response = await fetch(props.imageUrl)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `image-${Date.now()}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  catch (error) {
    console.error('Download failed:', error)
  }
}

function handleFavorite() {
  if (!props.imageUrl || props.disabled)
    return
  imageStore.addToGallery([props.imageUrl])
  emit('favorite', props.imageUrl)
}
</script>

<template>
  <div class="image-actions flex gap-2">
    <button
      type="button"
      :disabled="disabled || !imageUrl"
      class="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border-light bg-white text-text-primary text-sm font-medium hover:border-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="下载图片"
      @click="handleDownload"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      下载
    </button>
    <button
      type="button"
      :disabled="disabled || !imageUrl"
      class="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-border-light bg-white text-text-primary text-sm font-medium hover:border-cta hover:bg-cta/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      title="收藏图片"
      @click="handleFavorite"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-cta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      收藏
    </button>
  </div>
</template>
