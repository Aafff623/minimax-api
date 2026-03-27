<script setup lang="ts">
import type { VoiceCloneStatusResponse } from '@/api/voiceClone'
import { onMounted, ref } from 'vue'
import { createVoiceClone, getCloneList, getCloneStatus } from '@/api/voiceClone'

const audioFile = ref<File | null>(null)
const isUploading = ref(false)
const isPolling = ref(false)
const currentTaskId = ref<string | null>(null)
const cloneList = ref<VoiceCloneStatusResponse[]>([])
const uploadProgress = ref(0)
const error = ref<string | null>(null)

// Load clone list on mount
onMounted(async () => {
  await fetchCloneList()
})

async function fetchCloneList() {
  const res = await getCloneList()
  if (res.success && res.data) {
    cloneList.value = res.data
  }
}

function triggerUpload() {
  document.getElementById('audio-upload')?.click()
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    audioFile.value = target.files[0]
    error.value = null
  }
}

async function handleUpload() {
  if (!audioFile.value) {
    error.value = '请选择音频文件'
    return
  }

  // Validate file type
  const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/m4a']
  if (!validTypes.includes(audioFile.value.type) && !audioFile.value.name.match(/\.(mp3|wav|m4a)$/i)) {
    error.value = '请上传 MP3、WAV 或 M4A 格式的音频文件'
    return
  }

  // Validate file size (max 10MB)
  if (audioFile.value.size > 10 * 1024 * 1024) {
    error.value = '音频文件大小不能超过 10MB'
    return
  }

  isUploading.value = true
  error.value = null
  uploadProgress.value = 0

  const res = await createVoiceClone(audioFile.value)

  if (res.success && res.data) {
    currentTaskId.value = res.data.task_id
    await pollCloneStatus(res.data.task_id)
  }
  else {
    error.value = res.error?.message || '上传失败'
    isUploading.value = false
  }
}

async function pollCloneStatus(taskId: string) {
  isPolling.value = true

  const poll = async () => {
    const res = await getCloneStatus(taskId)

    if (res.success && res.data) {
      const status = res.data.status

      if (status === 'success') {
        isPolling.value = false
        isUploading.value = false
        uploadProgress.value = 100
        await fetchCloneList()
        audioFile.value = null
        currentTaskId.value = null
        return
      }

      if (status === 'failed') {
        isPolling.value = false
        isUploading.value = false
        error.value = '克隆任务失败'
        return
      }

      // Still processing
      uploadProgress.value = res.data.progress ?? uploadProgress.value + 10

      if (isPolling.value) {
        setTimeout(poll, 2000)
      }
    }
    else {
      error.value = res.error?.message || '查询状态失败'
      isPolling.value = false
      isUploading.value = false
    }
  }

  await poll()
}

function getStatusTag(status: string) {
  switch (status) {
    case 'success':
      return { text: '已完成', class: 'bg-cta/10 text-cta' }
    case 'processing':
      return { text: '处理中', class: 'bg-primary/10 text-primary' }
    case 'pending':
      return { text: '等待中', class: 'bg-yellow-100 text-yellow-700' }
    case 'failed':
      return { text: '失败', class: 'bg-red-100 text-red-600' }
    default:
      return { text: status, class: 'bg-gray-100 text-gray-600' }
  }
}
</script>

<template>
  <div class="card-hover group">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
          <svg class="w-5 h-5 text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div>
          <h2 class="section-title">
            音色克隆
          </h2>
          <p class="section-subtitle">
            创建个性化的语音模型
          </p>
        </div>
      </div>
    </div>

    <!-- Upload Section -->
    <div class="mb-6">
      <label class="label">上传音频</label>
      <div
        class="border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer"
        :class="[
          audioFile ? 'border-primary bg-primary/5' : 'border-border-light hover:border-primary/50 hover:bg-hover-overlay',
        ]"
        @click="triggerUpload"
      >
        <input
          id="audio-upload"
          type="file"
          accept=".mp3,.wav,.m4a,audio/*"
          class="hidden"
          @change="handleFileChange"
        >
        <template v-if="!audioFile">
          <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>
          <p class="text-text-primary font-medium mb-2">
            点击或拖拽上传音频文件
          </p>
          <p class="text-sm text-text-muted">
            支持 MP3、WAV、M4A 格式，最大 10MB
          </p>
        </template>
        <template v-else>
          <div class="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <p class="font-semibold text-text-primary mb-1">
            {{ audioFile.name }}
          </p>
          <p class="text-sm text-text-secondary mb-3">
            {{ (audioFile.size / 1024 / 1024).toFixed(2) }} MB
          </p>
          <button
            class="text-sm text-red-500 hover:text-red-600 font-medium transition-colors duration-200 flex items-center gap-1 mx-auto"
            @click.stop="audioFile = null"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            移除
          </button>
        </template>
      </div>

      <!-- Error -->
      <p v-if="error" class="mt-3 text-sm text-red-500 flex items-center gap-2">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" x2="12" y1="8" y2="12" />
          <line x1="12" x2="12.01" y1="16" y2="16" />
        </svg>
        {{ error }}
      </p>

      <!-- Upload Progress -->
      <div v-if="isUploading" class="mt-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-text-secondary">
            {{ isPolling ? '克隆处理中...' : '上传中...' }}
          </span>
          <span class="text-sm font-semibold text-primary">{{ uploadProgress }}%</span>
        </div>
        <div class="h-2.5 bg-surface-elevated rounded-full overflow-hidden border border-border-light">
          <div
            class="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
            :style="{ width: `${uploadProgress}%` }"
          />
        </div>
      </div>

      <!-- Upload Button -->
      <button
        :disabled="!audioFile || isUploading"
        class="mt-4 w-full max-w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 bg-cta text-white hover:bg-cta/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-button hover:shadow-button-hover flex items-center justify-center gap-2 box-border overflow-hidden"
        @click="handleUpload"
      >
        <svg v-if="isUploading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        {{ isUploading ? '处理中...' : '开始克隆' }}
      </button>
    </div>

    <!-- Clone List -->
    <div>
      <h3 class="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
        <svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        克隆音色列表
      </h3>

      <div v-if="cloneList.length === 0" class="text-center py-10 bg-surface-elevated rounded-xl border border-border-light">
        <div class="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <p class="text-text-muted font-medium">
          暂无克隆音色
        </p>
        <p class="text-sm text-text-muted mt-1">
          上传音频开始创建你的第一个克隆音色
        </p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="clone in cloneList"
          :key="clone.task_id"
          class="p-4 rounded-xl border border-border-light bg-surface-elevated hover:border-primary/30 transition-all duration-200 hover:shadow-card"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span class="font-semibold text-text-primary">
                {{ clone.clone_id || clone.task_id.slice(0, 8) }}
              </span>
            </div>
            <span
              class="px-3 py-1 rounded-full text-xs font-semibold"
              :class="getStatusTag(clone.status).class"
            >
              {{ getStatusTag(clone.status).text }}
            </span>
          </div>

          <div class="flex items-center justify-between text-sm">
            <span class="text-text-muted font-mono text-xs">Task ID: {{ clone.task_id.slice(0, 12) }}...</span>
            <a
              v-if="clone.status === 'success' && clone.preview_url"
              :href="clone.preview_url"
              target="_blank"
              class="text-primary hover:text-primary/80 font-medium flex items-center gap-1 transition-colors duration-200"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              试听
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
