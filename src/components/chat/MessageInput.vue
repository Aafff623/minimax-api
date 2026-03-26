<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  disabled?: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'send': []
  'clear': []
}>()

const internalValue = ref(props.modelValue)

watch(() => props.modelValue, (val) => {
  internalValue.value = val
})

watch(internalValue, (val) => {
  emit('update:modelValue', val)
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function handleSend() {
  const text = internalValue.value.trim()
  if (text && !props.disabled && !props.loading) {
    emit('send')
  }
}

function handleClear() {
  internalValue.value = ''
  emit('clear')
}
</script>

<template>
  <div class="w-full">
    <div class="relative flex flex-col gap-3 p-4 rounded-2xl bg-white border-2 border-border-light focus-within:border-primary/50 transition-all duration-200 shadow-sm">
      <textarea
        v-model="internalValue"
        class="w-full resize-none rounded-xl px-4 py-3 text-sm bg-transparent border-none outline-none placeholder-text-muted disabled:cursor-not-allowed disabled:opacity-50"
        :disabled="disabled || loading"
        placeholder="输入消息，Shift+Enter 换行..."
        rows="3"
        @keydown="handleKeydown"
      />

      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <button
            class="p-2.5 rounded-xl text-text-muted hover:text-text-secondary hover:bg-gray-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            :disabled="!internalValue || loading"
            title="清空"
            @click="handleClear"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>

        <button
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-200 shadow-sm"
          :class="!internalValue.trim() || disabled || loading
            ? 'bg-gray-200 text-text-muted cursor-not-allowed'
            : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5'"
          :disabled="!internalValue.trim() || disabled || loading"
          title="发送"
          @click="handleSend"
        >
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          {{ loading ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>
