<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

type BackgroundMode = 'full' | 'gradient' | 'minimal'

interface Props {
  mode?: BackgroundMode
  enableParticles?: boolean
  particleCount?: number
  darkMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'full',
  enableParticles: false,
  particleCount: 30,
  darkMode: false,
})

const particles = ref<Array<{
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}>>([])

let animationFrame: number | null = null

const bgClasses = computed(() => {
  if (props.darkMode) {
    return {
      full: 'bg-gray-950',
      gradient: 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
      minimal: 'bg-gray-900',
    }
  }
  return {
    full: 'bg-background',
    gradient: 'bg-gradient-to-br from-primary/5 via-background to-secondary/10',
    minimal: 'bg-background',
  }
})

function generateParticles() {
  particles.value = Array.from({ length: props.particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
  }))
}

function initAnimation() {
  if (!props.enableParticles) return

  generateParticles()
}

onMounted(() => {
  initAnimation()
})

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<template>
  <div
    class="fixed inset-0 -z-10 overflow-hidden transition-colors duration-500"
    :class="bgClasses[mode]"
  >
    <!-- 动态渐变背景（gradient 模式） -->
    <Transition
      enter-active-class="transition-opacity duration-700"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mode === 'gradient'"
        class="absolute inset-0"
      >
        <!-- 主渐变光斑 -->
        <div
          class="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-3xl animate-pulse"
          style="animation-duration: 8s;"
        ></div>
        <div
          class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/15 rounded-full blur-3xl animate-pulse"
          style="animation-duration: 10s; animation-delay: 2s;"
        ></div>

        <!-- 次级光斑 -->
        <div
          class="absolute top-1/2 right-0 w-[400px] h-[400px] bg-cta/10 rounded-full blur-3xl animate-pulse"
          style="animation-duration: 12s; animation-delay: 4s;"
        ></div>
        <div
          class="absolute top-1/4 left-0 w-[300px] h-[300px] bg-pink-300/10 rounded-full blur-3xl animate-pulse"
          style="animation-duration: 15s; animation-delay: 1s;"
        ></div>
      </div>
    </Transition>

    <!-- 网格纹理（full 模式） -->
    <Transition
      enter-active-class="transition-opacity duration-700"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mode === 'full'"
        class="absolute inset-0 opacity-[0.03]"
        :style="{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }"
      ></div>
    </Transition>

    <!-- 浮动粒子 -->
    <Transition
      enter-active-class="transition-opacity duration-1000"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="enableParticles" class="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          v-for="particle in particles"
          :key="particle.id"
          class="absolute rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 animate-float"
          :style="{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }"
        ></div>
      </div>
    </Transition>

    <!-- 光晕效果（minimal 模式） -->
    <Transition
      enter-active-class="transition-opacity duration-700"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="mode === 'minimal'"
        class="absolute inset-0"
      >
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.6;
  }
  25% {
    transform: translate(20px, -30px) scale(1.1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-10px, -60px) scale(0.9);
    opacity: 0.4;
  }
  75% {
    transform: translate(-30px, -30px) scale(1.05);
    opacity: 0.7;
  }
}

.animate-float {
  animation: float ease-in-out infinite;
}
</style>
