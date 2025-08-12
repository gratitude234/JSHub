<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- Global Header slot -->
    <slot name="header" />

    <!-- Page Content -->
    <router-view />

    <!-- Floating Upload Button -->
    <button
      v-if="!hideFloatingButton"
      @click="handleSmartUpload"
      class="fixed bottom-20 right-5 bg-[#003f7f] hover:bg-[#002a5c] text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition z-50"
      title="Upload Something"
    >
      +
    </button>

    <!-- Bottom Navigation -->
    <nav
      v-if="!hideBottomNav"
      class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-inner z-50"
    >
      <ul class="flex justify-around text-xs text-[#2C3E50]">
        <li @click="router.push('/')" :class="navClass('/')">
          <span class="text-2xl">🏠</span><span>Home</span>
        </li>
        <li @click="router.push('/study-hub')" :class="navClass('/study-hub') + ' glow-study'">
          <span class="text-2xl">📚</span><span>Study</span>
        </li>
        <li @click="router.push('/marketplace')" :class="navClass('/marketplace')">
          <span class="text-2xl">🛒</span><span>Market</span>
        </li>
        <li @click="router.push('/community')" :class="navClass('/community')">
          <span class="text-2xl">💬</span><span>Vibes</span>
        </li>

        <template v-if="user">
          <li @click="router.push('/notifications')" :class="navClass('/notifications')">
            <span class="text-2xl relative">
              🔔
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none shadow"
              >
                {{ unreadCount }}
              </span>
            </span>
            <span>Alerts</span>
          </li>
          <li @click="router.push('/profile')" :class="navClass('/profile')">
            <span class="text-2xl">👤</span><span>Profile</span>
          </li>
        </template>

        <template v-else>
          <li @click="router.push('/login')" class="flex flex-col items-center p-2">
            <span class="text-2xl">🔑</span><span>Login</span>
          </li>
          <li @click="router.push('/register')" class="flex flex-col items-center p-2">
            <span class="text-2xl">📝</span><span>Signup</span>
          </li>
        </template>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const navClass = (path) =>
  router.currentRoute.value.path.startsWith(path)
    ? 'text-[#003f7f] font-bold flex flex-col items-center p-2'
    : 'flex flex-col items-center p-2'

// Smart Upload Logic
function handleSmartUpload() {
  const p = route.path
  const isAdmin = user.value?.role === 'admin'

  if (p.startsWith('/announcements')) {
    if (!isAdmin) return alert('🚫 Only admins can post announcements.')
    return router.push('/upload-announcement')
  }
  if (p.startsWith('/product/') || p.startsWith('/marketplace')) return router.push('/sell')
  if (p.startsWith('/community')) return router.push('/upload-vibe')
  if (p.startsWith('/lost-found')) return router.push({ path: '/upload', query: { type: 'lost' } })
  if (p.startsWith('/materials')) return router.push('/upload-material')
  router.push('/upload')
}

// Floating Button Exemptions
const floatingButtonExempt = [
  '/login', '/register', '/complete-profile', '/upload', '/upload-vibe',
  '/sell', '/upload-material', '/my-uploads', '/payment', '/apply', '/join-team',
  '/exam-mode', '/practice-mode', '/daily-quiz', '/admin',
  '/blog', '/add-blog', '/product', '/upload-announcement', '/community',
  '/theory-drill', '/ai-assistant','' // ✅ Exclude from AI Assistant page
]
const hideFloatingButton = computed(() => {
  const p = route.path
  return (
    floatingButtonExempt.some(e => p.startsWith(e)) ||
    p.includes('/blog/') ||
    p.startsWith('/message')
  )
})

// Bottom Nav Exemptions
const bottomNavExempt = [
  '/login', '/register', '/complete-profile', '/upload', '/upload-vibe',
  '/sell', '/upload-material', '/my-uploads', '/payment', '/apply', '/join-team',
  '/exam-mode', '/practice-mode', '/daily-quiz', '/admin', '/upload-announcement',
  '/theory-drill', '/ai-assistant' // ✅ Exclude from AI Assistant page
]
const hideBottomNav = computed(() => {
  const p = route.path
  return bottomNavExempt.some(e => p.startsWith(e)) || p.startsWith('/message')
})

// 🔔 Notification Count
const unreadCount = ref(0)
let intervalId = null

async function fetchUnreadFlag() {
  if (!user.value?.id) return
  try {
    const res = await fetch(
      `https://jabumarket.com.ng/api/get_notifications.php?user_id=${user.value.id}`
    )
    const body = await res.json()
    const list = body.notifications || []
    unreadCount.value = list.filter(n => Number(n.is_read) === 0).length
  } catch (e) {
    console.error('🔔 Notification fetch error:', e)
  }
}

onMounted(() => {
  fetchUnreadFlag()
  intervalId = setInterval(fetchUnreadFlag, 8000)
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.glow-study span:first-child {
  animation: glow 2.2s ease-in-out infinite;
}
@keyframes glow {
  0%, 100% {
    text-shadow: 0 0 0px #003f7f;
  }
  50% {
    text-shadow: 0 0 6px #003f7f, 0 0 10px #003f7f;
  }
}
</style>
 