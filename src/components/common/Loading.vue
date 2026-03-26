<script setup lang="ts" setup>
interface Props {
  size?: 'small' | 'medium' | 'large'
  color?: 'primary' | 'white'
}

withDefaults(defineProps<Props>(), {
  size: 'medium',
  color: 'primary',
})

const sizeClasses: Record<string, string> = {
  small: 'w-4 h-4',
  medium: 'w-8 h-8',
  large: 'w-12 h-12',
}

const colorClasses: Record<string, string> = {
  primary: 'text-blue-500',
  white: 'text-white',
}
</script>

<template>
  <div class="flex items-center justify-center">
    <svg
      :class="[sizeClasses[size!], colorClasses[color!], 'animate-spin']"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.196a8 8 0 01-8-8V0c5.373 0 12 5.373 12 12h-2zm-2 5.196a8 8 0 008-8V0c-5.373 0-12 5.373-12 12h2zm2-5.196a8 8 0 018 8V0c-5.373 0-12-5.373-12-12h2z"
      />
    </svg>
  </div>
</template>
