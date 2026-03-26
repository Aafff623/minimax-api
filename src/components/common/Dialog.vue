<script setup lang="ts" setup>
interface Props {
  modelValue: boolean
  title?: string
}

defineProps<Props>()
defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center"
      >
        <!-- Overlay -->
        <div
          class="absolute inset-0 bg-black/50"
          @click="$emit('update:modelValue', false)"
        />

        <!-- Dialog -->
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <!-- Header -->
          <div class="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ title || 'Dialog' }}
            </h3>
            <button
              class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              @click="$emit('update:modelValue', false)"
            >
              <span class="i-icon-park-outline-close text-xl" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-4 py-4">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
