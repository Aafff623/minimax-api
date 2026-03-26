<script setup lang="ts">
import { useVoiceStream } from '@/composables/useVoiceStream'

const voiceStream = useVoiceStream()

const text = ref('')
const isConnected = ref(false)
const isSending = ref(false)

const voiceOptions = [
  { label: '清澈女声', value: 'female-qn-tianmei' },
  { label: '温柔女声', value: 'female-qn-tianmei' },
  { label: '成熟男声', value: 'male-qn-qingse' },
  { label: '青年男声', value: 'male-qn-yunyan' },
]

const selectedVoice = ref('female-qn-tianmei')

const statusText = computed(() => {
  switch (voiceStream.status.value) {
    case 'idle':
      return '未连接'
    case 'connecting':
      return '连接中...'
    case 'open':
      return '已连接'
    case 'closed':
      return '已断开'
    case 'error':
      return '连接错误'
    default:
      return '未知'
  }
})

const statusColor = computed(() => {
  switch (voiceStream.status.value) {
    case 'open':
      return 'text-green-500'
    case 'error':
      return 'text-red-500'
    case 'connecting':
      return 'text-yellow-500'
    default:
      return 'text-gray-400'
  }
})

function handleConnect() {
  if (isConnected.value) {
    voiceStream.stop()
    isConnected.value = false
  }
  else {
    voiceStream.connect({
      voice_id: selectedVoice.value,
      onStatusChange: (s) => {
        isConnected.value = s === 'open'
      },
      onError: (e) => {
        console.error(e)
        isConnected.value = false
      },
    })
  }
}

function handleSend() {
  if (!text.value.trim() || !isConnected.value)
    return

  isSending.value = true
  voiceStream.sendText(text.value, { voice_id: selectedVoice.value })

  setTimeout(() => {
    isSending.value = false
  }, 500)
}

function handleDownload() {
  const blob = voiceStream.getAudioBlob()
  if (!blob)
    return

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `voice-${Date.now()}.mp3`
  a.click()
  URL.revokeObjectURL(url)
}

function handleClear() {
  voiceStream.clearChunks()
  text.value = ''
}
</script>

<template>
  <div class="voice-stream bg-white rounded-xl shadow-sm p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-800">
        流式语音合成
      </h2>
      <div class="flex items-center gap-2">
        <span class="i-icon-park-outline-circle mr-1" :class="[statusColor]" />
        <span :class="statusColor">{{ statusText }}</span>
      </div>
    </div>

    <!-- Voice Selection -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">音色选择</label>
      <select
        v-model="selectedVoice"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <option v-for="opt in voiceOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Text Input -->
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
      <textarea
        v-model="text"
        rows="4"
        placeholder="请输入要转换的文本..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
      />
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 mb-4">
      <button
        class="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200" :class="[
          isConnected
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-primary text-white hover:bg-primary/90',
        ]"
        @click="handleConnect"
      >
        {{ isConnected ? '断开连接' : '连接' }}
      </button>

      <button
        :disabled="!isConnected || !text.trim() || isSending"
        class="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleSend"
      >
        <span v-if="isSending" class="i-icon-park-outline-loading-three-quarters mr-1 animate-spin" />
        {{ isSending ? '发送中...' : '发送' }}
      </button>
    </div>

    <!-- Download & Clear -->
    <div class="flex gap-3">
      <button
        :disabled="voiceStream.audioChunks.value.length === 0"
        class="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleDownload"
      >
        <span class="i-icon-park-outline-download mr-1" />
        下载音频
      </button>

      <button
        :disabled="voiceStream.audioChunks.value.length === 0"
        class="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleClear"
      >
        <span class="i-icon-park-outline-delete mr-1" />
        清空
      </button>
    </div>

    <!-- mpv Player Hint -->
    <div class="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
      <div class="flex items-start gap-3">
        <span class="i-icon-park-outline-info text-amber-500 text-lg mt-0.5" />
        <div class="text-sm text-amber-800">
          <p class="font-medium mb-1">
            提示
          </p>
          <p>流式音频通过 Web Audio API 实时播放。如需更高质量的音频体验，可配合 mpv 播放器使用：</p>
          <code class="mt-2 block bg-amber-100 px-2 py-1 rounded text-xs">
            mpv --no-cache --no-terminal --loop=no https://api.minimaxi.com/...
          </code>
        </div>
      </div>
    </div>
  </div>
</template>
