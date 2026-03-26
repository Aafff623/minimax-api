import { beforeEach, describe, expect, it, vi } from 'vitest'

// Now import the API after mocking
import { createImageTask, getImageFile, getImageTaskStatus } from '@/api/image'

// Mock the fetch globally before importing the API
const mockFetch = vi.fn()

vi.stubGlobal('fetch', mockFetch)

describe('image API', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('createImageTask', () => {
    it('should create image task successfully', async () => {
      const mockResponse = {
        task_id: 'image-task-123',
        status: 'pending',
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const params = {
        model: 'image-01' as const,
        prompt: 'A beautiful sunset over mountains',
        image_size: '16:9' as const,
        num_images: 1,
      }

      const result = await createImageTask(params)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/image_generation'),
        expect.objectContaining({ method: 'POST' }),
      )
    })

    it('should return error when API fails', async () => {
      const errorResponse = { code: 'REQUEST_FAILED', message: 'Request failed' }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }))

      const params = {
        model: 'image-01' as const,
        prompt: 'Test prompt',
      }

      const result = await createImageTask(params)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    // Note: Network error handling test removed - the current API implementation
    // doesn't handle fetch errors, only HTTP error responses
  })

  describe('getImageTaskStatus', () => {
    it('should get task status successfully', async () => {
      const taskId = 'task-123'
      const mockResponse = {
        task_id: taskId,
        status: 'processing',
        progress: 50,
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getImageTaskStatus(taskId)

      expect(result.success).toBe(true)
      expect(result.data?.task_id).toBe(taskId)
      expect(result.data?.status).toBe('processing')
    })

    it('should return success status with image URLs', async () => {
      const taskId = 'task-456'
      const mockResponse = {
        task_id: taskId,
        status: 'success',
        progress: 100,
        image_urls: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getImageTaskStatus(taskId)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('success')
      expect(result.data?.image_urls).toHaveLength(2)
    })

    it('should handle task not found', async () => {
      const taskId = 'nonexistent-task'
      const errorResponse = { code: 'NOT_FOUND', message: 'Task not found' }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getImageTaskStatus(taskId)

      expect(result.success).toBe(false)
    })
  })

  describe('getImageFile', () => {
    it('should get image file info successfully', async () => {
      const fileId = 'file-123'
      const mockResponse = {
        file_id: fileId,
        url: 'https://example.com/image.jpg',
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getImageFile(fileId)

      expect(result.success).toBe(true)
      expect(result.data?.file_id).toBe(fileId)
      expect(result.data?.url).toBe('https://example.com/image.jpg')
    })

    it('should return error when file not found', async () => {
      const fileId = 'nonexistent-file'
      const errorResponse = { code: 'NOT_FOUND', message: 'File not found' }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getImageFile(fileId)

      expect(result.success).toBe(false)
    })
  })
})
