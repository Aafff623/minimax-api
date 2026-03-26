<script setup lang="ts">
import type { VideoTask } from '~/stores/video'
import { computed, ref } from 'vue'
import { useVideoStore } from '~/stores/video'
import VideoPlayer from './VideoPlayer.vue'

const videoStore = useVideoStore()

const pageSize = 12
const currentPage = ref(1)

const selectedVideo = ref<VideoTask | null>(null)
const showPlayer = ref(false)

const totalPages = computed(() => Math.ceil(videoStore.gallery.length / pageSize))

const paginatedVideos = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return videoStore.gallery.slice(start, end)
})

function formatDuration(seconds?: number): string {
  if (!seconds)
    return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function openPlayer(video: VideoTask) {
  selectedVideo.value = video
  showPlayer.value = true
  videoStore.setCurrentVideo(video.videoUrl || null)
}

function closePlayer() {
  showPlayer.value = false
  selectedVideo.value = null
  videoStore.setCurrentVideo(null)
}

function handleDelete(taskId: string) {
  videoStore.removeFromGallery(taskId)
  closePlayer()
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
  <div class="video-gallery">
    <!-- Empty State -->
    <div v-if="videoStore.gallery.length === 0" class="empty-state">
      <div class="i-icon-park-outline-video text-6xl text-gray-300 mb-4" />
      <p class="text-gray-500 text-center">
        No videos yet. Start generating!
      </p>
    </div>

    <!-- Gallery Grid -->
    <div v-else class="gallery-content">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="video in paginatedVideos"
          :key="video.taskId"
          class="video-card rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
          @click="openPlayer(video)"
        >
          <!-- Cover / Thumbnail -->
          <div class="aspect-video bg-gray-100 dark:bg-gray-700 relative">
            <img
              v-if="video.coverUrl"
              :src="video.coverUrl"
              :alt="video.prompt || 'Video'"
              class="w-full h-full object-cover"
            >
            <div
              v-else
              class="w-full h-full flex items-center justify-center"
            >
              <span class="i-icon-park-outline-video text-4xl text-gray-400" />
            </div>

            <!-- Duration Badge -->
            <span
              v-if="video.duration"
              class="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-xs font-mono"
            >
              {{ formatDuration(video.duration) }}
            </span>

            <!-- Play Icon Overlay -->
            <div class="play-overlay">
              <div class="play-icon">
                <span class="i-icon-park-outline-play text-2xl" />
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="p-3">
            <p
              v-if="video.prompt"
              class="text-sm text-gray-700 dark:text-gray-200 truncate mb-1"
            >
              {{ video.prompt }}
            </p>
            <p class="text-xs text-gray-500">
              {{ formatDate(video.createdAt) }}
            </p>
          </div>
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

    <!-- Player Dialog -->
    <Teleport to="body">
      <div
        v-if="showPlayer && selectedVideo"
        class="player-overlay"
        @click.self="closePlayer"
      >
        <div class="player-container">
          <div class="player-header">
            <h3 class="player-title truncate">
              {{ selectedVideo.prompt || 'Video Preview' }}
            </h3>
            <button
              class="close-btn"
              @click="closePlayer"
            >
              <span class="i-icon-park-outline-close text-xl" />
            </button>
          </div>

          <VideoPlayer
            :video-url="selectedVideo.videoUrl || ''"
            :cover-url="selectedVideo.coverUrl"
            :auto-play="true"
            @close="closePlayer"
          />

          <div class="player-footer">
            <button
              class="btn btn-sm btn-error"
              @click="handleDelete(selectedVideo.taskId)"
            >
              <span class="i-icon-park-outline-delete text-lg mr-1" />
              Delete
            </button>
            <span class="text-sm text-gray-500">
              {{ formatDate(selectedVideo.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.video-gallery {
  @apply w-full;
}

.empty-state {
  @apply flex flex-col items-center justify-center py-16;
}

.video-card {
  @apply border border-gray-100 dark:border-gray-700;
}

.video-card .play-overlay {
  @apply absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity;
}

.video-card .play-icon {
  @apply w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-gray-800;
}

.pagination {
  @apply py-4;
}

.player-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/80;
}

.player-container {
  @apply w-full max-w-4xl mx-4 rounded-lg overflow-hidden bg-black;
}

.player-header {
  @apply flex items-center justify-between p-4 bg-gray-900;
}

.player-title {
  @apply text-white font-medium flex-1 mr-4;
}

.close-btn {
  @apply p-2 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors;
}

.player-footer {
  @apply flex items-center justify-between p-4 bg-gray-900;
}
</style>
