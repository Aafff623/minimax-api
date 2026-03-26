<script setup lang="ts">
import type { HistoryItem } from '~/types'

interface Props {
  favorites: HistoryItem[]
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  toggleFavorite: [id: string]
  viewDetail: [item: HistoryItem]
}>()

function getTypeLabel(type: HistoryItem['type']): string {
  const labels = {
    voice: '语音',
    image: '图片',
    video: '视频',
    music: '音乐',
    chat: '对话',
  }
  return labels[type] || type
}

function getTypeColor(type: HistoryItem['type']): string {
  const colors = {
    voice: 'bg-purple-50 text-purple-600 border-purple-100',
    image: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    video: 'bg-red-50 text-red-600 border-red-100',
    music: 'bg-amber-50 text-amber-600 border-amber-100',
    chat: 'bg-blue-50 text-blue-600 border-blue-100',
  }
  return colors[type] || 'bg-gray-50 text-gray-600 border-gray-100'
}

function getTypeIcon(type: HistoryItem['type']): string {
  const icons = {
    voice: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    image: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    video: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    music: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3',
    chat: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  }
  return icons[type] || ''
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1)
    return '刚刚'
  if (minutes < 60)
    return `${minutes} 分钟前`
  if (hours < 24)
    return `${hours} 小时前`
  if (days < 7)
    return `${days} 天前`

  return date.toLocaleDateString('zh-CN')
}

function getPreviewText(item: HistoryItem): string {
  const { data, type } = item

  switch (type) {
    case 'voice':
      return data.text?.slice(0, 100) || '语音合成'
    case 'image':
      return data.prompt?.slice(0, 100) || '图片生成'
    case 'video':
      return data.prompt?.slice(0, 100) || '视频生成'
    case 'music':
      return data.lyrics?.slice(0, 100) || '音乐创作'
    case 'chat': {
      const lastMsg = data.messages?.[data.messages.length - 1]
      return lastMsg?.content?.slice(0, 100) || '对话'
    }
    default:
      return '未知内容'
  }
}
</script>

<template>
  <div class="favorites">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-bold text-text-primary flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
        我的收藏
      </h3>
      <span class="px-4 py-1.5 rounded-full text-sm font-semibold bg-gradient-to-r from-yellow-50 to-amber-50 text-amber-600 border border-amber-200">{{ favorites.length }} 项</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-20 text-center">
      <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
      <p class="mt-5 text-sm text-text-muted font-medium">
        加载中...
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="favorites.length === 0" class="py-24 text-center">
      <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-text-primary mb-2">
        暂无收藏内容
      </h3>
      <p class="text-sm text-text-muted max-w-xs mx-auto">
        点击列表中的星标收藏喜欢的内容
      </p>
    </div>

    <!-- Favorites List -->
    <div v-else class="space-y-4">
      <div
        v-for="item in favorites"
        :key="item.id"
        class="group bg-white rounded-2xl border border-border-light p-5 hover:border-amber-300/50 hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer"
        @click="emit('viewDetail', item)"
      >
        <div class="flex items-start gap-4">
          <!-- Type Icon -->
          <div class="flex-shrink-0">
            <div
              class="w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
              :class="getTypeColor(item.type)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path :d="getTypeIcon(item.type)" />
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-xs font-semibold uppercase tracking-wide" :class="getTypeColor(item.type)">
                {{ getTypeLabel(item.type) }}
              </span>
              <span class="text-text-muted">·</span>
              <span class="text-xs text-text-muted">
                {{ formatDate(item.createdAt) }}
              </span>
            </div>
            <p class="text-sm text-text-primary leading-relaxed line-clamp-2 mb-3">
              {{ getPreviewText(item) }}
            </p>
          </div>

          <!-- Favorite Button -->
          <button
            type="button"
            class="p-2.5 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200"
            title="取消收藏"
            @click.stop="emit('toggleFavorite', item.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 fill-current" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
