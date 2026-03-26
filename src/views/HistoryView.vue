<script setup lang="ts">
import type { HistoryItem } from '~/types'
import { onMounted, ref, watch } from 'vue'
import Favorites from '~/components/history/Favorites.vue'
import HistoryList from '~/components/history/HistoryList.vue'
import SearchFilter from '~/components/history/SearchFilter.vue'
import { useHistoryStore } from '~/stores/history'

const historyStore = useHistoryStore()

const activeTab = ref<'history' | 'favorites'>('history')
const showDeleteConfirm = ref(false)
const itemToDelete = ref<string | null>(null)

onMounted(async () => {
  await historyStore.loadItems()
  await historyStore.loadFavorites()
})

async function handleSearch(query: string) {
  await historyStore.search(query)
}

async function handleFilterChange(type: string) {
  await historyStore.setFilter(type)
}

async function handleToggleFavorite(id: string) {
  await historyStore.toggleFavorite(id)
}

async function handleDelete(id: string) {
  itemToDelete.value = id
  showDeleteConfirm.value = true
}

async function confirmDelete() {
  if (itemToDelete.value) {
    await historyStore.removeItem(itemToDelete.value)
  }
  showDeleteConfirm.value = false
  itemToDelete.value = null
}

function cancelDelete() {
  showDeleteConfirm.value = false
  itemToDelete.value = null
}

async function handleLoadMore() {
  await historyStore.loadMore()
}

function handleViewDetail(item: HistoryItem) {
  // TODO: Navigate to detail view based on type
  console.warn('View detail:', item)
}

watch(activeTab, async (tab) => {
  if (tab === 'favorites') {
    await historyStore.loadFavorites()
  }
})
</script>

<template>
  <div class="history-view p-6 min-h-screen" style="background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);">
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-text-primary flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          历史记录
        </h1>
        <p class="text-text-secondary mt-1">
          管理和查看您的所有创作历史
        </p>
      </div>

      <!-- Tabs -->
      <div class="flex gap-2 mb-6 p-1.5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-border-light w-fit">
        <button
          type="button"
          class="px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
          :class="activeTab === 'history'
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
            : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'"
          @click="activeTab = 'history'"
        >
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            全部记录
          </span>
        </button>
        <button
          type="button"
          class="px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
          :class="activeTab === 'favorites'
            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
            : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'"
          @click="activeTab = 'favorites'"
        >
          <span class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            我的收藏
          </span>
        </button>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Main Content -->
        <div class="col-span-1" :class="[activeTab === 'favorites' ? 'lg:col-span-4' : '']">
          <!-- Search & Filter -->
          <SearchFilter
            v-if="activeTab === 'history'"
            :filter="historyStore.filter"
            :search-query="historyStore.searchQuery"
            @search="handleSearch"
            @filter-change="handleFilterChange"
          />

          <!-- History List -->
          <HistoryList
            v-if="activeTab === 'history'"
            :items="historyStore.items"
            :is-loading="historyStore.isLoading"
            :has-more="historyStore.hasMore"
            @load-more="handleLoadMore"
            @toggle-favorite="handleToggleFavorite"
            @delete="handleDelete"
            @view-detail="handleViewDetail"
          />

          <!-- Favorites Content -->
          <Favorites
            v-else
            :favorites="historyStore.favorites"
            :is-loading="historyStore.isLoading"
            @toggle-favorite="handleToggleFavorite"
            @view-detail="handleViewDetail"
          />
        </div>

        <!-- Sidebar - Stats (only on history tab) -->
        <div v-if="activeTab === 'history'" class="col-span-1">
          <div class="bg-white rounded-2xl border border-border-light p-5 sticky top-6 shadow-sm">
            <h3 class="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
                <path d="M22 12A10 10 0 0 0 12 2v10z" />
              </svg>
              统计信息
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">总记录数</span>
                <span class="text-sm font-semibold text-text-primary">{{ historyStore.totalCount }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">收藏数量</span>
                <span class="text-sm font-semibold text-yellow-500">{{ historyStore.favorites.length }}</span>
              </div>
              <div class="h-px bg-border-light my-3" />
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">语音记录</span>
                <span class="text-sm font-semibold text-purple-600">{{ historyStore.items.filter(i => i.type === 'voice').length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">图片记录</span>
                <span class="text-sm font-semibold text-emerald-600">{{ historyStore.items.filter(i => i.type === 'image').length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">视频记录</span>
                <span class="text-sm font-semibold text-red-600">{{ historyStore.items.filter(i => i.type === 'video').length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">音乐记录</span>
                <span class="text-sm font-semibold text-yellow-600">{{ historyStore.items.filter(i => i.type === 'music').length }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-text-secondary">对话记录</span>
                <span class="text-sm font-semibold text-blue-600">{{ historyStore.items.filter(i => i.type === 'chat').length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        @click.self="cancelDelete"
      >
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-border-light">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-text-primary">确认删除</h3>
              <p class="text-sm text-text-muted">此操作无法撤销</p>
            </div>
          </div>
          <p class="text-sm text-text-secondary mb-6">
            删除后将无法恢复，确定要删除这条记录吗？
          </p>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2.5 text-sm font-medium text-text-secondary bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200"
              @click="cancelDelete"
            >
              取消
            </button>
            <button
              type="button"
              class="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg hover:shadow-red-500/25 rounded-xl transition-all duration-200"
              @click="confirmDelete"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
