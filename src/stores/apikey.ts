import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const API_KEY_STORAGE_KEY = 'minimax-api-key'
const API_KEY_GROUP_STORAGE_KEY = 'minimax-api-key-group'

export interface ApiKeyGroup {
  id: string
  name: string
  apiKey: string
  isActive: boolean
}

export const useApiKeyStore = defineStore('apikey', () => {
  // Single API key (legacy support)
  const apiKey = ref<string>(loadApiKey())

  // Multiple API key groups (for different modules)
  const apiKeyGroups = ref<ApiKeyGroup[]>(loadApiKeyGroups())

  // Computed: get active API key
  const activeApiKey = computed(() => {
    // First check for active group key
    const activeGroup = apiKeyGroups.value.find(g => g.isActive)
    if (activeGroup?.apiKey) {
      return activeGroup.apiKey
    }
    // Fallback to legacy single key
    return apiKey.value
  })

  // Computed: check if API key is configured
  const isConfigured = computed(() => {
    return !!activeApiKey.value && activeApiKey.value.length > 0
  })

  // Computed: mask API key for display
  const maskedApiKey = computed(() => {
    const key = activeApiKey.value
    if (!key)
      return ''
    if (key.length <= 8)
      return '****'
    return `${key.slice(0, 4)}...${key.slice(-4)}`
  })

  // Load from localStorage
  function loadApiKey(): string {
    try {
      return localStorage.getItem(API_KEY_STORAGE_KEY) || ''
    }
    catch {
      return ''
    }
  }

  function loadApiKeyGroups(): ApiKeyGroup[] {
    try {
      const stored = localStorage.getItem(API_KEY_GROUP_STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    }
    catch {
      return []
    }
  }

  // Save to localStorage
  function saveApiKey(key: string) {
    try {
      localStorage.setItem(API_KEY_STORAGE_KEY, key)
      apiKey.value = key
    }
    catch {
      // Ignore storage errors
    }
  }

  function saveApiKeyGroups(groups: ApiKeyGroup[]) {
    try {
      localStorage.setItem(API_KEY_GROUP_STORAGE_KEY, JSON.stringify(groups))
      apiKeyGroups.value = groups
    }
    catch {
      // Ignore storage errors
    }
  }

  // Set single API key (legacy)
  function setApiKey(key: string) {
    // Clear all active flags if setting single key
    apiKeyGroups.value.forEach((g) => {
      g.isActive = false
    })
    saveApiKey(key)
    saveApiKeyGroups(apiKeyGroups.value)
  }

  // Add a new API key group
  function addApiKeyGroup(group: Omit<ApiKeyGroup, 'id'>) {
    const newGroup: ApiKeyGroup = {
      ...group,
      id: `group-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    }
    apiKeyGroups.value.push(newGroup)
    saveApiKeyGroups(apiKeyGroups.value)
    return newGroup
  }

  // Update API key group
  function updateApiKeyGroup(id: string, updates: Partial<Omit<ApiKeyGroup, 'id'>>) {
    const index = apiKeyGroups.value.findIndex(g => g.id === id)
    if (index > -1) {
      apiKeyGroups.value[index] = { ...apiKeyGroups.value[index], ...updates }
      saveApiKeyGroups(apiKeyGroups.value)
    }
  }

  // Remove API key group
  function removeApiKeyGroup(id: string) {
    const index = apiKeyGroups.value.findIndex(g => g.id === id)
    if (index > -1) {
      apiKeyGroups.value.splice(index, 1)
      saveApiKeyGroups(apiKeyGroups.value)
    }
  }

  // Set active group
  function setActiveGroup(id: string) {
    apiKeyGroups.value.forEach((g) => {
      g.isActive = g.id === id
    })
    saveApiKeyGroups(apiKeyGroups.value)
  }

  // Clear all API keys
  function clearAll() {
    apiKey.value = ''
    apiKeyGroups.value = []
    localStorage.removeItem(API_KEY_STORAGE_KEY)
    localStorage.removeItem(API_KEY_GROUP_STORAGE_KEY)
  }

  return {
    // State
    apiKey,
    apiKeyGroups,
    // Computed
    activeApiKey,
    isConfigured,
    maskedApiKey,
    // Actions
    setApiKey,
    addApiKeyGroup,
    updateApiKeyGroup,
    removeApiKeyGroup,
    setActiveGroup,
    clearAll,
  }
})
