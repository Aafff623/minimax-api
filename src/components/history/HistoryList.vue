<script setup lang="ts">
import type { HistoryItem } from '~/types'

interface Props {
  items: HistoryItem[]
  isLoading?: boolean
  hasMore?: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'loadMore': []
  'toggleFavorite': [id: string]
  'delete': [id: string]
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
      return data.text?.slice(0, 80) || '语音合成'
    case 'image':
      return data.prompt?.slice(0, 80) || '图片生成'
    case 'video':
      return data.prompt?.slice(0, 80) || '视频生成'
    case 'music':
      return data.lyrics?.slice(0, 80) || '音乐创作'
    case 'chat': {
      const lastMsg = data.messages?.[data.messages.length - 1]
      return lastMsg?.content?.slice(0, 80) || '对话'
    }
    default:
      return '未知内容'
  }
}
</script>

<template>
  <div class="history-list">
    <!-- Loading State -->
    <div v-if="isLoading && items.length === 0" class="py-12 text-center">
      <div class="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p class="mt-4 text-sm text-text-muted">
        加载中...
      </p>
    </div>

    <!-- Empty State -->
    <div v-else-if="items.length === 0" class="py-16 text-center">
      <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-5">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-text-primary mb-2">暂无历史记录</h3>
      <p class="text-sm text-text-muted">
        您的创作记录将显示在这里
      </p>
    </div>

    <!-- History Items -->
    <div v-else class="space-y-3">
      <div
        v-for="item in items"
        :key="item.id"
        class="group p-4 bg-white rounded-2xl border-2 border-border-light hover:border-primary/30 hover:shadow-lg transition-all duration-200 cursor-pointer"
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
            <p class="text-sm text-text-primary line-clamp-2 mb-2">
              {{ getPreviewText(item) }}
            </p>
            <p class="text-xs text-text-muted">
              {{ formatDate(item.createdAt) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <!-- Favorite Button -->
            <button
              type="button"
              class="p-2 rounded-xl transition-all duration-200"
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
              class="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
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
      <div v-if="hasMore" class="pt-4 text-center">
        <button
          type="button"
          :disabled="isLoading"
          class="px-6 py-2.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all duration-200 disabled:opacity-50"
          @click="emit('loadMore')"
        >
          <span v-if="isLoading">加载中...</span>
          <span v-else>加载更多</span>
        </button>
      </div>
    </div>
  </div>
</template>
