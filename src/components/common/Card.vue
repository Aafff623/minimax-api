<script setup lang="ts" setup>
// Card component - simple container with header, body, footer slots
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
    <div v-if="$slots.header" class="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <slot name="header" />
    </div>
    <div class="px-4 py-4">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-4 py-3 border-t border-gray-200 bg-gray-50">
      <slot name="footer" />
    </div>
  </div>
</template>
