<script setup lang="ts">
import type { HistoryItem } from '~/types'

interface Props {
  items: HistoryItem[]
  isLoading?: boolean
  hasMore?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  loadMore: []
  toggleFavorite: [id: string]
  delete: [id: string]
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
  <div class="history-list">
    <!-- Loading State -->
    <div v-if="isLoading && items.length === 0" class="py-20 text-center">
      <div class="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
      <p class="mt-5 text-sm text-text-muted font-medium">
        加载中...
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="py-24 text-center">
      <div class="w-24 h-24 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-text-primary mb-2">
        暂无历史记录
      </h3>
      <p class="text-sm text-text-muted max-w-xs mx-auto">
        您的创作记录将显示在这里，开始创作吧！
      </p>
    </div>

    <!-- History Items -->
    <div v-else class="space-y-4">
      <div
        v-for="item in items"
        :key="item.id"
        class="group bg-white rounded-2xl border border-border-light p-5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer"
        @click="emit('viewDetail', item)"
      >
        <div class="flex items-start gap-4">
          <!-- Type Badge -->
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

          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <!-- Favorite Button -->
            <button
              type="button"
              class="p-2.5 rounded-xl transition-all duration-200"
              :class="item.favorite
                ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50'
                : 'text-gray-400 hover:text-yellow-500 hover:bg-gray-100'"
              :title="item.favorite ? '取消收藏' : '添加收藏'"
              @click.stop="emit('toggleFavorite', item.id)"
            >
              <svg
                class="w-5 h-5"
                :class="item.favorite ? 'fill-current' : 'fill-none'"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>

            <!-- Delete Button -->
            <button
              type="button"
              class="p-2.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              title="删除"
              @click.stop="emit('delete', item.id)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Load More Button -->
      <div v-if="hasMore" class="pt-6 text-center">
        <button
          type="button"
          :disabled="isLoading"
          class="px-8 py-3.5 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/10 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="emit('loadMore')"
        >
          <span v-if="isLoading">加载中...</span>
          <span v-else>加载更多</span>
        </button>
      </div>
    </div>
  </div>
</template>
