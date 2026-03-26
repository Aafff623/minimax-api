<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const navItems = [
  { path: '/', name: 'Home', icon: 'home' },
  { path: '/voice', name: 'Voice', icon: 'microphone' },
  { path: '/image', name: 'Image', icon: 'photo' },
  { path: '/video', name: 'Video', icon: 'video' },
  { path: '/music', name: 'Music', icon: 'music' },
  { path: '/chat', name: 'Chat', icon: 'chat' },
  { path: '/history', name: 'History', icon: 'clock' },
]

const isActive = (path: string) => route.path === path

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <div class="min-h-screen" style="background-color: #F5F3FF; font-family: 'Plus Jakarta Sans', sans-serif;">
    <!-- Desktop Navigation -->
    <header class="hidden md:block bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <RouterLink to="/" class="flex items-center gap-2 group">
            <div
              class="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
              style="background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="text-xl font-bold" style="color: #1E1B4B;">MiniMax</span>
          </RouterLink>

          <!-- Nav Items -->
          <div class="flex items-center gap-2">
            <RouterLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
              :class="[
                isActive(item.path)
                  ? 'text-white shadow-lg'
                  : 'hover:text-white hover:scale-105',
              ]"
              :style="isActive(item.path)
                ? 'background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);'
                : 'color: #1E1B4B; background-color: transparent;'"
            >
              <!-- Active indicator -->
              <span
                v-if="isActive(item.path)"
                class="absolute inset-0 rounded-xl opacity-50 blur-md -z-10"
                style="background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);"
              />

              <!-- Icons -->
              <!-- Home Icon -->
              <svg v-if="item.icon === 'home'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>

              <!-- Microphone Icon -->
              <svg v-if="item.icon === 'microphone'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>

              <!-- Photo Icon -->
              <svg v-if="item.icon === 'photo'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>

              <!-- Video Icon -->
              <svg v-if="item.icon === 'video'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>

              <!-- Music Icon -->
              <svg v-if="item.icon === 'music'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>

              <!-- Chat Icon -->
              <svg v-if="item.icon === 'chat'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>

              <!-- Clock Icon -->
              <svg v-if="item.icon === 'clock'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>

              <span>{{ item.name }}</span>

              <!-- Active bottom indicator -->
              <span
                v-if="isActive(item.path)"
                class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                style="background-color: #10B981;"
              />
            </RouterLink>
          </div>

          <!-- CTA Button -->
          <a
            href="#"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-300 hover:shadow-lg hover:scale-105"
            style="background: linear-gradient(135deg, #10B981 0%, #34D399 100%);"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            API Key
          </a>
        </div>
      </nav>
    </header>

    <!-- Mobile Navigation -->
    <header class="md:hidden bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <nav class="px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- Mobile Logo -->
          <RouterLink to="/" class="flex items-center gap-2">
            <div
              class="w-9 h-9 rounded-lg flex items-center justify-center"
              style="background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);"
            >
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span class="font-bold" style="color: #1E1B4B;">MiniMax</span>
          </RouterLink>

          <!-- Mobile Menu Button -->
          <button
            class="p-2 rounded-lg transition-colors"
            :style="{ color: isMobileMenuOpen ? '#6366F1' : '#1E1B4B' }"
            @click="toggleMobileMenu"
          >
            <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Mobile Menu Dropdown -->
        <transition
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="opacity-0 -translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition-all duration-200 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 -translate-y-2"
        >
          <div
            v-if="isMobileMenuOpen"
            class="mt-4 pb-2 grid grid-cols-4 gap-2"
          >
            <RouterLink
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-300"
              :class="[
                isActive(item.path)
                  ? 'text-white shadow-lg'
                  : 'hover:scale-105',
              ]"
              :style="isActive(item.path)
                ? 'background: linear-gradient(135deg, #6366F1 0%, #818CF8 100%);'
                : 'background-color: #F5F3FF; color: #1E1B4B;'"
              @click="isMobileMenuOpen = false"
            >
              <!-- Mobile Icons (same as desktop) -->
              <svg v-if="item.icon === 'home'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <svg v-if="item.icon === 'microphone'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <svg v-if="item.icon === 'photo'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <svg v-if="item.icon === 'video'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <svg v-if="item.icon === 'music'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <svg v-if="item.icon === 'chat'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <svg v-if="item.icon === 'clock'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>

              <span class="text-xs font-medium">{{ item.name }}</span>
            </RouterLink>
          </div>
        </transition>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>
