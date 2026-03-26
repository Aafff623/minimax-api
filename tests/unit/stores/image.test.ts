import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useImageStore } from '@/stores/image'

describe('image Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('addTask', () => {
    it('should add a new task', () => {
      const store = useImageStore()
      const taskId = 'task-123'

      store.addTask(taskId, 'A beautiful sunset')

      expect(store.tasks[taskId]).toBeDefined()
      expect(store.tasks[taskId].taskId).toBe(taskId)
      expect(store.tasks[taskId].status).toBe('pending')
      expect(store.tasks[taskId].prompt).toBe('A beautiful sunset')
      expect(store.tasks[taskId].createdAt).toBeDefined()
    })

    it('should create task with optional prompt', () => {
      const store = useImageStore()
      const taskId = 'task-456'

      store.addTask(taskId)

      expect(store.tasks[taskId].taskId).toBe(taskId)
      expect(store.tasks[taskId].prompt).toBeUndefined()
    })
  })

  describe('updateTask', () => {
    it('should update task status', () => {
      const store = useImageStore()
      const taskId = 'task-123'
      store.addTask(taskId)

      store.updateTask(taskId, { status: 'processing', progress: 50 })

      expect(store.tasks[taskId].status).toBe('processing')
      expect(store.tasks[taskId].progress).toBe(50)
    })

    it('should update task with success status and image URLs', () => {
      const store = useImageStore()
      const taskId = 'task-456'
      store.addTask(taskId)

      const imageUrls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]
      store.updateTask(taskId, { status: 'success', imageUrls })

      expect(store.tasks[taskId].status).toBe('success')
      expect(store.tasks[taskId].imageUrls).toEqual(imageUrls)
    })

    it('should add successful image URLs to gallery', () => {
      const store = useImageStore()
      const taskId = 'task-789'
      store.addTask(taskId)

      const imageUrls = ['https://example.com/new-image.jpg']
      store.updateTask(taskId, { status: 'success', imageUrls })

      expect(store.gallery).toContain('https://example.com/new-image.jpg')
    })

    it('should update task with error', () => {
      const store = useImageStore()
      const taskId = 'task-error'
      store.addTask(taskId)

      store.updateTask(taskId, { status: 'failed', error: 'Generation failed' })

      expect(store.tasks[taskId].status).toBe('failed')
      expect(store.tasks[taskId].error).toBe('Generation failed')
    })

    it('should not update non-existent task', () => {
      const store = useImageStore()

      store.updateTask('nonexistent', { status: 'success' })

      expect(Object.keys(store.tasks)).toHaveLength(0)
    })
  })

  describe('removeTask', () => {
    it('should remove existing task', () => {
      const store = useImageStore()
      const taskId = 'task-123'
      store.addTask(taskId)

      store.removeTask(taskId)

      expect(store.tasks[taskId]).toBeUndefined()
    })
  })

  describe('getTask', () => {
    it('should return task by ID', () => {
      const store = useImageStore()
      const taskId = 'task-123'
      store.addTask(taskId, 'Test prompt')

      const task = store.getTask(taskId)

      expect(task).toBeDefined()
      expect(task?.taskId).toBe(taskId)
      expect(task?.prompt).toBe('Test prompt')
    })

    it('should return undefined for non-existent task', () => {
      const store = useImageStore()

      const task = store.getTask('nonexistent')

      expect(task).toBeUndefined()
    })
  })

  describe('gallery management', () => {
    it('should add URLs to gallery', () => {
      const store = useImageStore()
      const urls = [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ]

      store.addToGallery(urls)

      expect(store.gallery).toHaveLength(2)
      expect(store.gallery[0]).toBe('https://example.com/image1.jpg')
      expect(store.gallery[1]).toBe('https://example.com/image2.jpg')
    })

    it('should prepend new gallery items', () => {
      const store = useImageStore()
      store.addToGallery(['https://example.com/first.jpg'])

      store.addToGallery(['https://example.com/second.jpg'])

      expect(store.gallery[0]).toBe('https://example.com/second.jpg')
    })

    it('should remove URL from gallery', () => {
      const store = useImageStore()
      store.addToGallery([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ])

      store.removeFromGallery('https://example.com/image1.jpg')

      expect(store.gallery).toHaveLength(1)
      expect(store.gallery[0]).toBe('https://example.com/image2.jpg')
    })

    it('should handle removing non-existent URL gracefully', () => {
      const store = useImageStore()
      store.addToGallery(['https://example.com/image1.jpg'])

      store.removeFromGallery('https://example.com/nonexistent.jpg')

      expect(store.gallery).toHaveLength(1)
    })

    it('should clear gallery', () => {
      const store = useImageStore()
      store.addToGallery([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
      ])

      store.clearGallery()

      expect(store.gallery).toHaveLength(0)
    })
  })
})
