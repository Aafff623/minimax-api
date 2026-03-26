<script setup lang="ts">
import type { VoiceAsyncRequest } from '~/types'
import { computed, ref } from 'vue'
import { useVoiceAsync } from '~/composables/useVoiceAsync'

// Voice models
const voiceModels = [
  { label: 'speech-2.8-hd (高清)', value: 'speech-2.8-hd' },
  { label: 'speech-2.6-hd', value: 'speech-2.6-hd' },
  { label: 'speech-2.8-turbo (快速)', value: 'speech-2.8-turbo' },
  { label: 'speech-2.6-turbo', value: 'speech-2.6-turbo' },
  { label: 'speech-02-hd', value: 'speech-02-hd' },
  { label: 'speech-02-turbo', value: 'speech-02-turbo' },
]

// Voice presets (327 voices - showing 20 popular ones as sample)
const voiceOptions = [
  { label: 'Alex (英文男声)', value: 'alex' },
  { label: 'Amy (英文女声)', value: 'amy' },
  { label: 'Brian (英式男声)', value: 'brian' },
  { label: 'Emma (英式女声)', value: 'emma' },
  { label: 'Geraint (威尔士男声)', value: 'geraint' },
  { label: 'Ivy (儿童女声)', value: 'ivy' },
  { label: 'Jacek (波兰男声)', value: 'jacek' },
  { label: 'Jan (波兰女声)', value: 'jan' },
  { label: 'Jasmine (美式女声)', value: 'jasmine' },
  { label: 'Justin (美式男声)', value: 'justin' },
  { label: 'Kendra (美式女声)', value: 'kendra' },
  { label: 'Kimberly (美式女声)', value: 'kimberly' },
  { label: 'Liam (加拿大男声)', value: 'liam' },
  { label: 'Mathieu (法式男声)', value: 'mathieu' },
  { label: 'Nicole (澳式女声)', value: 'nicole' },
  { label: 'Olivia (澳式女声)', value: 'olivia' },
  { label: 'Raveena (印度女声)', value: 'raveena' },
  { label: 'Ricardo (巴西葡语)', value: 'ricardo' },
  { label: 'Russell (澳式男声)', value: 'russell' },
  { label: 'Salli (美式女声)', value: 'salli' },
]

// Form state
const text = ref('')
const model = ref('speech-2.8-hd')
const voiceId = ref('alex')

// Composable
const { isPolling, error, audioUrl, isProcessing, progress, createAndPoll } = useVoiceAsync()

// Status message
const statusMessage = computed(() => {
  if (error.value)
    return error.value
  if (isPolling.value)
    return `处理中... ${progress.value}%`
  if (audioUrl.value)
    return '音频已就绪!'
  return ''
})

// Handle submit
async function handleSubmit() {
  if (!text.value.trim())
    return

  const params: VoiceAsyncRequest = {
    model: model.value as VoiceAsyncRequest['model'],
    text: text.value,
    voice_id: voiceId.value,
  }

  await createAndPoll(params)
}
</script>

<template>
  <div class="card-hover group">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-10 h-10 rounded-xl bg-cta/10 flex items-center justify-center">
        <svg class="w-5 h-5 text-cta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      </div>
      <div>
        <h2 class="section-title">
          异步语音合成
        </h2>
        <p class="section-subtitle">
          提交任务后自动处理，完成后通知
        </p>
      </div>
    </div>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <!-- Text Input -->
      <div>
        <label class="label">输入文本</label>
        <textarea
          v-model="text"
          rows="4"
          placeholder="请输入要转换为语音的文本..."
          :disabled="isProcessing"
          class="input-base resize-none w-full max-w-full box-border"
        />
      </div>

      <!-- Model Selection -->
      <div>
        <label class="label">选择模型</label>
        <select
          v-model="model"
          :disabled="isProcessing"
          class="input-base appearance-none cursor-pointer bg-no-repeat bg-right pr-10 w-full max-w-full box-border"
          style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239ca3af%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-size: 20px; background-position: right 12px center;"
        >
          <option v-for="opt in voiceModels" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Voice Selection -->
      <div>
        <label class="label">选择音色</label>
        <select
          v-model="voiceId"
          :disabled="isProcessing"
          class="input-base appearance-none cursor-pointer bg-no-repeat bg-right pr-10 w-full max-w-full box-border"
          style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239ca3af%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-size: 20px; background-position: right 12px center;"
        >
          <option v-for="opt in voiceOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>
      </div>

      <!-- Submit Button -->
      <div class="flex items-center gap-4">
        <button
          type="submit"
          :disabled="!text.trim() || isProcessing"
          class="btn-cta px-6"
        >
          <svg v-if="isProcessing" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
          {{ isProcessing ? '处理中...' : '生成音频' }}
        </button>

        <!-- Status Message -->
        <span
          v-if="statusMessage"
          class="text-sm font-medium" :class="[
            error ? 'text-red-500' : 'text-text-secondary',
          ]"
        >
          {{ statusMessage }}
        </span>
      </div>
    </form>

    <!-- Audio Player -->
    <div v-if="audioUrl" class="mt-6 p-5 rounded-xl bg-surface-elevated border border-border-light">
      <label class="label flex items-center gap-2">
        <svg class="w-4 h-4 text-cta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        生成的音频
      </label>
      <audio
        :src="audioUrl"
        controls
        class="w-full mt-2"
      />
    </div>

    <!-- Progress indicator when processing -->
    <div v-if="isPolling && !audioUrl" class="mt-6">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-text-secondary">处理进度</span>
        <span class="text-sm font-semibold text-primary">{{ progress }}%</span>
      </div>
      <div class="h-2.5 bg-surface-elevated rounded-full overflow-hidden border border-border-light">
        <div
          class="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 rounded-full"
          :style="{ width: `${progress}%` }"
        />
      </div>
    </div>
  </div>
</template>
