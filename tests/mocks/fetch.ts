/**
 * Mock fetch utility for testing API calls
 * Provides a simple way to mock fetch responses in tests
 */

// Store for mock responses
const mockResponses = new Map<string, { status: number, data: unknown }>()

// Default mock responses
const defaultResponses: Record<string, { status: number, data: unknown }> = {
  '/api/v1/t2a_async_v2': {
    status: 200,
    data: { task_id: 'mock-task-id-123', status: 'pending' },
  },
  '/api/v1/image_generation': {
    status: 200,
    data: { task_id: 'mock-image-task-123', status: 'pending' },
  },
  '/api/v1/video_generation': {
    status: 200,
    data: { task_id: 'mock-video-task-123', status: 'pending' },
  },
  '/api/v1/music_generation': {
    status: 200,
    data: { task_id: 'mock-music-task-123', status: 'pending' },
  },
}

let originalFetch: typeof fetch | undefined

/**
 * Setup mock fetch with default API responses
 */
export function setupMockFetch() {
  originalFetch = globalThis.fetch as typeof fetch
  globalThis.fetch = mockFetch as typeof fetch
}

/**
 * Reset mock fetch to default state
 */
export function resetMockFetch() {
  mockResponses.clear()
  if (originalFetch) {
    globalThis.fetch = originalFetch
    originalFetch = undefined
  }
}

/**
 * Register a mock response for a specific URL
 */
export function mockFetch(url: string, data: unknown, status = 200) {
  mockResponses.set(url, { status, data })
}

/**
 * Remove a mock response for a specific URL
 */
export function unmockFetch(url: string) {
  mockResponses.delete(url)
}

/**
 * Custom mock fetch implementation
 */
async function mockFetchHandler(input: RequestInfo | URL, _init?: RequestInit): Promise<Response> {
  let url: string

  // Handle different input types
  if (typeof input === 'string') {
    url = input
  }
  else if (input instanceof URL) {
    url = input.href
  }
  else if (input instanceof Request) {
    url = input.url
  }
  else {
    url = String(input)
  }

  // Make relative URLs absolute for matching
  if (url.startsWith('/')) {
    url = `http://localhost${url}`
  }

  // Find matching mock response
  let response = mockResponses.get(url)

  // Fall back to checking for URL containing the pattern
  if (!response) {
    for (const [pattern, defaultResponse] of Object.entries(defaultResponses)) {
      if (url.includes(pattern)) {
        response = defaultResponse
        break
      }
    }
  }

  // If no mock found, return error response
  if (!response) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'NOT_FOUND', message: `Mock not found for: ${url}` },
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(JSON.stringify(response.data), {
    status: response.status,
    headers: { 'Content-Type': 'application/json' },
  })
}

// Re-export for type compatibility
export { mockFetchHandler as mockFetch }

/**
 * Create a mock for a pending task response
 */
export function mockPendingTask(taskId: string, endpoint: string) {
  mockFetch(endpoint, {
    task_id: taskId,
    status: 'pending',
    progress: 0,
  })
}

/**
 * Create a mock for a processing task response
 */
export function mockProcessingTask(taskId: string, endpoint: string, progress = 50) {
  mockFetch(endpoint, {
    task_id: taskId,
    status: 'processing',
    progress,
  })
}

/**
 * Create a mock for a successful task response
 */
export function mockSuccessTask(taskId: string, endpoint: string, fileId?: string, extra: Record<string, unknown> = {}) {
  mockFetch(endpoint, {
    task_id: taskId,
    status: 'success',
    progress: 100,
    file_id: fileId || `file-${taskId}`,
    ...extra,
  })
}

/**
 * Create a mock for a failed task response
 */
export function mockFailedTask(taskId: string, endpoint: string, errorMessage = 'Task failed') {
  mockFetch(endpoint, {
    task_id: taskId,
    status: 'failed',
    error: errorMessage,
  })
}

/**
 * Create a mock for file response (audio/image/video)
 */
export function mockFileResponse(fileId: string, fileUrl: string) {
  mockFetch(`/api/v1/files?file_id=${encodeURIComponent(fileId)}`, {
    file_id: fileId,
    url: fileUrl,
  })
}
