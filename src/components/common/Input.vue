<script setup lang="ts">
interface Props {
  modelValue: string
  type?: 'text' | 'password' | 'textarea'
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  error: false,
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
    class="input-base resize-none"
    :class="{ 'input-error': error }"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
  <input
    v-else
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    class="input-base"
    :class="{ 'input-error': error }"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  >
</template>
