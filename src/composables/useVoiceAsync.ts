import type { VoiceAsyncRequest } from '~/types'
import { computed, ref } from 'vue'
import { createVoiceTask, getAudioFile, getVoiceTaskStatus } from '~/api/voice'
import { useVoiceStore } from '~/stores/voice'

// Polling interval in ms
const POLL_INTERVAL = 2000
// Max polling attempts before giving up
const MAX_POLL_ATTEMPTS = 150

export interface UseVoiceAsyncReturn {
  // State
  isPolling: boolean
  currentTaskId: string | null
  error: string | null
  audioUrl: string | null

  // Computed
  isProcessing: computed<boolean>
  progress: computed<number>

  // Actions
  createAndPoll: (params: VoiceAsyncRequest) => Promise<string | null>
  stopPolling: () => void
  reset: () => void
}

export function useVoiceAsync(): UseVoiceAsyncReturn {
  const voiceStore = useVoiceStore()

  const isPolling = ref(false)
  const currentTaskId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const audioUrl = ref<string | null>(null)

  let pollTimer: ReturnType<typeof setTimeout> | null = null
  let pollAttempts = 0

  const isProcessing = computed(() => isPolling.value)
  const progress = computed(() => {
    const task = currentTaskId.value ? voiceStore.getTask(currentTaskId.value) : null
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
    audioUrl.value = null
    pollAttempts = 0
  }

  async function createAndPoll(params: VoiceAsyncRequest): Promise<string | null> {
    reset()
    error.value = null

    // Step 1: Create task
    const createResult = await createVoiceTask(params)
    if (!createResult.success || !createResult.data) {
      error.value = createResult.error?.message || 'Failed to create voice task'
      return null
    }

    const taskId = createResult.data.task_id
    currentTaskId.value = taskId
    voiceStore.addTask(taskId)

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

    const statusResult = await getVoiceTaskStatus(taskId)
    if (!statusResult.success || !statusResult.data) {
      error.value = statusResult.error?.message || 'Failed to get task status'
      stopPolling()
      voiceStore.updateTask(taskId, { status: 'failed', error: error.value })
      return
    }

    const { status, progress: taskProgress } = statusResult.data

    // Update store with current progress
    voiceStore.updateTask(taskId, {
      status,
      progress: taskProgress,
    })

    // Check if task is complete
    if (status === 'success') {
      stopPolling()
      await fetchAudioUrl(taskId, statusResult.data.file_id)
      return
    }

    if (status === 'failed') {
      stopPolling()
      error.value = 'Task processing failed'
      voiceStore.updateTask(taskId, { status: 'failed', error: error.value })
      return
    }

    // Continue polling if not max attempts
    if (pollAttempts < MAX_POLL_ATTEMPTS) {
      pollTimer = setTimeout(() => pollStatus(taskId), POLL_INTERVAL)
    }
    else {
      stopPolling()
      error.value = 'Polling timeout - please try again later'
      voiceStore.updateTask(taskId, { status: 'failed', error: error.value })
    }
  }

  async function fetchAudioUrl(taskId: string, fileId?: string) {
    if (!fileId) {
      error.value = 'No file_id returned from task'
      voiceStore.updateTask(taskId, { status: 'failed', error: error.value })
      return
    }

    const fileResult = await getAudioFile(fileId)
    if (!fileResult.success || !fileResult.data) {
      error.value = fileResult.error?.message || 'Failed to get audio file'
      voiceStore.updateTask(taskId, { status: 'failed', error: error.value })
      return
    }

    const url = fileResult.data.url
    audioUrl.value = url
    voiceStore.updateTask(taskId, { status: 'success', audioUrl: url })
  }

  return {
    isPolling,
    currentTaskId,
    error,
    audioUrl,
    isProcessing,
    progress,
    createAndPoll,
    stopPolling,
    reset,
  }
}
