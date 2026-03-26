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
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="section-title flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        我的画廊
      </h2>
      <span class="text-sm text-text-secondary">{{ imageStore.gallery.length }} 张图片</span>
    </div>

    <!-- Empty State -->
    <div v-if="imageStore.gallery.length === 0" class="empty-state">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
      <p class="text-gray-500 text-center text-lg font-medium mb-2">
        还没有图片
      </p>
      <p class="text-gray-400 text-center text-sm">
        开始生成你的第一张 AI 图片吧
      </p>
    </div>

    <!-- Gallery Grid -->
    <div v-else class="gallery-content">
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="(imageUrl, index) in paginatedImages"
          :key="imageUrl"
          class="gallery-item aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100 transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 group"
          @click="openDetail(imageUrl)"
        >
          <img
            :src="imageUrl"
            :alt="`Generated image ${index + 1}`"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination mt-6 flex items-center justify-center gap-4">
        <button
          class="btn btn-secondary"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          上一页
        </button>

        <span class="text-sm text-text-secondary font-medium px-4">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          class="btn btn-secondary"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          下一页
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
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
  @apply flex flex-col items-center justify-center py-16 text-center;
}

.gallery-item {
  @apply relative;
}

.pagination {
  @apply py-4;
}
</style>
