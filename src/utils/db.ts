import type { HistoryItem } from '~/types'

const DB_NAME = 'minimax-history'
const DB_VERSION = 1
const STORE_NAME = 'history'

let dbInstance: IDBDatabase | null = null

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance)
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('type', 'type', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('favorite', 'favorite', { unique: false })
      }
    }
  })
}

export async function saveHistoryItem(item: HistoryItem): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.put(item)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to save history item'))
  })
}

export async function getHistoryItems(
  type?: string,
  page: number = 1,
  pageSize: number = 20,
): Promise<HistoryItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const items: HistoryItem[] = []

    let request: IDBRequest

    if (type) {
      const index = store.index('type')
      request = index.getAll(type)
    }
    else {
      request = store.getAll()
    }

    request.onsuccess = () => {
      const allItems = request.result as HistoryItem[]

      // Sort by createdAt descending
      allItems.sort((a, b) => b.createdAt - a.createdAt)

      // Paginate
      const start = (page - 1) * pageSize
      const end = start + pageSize
      items.push(...allItems.slice(start, end))

      resolve(items)
    }

    request.onerror = () => reject(new Error('Failed to get history items'))
  })
}

export async function searchHistory(query: string): Promise<HistoryItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const allItems = request.result as HistoryItem[]
      const lowerQuery = query.toLowerCase()

      const results = allItems.filter((item) => {
        // Search in data based on type
        if (item.type === 'voice' && item.data?.text) {
          return item.data.text.toLowerCase().includes(lowerQuery)
        }
        if (item.type === 'image' && item.data?.prompt) {
          return item.data.prompt.toLowerCase().includes(lowerQuery)
        }
        if (item.type === 'video' && item.data?.prompt) {
          return item.data.prompt.toLowerCase().includes(lowerQuery)
        }
        if (item.type === 'music' && item.data?.lyrics) {
          return item.data.lyrics.toLowerCase().includes(lowerQuery)
        }
        if (item.type === 'chat' && item.data?.messages) {
          return item.data.messages.some(
            (m: { content: string }) => m.content.toLowerCase().includes(lowerQuery),
          )
        }
        return false
      })

      // Sort by createdAt descending
      results.sort((a, b) => b.createdAt - a.createdAt)

      resolve(results)
    }

    request.onerror = () => reject(new Error('Failed to search history'))
  })
}

export async function toggleFavorite(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const getRequest = store.get(id)

    getRequest.onsuccess = () => {
      const item = getRequest.result as HistoryItem
      if (item) {
        item.favorite = !item.favorite
        const putRequest = store.put(item)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(new Error('Failed to update favorite'))
      }
      else {
        reject(new Error('Item not found'))
      }
    }

    getRequest.onerror = () => reject(new Error('Failed to get item'))
  })
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to delete history item'))
  })
}

export async function getFavorites(): Promise<HistoryItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const allItems = request.result as HistoryItem[]
      const favorites = allItems.filter(item => item.favorite)

      // Sort by createdAt descending
      favorites.sort((a, b) => b.createdAt - a.createdAt)

      resolve(favorites)
    }

    request.onerror = () => reject(new Error('Failed to get favorites'))
  })
}

export async function getHistoryCount(type?: string): Promise<number> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    if (type) {
      const index = store.index('type')
      const request = index.count(type)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to count items'))
    }
    else {
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Failed to count items'))
    }
  })
}
