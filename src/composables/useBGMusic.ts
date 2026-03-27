import { ref, watch, onUnmounted, type Ref } from 'vue'
import { useAppStore } from '~/stores/app'

export interface UseBGMusicReturn {
  isPlaying: Ref<boolean>
  currentTime: Ref<number>
  duration: Ref<number>
  isLoaded: Ref<boolean>
  error: Ref<string | null>
  play: () => void
  pause: () => void
  toggle: () => void
  setVolume: (volume: number) => void
  seek: (time: number) => void
  next: () => void
  prev: () => void
}

export function useBGMusic(): UseBGMusicReturn {
  const appStore = useAppStore()

  const audio = ref<HTMLAudioElement | null>(null)
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const isLoaded = ref(false)
  const error = ref<string | null>(null)

  function initAudio() {
    if (audio.value)
      return

    audio.value = new Audio()
    audio.value.volume = appStore.bgmVolume
    audio.value.loop = false

    audio.value.addEventListener('loadedmetadata', () => {
      duration.value = audio.value?.duration ?? 0
      isLoaded.value = true
    })

    audio.value.addEventListener('timeupdate', () => {
      currentTime.value = audio.value?.currentTime ?? 0
    })

    audio.value.addEventListener('ended', () => {
      isPlaying.value = false
      // Play next track
      appStore.nextBgm()
    })

    audio.value.addEventListener('error', () => {
      error.value = 'Failed to load audio'
      isPlaying.value = false
    })
  }

  async function loadTrack(url: string) {
    if (!audio.value)
      return

    isLoaded.value = false
    error.value = null

    try {
      audio.value.src = url
      audio.value.load()
    }
    catch (e) {
      error.value = 'Failed to load track'
    }
  }

  function play() {
    if (!audio.value)
      return

    audio.value.play().then(() => {
      isPlaying.value = true
    }).catch(() => {
      error.value = 'Failed to play audio'
    })
  }

  function pause() {
    if (!audio.value)
      return

    audio.value.pause()
    isPlaying.value = false
  }

  function toggle() {
    if (isPlaying.value) {
      pause()
    }
    else {
      play()
    }
  }

  function setVolume(volume: number) {
    appStore.setBgmVolume(volume)
    if (audio.value) {
      audio.value.volume = volume
    }
  }

  function seek(time: number) {
    if (!audio.value)
      return

    audio.value.currentTime = time
  }

  function next() {
    appStore.nextBgm()
  }

  function prev() {
    appStore.prevBgm()
  }

  // Watch for BGM enabled state
  watch(() => appStore.bgmEnabled, (enabled) => {
    if (enabled && !isPlaying.value) {
      play()
    }
    else if (!enabled) {
      pause()
    }
  })

  // Watch for volume changes
  watch(() => appStore.bgmVolume, (vol) => {
    if (audio.value) {
      audio.value.volume = vol
    }
  })

  // Watch for track changes
  watch(() => appStore.currentBgmIndex, () => {
    const track = appStore.currentTrack()
    if (track) {
      loadTrack(track.url)
      if (appStore.bgmEnabled) {
        play()
      }
    }
  })

  // Initialize
  initAudio()

  // Load initial track
  const initialTrack = appStore.currentTrack()
  if (initialTrack) {
    loadTrack(initialTrack.url)
  }

  // Cleanup
  onUnmounted(() => {
    if (audio.value) {
      audio.value.pause()
      audio.value.src = ''
      audio.value = null
    }
  })

  return {
    isPlaying,
    currentTime,
    duration,
    isLoaded,
    error,
    play,
    pause,
    toggle,
    setVolume,
    seek,
    next,
    prev,
  }
}
