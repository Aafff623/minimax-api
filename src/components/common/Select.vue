<script setup lang="ts">
interface Option {
  label: string
  value: string | number
}

interface Props {
  modelValue: string | number
  options: Option[]
  placeholder?: string
  disabled?: boolean
  error?: boolean
}

withDefaults(defineProps<Props>(), {
  placeholder: '请选择',
  disabled: false,
  error: false,
})

defineEmits<{ (e: 'update:modelValue', value: string | number): void }>()
</script>

<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    class="input-base appearance-none cursor-pointer bg-no-repeat bg-right pr-10"
    :class="{ 'input-error': error }"
    style="background-image: url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%239ca3af%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e'); background-size: 20px; background-position: right 12px center;"
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
