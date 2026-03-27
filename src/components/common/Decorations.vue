<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface Props {
  enableFloatingIcons?: boolean
  enableSparkles?: boolean
  enableGradientSpots?: boolean
  iconCount?: number
  sparkleCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  enableFloatingIcons: true,
  enableSparkles: true,
  enableGradientSpots: true,
  iconCount: 8,
  sparkleCount: 20,
})

interface FloatingIcon {
  id: number
  x: number
  y: number
  icon: string
  size: number
  duration: number
  delay: number
  rotate: number
}

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  duration: number
  delay: number
}

interface GradientSpot {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

const floatingIcons = ref<FloatingIcon[]>([])
const sparkles = ref<Sparkle[]>([])
const gradientSpots = ref<GradientSpot[]>([])

const iconEmojis = ['✨', '🌟', '💫', '⭐', '🌸', '🎵', '🎨', '💎', '🔮', '🎀', '🌈', '💖']

function generateFloatingIcons() {
  floatingIcons.value = Array.from({ length: props.iconCount }, (_, i) => ({
    id: i,
    x: Math.random() * 90 + 5,
    y: Math.random() * 80 + 10,
    icon: iconEmojis[Math.floor(Math.random() * iconEmojis.length)],
    size: Math.random() * 20 + 16,
    duration: Math.random() * 15 + 20,
    delay: Math.random() * 10,
    rotate: Math.random() * 360,
  }))
}

function generateSparkles() {
  sparkles.value = Array.from({ length: props.sparkleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 5,
  }))
}

function generateGradientSpots() {
  const colors = [
    'from-primary/20 to-transparent',
    'from-secondary/20 to-transparent',
    'from-cta/15 to-transparent',
    'from-pink-300/20 to-transparent',
    'from-purple-300/20 to-transparent',
  ]

  gradientSpots.value = Array.from({ length: 4 }, (_, i) => ({
    id: i,
    x: [10, 85, 25, 70][i] + Math.random() * 10,
    y: [15, 25, 60, 75][i] + Math.random() * 10,
    size: Math.random() * 200 + 150,
    color: colors[i % colors.length],
    duration: Math.random() * 20 + 25,
    delay: Math.random() * 10,
  }))
}

onMounted(() => {
  if (props.enableFloatingIcons) generateFloatingIcons()
  if (props.enableSparkles) generateSparkles()
  if (props.enableGradientSpots) generateGradientSpots()
})
</script>

<template>
  <div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
    <!-- 渐变光斑 -->
    <Transition
      enter-active-class="transition-opacity duration-1000"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="enableGradientSpots" class="absolute inset-0">
        <div
          v-for="spot in gradientSpots"
          :key="spot.id"
          class="absolute rounded-full blur-3xl animate-drift"
          :class="spot.color.split(' ')[0].replace('from-', 'bg-gradient-to-br')"
          :style="{
            left: `${spot.x}%`,
            top: `${spot.y}%`,
            width: `${spot.size}px`,
            height: `${spot.size}px`,
            background: `linear-gradient(135deg, var(--color-primary) 0%, transparent 70%)`,
            animationDuration: `${spot.duration}s`,
            animationDelay: `${spot.delay}s`,
            opacity: 0.4,
          }"
        ></div>
      </div>
    </Transition>

    <!-- 浮动图标 -->
    <Transition
      enter-active-class="transition-opacity duration-1000 delay-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-60"
      leave-active-class="transition-opacity duration-500"
      leave-from-class="opacity-60"
      leave-to-class="opacity-0"
    >
      <div v-if="enableFloatingIcons" class="absolute inset-0">
        <div
          v-for="item in floatingIcons"
          :key="item.id"
          class="absolute animate-float-icon text-gray-400/60 dark:text-gray-600/40"
          :style="{
            left: `${item.x}%`,
            top: `${item.y}%`,
            fontSize: `${item.size}px`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
            transform: `rotate(${item.rotate}deg)`,
          }"
        >
          {{ item.icon }}
        </div>
      </div>
    </Transition>

    <!-- 闪光粒子 -->
    <Transition
      enter-active-class="transition-opacity duration-1500 delay-500"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="enableSparkles" class="absolute inset-0">
        <div
          v-for="sparkle in sparkles"
          :key="sparkle.id"
          class="absolute rounded-full bg-white animate-sparkle"
          :style="{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
            width: `${sparkle.size}px`,
            height: `${sparkle.size}px`,
            animationDuration: `${sparkle.duration}s`,
            animationDelay: `${sparkle.delay}s`,
            boxShadow: `0 0 ${sparkle.size * 2}px rgba(255, 255, 255, 0.8)`,
          }"
        ></div>
      </div>
    </Transition>

    <!-- 角落装饰 -->
    <div class="absolute top-0 left-0 w-32 h-32 pointer-events-none">
      <div class="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary/20 rounded-tl-xl"></div>
      <div class="absolute top-8 left-8 w-12 h-12 border-l border-t border-secondary/15 rounded-tl-lg"></div>
    </div>

    <div class="absolute top-0 right-0 w-32 h-32 pointer-events-none">
      <div class="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-primary/20 rounded-tr-xl"></div>
      <div class="absolute top-8 right-8 w-12 h-12 border-r border-t border-secondary/15 rounded-tr-lg"></div>
    </div>

    <div class="absolute bottom-0 left-0 w-32 h-32 pointer-events-none">
      <div class="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-primary/20 rounded-bl-xl"></div>
      <div class="absolute bottom-8 left-8 w-12 h-12 border-l border-b border-secondary/15 rounded-bl-lg"></div>
    </div>

    <div class="absolute bottom-0 right-0 w-32 h-32 pointer-events-none">
      <div class="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-primary/20 rounded-br-xl"></div>
      <div class="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-secondary/15 rounded-br-lg"></div>
    </div>
  </div>
</template>

<style scoped>
@keyframes float-icon {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
    opacity: 0.6;
  }
  25% {
    transform: translateY(-20px) rotate(5deg);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-35px) rotate(-3deg);
    opacity: 0.5;
  }
  75% {
    transform: translateY(-15px) rotate(3deg);
    opacity: 0.7;
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 0;
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes drift {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -20px) scale(1.05);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.95);
  }
}

.animate-float-icon {
  animation: float-icon ease-in-out infinite;
}

.animate-sparkle {
  animation: sparkle ease-in-out infinite;
}

.animate-drift {
  animation: drift ease-in-out infinite;
}
</style>
