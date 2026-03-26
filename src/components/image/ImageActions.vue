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
      class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-2 hover:border-gray-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="下载图片"
      @click="handleDownload"
    >
      <span class="i-ph-download text-sm" />
      <span class="text-sm">下载</span>
    </button>
    <button
      type="button"
      :disabled="disabled || !imageUrl"
      class="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-2 hover:border-gray-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      title="收藏图片"
      @click="handleFavorite"
    >
      <span class="i-ph-heart text-sm" />
      <span class="text-sm">收藏</span>
    </button>
  </div>
</template>
