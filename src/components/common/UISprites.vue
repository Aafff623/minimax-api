<script setup lang="ts">
/**
 * UISprites - SVG Sprite Container
 * Contains inline SVG definitions for all UI decorative assets
 * This component is hidden and provides SVG sprites for the entire app
 */

// Icon paths by module
const iconPaths = {
  voice: 'M12 2C9.243 2 7 4.243 7 7v6c0 2.757 2.243 5 5 5s5-2.243 5-5V7c0-2.757-2.243-5-5-5zm3 11c0 1.654-1.346 3-3 3s-3-1.346-3-3v-1c0-1.654 1.346-3 3-3s3 1.346 3 3v1zM12 18c2.206 0 4-1.794 4-4h-8c0 2.206 1.794 4 4 4z',
  image: 'M3 3h18v18H3V3zm2 2v14h14V5H5zm2.5 3.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM21 15l-5-5L5 21',
  video: 'M2 4h15v16H2V4zm15 4l4 4-4 4V8z',
  music: 'M9 18V6l12-3v12M6 18a3 3 0 100-6 3 3 0 000 6zm12-3a3 3 0 100-6 3 3 0 000 6z',
  chat: 'M21 15c0 3.866-3.134 7-7 7H7l-4 4V7c0-3.866 3.134-7 7-7h7c3.866 0 7 3.134 7 7v8z',
  history: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 110-16 8 8 0 010 16zm0-12v6l4 2',
} as const
</script>

<template>
  <!-- Hidden SVG sprite container -->
  <div class="hidden">
    <svg xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Gradient definitions -->
        <linearGradient id="sprite-primary-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="100%" stop-color="#8b5cf6"/>
        </linearGradient>

        <!-- Module icon symbols -->
        <symbol id="sprite-icon-voice" viewBox="0 0 24 24">
          <path :d="iconPaths.voice" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="sprite-icon-image" viewBox="0 0 24 24">
          <path :d="iconPaths.image" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="sprite-icon-video" viewBox="0 0 24 24">
          <path :d="iconPaths.video" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="sprite-icon-music" viewBox="0 0 24 24">
          <path :d="iconPaths.music" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="sprite-icon-chat" viewBox="0 0 24 24">
          <path :d="iconPaths.chat" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <symbol id="sprite-icon-history" viewBox="0 0 24 24">
          <path :d="iconPaths.history" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </symbol>

        <!-- Background patterns -->
        <pattern id="sprite-geo-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#f8fafc"/>
          <rect x="5" y="5" width="10" height="10" fill="#e2e8f0" rx="2"/>
        </pattern>

        <pattern id="sprite-dots-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <rect width="20" height="20" fill="#f8fafc"/>
          <circle cx="10" cy="10" r="2" fill="#cbd5e1"/>
        </pattern>

        <pattern id="sprite-waves-pattern" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse" preserveAspectRatio="none">
          <rect width="100" height="50" fill="#f8fafc"/>
          <path d="M0 25 Q25 15 50 25 T100 25" fill="none" stroke="#e2e8f0" stroke-width="2"/>
        </pattern>
      </defs>
    </svg>
  </div>
</template>
