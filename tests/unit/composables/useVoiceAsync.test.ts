import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createVoiceTask, getAudioFile, getVoiceTaskStatus } from '@/api/voice'
import { useVoiceAsync } from '@/composables/useVoiceAsync'

// Mock the API modules
vi.mock('@/api/voice', () => ({
  createVoiceTask: vi.fn(),
  getVoiceTaskStatus: vi.fn(),
  getAudioFile: vi.fn(),
}))

// Mock the voice store
vi.mock('@/stores/voice', () => ({
  useVoiceStore: () => ({
    addTask: vi.fn(),
    updateTask: vi.fn(),
    getTask: vi.fn(),
  }),
}))

describe('useVoiceAsync Composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    setActivePinia(createPinia())
  })

  describe('initial state', () => {
    it('should initialize with correct default values', () => {
      const { isPolling, currentTaskId, error, audioUrl } = useVoiceAsync()

      expect(isPolling.value).toBe(false)
      expect(currentTaskId.value).toBeNull()
      expect(error.value).toBeNull()
      expect(audioUrl.value).toBeNull()
    })

    it('should have correct computed values', () => {
      const { isProcessing, progress } = useVoiceAsync()

      expect(isProcessing.value).toBe(false)
      expect(progress.value).toBe(0)
    })
  })

  describe('createAndPoll', () => {
    it('should create task and return taskId on success', async () => {
      const mockCreateResponse = {
        success: true,
        data: { task_id: 'task-123', status: 'pending' },
      }
      ;(createVoiceTask as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreateResponse)

      const mockStatusResponse = {
        success: true,
        data: { task_id: 'task-123', status: 'success', file_id: 'file-abc' },
      }
      ;(getVoiceTaskStatus as ReturnType<typeof vi.fn>).mockResolvedValue(mockStatusResponse)

      const mockFileResponse = {
        success: true,
        data: { file_id: 'file-abc', url: 'https://example.com/audio.mp3' },
      }
      ;(getAudioFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileResponse)

      const { createAndPoll } = useVoiceAsync()

      const taskId = await createAndPoll({
        model: 'speech-2.8-hd',
        text: 'Hello world',
      })

      expect(taskId).toBe('task-123')
      expect(createVoiceTask).toHaveBeenCalledWith({
        model: 'speech-2.8-hd',
        text: 'Hello world',
      })
    })

    it('should return null and set error when create fails', async () => {
      const mockCreateResponse = {
        success: false,
        error: { code: 'FAILED', message: 'Creation failed' },
      }
      ;(createVoiceTask as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreateResponse)

      const { createAndPoll, error } = useVoiceAsync()

      const taskId = await createAndPoll({
        model: 'speech-2.8-hd',
        text: 'Hello world',
      })

      expect(taskId).toBeNull()
      expect(error.value).toBe('Creation failed')
    })
  })

  describe('stopPolling', () => {
    it('should stop polling and reset isPolling to false', async () => {
      const mockCreateResponse = {
        success: true,
        data: { task_id: 'task-123', status: 'pending' },
      }
      ;(createVoiceTask as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreateResponse)

      const { createAndPoll, stopPolling, isPolling } = useVoiceAsync()

      // Create a task first
      await createAndPoll({
        model: 'speech-2.8-hd',
        text: 'Hello world',
      })

      // Stop polling
      stopPolling()

      expect(isPolling.value).toBe(false)
    })
  })

  describe('reset', () => {
    it('should reset all state to initial values', async () => {
      const mockCreateResponse = {
        success: true,
        data: { task_id: 'task-123', status: 'pending' },
      }
      ;(createVoiceTask as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreateResponse)

      const { createAndPoll, reset, isPolling, currentTaskId, error, audioUrl } = useVoiceAsync()

      await createAndPoll({
        model: 'speech-2.8-hd',
        text: 'Hello world',
      })

      reset()

      expect(isPolling.value).toBe(false)
      expect(currentTaskId.value).toBeNull()
      expect(error.value).toBeNull()
      expect(audioUrl.value).toBeNull()
    })
  })

  describe('polling logic', () => {
    it('should set audioUrl when task succeeds', async () => {
      const mockCreateResponse = {
        success: true,
        data: { task_id: 'task-success', status: 'pending' },
      }
      ;(createVoiceTask as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreateResponse)

      const mockStatusResponse = {
        success: true,
        data: { task_id: 'task-success', status: 'success', file_id: 'file-123' },
      }
      ;(getVoiceTaskStatus as ReturnType<typeof vi.fn>).mockResolvedValue(mockStatusResponse)

      const mockFileResponse = {
        success: true,
        data: { file_id: 'file-123', url: 'https://example.com/audio.mp3' },
      }
      ;(getAudioFile as ReturnType<typeof vi.fn>).mockResolvedValue(mockFileResponse)

      const { createAndPoll, audioUrl } = useVoiceAsync()

      await createAndPoll({
        model: 'speech-2.8-hd',
        text: 'Hello',
      })

      expect(audioUrl.value).toBe('https://example.com/audio.mp3')
    })

    it('should set error when task fails', async () => {
      const mockCreateResponse = {
        success: true,
        data: { task_id: 'task-fail', status: 'pending' },
      }
      ;(createVoiceTask as ReturnType<typeof vi.fn>).mockResolvedValue(mockCreateResponse)

      const mockStatusResponse = {
        success: true,
        data: { task_id: 'task-fail', status: 'failed' },
      }
      ;(getVoiceTaskStatus as ReturnType<typeof vi.fn>).mockResolvedValue(mockStatusResponse)

      const { createAndPoll, error } = useVoiceAsync()

      await createAndPoll({
        model: 'speech-2.8-hd',
        text: 'Hello',
      })

      expect(error.value).toBe('Task processing failed')
    })
  })
})
