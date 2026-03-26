import type { TaskStatus } from '~/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface MusicTask {
  taskId: string
  status: TaskStatus['status']
  musicUrl?: string
  progress?: number
  error?: string
  lyrics?: string
  createdAt: number
}

export interface LyricLine {
  id: string
  text: string
  startTime: number // in seconds
  endTime: number // in seconds
}

export interface MusicState {
  tasks: Record<string, MusicTask>
  currentMusic: string | null
  lyrics: LyricLine[]
}

export const useMusicStore = defineStore('music', () => {
  const tasks = ref<Record<string, MusicTask>>({})
  const currentMusic = ref<string | null>(null)
  const lyrics = ref<LyricLine[]>([])

  function addTask(taskId: string, lyrics?: string) {
    tasks.value[taskId] = {
      taskId,
      status: 'pending',
      lyrics,
      createdAt: Date.now(),
    }
  }

  function updateTask(taskId: string, updates: Partial<MusicTask>) {
    if (tasks.value[taskId]) {
      tasks.value[taskId] = {
        ...tasks.value[taskId],
        ...updates,
      }
    }
  }

  function removeTask(taskId: string) {
    delete tasks.value[taskId]
  }

  function getTask(taskId: string): MusicTask | undefined {
    return tasks.value[taskId]
  }

  function setCurrentMusic(url: string | null) {
    currentMusic.value = url
  }

  function setLyrics(lines: LyricLine[]) {
    lyrics.value = lines
  }

  function updateLyricLine(id: string, updates: Partial<LyricLine>) {
    const index = lyrics.value.findIndex(l => l.id === id)
    if (index > -1) {
      lyrics.value[index] = {
        ...lyrics.value[index],
        ...updates,
      }
    }
  }

  function addLyricLine(line: LyricLine) {
    lyrics.value.push(line)
    lyrics.value.sort((a, b) => a.startTime - b.startTime)
  }

  function removeLyricLine(id: string) {
    const index = lyrics.value.findIndex(l => l.id === id)
    if (index > -1) {
      lyrics.value.splice(index, 1)
    }
  }

  function clearLyrics() {
    lyrics.value = []
  }

  return {
    tasks,
    currentMusic,
    lyrics,
    addTask,
    updateTask,
    removeTask,
    getTask,
    setCurrentMusic,
    setLyrics,
    updateLyricLine,
    addLyricLine,
    removeLyricLine,
    clearLyrics,
  }
})
