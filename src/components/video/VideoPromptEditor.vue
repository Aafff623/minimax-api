<script setup lang="ts">
import type { VideoMode } from '~/types'

defineProps<{
  mode: VideoMode
}>()

const prompt = defineModel<string>('prompt', { default: '' })
const subject = defineModel<string>('subject', { default: '' })
const subjectType = defineModel<string>('subjectType', { default: 'human' })
const referenceImage = defineModel<string>('referenceImage', { default: '' })

const subjectTypes = [
  { value: 'human', label: '人物', icon: 'i-ph-user' },
  { value: 'animal', label: '动物', icon: 'i-ph-bird' },
  { value: 'object', label: '物体', icon: 'i-ph-cube' },
]

function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file)
    return

  const reader = new FileReader()
  reader.onload = (e) => {
    referenceImage.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="prompt-editor space-y-6">
    <!-- 文字模式: 提示词输入 -->
    <div v-if="mode === 'text-to-video'">
      <label class="label flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        视频描述
      </label>
      <textarea
        v-model="prompt"
        rows="4"
        class="input-base resize-none"
        placeholder="描述你想要生成的视频内容，如场景、动作、氛围等..."
      />
    </div>

    <!-- 图片模式: 图片上传 + 提示词 -->
    <template v-else-if="mode === 'image-to-video'">
      <div>
        <label class="label flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          上传图片
        </label>
        <div class="flex gap-4">
          <label
            class="w-32 h-32 rounded-xl border-2 border-dashed border-border-light flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors duration-200 overflow-hidden bg-gray-50 hover:bg-primary/5"
          >
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleImageUpload"
            >
            <span v-if="referenceImage" class="w-full h-full">
              <img
                :src="referenceImage"
                alt="Reference"
                class="w-full h-full object-cover"
              >
            </span>
            <template v-else>
              <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-text-muted mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span class="text-xs text-text-muted">点击上传</span>
            </template>
          </label>
          <div class="flex-1">
            <label class="label flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              图片描述 (可选)
            </label>
            <textarea
              v-model="prompt"
              rows="3"
              class="input-base resize-none text-sm"
              placeholder="描述图片中内容的运动方式..."
            />
          </div>
        </div>
      </div>
    </template>

    <!-- 主体模式: 主体描述 + 参考图 -->
    <template v-else-if="mode === 'subject-to-video'">
      <div>
        <label class="label flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          主体类型
        </label>
        <div class="flex gap-3">
          <button
            v-for="type in subjectTypes"
            :key="type.value"
            type="button"
            class="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all duration-200" :class="[
              subjectType === type.value
                ? 'border-primary bg-primary text-white shadow-button'
                : 'border-border-light bg-white text-text-primary hover:border-primary/50 hover:bg-primary/5',
            ]"
            @click="subjectType = type.value"
          >
            <span class="text-lg" :class="[type.icon]" />
            {{ type.label }}
          </button>
        </div>
      </div>

      <div>
        <label class="label flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          主体描述
        </label>
        <textarea
          v-model="subject"
          rows="2"
          class="input-base resize-none"
          placeholder="描述主体的外观、动作、特征..."
        />
      </div>

      <div>
        <label class="label flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          参考图 (可选)
        </label>
        <label
          class="w-32 h-32 rounded-xl border-2 border-dashed border-border-light flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors duration-200 overflow-hidden bg-gray-50 hover:bg-primary/5"
        >
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handleImageUpload"
          >
          <span v-if="referenceImage" class="w-full h-full">
            <img
              :src="referenceImage"
              alt="Reference"
              class="w-full h-full object-cover"
            >
          </span>
          <template v-else>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-text-muted mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span class="text-xs text-text-muted">点击上传</span>
          </template>
        </label>
      </div>
    </template>
  </div>
</template>
