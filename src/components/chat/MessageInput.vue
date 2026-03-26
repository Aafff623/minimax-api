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
  <div class="message-input">
    <div class="input-wrapper">
      <textarea
        v-model="internalValue"
        class="input-textarea"
        :disabled="disabled || loading"
        placeholder="输入消息，Shift+Enter 换行..."
        rows="3"
        @keydown="handleKeydown"
      />
      <div class="input-actions">
        <button
          class="btn-clear"
          :disabled="!internalValue || loading"
          title="清空"
          @click="handleClear"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
        <button
          class="btn-send"
          :disabled="!internalValue.trim() || disabled || loading"
          title="发送"
          @click="handleSend"
        >
          <svg v-if="!loading" xmlns="http://www.w3.org/2000/svg" class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" stroke-dasharray="32" stroke-dashoffset="12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.message-input {
  @apply w-full;
}

.input-wrapper {
  @apply relative flex flex-col gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700;
}

.input-textarea {
  @apply w-full resize-none rounded-md px-3 py-2 text-sm bg-transparent border-none outline-none;
  @apply placeholder:text-gray-400 dark:placeholder:text-gray-500;
  @apply disabled:cursor-not-allowed disabled:opacity-50;
  min-height: 60px;
  max-height: 120px;
}

.input-textarea:disabled {
  @apply cursor-not-allowed;
}

.input-actions {
  @apply flex justify-end gap-2;
}

.btn-clear,
.btn-send {
  @apply p-2 rounded-md transition-all duration-200;
  @apply disabled:opacity-40 disabled:cursor-not-allowed;
}

.btn-clear {
  @apply text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700;
}

.btn-send {
  @apply text-white bg-primary-500 hover:bg-primary-600;
  @apply disabled:bg-gray-300 dark:disabled:bg-gray-600;
}

.icon {
  @apply w-4 h-4;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
