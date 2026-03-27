<script setup lang="ts">
import { ref, computed } from 'vue'

interface VoiceOption {
  id: string
  name: string
  avatar: string
}

const isExpanded = ref(false)
const isPlaying = ref(false)
const selectedVoice = ref<string>('catgirl-1')

const voiceOptions: VoiceOption[] = [
  { id: 'catgirl-1', name: '猫娘-甜萌', avatar: '' },
  { id: 'catgirl-2', name: '猫娘-傲娇', avatar: '' },
  { id: 'catgirl-3', name: '猫娘-温柔', avatar: '' },
  { id: 'neko-1', name: 'Neko-活力', avatar: '' },
  { id: 'neko-2', name: 'Neko-沉稳', avatar: '' },
  { id: 'neko-3', name: 'Neko-活泼', avatar: '' },
  { id: 'custom-1', name: '自定义-清新', avatar: '' },
  { id: 'custom-2', name: '自定义-磁性', avatar: '' },
]

const currentVoice = computed(() =>
  voiceOptions.find(v => v.id === selectedVoice.value) || voiceOptions[0]
)

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    isPlaying.value = true
  }
}

function togglePlay() {
  isPlaying.value = !isPlaying.value
}

function selectVoice(voiceId: string) {
  selectedVoice.value = voiceId
}

function handleMouseEnter() {
  if (!isExpanded.value) {
    isExpanded.value = true
    isPlaying.value = true
  }
}
</script>

<template>
  <div
    class="fixed bottom-4 left-4 z-50 select-none"
    @mouseenter="handleMouseEnter"
    @mouseleave="isExpanded = false"
  >
    <!-- 收起状态：只显示猫娘头像 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-75 -translate-x-4"
      enter-to-class="opacity-100 scale-100 translate-x-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-x-0"
      leave-to-class="opacity-0 scale-75 -translate-x-4"
    >
      <div
        v-if="!isExpanded"
        class="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary p-1 shadow-lg cursor-pointer hover:scale-110 transition-transform duration-200"
      >
        <div class="w-full h-full rounded-full bg-surface overflow-hidden">
          <!-- SVG Catgirl Avatar -->
          <svg viewBox="0 0 64 64" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="avatarBg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFB6C1"/>
                <stop offset="50%" stop-color="#DDA0DD"/>
                <stop offset="100%" stop-color="#B0C4DE"/>
              </linearGradient>
              <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FF69B4"/>
                <stop offset="100%" stop-color="#FFB6C1"/>
              </linearGradient>
            </defs>
            <!-- Background -->
            <rect width="64" height="64" fill="url(#avatarBg)"/>
            <!-- Cat ears -->
            <path d="M16 28 L10 10 L24 22 Z" fill="url(#earGrad)"/>
            <path d="M48 28 L54 10 L40 22 Z" fill="url(#earGrad)"/>
            <path d="M16 26 L13 14 L21 22 Z" fill="#FFB6C1"/>
            <path d="M48 26 L51 14 L43 22 Z" fill="#FFB6C1"/>
            <!-- Face -->
            <ellipse cx="32" cy="38" rx="18" ry="20" fill="#FFF5F5"/>
            <!-- Eyes -->
            <ellipse cx="25" cy="36" rx="4" ry="5" fill="#FF69B4"/>
            <ellipse cx="39" cy="36" rx="4" ry="5" fill="#FF69B4"/>
            <ellipse cx="25" cy="37" rx="2" ry="3" fill="#FFFFFF"/>
            <ellipse cx="39" cy="37" rx="2" ry="3" fill="#FFFFFF"/>
            <circle cx="24" cy="35" r="1" fill="#4A4A4A"/>
            <circle cx="38" cy="35" r="1" fill="#4A4A4A"/>
            <!-- Blush -->
            <ellipse cx="20" cy="42" rx="3" ry="2" fill="#FFB6C1" opacity="0.6"/>
            <ellipse cx="44" cy="42" rx="3" ry="2" fill="#FFB6C1" opacity="0.6"/>
            <!-- Nose -->
            <path d="M32 40 L30 43 L34 43 Z" fill="#FF69B4"/>
            <!-- Mouth -->
            <path d="M29 46 Q32 50 35 46" fill="none" stroke="#FF1493" stroke-width="1" stroke-linecap="round"/>
            <!-- Whiskers -->
            <line x1="10" y1="40" x2="18" y2="42" stroke="#FFB6C1" stroke-width="0.5"/>
            <line x1="10" y1="43" x2="18" y2="43" stroke="#FFB6C1" stroke-width="0.5"/>
            <line x1="46" y1="42" x2="54" y2="40" stroke="#FFB6C1" stroke-width="0.5"/>
            <line x1="46" y1="43" x2="54" y2="43" stroke="#FFB6C1" stroke-width="0.5"/>
          </svg>
        </div>
      </div>
    </Transition>

    <!-- 展开状态：完整面板 -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 scale-95 -translate-y-2"
      enter-to-class="opacity-100 scale-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 scale-100 translate-y-0"
      leave-to-class="opacity-0 scale-95 -translate-y-2"
    >
      <div
        v-if="isExpanded"
        class="w-80 bg-surface/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border-light/50 overflow-hidden"
      >
        <!-- 头部 -->
        <div class="relative px-5 py-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-b border-border-light/30">
          <div class="flex items-center gap-4">
            <!-- 头像 -->
            <div class="relative">
              <div class="w-14 h-14 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 p-1 shadow-md">
                <div class="w-full h-full rounded-full bg-surface overflow-hidden relative">
                  <!-- SVG Catgirl Avatar - Expanded -->
                  <svg viewBox="0 0 64 64" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="avatarBgExp" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FFB6C1"/>
                        <stop offset="50%" stop-color="#DDA0DD"/>
                        <stop offset="100%" stop-color="#B0C4DE"/>
                      </linearGradient>
                      <linearGradient id="earGradExp" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FF69B4"/>
                        <stop offset="100%" stop-color="#FFB6C1"/>
                      </linearGradient>
                    </defs>
                    <rect width="64" height="64" fill="url(#avatarBgExp)"/>
                    <path d="M16 28 L10 10 L24 22 Z" fill="url(#earGradExp)"/>
                    <path d="M48 28 L54 10 L40 22 Z" fill="url(#earGradExp)"/>
                    <path d="M16 26 L13 14 L21 22 Z" fill="#FFB6C1"/>
                    <path d="M48 26 L51 14 L43 22 Z" fill="#FFB6C1"/>
                    <ellipse cx="32" cy="38" rx="18" ry="20" fill="#FFF5F5"/>
                    <ellipse cx="25" cy="36" rx="4" ry="5" fill="#FF69B4"/>
                    <ellipse cx="39" cy="36" rx="4" ry="5" fill="#FF69B4"/>
                    <ellipse cx="25" cy="37" rx="2" ry="3" fill="#FFFFFF"/>
                    <ellipse cx="39" cy="37" rx="2" ry="3" fill="#FFFFFF"/>
                    <circle cx="24" cy="35" r="1" fill="#4A4A4A"/>
                    <circle cx="38" cy="35" r="1" fill="#4A4A4A"/>
                    <ellipse cx="20" cy="42" rx="3" ry="2" fill="#FFB6C1" opacity="0.6"/>
                    <ellipse cx="44" cy="42" rx="3" ry="2" fill="#FFB6C1" opacity="0.6"/>
                    <path d="M32 40 L30 43 L34 43 Z" fill="#FF69B4"/>
                    <path d="M29 46 Q32 50 35 46" fill="none" stroke="#FF1493" stroke-width="1" stroke-linecap="round"/>
                    <line x1="10" y1="40" x2="18" y2="42" stroke="#FFB6C1" stroke-width="0.5"/>
                    <line x1="10" y1="43" x2="18" y2="43" stroke="#FFB6C1" stroke-width="0.5"/>
                    <line x1="46" y1="42" x2="54" y2="40" stroke="#FFB6C1" stroke-width="0.5"/>
                    <line x1="46" y1="43" x2="54" y2="43" stroke="#FFB6C1" stroke-width="0.5"/>
                  </svg>
                </div>
              </div>
              <!-- 播放指示器 -->
              <div
                v-if="isPlaying"
                class="absolute -bottom-1 -right-1 w-5 h-5 bg-cta rounded-full flex items-center justify-center shadow-sm"
              >
                <div class="flex gap-0.5 items-end h-2">
                  <div class="w-0.5 bg-white rounded-full animate-pulse" style="animation-duration: 0.6s"></div>
                  <div class="w-0.5 bg-white rounded-full animate-pulse" style="animation-duration: 0.8s; animation-delay: 0.1s"></div>
                  <div class="w-0.5 bg-white rounded-full animate-pulse" style="animation-duration: 0.7s; animation-delay: 0.2s"></div>
                </div>
              </div>
            </div>

            <!-- 信息 -->
            <div class="flex-1">
              <h3 class="font-bold text-text-primary">AI 助手</h3>
              <p class="text-xs text-text-muted">{{ isPlaying ? '正在播放...' : '已暂停' }}</p>
            </div>

            <!-- 控制按钮 -->
            <button
              @click="togglePlay"
              class="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors duration-200"
            >
              <svg v-if="!isPlaying" class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              <svg v-else class="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- 音色选择器 -->
        <div class="p-4">
          <label class="label">选择音色</label>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="voice in voiceOptions"
              :key="voice.id"
              @click="selectVoice(voice.id)"
              class="group flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200"
              :class="[
                selectedVoice === voice.id
                  ? 'bg-primary/10 ring-2 ring-primary/30'
                  : 'bg-gray-50 hover:bg-gray-100'
              ]"
            >
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 40 40" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="voiceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#FFB6C1"/>
                      <stop offset="100%" stop-color="#DDA0DD"/>
                    </linearGradient>
                  </defs>
                  <rect width="40" height="40" fill="url(#voiceGrad)"/>
                  <path d="M10 18 L6 6 L15 14 Z" fill="#FF69B4"/>
                  <path d="M30 18 L34 6 L25 14 Z" fill="#FF69B4"/>
                  <ellipse cx="20" cy="24" rx="10" ry="11" fill="#FFF5F5"/>
                  <ellipse cx="15" cy="22" rx="2.5" ry="3" fill="#FF69B4"/>
                  <ellipse cx="25" cy="22" rx="2.5" ry="3" fill="#FF69B4"/>
                  <ellipse cx="15" cy="23" rx="1.2" ry="1.8" fill="#FFFFFF"/>
                  <ellipse cx="25" cy="23" rx="1.2" ry="1.8" fill="#FFFFFF"/>
                  <path d="M20 26 L18.5 28 L21.5 28 Z" fill="#FF69B4"/>
                </svg>
              </div>
              <span class="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors duration-200 truncate w-full text-center">
                {{ voice.name }}
              </span>
            </button>
          </div>
        </div>

        <!-- 当前选中音色信息 -->
        <div class="px-4 pb-4">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span class="text-lg">🎵</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-semibold text-text-primary text-sm">{{ currentVoice.name }}</p>
              <p class="text-xs text-text-muted">当前选中音色</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
