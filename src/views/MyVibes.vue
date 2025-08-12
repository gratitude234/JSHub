<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-28 text-[#2C3E50]">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 px-4 flex items-center justify-between shadow-md sticky top-0 z-50">
      <button @click="router.back()" class="text-white font-bold text-xl">←</button>
      <h1 class="text-lg font-bold text-center flex-1 -ml-4">💬 My Campus Vibes</h1>
      <div class="w-6" />
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-20 text-sm text-gray-500 animate-pulse">
      ⏳ Loading your vibes…
    </div>

    <!-- No Posts -->
    <div v-else-if="posts.length === 0" class="text-center py-20 text-sm text-gray-500">
      😶 You haven't posted anything on Campus Vibes yet.
    </div>

    <!-- Posts List -->
    <div v-else class="p-4 space-y-5">
      <div
        v-for="post in posts"
        :key="post.id"
        class="bg-white rounded-xl shadow-md border border-gray-200 p-4 space-y-3 relative"
      >
        <!-- Timestamp + Delete Button -->
        <div class="flex justify-between items-start text-xs text-gray-500">
          <span class="font-medium">🕒 {{ formatDate(post.timestamp) }}</span>
          <button
            @click="confirmDelete(post.id)"
            class="text-red-500 text-xs font-semibold hover:underline"
          >
            🗑 Delete
          </button>
        </div>

        <!-- Post Text -->
        <p class="text-sm text-[#2C3E50] whitespace-pre-wrap leading-relaxed">
          {{ post.body }}
        </p>

        <!-- Post Image -->
        <div
          v-if="post.image_url"
          class="w-full overflow-hidden rounded-lg border border-gray-100"
        >
          <img
            :src="post.image_url"
            alt="Post Image"
            class="w-full object-cover max-h-64"
          />
        </div>

        <!-- Reactions -->
        <div class="text-xs text-gray-500 font-medium pt-1">
          💬 {{ post.reactions || 0 }} reactions
        </div>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="toastMessage"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#003f7f] text-white px-4 py-2 rounded-full shadow-lg animate-fade-in-out"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const posts = ref([])
const loading = ref(true)
const toastMessage = ref('')

onMounted(() => {
  loadMyPosts()
})

async function loadMyPosts() {
  if (!user.value?.id) return
  try {
    const res = await fetch(`https://jabumarket.com.ng/api/get_my_posts.php?user_id=${user.value.id}`)
    const data = await res.json()
    posts.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Failed to fetch posts:', err)
    posts.value = []
  } finally {
    loading.value = false
  }
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function showToast(msg) {
  toastMessage.value = msg
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

async function confirmDelete(id) {
  if (!confirm('Are you sure you want to delete this post?')) return

  try {
    const res = await fetch('https://jabumarket.com.ng/api/delete_post.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, user_id: user.value.id }),
    })
    const data = await res.json()
    if (data.success) {
      posts.value = posts.value.filter(p => p.id !== id)
      showToast('✅ Post deleted.')
    } else {
      showToast(data.error || '❌ Failed to delete post.')
    }
  } catch (err) {
    showToast('❌ Network error.')
  }
}
</script>

<style scoped>
img {
  max-height: 256px;
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10%, 90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}
.animate-fade-in-out {
  animation: fadeInOut 3s ease forwards;
}
</style>
