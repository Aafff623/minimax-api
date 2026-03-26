<script setup lang="ts">
interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue: string | number
  options: Option[]
  placeholder?: string
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Please select',
})

defineEmits<{ (e: 'update:modelValue', value: string | number): void }>()
</script>

<template>
  <select
    :value="modelValue"
    class="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white transition-colors duration-200
           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
           disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
  >
    <option value="" disabled :selected="!modelValue">
      {{ placeholder }}
    </option>
    <option
      v-for="option in options"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>
