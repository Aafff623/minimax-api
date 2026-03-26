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
  <div class="history-view p-6 max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        历史记录
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        管理和查看您的所有创作历史
      </p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg w-fit">
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200" :class="[
          activeTab === 'history'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800',
        ]"
        @click="activeTab = 'history'"
      >
        全部记录
      </button>
      <button
        type="button"
        class="px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200" :class="[
          activeTab === 'favorites'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-800',
        ]"
        @click="activeTab = 'favorites'"
      >
        我的收藏
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- Main Content -->
      <div class="col-span-1" :class="[activeTab === 'favorites' ? 'lg:col-span-3' : '']">
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
        <div class="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">
            统计信息
          </h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">总记录数</span>
              <span class="text-sm font-medium text-gray-700">{{ historyStore.totalCount }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">收藏数量</span>
              <span class="text-sm font-medium text-yellow-500">{{ historyStore.favorites.length }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">语音记录</span>
              <span class="text-sm font-medium text-purple-600">
                {{ historyStore.items.filter(i => i.type === 'voice').length }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">图片记录</span>
              <span class="text-sm font-medium text-green-600">
                {{ historyStore.items.filter(i => i.type === 'image').length }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">视频记录</span>
              <span class="text-sm font-medium text-red-600">
                {{ historyStore.items.filter(i => i.type === 'video').length }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">音乐记录</span>
              <span class="text-sm font-medium text-yellow-600">
                {{ historyStore.items.filter(i => i.type === 'music').length }}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-500">对话记录</span>
              <span class="text-sm font-medium text-blue-600">
                {{ historyStore.items.filter(i => i.type === 'chat').length }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Teleport to="body">
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="cancelDelete"
      >
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            确认删除
          </h3>
          <p class="text-sm text-gray-500 mb-6">
            删除后将无法恢复，确定要删除这条记录吗？
          </p>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              @click="cancelDelete"
            >
              取消
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
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
