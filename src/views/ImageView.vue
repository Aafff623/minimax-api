<script setup lang="ts">
import type { ImageConfigValue } from '~/components/image/ImageConfig.vue'
import { ref } from 'vue'
import { createImageTask, getImageTaskStatus } from '~/api/image'
import ImageActions from '~/components/image/ImageActions.vue'
import ImageConfig from '~/components/image/ImageConfig.vue'
import ImageGallery from '~/components/image/ImageGallery.vue'
import StyleSelector from '~/components/image/StyleSelector.vue'
import { useImageStore } from '~/stores/image'

const imageStore = useImageStore()

const prompt = ref('')
const selectedStyle = ref('realistic')
const config = ref<ImageConfigValue>({
  size: '1:1',
  quality: 'standard',
  numImages: 1,
})

const isGenerating = ref(false)
const currentTaskId = ref<string | null>(null)
const generatedImages = ref<string[]>([])
const errorMessage = ref('')
const showGallery = ref(false)

async function handleGenerate() {
  if (!prompt.value.trim() || isGenerating.value)
    return

  isGenerating.value = true
  errorMessage.value = ''
  generatedImages.value = []
  currentTaskId.value = null

  try {
    const result = await createImageTask({
      model: 'image-01',
      prompt: `${prompt.value} [风格: ${selectedStyle.value}]`,
      image_size: config.value.size,
      num_images: config.value.numImages,
    })

    if (!result.success || !result.data) {
      errorMessage.value = result.error?.message || '创建任务失败'
      return
    }

    currentTaskId.value = result.data.task_id
    imageStore.addTask(result.data.task_id, prompt.value)
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
  const maxAttempts = 60
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const result = await getImageTaskStatus(taskId)

      if (result.success && result.data) {
        imageStore.updateTask(taskId, {
          status: result.data.status,
          imageUrls: result.data.image_urls,
        })

        if (result.data.status === 'success' && result.data.image_urls) {
          generatedImages.value = result.data.image_urls
          return
        }

        if (result.data.status === 'failed') {
          errorMessage.value = '图片生成失败'
          return
        }
      }

      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }
    catch (error) {
      console.error('Polling error:', error)
      break
    }
  }

  errorMessage.value = '任务超时'
}

function handleFavorite(_url: string) {
  // Image added to gallery via ImageActions
}

function toggleGallery() {
  showGallery.value = !showGallery.value
}
</script>

<template>
  <div class="image-view p-6 min-h-screen" style="background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-text-primary flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            图片生成
          </h1>
          <p class="text-text-secondary mt-1">
            使用 AI 根据描述创建精美图片
          </p>
        </div>
        <button
          v-if="imageStore.gallery.length > 0"
          type="button"
          class="btn btn-secondary text-sm"
          @click="toggleGallery"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          {{ showGallery ? '返回生成' : '我的画廊' }}
        </button>
      </div>

      <!-- Gallery View -->
      <div v-if="showGallery" class="card">
        <ImageGallery />
      </div>

      <!-- Generation Form -->
      <template v-else>
        <div class="card mb-6">
          <!-- 提示词输入 -->
          <div class="mb-6">
            <label class="label">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 inline-block mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              描述你的图片
            </label>
            <textarea
              v-model="prompt"
              rows="4"
              class="input-base resize-none"
              placeholder="描述你想要生成的图片内容，如：一只可爱的橘猫在阳光下打盹..."
            />
          </div>

          <!-- 风格选择 -->
          <div class="mb-6">
            <StyleSelector v-model="selectedStyle" />
          </div>

          <!-- 配置选项 -->
          <div class="mb-6">
            <ImageConfig v-model="config" />
          </div>

          <!-- 生成按钮 -->
          <button
            type="button"
            :disabled="!prompt.trim() || isGenerating"
            class="btn btn-primary w-full py-4 text-lg"
            @click="handleGenerate"
          >
            <svg v-if="!isGenerating" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {{ isGenerating ? '生成中...' : '生成图片' }}
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

        <!-- 生成结果画廊 -->
        <div v-if="generatedImages.length > 0" class="card">
          <h2 class="section-title mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-cta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            生成结果
          </h2>
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(url, index) in generatedImages"
              :key="index"
              class="relative group rounded-xl overflow-hidden shadow-card-hover transition-all duration-300"
            >
              <img
                :src="url"
                :alt="`Generated image ${index + 1}`"
                class="w-full aspect-square object-cover"
              >
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div class="absolute bottom-3 left-3 right-3 flex justify-end gap-2">
                  <ImageActions
                    :image-url="url"
                    @favorite="handleFavorite"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
