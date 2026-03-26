<script setup lang="ts" setup>
import { ref, onMounted } from 'vue'

interface Props {
  type?: 'success' | 'error' | 'warning' | 'info'
  message: string
  duration?: number
}

withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 3000,
})

const visible = ref(false)

onMounted(() => {
  visible.value = true
  if (duration > 0) {
    setTimeout(() => {
      visible.value = false
    }, duration)
  }
})

const typeClasses: Record<string, string> = {
  success: 'bg-green-500',
  error: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
}

const typeIcons: Record<string, string> = {
  success: 'i-icon-park-outline-success',
  error: 'i-icon-park-outline-error',
  warning: 'i-icon-park-outline-warning',
  info: 'i-icon-park-outline-info',
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-all duration-300"
      leave-active-class="transition-all duration-300"
      enter-from-class="opacity-0 translate-y-4"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="visible"
        :class="[
          'fixed top-4 left-1/2 -translate-x-1/2 z-50',
          'flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white',
          typeClasses[type!],
        ]"
      >
        <span :class="[typeIcons[type!], 'text-lg']" />
        <span>{{ message }}</span>
      </div>
    </Transition>
  </Teleport>
</template>
