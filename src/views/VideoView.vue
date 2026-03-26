<script setup lang="ts">
import { ref } from 'vue'
import { createVideoTask, getVideoTaskStatus } from '~/api/video'
import TemplateSelector from '~/components/video/TemplateSelector.vue'
import VideoGallery from '~/components/video/VideoGallery.vue'
import VideoModeSelector from '~/components/video/VideoModeSelector.vue'
import VideoPlayer from '~/components/video/VideoPlayer.vue'
import VideoPromptEditor from '~/components/video/VideoPromptEditor.vue'

const selectedMode = ref<'text-to-video' | 'image-to-video' | 'subject-to-video' | 'subject-reference'>('text-to-video')
const prompt = ref('')
const subject = ref('')
const subjectType = ref('human')
const referenceImage = ref('')
const selectedTemplate = ref('cinematic')

const isGenerating = ref(false)
const currentTaskId = ref<string | null>(null)
const generatedVideo = ref<string | null>(null)
const errorMessage = ref('')
const showGallery = ref(false)

async function handleGenerate() {
  if (isGenerating.value)
    return

  if (selectedMode.value === 'text-to-video' && !prompt.value.trim()) {
    errorMessage.value = '请输入视频描述'
    return
  }

  if (selectedMode.value === 'subject-to-video' && !subject.value.trim()) {
    errorMessage.value = '请输入主体描述'
    return
  }

  isGenerating.value = true
  errorMessage.value = ''
  generatedVideo.value = null
  currentTaskId.value = null

  try {
    const requestParams: any = {
      model: 'Hailuo-2.3-Fast',
      mode: selectedMode.value,
      template_id: selectedTemplate.value,
    }

    if (selectedMode.value === 'text-to-video') {
      requestParams.prompt = prompt.value
    }
    else if (selectedMode.value === 'image-to-video') {
      requestParams.reference_image = referenceImage.value
      if (prompt.value.trim())
        requestParams.prompt = prompt.value
    }
    else if (selectedMode.value === 'subject-to-video') {
      requestParams.subject = subject.value
      requestParams.subject_type = subjectType.value
      if (referenceImage.value)
        requestParams.reference_image = referenceImage.value
    }

    const result = await createVideoTask(requestParams)

    if (!result.success || !result.data) {
      errorMessage.value = result.error?.message || '创建任务失败'
      return
    }

    currentTaskId.value = result.data.task_id
    await pollTaskStatus(result.data.task_id)
  }
  catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '生成失败'
  }
  finally {
    isGenerating.value = false
  }
}

async function pollTaskStatus(taskId: string) {
  const maxAttempts = 120
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const result = await getVideoTaskStatus(taskId)

      if (result.success && result.data) {
        if (result.data.status === 'success' && result.data.video_url) {
          generatedVideo.value = result.data.video_url
          return
        }

        if (result.data.status === 'failed') {
          errorMessage.value = '视频生成失败'
          return
        }
      }

      await new Promise(resolve => setTimeout(resolve, 3000))
      attempts++
    }
    catch (error) {
      console.error('Polling error:', error)
      break
    }
  }

  errorMessage.value = '任务超时'
}

function handleDownload() {
  if (!generatedVideo.value)
    return
  window.open(generatedVideo.value, '_blank')
}

function toggleGallery() {
  showGallery.value = !showGallery.value
}
</script>

<template>
  <div class="video-view p-6 min-h-screen" style="background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-text-primary flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            视频生成
          </h1>
          <p class="text-text-secondary mt-1">
            使用 AI 创建精彩的视频内容
          </p>
        </div>
        <button
          type="button"
          class="btn btn-secondary text-sm"
          @click="toggleGallery"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
            <line x1="7" y1="2" x2="7" y2="22" />
            <line x1="17" y1="2" x2="17" y2="22" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <line x1="2" y1="7" x2="7" y2="7" />
            <line x1="2" y1="17" x2="7" y2="17" />
            <line x1="17" y1="17" x2="22" y2="17" />
            <line x1="17" y1="7" x2="22" y2="7" />
          </svg>
          {{ showGallery ? '返回生成' : '视频库' }}
        </button>
      </div>

      <!-- Gallery View -->
      <div v-if="showGallery" class="card">
        <VideoGallery />
      </div>

      <!-- Generation Form -->
      <template v-else>
        <div class="card mb-6">
          <!-- 模式选择 -->
          <div class="mb-6">
            <VideoModeSelector v-model="selectedMode" />
          </div>

          <!-- 提示词编辑器 -->
          <div class="mb-6">
            <VideoPromptEditor
              v-model:prompt="prompt"
              v-model:subject="subject"
              v-model:subject-type="subjectType"
              v-model:reference-image="referenceImage"
              :mode="selectedMode"
            />
          </div>

          <!-- 模板选择 -->
          <div class="mb-6">
            <TemplateSelector v-model="selectedTemplate" />
          </div>

          <!-- 生成按钮 -->
          <button
            type="button"
            :disabled="isGenerating"
            class="btn btn-primary w-full py-4 text-lg"
            @click="handleGenerate"
          >
            <svg v-if="!isGenerating" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {{ isGenerating ? '生成中...' : '生成视频' }}
          </button>

          <!-- 错误提示 -->
          <div
            v-if="errorMessage"
            class="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {{ errorMessage }}
          </div>
        </div>

        <!-- 生成结果 -->
        <div v-if="generatedVideo" class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="section-title flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-cta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              生成结果
            </h2>
            <button
              type="button"
              class="btn btn-secondary text-sm"
              @click="handleDownload"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              下载视频
            </button>
          </div>
          <div class="rounded-xl overflow-hidden shadow-card-hover transition-all duration-300">
            <VideoPlayer :video-url="generatedVideo" />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
