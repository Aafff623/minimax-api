<script setup lang="ts">
import type { ImageConfigValue } from '~/components/image/ImageConfig.vue'
import { ref } from 'vue'
import { createImageTask, getImageTaskStatus } from '~/api/image'
import ImageActions from '~/components/image/ImageActions.vue'
import ImageConfig from '~/components/image/ImageConfig.vue'
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
</script>

<template>
  <div class="image-view p-6">
    <div class="max-w-4xl mx-auto">
      <!-- 页面标题 -->
      <h1 class="text-2xl font-bold mb-6">
        图片生成
      </h1>

      <!-- 表单区域 -->
      <div class="bg-white rounded-xl border border-gray-2 p-6 mb-6">
        <!-- 提示词输入 -->
        <div class="mb-6">
          <label class="block text-sm text-gray-6 mb-2">
            描述你的图片
          </label>
          <textarea
            v-model="prompt"
            rows="4"
            class="w-full px-4 py-3 rounded-lg border border-gray-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            placeholder="描述你想要生成的图片内容..."
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
          class="w-full py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          @click="handleGenerate"
        >
          {{ isGenerating ? '生成中...' : '生成图片' }}
        </button>

        <!-- 错误提示 -->
        <div
          v-if="errorMessage"
          class="mt-4 p-3 rounded-lg bg-red-5 text-red-6 text-sm"
        >
          {{ errorMessage }}
        </div>
      </div>

      <!-- 生成结果画廊 -->
      <div v-if="generatedImages.length > 0" class="bg-white rounded-xl border border-gray-2 p-6">
        <h2 class="text-lg font-bold mb-4">
          生成结果
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="(url, index) in generatedImages"
            :key="index"
            class="relative group"
          >
            <img
              :src="url"
              :alt="`Generated image ${index + 1}`"
              class="w-full rounded-lg"
            >
            <div class="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ImageActions
                :image-url="url"
                @favorite="handleFavorite"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 画廊预览 -->
      <div v-if="imageStore.gallery.length > 0" class="mt-6">
        <h2 class="text-lg font-bold mb-4">
          我的收藏
        </h2>
        <div class="grid grid-cols-4 gap-3">
          <img
            v-for="(url, index) in imageStore.gallery"
            :key="index"
            :src="url"
            alt="Gallery image"
            class="w-full aspect-square object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
          >
        </div>
      </div>
    </div>
  </div>
</template>
