<script setup lang="ts">
interface Props {
  modelValue: string
  type?: 'text' | 'password' | 'textarea'
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
})

defineEmits<{ (e: 'update:modelValue', value: string): void }>()
</script>

<template>
  <textarea
    v-if="type === 'textarea'"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    rows="4"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none transition-colors duration-200
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
           disabled:bg-gray-100 disabled:cursor-not-allowed"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
  <input
    v-else
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg transition-colors duration-200
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
           disabled:bg-gray-100 disabled:cursor-not-allowed"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
