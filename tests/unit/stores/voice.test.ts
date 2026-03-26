import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useVoiceStore } from '@/stores/voice'

describe('voice Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addTask', () => {
    it('should add a new task', () => {
      const store = useVoiceStore()
      const taskId = 'task-123'

      store.addTask(taskId)

      expect(store.asyncTasks[taskId]).toBeDefined()
      expect(store.asyncTasks[taskId].taskId).toBe(taskId)
      expect(store.asyncTasks[taskId].status).toBe('pending')
      expect(store.asyncTasks[taskId].createdAt).toBeDefined()
    })

    it('should create task with correct initial state', () => {
      const store = useVoiceStore()
      const taskId = 'task-456'

      store.addTask(taskId)

      const task = store.asyncTasks[taskId]
      expect(task.status).toBe('pending')
      expect(task.audioUrl).toBeUndefined()
      expect(task.progress).toBeUndefined()
      expect(task.error).toBeUndefined()
    })
  })

  describe('updateTask', () => {
    it('should update task status', () => {
      const store = useVoiceStore()
      const taskId = 'task-123'
      store.addTask(taskId)

      store.updateTask(taskId, { status: 'processing', progress: 50 })

      expect(store.asyncTasks[taskId].status).toBe('processing')
      expect(store.asyncTasks[taskId].progress).toBe(50)
    })

    it('should update task with success status and audio URL', () => {
      const store = useVoiceStore()
      const taskId = 'task-456'
      store.addTask(taskId)

      const audioUrl = 'https://example.com/audio.mp3'
      store.updateTask(taskId, { status: 'success', audioUrl })

      expect(store.asyncTasks[taskId].status).toBe('success')
      expect(store.asyncTasks[taskId].audioUrl).toBe(audioUrl)
    })

    it('should update task with error', () => {
      const store = useVoiceStore()
      const taskId = 'task-789'
      store.addTask(taskId)

      const errorMsg = 'Something went wrong'
      store.updateTask(taskId, { status: 'failed', error: errorMsg })

      expect(store.asyncTasks[taskId].status).toBe('failed')
      expect(store.asyncTasks[taskId].error).toBe(errorMsg)
    })

    it('should not update non-existent task', () => {
      const store = useVoiceStore()

      store.updateTask('nonexistent', { status: 'success' })

      expect(Object.keys(store.asyncTasks)).toHaveLength(0)
    })
  })

  describe('removeTask', () => {
    it('should remove existing task', () => {
      const store = useVoiceStore()
      const taskId = 'task-123'
      store.addTask(taskId)

      store.removeTask(taskId)

      expect(store.asyncTasks[taskId]).toBeUndefined()
    })

    it('should handle removing non-existent task gracefully', () => {
      const store = useVoiceStore()

      expect(() => store.removeTask('nonexistent')).not.toThrow()
    })
  })

  describe('getTask', () => {
    it('should return task by ID', () => {
      const store = useVoiceStore()
      const taskId = 'task-123'
      store.addTask(taskId)

      const task = store.getTask(taskId)

      expect(task).toBeDefined()
      expect(task?.taskId).toBe(taskId)
    })

    it('should return undefined for non-existent task', () => {
      const store = useVoiceStore()

      const task = store.getTask('nonexistent')

      expect(task).toBeUndefined()
    })
  })

  describe('task lifecycle', () => {
    it('should track complete task lifecycle', () => {
      const store = useVoiceStore()
      const taskId = 'lifecycle-task'

      // Add task
      store.addTask(taskId)
      expect(store.getTask(taskId)?.status).toBe('pending')

      // Update to processing
      store.updateTask(taskId, { status: 'processing', progress: 25 })
      expect(store.getTask(taskId)?.status).toBe('processing')
      expect(store.getTask(taskId)?.progress).toBe(25)

      // Continue processing
      store.updateTask(taskId, { status: 'processing', progress: 75 })
      expect(store.getTask(taskId)?.progress).toBe(75)

      // Complete task
      store.updateTask(taskId, {
        status: 'success',
        progress: 100,
        audioUrl: 'https://example.com/final.mp3',
      })
      expect(store.getTask(taskId)?.status).toBe('success')
      expect(store.getTask(taskId)?.audioUrl).toBe('https://example.com/final.mp3')
    })

    it('should track failed task lifecycle', () => {
      const store = useVoiceStore()
      const taskId = 'failed-task'

      store.addTask(taskId)
      store.updateTask(taskId, { status: 'processing', progress: 50 })
      store.updateTask(taskId, { status: 'failed', error: 'Processing error' })

      expect(store.getTask(taskId)?.status).toBe('failed')
      expect(store.getTask(taskId)?.error).toBe('Processing error')
    })
  })
})
