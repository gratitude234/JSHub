<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-32 text-[#2C3E50]">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      👋 Hey, {{ firstName }}!
    </header>

    <section v-if="userReady" class="p-4 space-y-8">
      <!-- Profile Info Card -->
      <div class="bg-white rounded-2xl shadow p-6 space-y-4 text-center">
        <div class="flex flex-col items-center space-y-2">
          <div class="relative w-20 h-20">
            <img
              v-if="user.profile_picture"
              :src="user.profile_picture"
              alt="Profile"
              class="w-20 h-20 rounded-full object-cover shadow"
            />
            <div
              v-else
              class="w-20 h-20 bg-[#003f7f] text-white flex items-center justify-center text-2xl font-bold rounded-full shadow"
            >
              {{ initials }}
            </div>
            <label class="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer shadow hover:scale-105 transition">
              📷
              <input type="file" accept="image/*" class="hidden" @change="handleImageUpload" />
            </label>
          </div>

          <transition name="fade">
            <div v-if="uploading || successMsg || errorMsg" class="text-xs mt-1">
              <span v-if="uploading" class="text-gray-500">Uploading...</span>
              <span v-else-if="successMsg" class="text-green-600">{{ successMsg }}</span>
              <span v-else-if="errorMsg" class="text-red-600">{{ errorMsg }}</span>
            </div>
          </transition>

          <div>
            <h2 class="text-lg font-bold">{{ user.name }}</h2>
            <p class="text-sm text-gray-600">{{ user.email }}</p>

            <span
              v-if="user.role === 'admin'"
              class="inline-block mt-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-semibold"
            >
              👑 Admin
            </span>
            <span
              v-else-if="user.role === 'staff'"
              class="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-semibold"
            >
              🛠️ Staff
            </span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-700">
          <div>
            <p class="font-medium text-[#003f7f]">🎓 Department</p>
            <p>{{ user.department || 'Not set' }}</p>
          </div>
          <div>
            <p class="font-medium text-[#003f7f]">📘 Level</p>
            <p>{{ user.level || 'Not set' }}</p>
          </div>
        </div>

        <router-link
          to="/complete-profile"
          class="block w-full mt-4 py-2 text-sm font-semibold text-center text-[#003f7f] bg-[#e9f3ff] rounded-lg hover:bg-[#d5e9ff] transition"
        >
          ✏️ Edit Profile
        </router-link>

        <router-link
          v-if="user.role === 'admin'"
          to="/admin/"
          class="admin-button"
        >
          ⚙️ Admin Dashboard
        </router-link>
      </div>

      <!-- Upload Summary -->
      <div>
        <h2 class="text-lg font-bold text-[#003f7f] mb-3">📁 My Uploads</h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <router-link to="/my-materials" class="upload-card">
            📚 Study Materials
            <span class="text-xs text-gray-500 block">{{ uploads.materials || 'No uploads yet' }}</span>
          </router-link>
          <router-link to="/my-products" class="upload-card">
            🛒 Products
            <span class="text-xs text-gray-500 block">{{ uploads.products || 'No uploads yet' }}</span>
          </router-link>
          <router-link to="/my-blogs" class="upload-card">
            📝 Blogs
            <span class="text-xs text-gray-500 block">{{ uploads.blogs || 'No posts yet' }}</span>
          </router-link>
          <router-link to="/my-vibes" class="upload-card">
            💬 Campus Vibes
            <span class="text-xs text-gray-500 block">{{ uploads.posts || 'Nothing shared yet' }}</span>
          </router-link>
        </div>
      </div>

      <!-- Gamification Overview -->
      <div>
        <h2 class="text-lg font-bold text-[#003f7f] mb-2">⚡ Gamification Overview</h2>
        <div class="bg-white rounded-2xl shadow p-4 space-y-3">
          <p class="text-sm">
            Level <strong>{{ progress.gamification_level }}</strong> · 🔥
            <span class="text-orange-500 font-semibold">{{ progress.streak }}</span> day streak
          </p>
          <div class="w-full bg-gray-200 rounded-full h-3" title="XP Progress">
            <div
              class="bg-[#28a745] h-3 rounded-full transition-all duration-700"
              :style="{ width: xpPercent + '%' }"
            ></div>
          </div>
          <p class="text-xs text-gray-500 text-right">
            {{ progress.xp }} XP · Next Level at {{ xpTarget }} XP
          </p>
          <div v-if="progress.badges.length" class="flex flex-wrap gap-2 mt-2">
            <span
              v-for="badge in progress.badges"
              :key="badge"
              class="bg-[#003f7f] text-white text-xs px-2 py-1 rounded-full"
              :title="`You earned this badge for ${badge}`"
            >
              🏅 {{ badge }}
            </span>
          </div>
          <router-link
            to="/progress"
            class="text-xs text-[#003f7f] underline mt-2 inline-block"
          >
            View full progress →
          </router-link>
        </div>
      </div>

      <!-- Quick Actions -->
      <div>
        <h2 class="text-lg font-bold text-[#003f7f] mb-2">🎯 Quick Actions</h2>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <router-link to="/progress" class="action-button">📊 My Progress</router-link>
          <router-link to="/wishlist" class="action-button">💖 Wishlist</router-link>
          <router-link to="/my-blogs" class="action-button">📰 My Blogs</router-link>
          <router-link to="/lost-found" class="action-button">🧳 Lost & Found</router-link>
          <router-link to="/practice-mode" class="action-button">🧠 Practice Mode</router-link>
          <router-link to="/exam-mode" class="action-button">📝 Exam Mode</router-link>
          <router-link to="/daily-quiz" class="action-button">🧩 Daily Quiz</router-link>
          <router-link to="/orders" class="action-button">📦 My Orders</router-link>
        </div>
      </div>

      <!-- Logout -->
      <div class="pt-2">
        <button
          @click="logout"
          class="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold shadow transition duration-200"
        >
          🚪 Logout
        </button>
      </div>
    </section>

    <div v-else class="text-center py-24 text-sm text-gray-400 animate-pulse">
      ⏳ Loading profile...
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const userReady = computed(() => !!user.value)
const progress = ref({ xp: 0, gamification_level: 0, streak: 0, badges: [] })
const uploads = ref({ materials: 0, products: 0, blogs: 0, posts: 0 })

const uploading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

const xpAtLevelStart = computed(() => {
  const level = progress.value.gamification_level || 1
  return Math.round(100 * Math.pow(level - 1, 1.5))
})

const xpTarget = computed(() => {
  const level = progress.value.gamification_level || 1
  return Math.round(100 * Math.pow(level, 1.5))
})

const xpPercent = computed(() => {
  const xp = progress.value.xp || 0
  const earned = xp - xpAtLevelStart.value
  const needed = xpTarget.value - xpAtLevelStart.value
  if (needed <= 0) return 0
  return Math.min(100, (earned / needed) * 100).toFixed(1)
})

const initials = computed(() => {
  const name = user.value?.name || ''
  return name
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const firstName = computed(() => {
  return user.value?.name?.split(' ')[0] || 'Scholar'
})

onMounted(() => {
  fetchUserInfo()
  fetchProgress()
  fetchUploads()
})

async function fetchUserInfo() {
  if (!user.value?.id) return
  try {
    const res = await fetch(`https://jabumarket.com.ng/api/get_user_profile.php?user_id=${user.value.id}`)
    const data = await res.json()
    if (data.success && data.user) {
      userStore.setUser(data.user)
    }
  } catch (err) {
    console.error('Failed to load user info:', err)
  }
}

async function fetchProgress() {
  if (!user.value?.id) return
  try {
    const res = await fetch(`https://jabumarket.com.ng/api/get_user_progress.php?user_id=${user.value.id}`)
    if (res.ok) {
      progress.value = await res.json()
    }
  } catch (err) {
    console.error('Failed to load gamification:', err)
  }
}

async function fetchUploads() {
  if (!user.value?.id) return
  try {
    const [mat, prod, blog, post] = await Promise.all([
      fetch(`https://jabumarket.com.ng/api/get_my_materials.php?user_id=${user.value.id}`),
      fetch(`https://jabumarket.com.ng/api/get_my_products.php?user_id=${user.value.id}`),
      fetch(`https://jabumarket.com.ng/api/get_my_blogs.php?user_id=${user.value.id}`),
      fetch(`https://jabumarket.com.ng/api/get_my_posts.php?user_id=${user.value.id}`)
    ])
    uploads.value.materials = (await safeJson(mat)).length
    uploads.value.products = (await safeJson(prod)).length
    uploads.value.blogs = (await safeJson(blog)).length
    uploads.value.posts = (await safeJson(post)).length
  } catch (err) {
    console.error('Upload counts failed:', err)
  }
}

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return []
  }
}

async function handleImageUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  uploading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  const formData = new FormData()
  formData.append('profile_picture', file)
  formData.append('user_id', user.value.id)

  try {
    const res = await fetch('https://jabumarket.com.ng/api/update_full_profile.php', {
      method: 'POST',
      body: formData
    })
    const data = await res.json()
    if (data.success) {
      successMsg.value = '✅ Profile picture updated!'
      await fetchUserInfo()
    } else {
      errorMsg.value = data.error || '❌ Upload failed.'
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = '❌ Network error. Please try again.'
  } finally {
    uploading.value = false
  }
}

function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.action-button {
  @apply bg-white border border-[#003f7f] text-[#003f7f] py-3 rounded-xl font-semibold shadow text-center hover:bg-[#f0faff] transition-transform duration-200 hover:scale-105;
}
.upload-card {
  @apply bg-white border border-gray-300 rounded-xl p-4 shadow hover:shadow-md transition duration-300;
}
.admin-button {
  @apply block w-full mt-2 py-2 text-sm font-semibold text-center text-white bg-[#7f4000] rounded-lg shadow-md hover:bg-[#693300] hover:shadow-lg transition-shadow duration-200;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
