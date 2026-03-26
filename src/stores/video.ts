import type { TaskStatus } from '~/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface VideoTask {
  taskId: string
  status: TaskStatus['status']
  videoUrl?: string
  coverUrl?: string
  progress?: number
  error?: string
  prompt?: string
  duration?: number
  createdAt: number
}

export interface VideoState {
  tasks: Record<string, VideoTask>
  gallery: VideoTask[]
  currentVideo: string | null
}

export const useVideoStore = defineStore('video', () => {
  const tasks = ref<Record<string, VideoTask>>({})
  const gallery = ref<VideoTask[]>([])
  const currentVideo = ref<string | null>(null)

  function addTask(taskId: string, prompt?: string) {
    tasks.value[taskId] = {
      taskId,
      status: 'pending',
      prompt,
      createdAt: Date.now(),
    }
  }

  function updateTask(taskId: string, updates: Partial<VideoTask>) {
    if (tasks.value[taskId]) {
      tasks.value[taskId] = {
        ...tasks.value[taskId],
        ...updates,
      }

      // Add successful video to gallery
      if (updates.status === 'success' && updates.videoUrl) {
        const existingIndex = gallery.value.findIndex(v => v.taskId === taskId)
        const videoTask = tasks.value[taskId]

        if (existingIndex > -1) {
          gallery.value[existingIndex] = { ...videoTask }
        }
        else {
          gallery.value.unshift({ ...videoTask })
        }
      }
    }
  }

  function removeTask(taskId: string) {
    delete tasks.value[taskId]
  }

  function getTask(taskId: string): VideoTask | undefined {
    return tasks.value[taskId]
  }

  function setCurrentVideo(videoUrl: string | null) {
    currentVideo.value = videoUrl
  }

  function removeFromGallery(taskId: string) {
    const index = gallery.value.findIndex(v => v.taskId === taskId)
    if (index > -1) {
      gallery.value.splice(index, 1)
    }
  }

  function clearGallery() {
    gallery.value = []
  }

  return {
    tasks,
    gallery,
    currentVideo,
    addTask,
    updateTask,
    removeTask,
    getTask,
    setCurrentVideo,
    removeFromGallery,
    clearGallery,
  }
})
