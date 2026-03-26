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
  <Dialog v-model="props.modelValue" title="Image Detail">
    <div class="image-detail">
      <!-- Image Preview -->
      <div class="image-container mb-4">
        <img
          :src="imageUrl"
          alt="Generated image"
          class="w-full h-auto rounded-lg"
        >
      </div>

      <!-- Actions -->
      <div class="actions flex gap-3">
        <button
          class="btn btn-primary flex-1"
          :disabled="isLoading"
          @click="downloadImage"
        >
          <span v-if="isLoading" class="i-icon-park-outline-loading text-lg animate-spin" />
          <span v-else class="i-icon-park-outline-download text-lg" />
          <span class="ml-2">Download</span>
        </button>

        <button
          class="btn btn-error flex-1"
          @click="handleDelete"
        >
          <span class="i-icon-park-outline-delete text-lg" />
          <span class="ml-2">Delete</span>
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
  @apply bg-gray-100 rounded-lg overflow-hidden;
}
</style>
