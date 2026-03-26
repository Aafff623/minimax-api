<script setup lang="ts">
import ChatWindow from '@/components/chat/ChatWindow.vue'
</script>

<template>
  <div class="chat-view p-6 min-h-screen" style="background: linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%);">
    <div class="max-w-4xl mx-auto h-[calc(100vh-3rem)]">
      <ChatWindow />
    </div>
  </div>
</template>

<style scoped>
.chat-view {
  @apply h-full;
}
</style>
