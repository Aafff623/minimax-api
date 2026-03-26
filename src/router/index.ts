import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/voice',
      name: 'voice',
      component: () => import('@/views/VoiceView.vue'),
    },
    {
      path: '/image',
      name: 'image',
      component: () => import('@/views/ImageView.vue'),
    },
    {
      path: '/video',
      name: 'video',
      component: () => import('@/views/VideoView.vue'),
    },
    {
      path: '/music',
      name: 'music',
      component: () => import('@/views/MusicView.vue'),
    },
    {
      path: '/chat',
      name: 'chat',
      component: () => import('@/views/ChatView.vue'),
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('@/views/HistoryView.vue'),
    },
  ],
})

export default router
