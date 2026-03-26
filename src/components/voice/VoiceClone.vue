<script setup lang="ts">
import type { VoiceCloneStatusResponse } from '@/api/voiceClone'
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
      return { text: '已完成', class: 'bg-green-100 text-green-700' }
    case 'processing':
      return { text: '处理中', class: 'bg-blue-100 text-blue-700' }
    case 'pending':
      return { text: '等待中', class: 'bg-yellow-100 text-yellow-700' }
    case 'failed':
      return { text: '失败', class: 'bg-red-100 text-red-700' }
    default:
      return { text: status, class: 'bg-gray-100 text-gray-700' }
  }
}
</script>

<template>
  <div class="voice-clone bg-white rounded-xl shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">
        音色克隆
      </h2>
    </div>

    <!-- Upload Section -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">上传音频</label>
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200"
        :class="[
          audioFile ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50',
        ]"
      >
        <input
          id="audio-upload"
          type="file"
          accept=".mp3,.wav,.m4a,audio/*"
          class="hidden"
          @change="handleFileChange"
        >
        <template v-if="!audioFile">
          <span class="i-icon-park-outline-cloud-upload text-5xl text-gray-400 mb-3 block mx-auto" />
          <p class="text-gray-600 mb-2">
            点击或拖拽上传音频文件
          </p>
          <p class="text-sm text-gray-400">
            支持 MP3、WAV、M4A 格式，最大 10MB
          </p>
        </template>
        <template v-else>
          <span class="i-icon-park-outline-music text-4xl text-primary mb-2 block" />
          <p class="font-medium text-gray-800">
            {{ audioFile.name }}
          </p>
          <p class="text-sm text-gray-500">
            {{ (audioFile.size / 1024 / 1024).toFixed(2) }} MB
          </p>
          <button
            class="mt-3 text-sm text-red-500 hover:text-red-600"
            @click="audioFile = null"
          >
            移除
          </button>
        </template>
      </div>

      <!-- Error -->
      <p v-if="error" class="mt-2 text-sm text-red-500 flex items-center gap-1">
        <span class="i-icon-park-outline-warning" />
        {{ error }}
      </p>

      <!-- Upload Progress -->
      <div v-if="isUploading" class="mt-4">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm text-gray-600">
            {{ isPolling ? '克隆处理中...' : '上传中...' }}
          </span>
          <span class="text-sm text-gray-600">{{ uploadProgress }}%</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full bg-primary transition-all duration-300 rounded-full"
            :style="{ width: `${uploadProgress}%` }"
          />
        </div>
      </div>

      <!-- Upload Button -->
      <button
        :disabled="!audioFile || isUploading"
        class="mt-4 w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleUpload"
      >
        <span v-if="isUploading" class="i-icon-park-outline-loading-three-quarters mr-1 animate-spin" />
        {{ isUploading ? '处理中...' : '开始克隆' }}
      </button>
    </div>

    <!-- Clone List -->
    <div>
      <h3 class="text-lg font-bold text-gray-800 mb-4">
        克隆音色列表
      </h3>

      <div v-if="cloneList.length === 0" class="text-center py-8 text-gray-400">
        <span class="i-icon-park-outline-infomation text-4xl mb-2 block mx-auto" />
        <p>暂无克隆音色</p>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="clone in cloneList"
          :key="clone.task_id"
          class="p-4 border border-gray-200 rounded-lg hover:border-primary/30 transition-colors"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="i-icon-park-outline-person text-gray-400" />
              <span class="font-medium text-gray-800">
                {{ clone.clone_id || clone.task_id.slice(0, 8) }}
              </span>
            </div>
            <span
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="[
                getStatusTag(clone.status).class,
              ]"
            >
              {{ getStatusTag(clone.status).text }}
            </span>
          </div>

          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>Task ID: {{ clone.task_id }}</span>
            <a
              v-if="clone.status === 'success' && clone.preview_url"
              :href="clone.preview_url"
              target="_blank"
              class="text-primary hover:underline flex items-center gap-1"
            >
              <span class="i-icon-park-outline-play" />
              试听
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
