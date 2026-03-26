<script setup lang="ts">
import { computed, ref } from 'vue'
import { useImageStore } from '~/stores/image'
import ImageDetail from './ImageDetail.vue'

const imageStore = useImageStore()

const pageSize = 20
const currentPage = ref(1)

const selectedImage = ref<string | null>(null)
const showDetail = ref(false)

const totalPages = computed(() => Math.ceil(imageStore.gallery.length / pageSize))

const paginatedImages = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return imageStore.gallery.slice(start, end)
})

function openDetail(imageUrl: string) {
  selectedImage.value = imageUrl
  showDetail.value = true
}

function closeDetail() {
  showDetail.value = false
  selectedImage.value = null
}

function handleDelete(url: string) {
  imageStore.removeFromGallery(url)
  closeDetail()
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}
</script>

<template>
  <div class="image-gallery">
    <!-- Empty State -->
    <div v-if="imageStore.gallery.length === 0" class="empty-state">
      <div class="i-icon-park-outline-picture text-6xl text-gray-300 mb-4" />
      <p class="text-gray-500 text-center">
        No images yet. Start generating!
      </p>
    </div>

    <!-- Gallery Grid -->
    <div v-else class="gallery-content">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="(imageUrl, index) in paginatedImages"
          :key="imageUrl"
          class="gallery-item aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          @click="openDetail(imageUrl)"
        >
          <img
            :src="imageUrl"
            :alt="`Generated image ${index + 1}`"
            class="w-full h-full object-cover"
            loading="lazy"
          >
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination mt-6 flex items-center justify-center gap-4">
        <button
          class="btn btn-sm btn-ghost"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <span class="i-icon-park-outline-left text-lg" />
        </button>

        <span class="text-sm text-gray-600">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          class="btn btn-sm btn-ghost"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          <span class="i-icon-park-outline-right text-lg" />
        </button>
      </div>
    </div>

    <!-- Detail Dialog -->
    <ImageDetail
      v-if="showDetail && selectedImage"
      v-model="showDetail"
      :image-url="selectedImage"
      @delete="handleDelete"
    />
  </div>
</template>

<style scoped>
.image-gallery {
  @apply w-full;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16;
}

.gallery-item {
  @apply bg-gray-100;
}

.pagination {
  @apply py-4;
}
</style>
