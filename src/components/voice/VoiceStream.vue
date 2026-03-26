<script setup lang="ts">
import { computed, ref } from 'vue'
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
      return 'bg-cta'
    case 'error':
      return 'bg-red-500'
    case 'connecting':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-400'
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
  <div class="card-hover group">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <svg class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </div>
        <div>
          <h2 class="section-title">
            流式语音合成
          </h2>
          <p class="section-subtitle">
            实时转换，即时播放
          </p>
        </div>
      </div>
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-elevated border border-border-light">
        <span class="w-2 h-2 rounded-full transition-all duration-300" :class="statusColor" />
        <span class="text-sm font-medium text-text-secondary">{{ statusText }}</span>
      </div>
    </div>

    <!-- Voice Selection -->
    <div class="mb-5">
      <label class="label">音色选择</label>
      <select
        v-model="selectedVoice"
        class="input-base appearance-none cursor-pointer bg-no-repeat bg-right pr-10"
        style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239ca3af%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-size: 20px; background-position: right 12px center;"
      >
        <option v-for="opt in voiceOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
    </div>

    <!-- Text Input -->
    <div class="mb-5">
      <label class="label">输入文本</label>
      <textarea
        v-model="text"
        rows="4"
        placeholder="请输入要转换的文本..."
        class="input-base resize-none w-full max-w-full box-border"
      />
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 mb-5 w-full overflow-hidden">
      <button
        class="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 box-border overflow-hidden"
        :class="[
          isConnected
            ? 'bg-red-500 text-white hover:bg-red-600 shadow-button hover:shadow-button-hover'
            : 'bg-primary text-white hover:bg-primary/90 shadow-button hover:shadow-button-hover',
        ]"
        @click="handleConnect"
      >
        <svg v-if="isConnected" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" x2="6" y1="6" y2="18" />
          <line x1="6" x2="18" y1="6" y2="18" />
        </svg>
        <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14" />
          <path d="M12 5v14" />
        </svg>
        {{ isConnected ? '断开连接' : '连接' }}
      </button>

      <button
        :disabled="!isConnected || !text.trim() || isSending"
        class="flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-200 bg-secondary text-white hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-button hover:shadow-button-hover flex items-center justify-center gap-2"
        @click="handleSend"
      >
        <svg v-if="isSending" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
        {{ isSending ? '发送中...' : '发送' }}
      </button>
    </div>

    <!-- Download & Clear -->
    <div class="flex gap-3 w-full overflow-hidden">
      <button
        :disabled="voiceStream.audioChunks.value.length === 0"
        class="flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 bg-surface-elevated text-text-primary border border-border-light hover:border-primary/50 hover:bg-hover-overlay disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 box-border overflow-hidden"
        @click="handleDownload"
      >
        <svg class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        下载音频
      </button>

      <button
        :disabled="voiceStream.audioChunks.value.length === 0"
        class="flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-200 bg-surface-elevated text-text-primary border border-border-light hover:border-primary/50 hover:bg-hover-overlay disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        @click="handleClear"
      >
        <svg class="w-4 h-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
        清空
      </button>
    </div>

    <!-- Info Card -->
    <div class="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
      <div class="flex items-start gap-3">
        <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        </div>
        <div class="text-sm text-text-secondary">
          <p class="font-semibold text-text-primary mb-1">
            使用提示
          </p>
          <p>流式音频通过 Web Audio API 实时播放。如需更高质量的音频体验，可配合 mpv 播放器使用：</p>
          <code class="mt-2 block bg-surface px-3 py-2 rounded-lg text-xs font-mono text-text-primary border border-border-light">
            mpv --no-cache --no-terminal --loop=no https://api.minimaxi.com/...
          </code>
        </div>
      </div>
    </div>
  </div>
</template>
