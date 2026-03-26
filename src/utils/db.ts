import type { HistoryItem } from '~/types'

const DB_NAME = 'minimax-history'
const DB_VERSION = 2
const STORE_NAME = 'history'
const MAX_ITEMS = 1000

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
        store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false })
      }
      else {
        const store = request.transaction!.objectStore(STORE_NAME)
        if (!store.indexNames.contains('lastAccessedAt')) {
          store.createIndex('lastAccessedAt', 'lastAccessedAt', { unique: false })
        }
      }
    }
  })
}

export async function saveHistoryItem(item: HistoryItem): Promise<void> {
  const db = await openDB()

  await enforceLimit()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)

    const itemToSave = {
      ...item,
      lastAccessedAt: Date.now(),
    }

    const request = store.put(itemToSave)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(new Error('Failed to save history item'))
  })
}

export async function getHistoryItems(
  type?: string,
  cursor?: string,
  limit = 20,
): Promise<{ items: HistoryItem[], nextCursor?: string }> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)

    const getAllRequest = store.getAll()
    getAllRequest.onsuccess = () => {
      const allItems = getAllRequest.result as HistoryItem[]

      const filteredItems = type
        ? allItems.filter(item => item.type === type)
        : allItems

      filteredItems.sort((a, b) => b.createdAt - a.createdAt)

      let startIndex = 0
      if (cursor) {
        const cursorIndex = filteredItems.findIndex(item => item.id === cursor)
        if (cursorIndex !== -1) {
          startIndex = cursorIndex + 1
        }
      }

      const paginatedItems = filteredItems.slice(startIndex, startIndex + limit)

      if (startIndex + limit < filteredItems.length) {
        const nextCursor = paginatedItems[paginatedItems.length - 1]?.id
        resolve({ items: paginatedItems, nextCursor })
      }
      else {
        resolve({ items: paginatedItems })
      }
    }

    getAllRequest.onerror = () => reject(new Error('Failed to get history items'))
  })
}

export async function searchHistory(
  query: string,
  limit = 50,
): Promise<HistoryItem[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const allItems = request.result as HistoryItem[]
      const lowerQuery = query.toLowerCase()

      const results = allItems.filter((item) => {
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

      results.sort((a, b) => b.createdAt - a.createdAt)

      resolve(results.slice(0, limit))
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
        item.lastAccessedAt = Date.now()
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

export async function getFavorites(
  cursor?: string,
  limit = 20,
): Promise<{ items: HistoryItem[], nextCursor?: string }> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const allItems = request.result as HistoryItem[]
      const favorites = allItems.filter(item => item.favorite)

      favorites.sort((a, b) => b.createdAt - a.createdAt)

      let startIndex = 0
      if (cursor) {
        const cursorIndex = favorites.findIndex(item => item.id === cursor)
        if (cursorIndex !== -1) {
          startIndex = cursorIndex + 1
        }
      }

      const paginatedItems = favorites.slice(startIndex, startIndex + limit)

      if (startIndex + limit < favorites.length) {
        const nextCursor = paginatedItems[paginatedItems.length - 1]?.id
        resolve({ items: paginatedItems, nextCursor })
      }
      else {
        resolve({ items: paginatedItems })
      }
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

async function enforceLimit(): Promise<void> {
  const count = await getHistoryCount()

  if (count >= MAX_ITEMS) {
    await evictLRUItems(count - MAX_ITEMS + 1)
  }
}

async function evictLRUItems(count: number): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('lastAccessedAt')

    const request = index.openCursor()

    let evicted = 0

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result

      if (cursor && evicted < count) {
        const item = cursor.value as HistoryItem

        if (!item.favorite) {
          cursor.delete()
          evicted++
        }

        cursor.continue()
      }
      else {
        resolve()
      }
    }

    request.onerror = () => reject(new Error('Failed to evict LRU items'))
  })
}

export async function clearMemoryCache(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}

export async function compactDatabase(): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const index = store.index('lastAccessedAt')

    const request = index.openCursor()
    const itemsToKeep: HistoryItem[] = []
    const itemsById = new Map<string, HistoryItem>()

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result

      if (cursor) {
        const item = cursor.value as HistoryItem
        itemsById.set(item.id, item)
        cursor.continue()
      }
      else {
        itemsById.forEach((item) => {
          itemsToKeep.push(item)
        })

        itemsToKeep.sort((a, b) => (b.lastAccessedAt ?? 0) - (a.lastAccessedAt ?? 0))

        const deleteTransaction = db.transaction(STORE_NAME, 'readwrite')
        const deleteStore = deleteTransaction.objectStore(STORE_NAME)
        const clearRequest = deleteStore.clear()

        clearRequest.onsuccess = () => {
          const putTransaction = db.transaction(STORE_NAME, 'readwrite')
          const putStore = putTransaction.objectStore(STORE_NAME)

          let putCount = 0
          const totalToPut = Math.min(itemsToKeep.length, MAX_ITEMS)

          itemsToKeep.slice(0, MAX_ITEMS).forEach((item) => {
            const putReq = putStore.put(item)
            putReq.onsuccess = () => {
              putCount++
              if (putCount === totalToPut) {
                resolve()
              }
            }
          })
        }

        clearRequest.onerror = () => reject(new Error('Failed to compact database'))
      }
    }

    request.onerror = () => reject(new Error('Failed to compact database'))
  })
}
