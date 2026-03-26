<script setup lang="ts">
import type { VoiceAsyncRequest } from '~/types'
import { computed, ref } from 'vue'
import Button from '~/components/common/Button.vue'
import Card from '~/components/common/Card.vue'
import Input from '~/components/common/Input.vue'
import Loading from '~/components/common/Loading.vue'
import Select from '~/components/common/Select.vue'
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
    return `Processing... ${progress.value}%`
  if (audioUrl.value)
    return 'Audio ready!'
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
  <Card>
    <template #header>
      <h2 class="text-lg font-semibold text-gray-800">
        Async Voice Synthesis
      </h2>
    </template>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Text Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Text to Speech
        </label>
        <Input
          v-model="text"
          type="textarea"
          placeholder="Enter text to convert to speech..."
          :disabled="isProcessing"
        />
      </div>

      <!-- Model Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Model
        </label>
        <Select
          v-model="model"
          :options="voiceModels"
          :disabled="isProcessing"
        />
      </div>

      <!-- Voice Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Voice
        </label>
        <Select
          v-model="voiceId"
          :options="voiceOptions"
          :disabled="isProcessing"
        />
      </div>

      <!-- Submit Button -->
      <div class="flex items-center gap-4">
        <Button
          type="submit"
          :loading="isProcessing"
          :disabled="!text.trim() || isProcessing"
        >
          {{ isProcessing ? 'Processing...' : 'Generate Audio' }}
        </Button>

        <!-- Status Message -->
        <span
          v-if="statusMessage"
          class="text-sm" :class="[
            error ? 'text-red-500' : 'text-gray-600',
          ]"
        >
          {{ statusMessage }}
        </span>
      </div>
    </form>

    <!-- Audio Player -->
    <div v-if="audioUrl" class="mt-6 p-4 bg-gray-50 rounded-lg">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Generated Audio
      </label>
      <audio
        :src="audioUrl"
        controls
        class="w-full"
      />
    </div>

    <!-- Loading State -->
    <div v-if="isProcessing && !audioUrl" class="mt-6 flex justify-center">
      <Loading size="large" />
    </div>
  </Card>
</template>
