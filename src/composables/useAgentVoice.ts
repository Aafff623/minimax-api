import { shallowRef, type ShallowRef } from 'vue'
import { useAgentStore } from '~/stores/agent'
import { createVoiceTask, getAudioFile, getVoiceTaskStatus } from '~/api/voice'

const POLL_INTERVAL = 2000
const MAX_POLL_ATTEMPTS = 150

export interface UseAgentVoiceReturn {
  isSpeaking: ShallowRef<boolean>
  isLoading: ShallowRef<boolean>
  error: ShallowRef<string | null>
  audioUrl: ShallowRef<string | null>
  speak: (text: string) => Promise<void>
  stop: () => void
}

export function useAgentVoice(): UseAgentVoiceReturn {
  const agentStore = useAgentStore()

  const isSpeaking = shallowRef(false)
  const isLoading = shallowRef(false)
  const error = shallowRef<string | null>(null)
  const audioUrl = shallowRef<string | null>(null)

  let currentAudio: HTMLAudioElement | null = null
  let pollTimer: ReturnType<typeof setTimeout> | null = null
  let pollAttempts = 0

  function cleanup() {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.src = ''
      currentAudio = null
    }
    if (pollTimer) {
      clearTimeout(pollTimer)
      pollTimer = null
    }
  }

  function stop() {
    cleanup()
    isSpeaking.value = false
    isLoading.value = false
    agentStore.setSpeaking(false)
  }

  async function pollStatus(taskId: string, fileId?: string): Promise<string | null> {
    pollAttempts++

    const statusResult = await getVoiceTaskStatus(taskId)
    if (!statusResult.success || !statusResult.data) {
      error.value = statusResult.error?.message || 'Failed to get task status'
      isSpeaking.value = false
      agentStore.setSpeaking(false)
      return null
    }

    const { status } = statusResult.data

    if (status === 'success') {
      const fid = statusResult.data.file_id ?? fileId
      if (fid) {
        const audioResult = await getAudioFile(fid)
        if (audioResult.success && audioResult.data) {
          audioUrl.value = audioResult.data.url
          return audioResult.data.url
        }
      }
      error.value = 'No file_id returned'
      return null
    }

    if (status === 'failed') {
      error.value = 'Task processing failed'
      isSpeaking.value = false
      agentStore.setSpeaking(false)
      return null
    }

    if (pollAttempts < MAX_POLL_ATTEMPTS) {
      pollTimer = setTimeout(() => pollStatus(taskId, fileId), POLL_INTERVAL)
    }
    else {
      error.value = 'Polling timeout'
      isSpeaking.value = false
      agentStore.setSpeaking(false)
    }

    return null
  }

  async function speak(text: string): Promise<void> {
    stop()
    error.value = null
    isLoading.value = true

    const preset = agentStore.getCurrentPreset()
    if (!preset) {
      error.value = 'No voice preset selected'
      isLoading.value = false
      return
    }

    try {
      const result = await createVoiceTask({
        model: 'speech-2.8-hd',
        text,
        voice_id: preset.voiceId,
      })

      if (!result.success || !result.data) {
        error.value = result.error?.message || 'Failed to create voice task'
        isLoading.value = false
        return
      }

      const taskId = result.data.task_id
      isLoading.value = false
      isSpeaking.value = true
      agentStore.setSpeaking(true)

      pollAttempts = 0
      const url = await pollStatus(taskId)

      if (url) {
        await playAudio(url)
      }
    }
    catch (e) {
      error.value = 'Voice synthesis failed'
      isSpeaking.value = false
      agentStore.setSpeaking(false)
    }
  }

  async function playAudio(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      cleanup()

      currentAudio = new Audio(url)
      currentAudio.volume = 0.8

      currentAudio.addEventListener('ended', () => {
        isSpeaking.value = false
        agentStore.setSpeaking(false)
        resolve()
      })

      currentAudio.addEventListener('error', () => {
        error.value = 'Audio playback failed'
        isSpeaking.value = false
        agentStore.setSpeaking(false)
        reject(new Error('Audio playback failed'))
      })

      currentAudio.play().catch(() => {
        error.value = 'Failed to play audio'
        isSpeaking.value = false
        agentStore.setSpeaking(false)
      })
    })
  }

  return {
    isSpeaking,
    isLoading,
    error,
    audioUrl,
    speak,
    stop,
  }
}
