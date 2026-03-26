<script setup lang="ts">
interface Props {
  type?: 'primary' | 'secondary' | 'cta' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
})

const typeClasses: Record<string, string> = {
  primary: 'bg-primary text-white shadow-button hover:shadow-button-hover hover:bg-primary/90',
  secondary: 'bg-surface border-2 border-border-light text-text-primary hover:border-primary/50 hover:bg-hover-overlay',
  cta: 'bg-cta text-white shadow-button hover:shadow-button-hover hover:bg-cta/90',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  ghost: 'bg-transparent text-text-primary hover:bg-hover-overlay',
}

const sizeClasses: Record<string, string> = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-5 py-2.5 text-base',
  large: 'px-6 py-3 text-lg',
}
</script>

<template>
  <button
    class="inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0" :class="[
      typeClasses[type!],
      sizeClasses[size!],
    ]"
    :disabled="disabled || loading"
  >
    <svg v-if="loading" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
    <slot />
  </button>
</template>
