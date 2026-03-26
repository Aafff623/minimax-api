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
      <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-text-muted mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
      <p class="text-text-secondary text-center">
        还没有视频，开始生成吧！
      </p>
    </div>

    <!-- Gallery Grid -->
    <div v-else class="gallery-content">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <div
          v-for="video in paginatedVideos"
          :key="video.taskId"
          class="video-card rounded-2xl overflow-hidden bg-surface border border-border-light shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1"
          @click="openPlayer(video)"
        >
          <!-- Cover / Thumbnail -->
          <div class="aspect-video bg-gray-100 relative">
            <img
              v-if="video.coverUrl"
              :src="video.coverUrl"
              :alt="video.prompt || 'Video'"
              class="w-full h-full object-cover"
            >
            <div
              v-else
              class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="23 7 16 12 23 17 23 7" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>

            <!-- Duration Badge -->
            <span
              v-if="video.duration"
              class="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 text-white text-xs font-medium backdrop-blur-sm"
            >
              {{ formatDuration(video.duration) }}
            </span>

            <!-- Play Icon Overlay -->
            <div class="play-overlay">
              <div class="play-icon">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </div>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <p
              v-if="video.prompt"
              class="text-sm text-text-primary truncate mb-2 font-medium"
            >
              {{ video.prompt }}
            </p>
            <p class="text-xs text-text-muted">
              {{ formatDate(video.createdAt) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination mt-8 flex items-center justify-center gap-4">
        <button
          class="btn btn-secondary w-10 h-10 p-0 flex items-center justify-center"
          :disabled="currentPage === 1"
          @click="prevPage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <span class="text-sm text-text-secondary px-4">
          {{ currentPage }} / {{ totalPages }}
        </span>

        <button
          class="btn btn-secondary w-10 h-10 p-0 flex items-center justify-center"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
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
              {{ selectedVideo.prompt || '视频预览' }}
            </h3>
            <button
              class="close-btn"
              @click="closePlayer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
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
              class="btn btn-danger"
              @click="handleDelete(selectedVideo.taskId)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              删除
            </button>
            <span class="text-sm text-white/60">
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
  @apply flex flex-col items-center justify-center py-20;
}

.video-card {
  @apply border border-border-light;
}

.video-card:hover {
  @apply border-primary/30;
}

.video-card .play-overlay {
  @apply absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300;
}

.video-card:hover .play-overlay {
  @apply opacity-100;
}

.video-card .play-icon {
  @apply w-14 h-14 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center text-white;
  @apply shadow-lg transition-all duration-300;
  @apply hover:scale-110 hover:bg-primary;
}

.pagination {
  @apply py-4;
}

.player-overlay {
  @apply fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm;
}

.player-container {
  @apply w-full max-w-4xl mx-4 rounded-2xl overflow-hidden bg-gray-900;
  @apply shadow-2xl;
}

.player-header {
  @apply flex items-center justify-between p-4 bg-gray-900 border-b border-white/10;
}

.player-title {
  @apply text-white font-medium flex-1 mr-4 truncate;
}

.close-btn {
  @apply p-2.5 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200;
}

.player-footer {
  @apply flex items-center justify-between p-4 bg-gray-900 border-t border-white/10;
}
</style>
