import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface BgmTrack {
  id: string
  name: string
  artist: string
  url: string
  cover?: string
}

const DEFAULT_BGM_TRACKS: BgmTrack[] = [
  {
    id: 'bgm-1',
    name: 'Peaceful Morning',
    artist: 'Lo-Fi Studio',
    url: '/bgm/peaceful-morning.mp3',
  },
  {
    id: 'bgm-2',
    name: 'Focus Flow',
    artist: 'Ambient Works',
    url: '/bgm/focus-flow.mp3',
  },
  {
    id: 'bgm-3',
    name: 'Creative Vibes',
    artist: 'Chill Beats',
    url: '/bgm/creative-vibes.mp3',
  },
]

const STORAGE_KEY = 'minimax-app-settings'

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : defaultValue
  }
  catch {
    return defaultValue
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  }
  catch {
    // Ignore storage errors
  }
}

export const useAppStore = defineStore('app', () => {
  // BGM state
  const bgmEnabled = ref(loadFromStorage('bgmEnabled', true))
  const bgmVolume = ref(loadFromStorage('bgmVolume', 0.5))
  const currentBgmIndex = ref(loadFromStorage('currentBgmIndex', 0))
  const bgmTracks = ref<BgmTrack[]>(DEFAULT_BGM_TRACKS)

  // Welcome video state
  const hasSeenWelcomeVideo = ref(loadFromStorage('hasSeenWelcomeVideo', false))

  // UI settings
  const backgroundStyle = ref<'default' | 'gradient' | 'particles'>(
    loadFromStorage('backgroundStyle', 'default'),
  )

  // Sync to localStorage
  watch(bgmEnabled, (val) => saveToStorage('bgmEnabled', val))
  watch(bgmVolume, (val) => saveToStorage('bgmVolume', val))
  watch(currentBgmIndex, (val) => saveToStorage('currentBgmIndex', val))
  watch(hasSeenWelcomeVideo, (val) => saveToStorage('hasSeenWelcomeVideo', val))
  watch(backgroundStyle, (val) => saveToStorage('backgroundStyle', val))

  function toggleBgm() {
    bgmEnabled.value = !bgmEnabled.value
  }

  function setBgmVolume(volume: number) {
    bgmVolume.value = Math.max(0, Math.min(1, volume))
  }

  function nextBgm() {
    currentBgmIndex.value = (currentBgmIndex.value + 1) % bgmTracks.value.length
  }

  function prevBgm() {
    currentBgmIndex.value = (currentBgmIndex.value - 1 + bgmTracks.value.length) % bgmTracks.value.length
  }

  function setBgmTrack(index: number) {
    if (index >= 0 && index < bgmTracks.value.length) {
      currentBgmIndex.value = index
    }
  }

  function setHasSeenWelcomeVideo(value: boolean = true) {
    hasSeenWelcomeVideo.value = value
  }

  function setBackgroundStyle(style: 'default' | 'gradient' | 'particles') {
    backgroundStyle.value = style
  }

  function addBgmTrack(track: BgmTrack) {
    bgmTracks.value.push(track)
  }

  function removeBgmTrack(id: string) {
    const index = bgmTracks.value.findIndex((t) => t.id === id)
    if (index > -1) {
      bgmTracks.value.splice(index, 1)
      if (currentBgmIndex.value >= bgmTracks.value.length) {
        currentBgmIndex.value = Math.max(0, bgmTracks.value.length - 1)
      }
    }
  }

  const currentTrack = () => bgmTracks.value[currentBgmIndex.value] ?? null

  return {
    // BGM
    bgmEnabled,
    bgmVolume,
    currentBgmIndex,
    bgmTracks,
    toggleBgm,
    setBgmVolume,
    nextBgm,
    prevBgm,
    setBgmTrack,
    addBgmTrack,
    removeBgmTrack,
    currentTrack,
    // Welcome video
    hasSeenWelcomeVideo,
    setHasSeenWelcomeVideo,
    // UI
    backgroundStyle,
    setBackgroundStyle,
  }
})
