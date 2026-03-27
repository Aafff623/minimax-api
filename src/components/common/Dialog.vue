<script setup lang="ts">
interface Props {
  modelValue: boolean
  title?: string
  width?: string
}

withDefaults(defineProps<Props>(), {
  width: 'max-w-md',
})
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
        <div
          class="relative bg-white rounded-xl shadow-xl mx-4 transition-all"
          :class="width"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ title || 'Dialog' }}
            </h3>
            <button
              class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              @click="$emit('update:modelValue', false)"
            >
              <span class="i-icon-park-outline-close text-lg" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-5">
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
