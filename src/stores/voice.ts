import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TaskStatus = 'pending' | 'processing' | 'success' | 'failed'

export interface VoiceTask {
  taskId: string
  status: TaskStatus
  audioUrl?: string
  progress?: number
  error?: string
  createdAt: number
}

export interface VoiceState {
  asyncTasks: Record<string, VoiceTask>
}

export const useVoiceStore = defineStore('voice', () => {
  const asyncTasks = ref<Record<string, VoiceTask>>({})

  function addTask(taskId: string) {
    asyncTasks.value[taskId] = {
      taskId,
      status: 'pending',
      createdAt: Date.now(),
    }
  }

  function updateTask(taskId: string, updates: Partial<VoiceTask>) {
    if (asyncTasks.value[taskId]) {
      asyncTasks.value[taskId] = {
        ...asyncTasks.value[taskId],
        ...updates,
      }
    }
  }

  function removeTask(taskId: string) {
    delete asyncTasks.value[taskId]
  }

  function getTask(taskId: string): VoiceTask | undefined {
    return asyncTasks.value[taskId]
  }

  return {
    asyncTasks,
    addTask,
    updateTask,
    removeTask,
    getTask,
  }
})
