<script setup lang="ts">
interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'default'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'default',
  size: 'medium',
  disabled: false,
  loading: false,
})

const typeClasses: Record<string, string> = {
  primary: 'bg-blue-500 text-white hover:bg-blue-600',
  success: 'bg-green-500 text-white hover:bg-green-600',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  default: 'bg-gray-200 text-gray-700 hover:bg-gray-300',
}

const sizeClasses: Record<string, string> = {
  small: 'px-2 py-1 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg',
}
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      typeClasses[type!],
      sizeClasses[size!],
    ]"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="i-icon-park-outline-loading-three-quarters mr-2 animate-spin" />
    <slot />
  </button>
</template>
