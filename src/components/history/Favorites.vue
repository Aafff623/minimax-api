<script setup lang="ts">
import type { HistoryItem } from '~/types'

interface Props {
  favorites: HistoryItem[]
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'toggleFavorite': [id: string]
  'viewDetail': [item: HistoryItem]
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
    voice: 'bg-purple-100 text-purple-700 border-purple-200',
    image: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    video: 'bg-red-100 text-red-700 border-red-200',
    music: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    chat: 'bg-blue-100 text-blue-700 border-blue-200',
  }
  return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200'
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
      return data.text?.slice(0, 50) || '语音合成'
    case 'image':
      return data.prompt?.slice(0, 50) || '图片生成'
    case 'video':
      return data.prompt?.slice(0, 50) || '视频生成'
    case 'music':
      return data.lyrics?.slice(0, 50) || '音乐创作'
    case 'chat': {
      const lastMsg = data.messages?.[data.messages.length - 1]
      return lastMsg?.content?.slice(0, 50) || '对话'
    }
    default:
      return '未知内容'
  }
}
</script>

<template>
  <div class="favorites">
    <div class="flex items-center justify-between mb-5">
      <h3 class="text-lg font-semibold text-text-primary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        我的收藏
      </h3>
      <span class="px-3 py-1.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">{{ favorites.length }} 项</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-12 text-center">
      <div class="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p class="mt-4 text-sm text-text-muted">
        加载中...
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="favorites.length === 0" class="py-16 text-center">
      <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center mx-auto mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-text-primary mb-2">暂无收藏内容</h3>
      <p class="text-sm text-text-muted mb-1">点击列表中的星标添加收藏</p>
    </div>

    <!-- Favorites List -->
    <div v-else class="space-y-3">
      <div
        v-for="item in favorites"
        :key="item.id"
        class="group p-4 bg-white rounded-2xl border-2 border-border-light hover:border-yellow-300 hover:shadow-lg transition-all duration-200 cursor-pointer"
        @click="emit('viewDetail', item)"
      >
        <div class="flex items-start gap-4">
          <!-- Type Badge -->
          <span
            class="px-3 py-1.5 rounded-xl text-xs font-semibold border flex-shrink-0"
            :class="getTypeColor(item.type)"
          >
            {{ getTypeLabel(item.type) }}
          </span>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm text-text-primary truncate mb-2">
              {{ getPreviewText(item) }}
            </p>
            <p class="text-xs text-text-muted">
              {{ formatDate(item.createdAt) }}
            </p>
          </div>

          <!-- Favorite Icon -->
          <button
            type="button"
            class="p-2 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-xl transition-all duration-200"
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
