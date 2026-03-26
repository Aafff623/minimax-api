import type { HistoryItem } from '~/types'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  deleteHistoryItem,
  getFavorites,
  getHistoryCount,
  getHistoryItems,
  saveHistoryItem,
  searchHistory,
  toggleFavorite as toggleFavoriteDb,
} from '~/utils/db'

export const useHistoryStore = defineStore('history', () => {
  // State
  const items = ref<HistoryItem[]>([])
  const favorites = ref<HistoryItem[]>([])
  const searchQuery = ref('')
  const filter = ref<string>('')
  const isLoading = ref(false)
  const currentPage = ref(1)
  const totalCount = ref(0)
  const hasMore = ref(true)

  // Getters
  const filteredItems = computed(() => {
    if (!filter.value)
      return items.value
    return items.value.filter(item => item.type === filter.value)
  })

  // Actions
  async function loadItems(type?: string, page: number = 1, append: boolean = false) {
    isLoading.value = true
    try {
      const newItems = await getHistoryItems(type, page)

      if (append) {
        items.value.push(...newItems)
      }
      else {
        items.value = newItems
      }

      currentPage.value = page
      hasMore.value = newItems.length >= 20

      totalCount.value = await getHistoryCount(type)
    }
    finally {
      isLoading.value = false
    }
  }

  async function loadMore() {
    if (isLoading.value || !hasMore.value)
      return
    await loadItems(filter.value || undefined, currentPage.value + 1, true)
  }

  async function search(query: string) {
    searchQuery.value = query
    if (!query.trim()) {
      await loadItems(filter.value || undefined)
      return
    }

    isLoading.value = true
    try {
      items.value = await searchHistory(query)
      hasMore.value = false
    }
    finally {
      isLoading.value = false
    }
  }

  async function setFilter(type: string) {
    filter.value = type
    searchQuery.value = ''
    currentPage.value = 1
    await loadItems(type || undefined)
  }

  async function addItem(item: HistoryItem) {
    await saveHistoryItem(item)

    // Add to beginning of list
    items.value = [item, ...items.value]
    totalCount.value++

    // Update favorites if needed
    if (item.favorite) {
      favorites.value = [item, ...favorites.value]
    }
  }

  async function toggleFavorite(id: string) {
    await toggleFavoriteDb(id)

    const item = items.value.find(i => i.id === id)
    if (item) {
      item.favorite = !item.favorite

      if (item.favorite) {
        favorites.value = [item, ...favorites.value]
      }
      else {
        favorites.value = favorites.value.filter(f => f.id !== id)
      }
    }
  }

  async function removeItem(id: string) {
    await deleteHistoryItem(id)

    const item = items.value.find(i => i.id === id)
    if (item) {
      items.value = items.value.filter(i => i.id !== id)
      favorites.value = favorites.value.filter(f => f.id !== id)
      totalCount.value--
    }
  }

  async function loadFavorites() {
    favorites.value = await getFavorites()
  }

  async function refresh() {
    if (searchQuery.value) {
      await search(searchQuery.value)
    }
    else {
      await loadItems(filter.value || undefined)
    }
    await loadFavorites()
  }

  return {
    // State
    items,
    favorites,
    searchQuery,
    filter,
    isLoading,
    currentPage,
    totalCount,
    hasMore,
    // Getters
    filteredItems,
    // Actions
    loadItems,
    loadMore,
    search,
    setFilter,
    addItem,
    toggleFavorite,
    removeItem,
    loadFavorites,
    refresh,
  }
})
