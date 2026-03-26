// WebSocket 流式语音合成 composable
// wss://api.minimaxi.com/ws/v1/t2a_v2

import { onUnmounted, readonly, ref } from 'vue'

export interface VoiceStreamOptions {
  model?: string
  voice_id?: string
  onAudioChunk?: (chunk: ArrayBuffer) => void
  onStatusChange?: (status: 'connecting' | 'open' | 'closed' | 'error') => void
  onError?: (error: Error) => void
}

export interface VoiceStreamMessage {
  model: string
  text: string
  voice_id: string
  stream?: boolean
}

export function useVoiceStream() {
  const ws = ref<WebSocket | null>(null)
  const status = ref<'idle' | 'connecting' | 'open' | 'closed' | 'error'>('idle')
  const audioChunks = ref<ArrayBuffer[]>([])
  const error = ref<Error | null>(null)

  // Audio context for playback
  let audioContext: AudioContext | null = null
  let audioQueue: ArrayBuffer[] = []
  let isPlaying = false

  const connect = (options: VoiceStreamOptions = {}) => {
    const { model = 'speech-02-hd', voice_id = 'male-qn-qingse', onAudioChunk, onStatusChange, onError } = options

    if (ws.value) {
      ws.value.close()
    }

    status.value = 'connecting'
    onStatusChange?.('connecting')

    const websocket = new WebSocket('wss://api.minimaxi.com/ws/v1/t2a_v2')

    websocket.binaryType = 'arraybuffer'

    websocket.onopen = () => {
      status.value = 'open'
      onStatusChange?.('open')
    }

    websocket.onmessage = (event) => {
      if (event.data instanceof ArrayBuffer) {
        audioChunks.value.push(event.data)
        onAudioChunk?.(event.data)
        playAudioChunk(event.data)
      }
    }

    websocket.onerror = (event) => {
      error.value = new Error('WebSocket error')
      status.value = 'error'
      onError?.(error.value)
    }

    websocket.onclose = () => {
      status.value = 'closed'
      onStatusChange?.('closed')
    }

    ws.value = websocket

    return websocket
  }

  const sendText = (text: string, options: Partial<VoiceStreamMessage> = {}) => {
    if (!ws.value || ws.value.readyState !== WebSocket.OPEN) {
      error.value = new Error('WebSocket not connected')
      return false
    }

    const message: VoiceStreamMessage = {
      model: options.model ?? 'speech-02-hd',
      text,
      voice_id: options.voice_id ?? 'male-qn-qingse',
      stream: true,
    }

    ws.value.send(JSON.stringify(message))
    return true
  }

  const playAudioChunk = async (chunk: ArrayBuffer) => {
    if (!audioContext) {
      audioContext = new AudioContext()
    }

    audioQueue.push(chunk)

    if (!isPlaying) {
      await processQueue()
    }
  }

  const processQueue = async () => {
    if (audioQueue.length === 0) {
      isPlaying = false
      return
    }

    isPlaying = true
    const chunk = audioQueue.shift()!

    try {
      const audioBuffer = await audioContext!.decodeAudioData(chunk.slice(0))
      const source = audioContext!.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext!.destination)

      source.onended = () => {
        processQueue()
      }

      source.start()
    }
    catch (e) {
      console.error('Failed to decode audio:', e)
      processQueue()
    }
  }

  const stop = () => {
    if (ws.value) {
      ws.value.close()
      ws.value = null
    }
    audioQueue = []
    isPlaying = false
    status.value = 'idle'
  }

  const getAudioBlob = () => {
    if (audioChunks.value.length === 0)
      return null

    const totalLength = audioChunks.value.reduce((acc, chunk) => acc + chunk.byteLength, 0)
    const merged = new ArrayBuffer(totalLength)
    const view = new Uint8Array(merged)

    let offset = 0
    for (const chunk of audioChunks.value) {
      view.set(new Uint8Array(chunk), offset)
      offset += chunk.byteLength
    }

    return new Blob([merged], { type: 'audio/mpeg' })
  }

  const clearChunks = () => {
    audioChunks.value = []
  }

  onUnmounted(() => {
    stop()
    if (audioContext) {
      audioContext.close()
      audioContext = null
    }
  })

  return {
    status: readonly(status),
    error: readonly(error),
    audioChunks: readonly(audioChunks),
    connect,
    sendText,
    stop,
    getAudioBlob,
    clearChunks,
  }
}
