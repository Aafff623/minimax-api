<script setup lang="ts">
// Card component - simple container with header, body, footer slots
</script>

<template>
  <div class="bg-surface rounded-2xl shadow-card overflow-hidden border border-border-light transition-all duration-200 hover:shadow-card-hover">
    <div v-if="$slots.header" class="px-5 py-4 border-b border-border-light bg-surface-elevated">
      <slot name="header" />
    </div>
    <div class="p-5">
      <slot />
    </div>
    <div v-if="$slots.footer" class="px-5 py-4 border-t border-border-light bg-surface-elevated">
      <slot name="footer" />
    </div>
  </div>
</template>
