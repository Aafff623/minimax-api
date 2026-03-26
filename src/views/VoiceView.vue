<script setup lang="ts">
import VoiceClone from '@/components/voice/VoiceClone.vue'
import VoiceStream from '@/components/voice/VoiceStream.vue'
</script>

<template>
  <div class="voice-view min-h-screen bg-background p-6 lg:p-8">
    <!-- Page Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-text-primary flex items-center gap-3">
        <svg class="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
        语音合成
      </h1>
      <p class="text-text-secondary mt-2">
        使用 MiniMax 语音合成技术，将文本转换为自然流畅的语音
      </p>
    </header>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="space-y-6">
        <VoiceStream />
      </div>
      <div class="space-y-6">
        <VoiceClone />
      </div>
    </div>
  </div>
</template>
