import type { ComputedRef, Ref } from 'vue'
import type { MusicRequest } from '~/types'
import { computed, ref } from 'vue'
import { createMusicTask, getMusicTaskStatus } from '~/api/music'
import { useMusicStore } from '~/stores/music'

// Polling interval in ms - 3000ms as specified
const POLL_INTERVAL = 3000
// Max polling attempts before giving up
const MAX_POLL_ATTEMPTS = 100

export interface UseMusicAsyncReturn {
  // State
  isPolling: Ref<boolean>
  currentTaskId: Ref<string | null>
  error: Ref<string | null>
  musicUrl: Ref<string | null>

  // Computed
  isProcessing: ComputedRef<boolean>
  progress: ComputedRef<number>

  // Actions
  createAndPoll: (params: MusicRequest) => Promise<string | null>
  stopPolling: () => void
  reset: () => void
}

export function useMusicAsync(): UseMusicAsyncReturn {
  const musicStore = useMusicStore()

  const isPolling = ref(false)
  const currentTaskId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const musicUrl = ref<string | null>(null)

  let pollTimer: ReturnType<typeof setTimeout> | null = null
  let pollAttempts = 0

  const isProcessing = computed(() => isPolling.value)
  const progress = computed(() => {
    const task = currentTaskId.value ? musicStore.getTask(currentTaskId.value) : null
    return task?.progress ?? 0
  })

  function stopPolling() {
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
    isPolling.value = false
  }

  function reset() {
    stopPolling()
    currentTaskId.value = null
    error.value = null
    musicUrl.value = null
    pollAttempts = 0
  }

  async function createAndPoll(params: MusicRequest): Promise<string | null> {
    reset()
    error.value = null

    // Step 1: Create task
    const createResult = await createMusicTask(params)
    if (!createResult.success || !createResult.data) {
      error.value = createResult.error?.message || 'Failed to create music task'
      return null
    }

    const taskId = createResult.data.task_id
    currentTaskId.value = taskId
    musicStore.addTask(taskId, params.lyrics)

    // Step 2: Start polling
    isPolling.value = true
    pollAttempts = 0
    await pollStatus(taskId)

    return taskId
  }

  async function pollStatus(taskId: string) {
    if (!isPolling.value)
      return

    pollAttempts++

    const statusResult = await getMusicTaskStatus(taskId)
    if (!statusResult.success || !statusResult.data) {
      error.value = statusResult.error?.message || 'Failed to get task status'
      stopPolling()
      musicStore.updateTask(taskId, { status: 'failed', error: error.value })
      return
    }

    const { status } = statusResult.data

    // Update store with current status
    musicStore.updateTask(taskId, {
      status: status as 'pending' | 'processing' | 'success' | 'failed',
    })

    // Check if task is complete
    if (status === 'success') {
      stopPolling()
      const url = statusResult.data.music_url || null
      musicUrl.value = url
      musicStore.updateTask(taskId, { status: 'success', musicUrl: url || undefined })
      musicStore.setCurrentMusic(url)
      return
    }

    if (status === 'failed') {
      stopPolling()
      error.value = 'Task processing failed'
      musicStore.updateTask(taskId, { status: 'failed', error: error.value })
      return
    }

    // Continue polling if not max attempts
    if (pollAttempts < MAX_POLL_ATTEMPTS) {
      pollTimer = setTimeout(() => pollStatus(taskId), POLL_INTERVAL)
    }
    else {
      stopPolling()
      error.value = 'Polling timeout - please try again later'
      musicStore.updateTask(taskId, { status: 'failed', error: error.value })
    }
  }

  return {
    isPolling,
    currentTaskId,
    error,
    musicUrl,
    isProcessing,
    progress,
    createAndPoll,
    stopPolling,
    reset,
  }
}
