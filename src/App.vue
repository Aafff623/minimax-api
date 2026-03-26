<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow-sm">
      <nav class="container mx-auto px-4 py-4">
        <div class="flex items-center gap-6">
          <RouterLink to="/" class="text-xl font-bold text-primary">
            MiniMax API
          </RouterLink>
          <div class="flex gap-4">
            <RouterLink
              to="/"
              class="text-gray-600 hover:text-primary transition-colors"
            >
              Home
            </RouterLink>
            <RouterLink
              to="/voice"
              class="text-gray-600 hover:text-primary transition-colors"
            >
              Voice
            </RouterLink>
          </div>
        </div>
      </nav>
    </header>
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
