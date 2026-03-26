import type { ComputedRef, Ref } from 'vue'
import type { ImageRequest } from '~/types'
import { computed, ref } from 'vue'
import { createImageTask, getImageTaskStatus } from '~/api/image'
import { useImageStore } from '~/stores/image'

const POLL_INTERVAL = 3000
const MAX_POLL_ATTEMPTS = 100

export interface UseImageAsyncReturn {
  isPolling: Ref<boolean>
  currentTaskId: Ref<string | null>
  error: Ref<string | null>
  imageUrls: Ref<string[]>

  isProcessing: ComputedRef<boolean>
  progress: ComputedRef<number>

  createAndPoll: (params: ImageRequest) => Promise<string | null>
  stopPolling: () => void
  reset: () => void
}

export function useImageAsync(): UseImageAsyncReturn {
  const imageStore = useImageStore()

  const isPolling = ref(false)
  const currentTaskId = ref<string | null>(null)
  const error = ref<string | null>(null)
  const imageUrls = ref<string[]>([])

  let pollTimer: ReturnType<typeof setTimeout> | null = null
  let pollAttempts = 0

  const isProcessing = computed(() => isPolling.value)
  const progress = computed(() => {
    const task = currentTaskId.value ? imageStore.getTask(currentTaskId.value) : null
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
    imageUrls.value = []
    pollAttempts = 0
  }

  async function createAndPoll(params: ImageRequest): Promise<string | null> {
    reset()
    error.value = null

    // Step 1: Create task
    const createResult = await createImageTask(params)
    if (!createResult.success || !createResult.data) {
      error.value = createResult.error?.message || 'Failed to create image task'
      return null
    }

    const taskId = createResult.data.task_id
    currentTaskId.value = taskId
    imageStore.addTask(taskId, params.prompt)

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

    const statusResult = await getImageTaskStatus(taskId)
    if (!statusResult.success || !statusResult.data) {
      error.value = statusResult.error?.message || 'Failed to get task status'
      stopPolling()
      imageStore.updateTask(taskId, { status: 'failed', error: error.value })
      return
    }

    const { status, progress: taskProgress, image_urls } = statusResult.data

    // Update store with current progress
    imageStore.updateTask(taskId, {
      status,
      progress: taskProgress,
      imageUrls: image_urls,
    })

    // Check if task is complete
    if (status === 'success') {
      stopPolling()
      if (image_urls) {
        imageUrls.value = image_urls
      }
      return
    }

    if (status === 'failed') {
      stopPolling()
      error.value = 'Task processing failed'
      imageStore.updateTask(taskId, { status: 'failed', error: error.value })
      return
    }

    // Continue polling if not max attempts
    if (pollAttempts < MAX_POLL_ATTEMPTS) {
      pollTimer = setTimeout(() => pollStatus(taskId), POLL_INTERVAL)
    }
    else {
      stopPolling()
      error.value = 'Polling timeout - please try again later'
      imageStore.updateTask(taskId, { status: 'failed', error: error.value })
    }
  }

  return {
    isPolling,
    currentTaskId,
    error,
    imageUrls,
    isProcessing,
    progress,
    createAndPoll,
    stopPolling,
    reset,
  }
}
