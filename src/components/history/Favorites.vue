<script setup lang="ts">
import type { HistoryItem } from '~/types'

interface Props {
  favorites: HistoryItem[]
  isLoading?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'toggleFavorite', id: string): void
  (e: 'viewDetail', item: HistoryItem): void
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
    voice: 'bg-purple-100 text-purple-700',
    image: 'bg-green-100 text-green-700',
    video: 'bg-red-100 text-red-700',
    music: 'bg-yellow-100 text-yellow-700',
    chat: 'bg-blue-100 text-blue-700',
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
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
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">
        我的收藏
      </h3>
      <span class="text-sm text-gray-500">{{ favorites.length }} 项</span>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="py-8 text-center">
      <div class="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p class="mt-2 text-sm text-gray-500">
        加载中...
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="favorites.length === 0" class="py-8 text-center">
      <svg
        class="mx-auto w-12 h-12 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <p class="mt-3 text-sm text-gray-500">
        暂无收藏内容
      </p>
      <p class="text-xs text-gray-400">
        点击列表中的星标添加收藏
      </p>
    </div>

    <!-- Favorites List -->
    <div v-else class="space-y-3">
      <div
        v-for="item in favorites"
        :key="item.id"
        class="group p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
        @click="emit('viewDetail', item)"
      >
        <div class="flex items-start gap-3">
          <!-- Type Badge -->
          <span
            class="px-2 py-0.5 rounded text-xs font-medium" :class="[
              getTypeColor(item.type),
            ]"
          >
            {{ getTypeLabel(item.type) }}
          </span>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <p class="text-sm text-gray-700 truncate">
              {{ getPreviewText(item) }}
            </p>
            <p class="text-xs text-gray-400 mt-1">
              {{ formatDate(item.createdAt) }}
            </p>
          </div>

          <!-- Actions -->
          <button
            type="button"
            class="p-1.5 text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors duration-200"
            title="取消收藏"
            @click.stop="emit('toggleFavorite', item.id)"
          >
            <svg
              class="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
