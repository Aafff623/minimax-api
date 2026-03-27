<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'

interface Props {
  videoSrc?: string
  logoSrc?: string
  duration?: number // 倒计时秒数
  autoPlay?: boolean
  showAgain?: boolean // 是否强制显示（忽略 localStorage）
}

const props = withDefaults(defineProps<Props>(), {
  videoSrc: '/videos/welcome.mp4',
  logoSrc: '/images/logo.png',
  duration: 8,
  autoPlay: true,
  showAgain: false,
})

const emit = defineEmits<{
  (e: 'complete'): void
  (e: 'skip'): void
}>()

const isVisible = ref(false)
const isSkipping = ref(false)
const countdown = ref(props.duration)
const showLogo = ref(true)
const neverShowAgain = ref(false)
const videoLoaded = ref(false)

let countdownInterval: number | null = null
let videoElement: HTMLVideoElement | null = null

const countdownText = computed(() => `${countdown.value}s`)
const STORAGE_KEY = 'hasSeenWelcomeVideo'

function initVideo() {
  if (!props.autoPlay) {
    isVisible.value = false
    return
  }

  // 检查 localStorage（除非 showAgain 为 true）
  if (!props.showAgain) {
    const hasSeenWelcome = localStorage.getItem(STORAGE_KEY)
    if (hasSeenWelcome) {
      isVisible.value = false
      return
    }
  }

  isVisible.value = true
  startCountdown()
}

function startCountdown() {
  countdownInterval = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      completeVideo()
    }
  }, 1000)
}

function completeVideo() {
  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }

  // 淡出效果
  isSkipping.value = true
  setTimeout(() => {
    isVisible.value = false
    showLogo.value = false
    emit('complete')
  }, 500)
}

function skipVideo() {
  if (neverShowAgain.value) {
    localStorage.setItem('hasSeenWelcomeVideo', 'true')
  }
  completeVideo()
  emit('skip')
}

function handleVideoLoaded() {
  videoLoaded.value = true
  if (videoElement) {
    videoElement.play().catch(() => {
      // 自动播放被阻止，显示 CSS 动画
      videoLoaded.value = false
    })
  }
}

function handleVideoEnded() {
  completeVideo()
}

function toggleNeverShow() {
  neverShowAgain.value = !neverShowAgain.value
}

onMounted(() => {
  initVideo()
})

onUnmounted(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-500"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-500"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
      >
        <!-- 视频层（仅当视频加载成功时显示） -->
        <div v-if="videoLoaded" class="absolute inset-0 overflow-hidden">
          <video
            ref="videoElement"
            :src="videoSrc"
            class="absolute inset-0 w-full h-full object-cover"
            @loadeddata="handleVideoLoaded"
            @ended="handleVideoEnded"
            muted
            playsinline
          />
        </div>

        <!-- CSS 动画层（视频未加载或自动播放失败时显示） -->
        <Transition
          enter-active-class="transition-all duration-700"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition-all duration-500"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-105"
        >
          <div
            v-if="showLogo"
            class="absolute inset-0 flex items-center justify-center overflow-hidden"
          >
            <!-- 动态渐变背景 -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent animate-gradient-shift"></div>

            <!-- 背景动画元素 -->
            <div class="absolute inset-0 overflow-hidden">
              <!-- 漂浮粒子 -->
              <div class="particle p1"></div>
              <div class="particle p2"></div>
              <div class="particle p3"></div>
              <div class="particle p4"></div>
              <div class="particle p5"></div>
              <div class="particle p6"></div>

              <!-- 光晕效果 -->
              <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
              <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 0.5s"></div>

              <!-- 网格线 -->
              <div class="grid-overlay"></div>
            </div>

            <!-- Logo -->
            <div class="relative flex flex-col items-center gap-6 z-10">
              <div class="logo-container">
                <div class="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl animate-float">
                  <span class="text-6xl animate-pulse">🎬</span>
                </div>
                <div class="logo-ring"></div>
                <div class="logo-ring ring-2"></div>
              </div>
              <h1 class="text-5xl font-bold text-white tracking-wide animate-title">
                MiniMax
              </h1>
              <p class="text-white/70 text-lg tracking-widest animate-subtitle">
                Visual Tool
              </p>
            </div>
          </div>
        </Transition>

        <!-- 顶部跳过按钮 -->
        <div class="absolute top-6 right-6 z-10">
          <button
            @click="skipVideo"
            class="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-sm text-white/80 hover:text-white rounded-full transition-all duration-200 hover:bg-black/60"
          >
            <span class="text-sm font-medium">跳过</span>
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 4l10 8-10 8V4zM19 5v14"/>
            </svg>
          </button>
        </div>

        <!-- 底部控制栏 -->
        <div
          class="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent"
          :class="{ 'opacity-0': isSkipping }"
        >
          <div class="flex items-center justify-between max-w-2xl mx-auto">
            <!-- 不再显示复选框 -->
            <label class="flex items-center gap-3 cursor-pointer group">
              <div
                class="w-6 h-6 rounded-md border-2 border-white/50 flex items-center justify-center transition-all duration-200 group-hover:border-white/80"
                :class="[
                  neverShowAgain
                    ? 'bg-cta border-cta'
                    : 'bg-transparent'
                ]"
                @click.stop="toggleNeverShow"
              >
                <svg
                  v-if="neverShowAgain"
                  class="w-4 h-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                >
                  <path d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span class="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-200">
                不再显示
              </span>
            </label>

            <!-- 倒计时 -->
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center">
                <span class="text-white font-bold text-sm">{{ countdownText }}</span>
              </div>
            </div>

            <!-- 进度条 -->
            <div class="flex-1 max-w-xs mx-8">
              <div class="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  class="h-full bg-cta rounded-full transition-all duration-1000 ease-linear"
                  :style="{ width: `${((duration - countdown) / duration) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 渐变动画 */
@keyframes gradient-shift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-gradient-shift {
  background-size: 200% 200%;
  animation: gradient-shift 8s ease infinite;
}

/* 漂浮动画 */
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}

/* 标题动画 */
@keyframes title-reveal {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-title {
  animation: title-reveal 1s ease-out 0.3s both;
}

.animate-subtitle {
  animation: title-reveal 1s ease-out 0.6s both;
}

/* Logo 光环 */
.logo-container {
  position: relative;
}

.logo-ring {
  position: absolute;
  inset: -8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 2rem;
  animation: ring-pulse 2s ease-in-out infinite;
}

.logo-ring.ring-2 {
  inset: -16px;
  animation-delay: 0.5s;
  opacity: 0.5;
}

@keyframes ring-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.6;
  }
}

/* 粒子动画 */
.particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: particle-float 15s linear infinite;
}

.p1 { top: 10%; left: 20%; animation-delay: 0s; }
.p2 { top: 20%; left: 80%; animation-delay: 2s; animation-duration: 18s; }
.p3 { top: 60%; left: 10%; animation-delay: 4s; animation-duration: 20s; }
.p4 { top: 70%; left: 70%; animation-delay: 1s; animation-duration: 16s; }
.p5 { top: 40%; left: 50%; animation-delay: 3s; animation-duration: 22s; }
.p6 { top: 85%; left: 40%; animation-delay: 5s; animation-duration: 17s; }

@keyframes particle-float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

/* 网格覆盖层 */
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 20s linear infinite;
}

@keyframes grid-move {
  0% {
    transform: perspective(500px) rotateX(60deg) translateY(0);
  }
  100% {
    transform: perspective(500px) rotateX(60deg) translateY(50px);
  }
}
</style>
