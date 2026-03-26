import type { TaskStatus } from '~/types'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ImageTask {
  taskId: string
  status: TaskStatus['status']
  imageUrls?: string[]
  progress?: number
  error?: string
  prompt?: string
  createdAt: number
}

export const useImageStore = defineStore('image', () => {
  const tasks = ref<Record<string, ImageTask>>({})
  const gallery = ref<string[]>([])

  function addTask(taskId: string, prompt?: string) {
    tasks.value[taskId] = {
      taskId,
      status: 'pending',
      prompt,
      createdAt: Date.now(),
    }
  }

  function updateTask(taskId: string, updates: Partial<ImageTask>) {
    if (tasks.value[taskId]) {
      tasks.value[taskId] = {
        ...tasks.value[taskId],
        ...updates,
      }

      // Add successful image URLs to gallery
      if (updates.status === 'success' && updates.imageUrls) {
        gallery.value.unshift(...updates.imageUrls)
      }
    }
  }

  function removeTask(taskId: string) {
    delete tasks.value[taskId]
  }

  function getTask(taskId: string): ImageTask | undefined {
    return tasks.value[taskId]
  }

  function addToGallery(urls: string[]) {
    gallery.value.unshift(...urls)
  }

  function removeFromGallery(url: string) {
    const index = gallery.value.indexOf(url)
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
    addTask,
    updateTask,
    removeTask,
    getTask,
    addToGallery,
    removeFromGallery,
    clearGallery,
  }
})
