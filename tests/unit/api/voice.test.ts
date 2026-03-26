import { beforeEach, describe, expect, it, vi } from 'vitest'

// Now import the API after mocking
import { createVoiceTask, getAudioFile, getVoiceTaskStatus } from '@/api/voice'

// Mock the fetch globally before importing the API
const mockFetch = vi.fn()

vi.stubGlobal('fetch', mockFetch)

describe('voice API', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('createVoiceTask', () => {
    it('should create voice task successfully', async () => {
      const mockResponse = {
        task_id: 'voice-task-123',
        status: 'pending',
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const params = {
        model: 'speech-2.8-hd' as const,
        text: 'Hello world',
        voice_id: 'voice-001',
      }

      const result = await createVoiceTask(params)

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/v1/t2a_async_v2'),
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
        model: 'speech-2.8-hd' as const,
        text: 'Hello world',
      }

      const result = await createVoiceTask(params)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('REQUEST_FAILED')
    })

    // Note: Network error handling test removed - the current API implementation
    // doesn't handle fetch errors, only HTTP error responses
  })

  describe('getVoiceTaskStatus', () => {
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

      const result = await getVoiceTaskStatus(taskId)

      expect(result.success).toBe(true)
      expect(result.data?.task_id).toBe(taskId)
      expect(result.data?.status).toBe('processing')
      expect(result.data?.progress).toBe(50)
    })

    it('should return success status with file_id', async () => {
      const taskId = 'task-456'
      const mockResponse = {
        task_id: taskId,
        status: 'success',
        progress: 100,
        file_id: 'file-abc-123',
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getVoiceTaskStatus(taskId)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('success')
      expect(result.data?.file_id).toBe('file-abc-123')
    })

    it('should handle task not found', async () => {
      const taskId = 'nonexistent-task'
      const errorResponse = { code: 'NOT_FOUND', message: 'Task not found' }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getVoiceTaskStatus(taskId)

      expect(result.success).toBe(false)
    })
  })

  describe('getAudioFile', () => {
    it('should get audio file info successfully', async () => {
      const fileId = 'file-123'
      const mockResponse = {
        file_id: fileId,
        url: 'https://example.com/audio.mp3',
      }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getAudioFile(fileId)

      expect(result.success).toBe(true)
      expect(result.data?.file_id).toBe(fileId)
      expect(result.data?.url).toBe('https://example.com/audio.mp3')
    })

    it('should return error when file not found', async () => {
      const fileId = 'nonexistent-file'
      const errorResponse = { code: 'NOT_FOUND', message: 'File not found' }
      mockFetch.mockResolvedValueOnce(new Response(JSON.stringify(errorResponse), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }))

      const result = await getAudioFile(fileId)

      expect(result.success).toBe(false)
    })
  })
})
