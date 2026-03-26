import type { ComputedRef, Ref } from 'vue'
import type { VideoRequest } from '~/types'
import { computed, ref } from 'vue'
import { createVideoTask, getVideoTaskStatus } from '~/api/video'
import { useVideoStore } from '~/stores/video'

// Polling interval in ms - 5000ms as specified
const POLL_INTERVAL = 5000
// Max polling attempts before giving up
const MAX_POLL_ATTEMPTS = 120

export interface UseVideoAsyncReturn {
  // State
  isPolling: Ref<boolean>
  currentTaskId: Ref<string | null>
  error: Ref<string | null>
  videoUrl: Ref<string | null>

  // Computed
  isProcessing: ComputedRef<boolean>
  progress: ComputedRef<number>

  // Actions
  createAndPoll: (params: VideoRequest) => Promise<string | null>
  stopPolling: () => void
  reset: () => void
}

export function useVideoAsync(): UseVideoAsyncReturn {
  const videoStore = useVideoStore()

  const isPolling = ref(false)
  const currentTaskId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const videoUrl = ref<string | null>(null)

  let pollTimer: ReturnType<typeof setTimeout> | null = null
  let pollAttempts = 0

  const isProcessing = computed(() => isPolling.value)
  const progress = computed(() => {
    const task = currentTaskId.value ? videoStore.getTask(currentTaskId.value) : null
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
    videoUrl.value = null
    pollAttempts = 0
  }

  async function createAndPoll(params: VideoRequest): Promise<string | null> {
    reset()
    error.value = null

    // Step 1: Create task
    const createResult = await createVideoTask(params)
    if (!createResult.success || !createResult.data) {
      error.value = createResult.error?.message || 'Failed to create video task'
      return null
    }

    const taskId = createResult.data.task_id
    currentTaskId.value = taskId
    videoStore.addTask(taskId, params.prompt)

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

    const statusResult = await getVideoTaskStatus(taskId)
    if (!statusResult.success || !statusResult.data) {
      error.value = statusResult.error?.message || 'Failed to get task status'
      stopPolling()
      videoStore.updateTask(taskId, { status: 'failed', error: error.value })
      return
    }

    const { status, progress: taskProgress } = statusResult.data

    // Update store with current progress
    videoStore.updateTask(taskId, {
      status,
      progress: taskProgress,
    })

    // Check if task is complete
    if (status === 'success') {
      stopPolling()
      await fetchVideoUrl(taskId, statusResult.data.video_url)
      return
    }

    if (status === 'failed') {
      stopPolling()
      error.value = 'Task processing failed'
      videoStore.updateTask(taskId, { status: 'failed', error: error.value })
      return
    }

    // Continue polling if not max attempts
    if (pollAttempts < MAX_POLL_ATTEMPTS) {
      pollTimer = setTimeout(() => pollStatus(taskId), POLL_INTERVAL)
    }
    else {
      stopPolling()
      error.value = 'Polling timeout - please try again later'
      videoStore.updateTask(taskId, { status: 'failed', error: error.value })
    }
  }

  async function fetchVideoUrl(taskId: string, videoUrlFromStatus?: string) {
    // If video_url is directly returned in status response, use it
    if (videoUrlFromStatus) {
      videoUrl.value = videoUrlFromStatus
      videoStore.updateTask(taskId, { status: 'success', videoUrl: videoUrlFromStatus })
      return
    }

    // Otherwise, need to fetch file info (this would require file_id from task status)
    error.value = 'Video URL not available'
    videoStore.updateTask(taskId, { status: 'failed', error: error.value })
  }

  return {
    isPolling,
    currentTaskId,
    error,
    videoUrl,
    isProcessing,
    progress,
    createAndPoll,
    stopPolling,
    reset,
  }
}
