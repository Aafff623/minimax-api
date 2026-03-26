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
  { value: 'human', label: '人物' },
  { value: 'animal', label: '动物' },
  { value: 'object', label: '物体' },
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
  <div class="prompt-editor space-y-4">
    <!-- 文字模式: 提示词输入 -->
    <div v-if="mode === 'text-to-video'">
      <div class="text-sm text-gray-6 mb-2">
        视频描述
      </div>
      <textarea
        v-model="prompt"
        rows="4"
        class="w-full px-4 py-3 rounded-lg border border-gray-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
        placeholder="描述你想要生成的视频内容，如场景、动作、氛围等..."
      />
    </div>

    <!-- 图片模式: 图片上传 + 提示词 -->
    <template v-else-if="mode === 'image-to-video'">
      <div>
        <div class="text-sm text-gray-6 mb-2">
          上传图片
        </div>
        <div class="flex gap-4">
          <label
            class="w-32 h-32 rounded-lg border-2 border-dashed border-gray-2 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
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
              <span class="i-ph-upload-simple text-2xl text-gray-4 mb-1" />
              <span class="text-xs text-gray-5">点击上传</span>
            </template>
          </label>
          <div class="flex-1">
            <div class="text-sm text-gray-6 mb-2">
              图片描述 (可选)
            </div>
            <textarea
              v-model="prompt"
              rows="3"
              class="w-full px-4 py-2 rounded-lg border border-gray-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none text-sm"
              placeholder="描述图片中内容的运动方式..."
            />
          </div>
        </div>
      </div>
    </template>

    <!-- 主体模式: 主体描述 + 参考图 -->
    <template v-else-if="mode === 'subject-to-video'">
      <div>
        <div class="text-sm text-gray-6 mb-2">
          主体类型
        </div>
        <div class="flex gap-2 mb-4">
          <button
            v-for="type in subjectTypes"
            :key="type.value"
            type="button"
            class="px-4 py-2 rounded-lg border text-sm transition-all"
            :class="[
              subjectType === type.value
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-2 hover:border-gray-4 text-gray-6',
            ]"
            @click="subjectType = type.value"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <div>
        <div class="text-sm text-gray-6 mb-2">
          主体描述
        </div>
        <textarea
          v-model="subject"
          rows="2"
          class="w-full px-4 py-3 rounded-lg border border-gray-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
          placeholder="描述主体的外观、动作、特征..."
        />
      </div>

      <div>
        <div class="text-sm text-gray-6 mb-2">
          参考图 (可选)
        </div>
        <label
          class="w-32 h-32 rounded-lg border-2 border-dashed border-gray-2 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden"
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
            <span class="i-ph-upload-simple text-2xl text-gray-4 mb-1" />
            <span class="text-xs text-gray-5">点击上传</span>
          </template>
        </label>
      </div>
    </template>
  </div>
</template>
