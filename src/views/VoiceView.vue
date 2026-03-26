<script setup lang="ts">
import VoiceClone from '@/components/voice/VoiceClone.vue'
import VoiceStream from '@/components/voice/VoiceStream.vue'
</script>

<template>
  <div class="voice-view">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <VoiceStream />
      <VoiceClone />
    </div>
  </div>
</template>
