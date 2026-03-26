<script setup lang="ts">
import { ref } from 'vue'
import Dialog from '~/components/common/Dialog.vue'

interface Props {
  imageUrl: string
  modelValue: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'delete', url: string): void
}>()

const isLoading = ref(false)

async function downloadImage() {
  isLoading.value = true
  try {
    const response = await fetch(props.imageUrl)
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  catch (error) {
    console.error('Download failed:', error)
  }
  finally {
    isLoading.value = false
  }
}

function handleDelete() {
  emit('delete', props.imageUrl)
}
</script>

<template>
  <Dialog v-model="props.modelValue" title="图片详情">
    <div class="image-detail">
      <!-- Image Preview -->
      <div class="image-container mb-6 rounded-xl overflow-hidden bg-gray-100">
        <img
          :src="imageUrl"
          alt="Generated image"
          class="w-full h-auto"
        >
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button
          class="btn btn-primary flex-1 py-3"
          :disabled="isLoading"
          @click="downloadImage"
        >
          <svg v-if="!isLoading" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span class="ml-2">下载图片</span>
        </button>

        <button
          class="btn btn-danger flex-1 py-3"
          @click="handleDelete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
          <span class="ml-2">删除</span>
        </button>
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.image-detail {
  @apply w-full;
}

.image-container {
  @apply transition-all duration-300;
}

.image-container:hover {
  @apply shadow-card-hover;
}
</style>
