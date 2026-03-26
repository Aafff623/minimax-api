<script setup lang="ts">
import { ref } from 'vue'
import { createVideoTask, getVideoTaskStatus } from '~/api/video'
import TemplateSelector from '~/components/video/TemplateSelector.vue'
import VideoModeSelector from '~/components/video/VideoModeSelector.vue'
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
</script>

<template>
  <div class="video-view p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <h1 class="text-2xl font-bold mb-6">
        视频生成
      </h1>

      <!-- 表单区域 -->
      <div class="bg-white rounded-xl border border-gray-2 p-6 mb-6">
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
          class="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleGenerate"
        >
          {{ isGenerating ? '生成中...' : '生成视频' }}
        </button>

        <!-- 错误提示 -->
        <div
          v-if="errorMessage"
          class="mt-4 p-3 rounded-lg bg-red-5 text-red-6 text-sm"
        >
          {{ errorMessage }}
        </div>
      </div>

      <!-- 生成结果 -->
      <div v-if="generatedVideo" class="bg-white rounded-xl border border-gray-2 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-bold">
            生成结果
          </h2>
          <button
            type="button"
            class="px-4 py-2 rounded-lg border border-gray-2 text-sm hover:border-gray-4 transition-all"
            @click="handleDownload"
          >
            <span class="i-ph-download mr-1" />
            下载
          </button>
        </div>
        <video
          :src="generatedVideo"
          controls
          class="w-full rounded-lg"
        />
      </div>
    </div>
  </div>
</template>
