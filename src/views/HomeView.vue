<script setup lang="ts">
interface Module {
  id: string
  title: string
  description: string
  icon: string
  gradient: string
  route: string
}

const modules: Module[] = [
  {
    id: 'voice',
    title: '语音合成',
    description: 'Text-to-Speech 语音生成，支持 327 种音色',
    icon: 'voice',
    gradient: 'from-violet-500 to-purple-600',
    route: '/voice'
  },
  {
    id: 'image',
    title: '图片生成',
    description: 'AI 驱动的图片创作，image-01 模型',
    icon: 'image',
    gradient: 'from-pink-500 to-rose-600',
    route: '/image'
  },
  {
    id: 'video',
    title: '视频生成',
    description: 'T2V/I2V/S2V 多模式视频创作',
    icon: 'video',
    gradient: 'from-orange-500 to-amber-600',
    route: '/video'
  },
  {
    id: 'music',
    title: '音乐创作',
    description: 'Music-2.5 智能音乐生成带歌词',
    icon: 'music',
    gradient: 'from-emerald-500 to-teal-600',
    route: '/music'
  },
  {
    id: 'chat',
    title: 'AI 对话',
    description: 'M2.7 超拟人对话，30,000 次/5小时',
    icon: 'chat',
    gradient: 'from-blue-500 to-indigo-600',
    route: '/chat'
  },
  {
    id: 'history',
    title: '历史记录',
    description: '收藏夹与历史内容，永久保存',
    icon: 'history',
    gradient: 'from-slate-600 to-gray-700',
    route: '/history'
  }
]

const handleCardClick = (route: string) => {
  window.location.href = route
}
</script>

<template>
  <div class="min-h-screen bg-[#F5F3FF] font-sans">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-[#6366F1]/10 to-[#818CF8]/10" />
      <div class="absolute top-20 left-10 w-72 h-72 bg-[#6366F1]/20 rounded-full blur-3xl" />
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-[#818CF8]/20 rounded-full blur-3xl" />

      <div class="relative max-w-6xl mx-auto px-6 py-20 text-center">
        <h1 class="text-5xl md:text-6xl font-bold text-[#1E1B4B] mb-6 tracking-tight">
          <span class="bg-gradient-to-r from-[#6366F1] to-[#818CF8] bg-clip-text text-transparent">
            MiniMax Visual Tool
          </span>
        </h1>
        <p class="text-xl md:text-2xl text-[#1E1B4B]/70 mb-4 max-w-2xl mx-auto">
          您的专属 AI 创作助手
        </p>
        <p class="text-base text-[#1E1B4B]/50 max-w-xl mx-auto">
          集成语音合成、图片生成、视频创作、音乐创作、AI 对话等六大模块
        </p>
      </div>
    </section>

    <!-- Module Cards Section -->
    <section class="max-w-6xl mx-auto px-6 pb-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="mod in modules"
          :key="mod.id"
          class="group relative bg-white rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#6366F1]/20 border border-[#6366F1]/10"
          @click="handleCardClick(mod.route)"
        >
          <!-- Gradient accent bar -->
          <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <!-- Icon Container -->
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-[#6366F1]/10 to-[#818CF8]/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <!-- Voice Icon -->
            <svg v-if="mod.icon === 'voice'" class="w-7 h-7 text-[#6366F1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>

            <!-- Image Icon -->
            <svg v-else-if="mod.icon === 'image'" class="w-7 h-7 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>

            <!-- Video Icon -->
            <svg v-else-if="mod.icon === 'video'" class="w-7 h-7 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m22 8-6 4 6 4V8Z"/>
              <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
            </svg>

            <!-- Music Icon -->
            <svg v-else-if="mod.icon === 'music'" class="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/>
              <circle cx="18" cy="16" r="3"/>
            </svg>

            <!-- Chat Icon -->
            <svg v-else-if="mod.icon === 'chat'" class="w-7 h-7 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M8 10h.01"/>
              <path d="M12 10h.01"/>
              <path d="M16 10h.01"/>
            </svg>

            <!-- History Icon -->
            <svg v-else-if="mod.icon === 'history'" class="w-7 h-7 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M12 7v5l4 2"/>
            </svg>
          </div>

          <!-- Content -->
          <h3 class="text-lg font-semibold text-[#1E1B4B] mb-2">
            {{ mod.title }}
          </h3>
          <p class="text-sm text-[#1E1B4B]/60 leading-relaxed">
            {{ mod.description }}
          </p>

          <!-- Arrow indicator -->
          <div class="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <svg class="w-5 h-5 text-[#6366F1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="text-center py-8 text-sm text-[#1E1B4B]/40">
      <p>MiniMax Visual Tool v1.0</p>
    </footer>
  </div>
</template>
