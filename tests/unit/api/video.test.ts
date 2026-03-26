import { beforeEach, describe, expect, it, vi } from 'vitest'

// Now import the API after mocking
import { createVideoTask, getVideoFile, getVideoTaskStatus } from '@/api/video'

// Mock the fetch globally before importing the API
const mockFetch = vi.fn()

vi.stubGlobal('fetch', mockFetch)

describe('video API', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('createVideoTask', () => {
    it('should create video task successfully', async () => {
      const mockResponse = {
        task_id: 'video-task-123',
        status: 'pending',
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const params = {
        model: 'Hailuo-2.3-Fast' as const,
        mode: 'text-to-video' as const,
        prompt: 'A cat playing piano',
      }

      const result = await createVideoTask(params)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/video_generation'),
        expect.objectContaining({ method: 'POST' }),
      )
    })

    it('should create video task with subject mode', async () => {
      const mockResponse = {
        task_id: 'video-task-456',
        status: 'pending',
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const params = {
        model: 'Hailuo-2.3' as const,
        mode: 'subject-to-video' as const,
        subject: 'A dancing robot',
        subject_type: 'character',
      }

      const result = await createVideoTask(params)

      expect(result.success).toBe(true)
      expect(result.data?.task_id).toBe('video-task-456')
    })

    it('should return error when API fails', async () => {
      const errorResponse = { code: 'REQUEST_FAILED', message: 'Request failed' }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }))

      const params = {
        model: 'Hailuo-2.3-Fast' as const,
        mode: 'text-to-video' as const,
        prompt: 'Test',
      }

      const result = await createVideoTask(params)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getVideoTaskStatus', () => {
    it('should get task status successfully', async () => {
      const taskId = 'task-123'
      const mockResponse = {
        task_id: taskId,
        status: 'processing',
        progress: 30,
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getVideoTaskStatus(taskId)

      expect(result.success).toBe(true)
      expect(result.data?.task_id).toBe(taskId)
      expect(result.data?.status).toBe('processing')
      expect(result.data?.progress).toBe(30)
    })

    it('should return success status with video URL', async () => {
      const taskId = 'task-789'
      const mockResponse = {
        task_id: taskId,
        status: 'success',
        progress: 100,
        video_url: 'https://example.com/video.mp4',
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getVideoTaskStatus(taskId)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('success')
      expect(result.data?.video_url).toBe('https://example.com/video.mp4')
    })

    it('should handle task not found', async () => {
      const taskId = 'nonexistent-task'
      const errorResponse = { code: 'NOT_FOUND', message: 'Task not found' }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getVideoTaskStatus(taskId)

      expect(result.success).toBe(false)
    })
  })

  describe('getVideoFile', () => {
    it('should get video file info successfully', async () => {
      const fileId = 'file-123'
      const mockResponse = {
        file_id: fileId,
        url: 'https://example.com/video.mp4',
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getVideoFile(fileId)

      expect(result.success).toBe(true)
      expect(result.data?.file_id).toBe(fileId)
      expect(result.data?.url).toBe('https://example.com/video.mp4')
    })

    it('should return error when file not found', async () => {
      const fileId = 'nonexistent-file'
      const errorResponse = { code: 'NOT_FOUND', message: 'File not found' }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getVideoFile(fileId)

      expect(result.success).toBe(false)
    })
  })
})
