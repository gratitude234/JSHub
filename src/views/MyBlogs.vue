<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-32">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 px-4 shadow flex items-center justify-between sticky top-0 z-40">
      <button @click="$router.back()" class="text-white text-xl font-bold">←</button>
      <h1 class="text-xl font-bold flex-1 text-center -ml-4">📰 My Blog Posts</h1>
      <div class="w-6" />
    </header>

    <!-- Search -->
    <div v-if="blogs.length > 0" class="px-4 pt-4">
      <input
        v-model="search"
        type="text"
        placeholder="🔍 Search your blogs..."
        class="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#003f7f]"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="p-6 space-y-4">
      <div v-for="n in 3" :key="n" class="animate-pulse bg-white p-4 rounded-xl shadow space-y-2">
        <div class="flex gap-4">
          <div class="bg-gray-300 w-24 h-24 rounded-lg"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 bg-gray-300 rounded w-1/2"></div>
            <div class="h-3 bg-gray-200 rounded w-full"></div>
            <div class="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredBlogs.length === 0" class="text-center py-24 text-gray-600 px-6 animate-fade-in">
      <div class="text-6xl mb-4 animate-bounce">📝</div>
      <h2 class="text-lg font-semibold mb-2">No Blog Posts Yet</h2>
      <p class="text-sm text-gray-500 max-w-xs mx-auto">
        You haven’t posted any blogs. Share your thoughts, stories, or helpful tips with the campus community.
      </p>
      <router-link
        to="/upload-blog"
        class="inline-flex items-center gap-2 mt-6 bg-[#003f7f] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#002d5c] transition"
      >
        ✍️ <span>Write Your First Blog</span>
      </router-link>
    </div>

    <!-- Blog List -->
    <section v-else class="p-4 space-y-5 animate-fade-in">
      <div
        v-for="blog in filteredBlogs"
        :key="blog.id"
        class="bg-white rounded-2xl shadow border border-gray-200 hover:shadow-md hover:scale-[1.01] transition-all duration-200"
      >
        <div class="flex gap-4 p-4">
          <div
            class="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center text-3xl font-bold text-white shadow"
            :class="!blog.cover_url && 'bg-gradient-to-r from-[#003f7f] to-[#7f4000]'"
          >
            <img
              v-if="blog.cover_url"
              :src="blog.cover_url"
              alt="cover"
              class="w-full h-full object-cover"
            />
            <span v-else>{{ blog.title.charAt(0).toUpperCase() }}</span>
          </div>

          <div class="flex-1 space-y-1 overflow-hidden">
            <h2 class="text-base font-semibold truncate">{{ blog.title }}</h2>
            <p class="text-sm text-gray-600 leading-snug line-clamp-2">{{ trimExcerpt(blog.body) }}</p>
            <p class="text-xs text-gray-400">{{ formatDate(blog.created_at) }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-4 border-t border-gray-100 px-4 py-2 text-sm font-semibold">
          <router-link :to="`/blog/${blog.id}`" class="text-[#003f7f] hover:underline flex items-center gap-1">🔍 View</router-link>
          <router-link :to="`/add-blog?id=${blog.id}`" class="text-blue-600 hover:underline flex items-center gap-1">✏️ Edit</router-link>
          <button @click="deleteBlog(blog.id)" class="text-red-600 hover:underline flex items-center gap-1">🗑 Delete</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const blogs = ref([])
const loading = ref(true)
const search = ref('')

onMounted(loadBlogs)

async function loadBlogs() {
  loading.value = true
  try {
    if (!user.value?.id) {
      blogs.value = []
      return
    }
    const res = await fetch(`https://jabumarket.com.ng/api/get_my_blogs.php?user_id=${user.value.id}`)
    blogs.value = await safeJson(res)
  } catch (err) {
    console.error('Failed to load user blogs:', err)
    blogs.value = []
  } finally {
    loading.value = false
  }
}

async function deleteBlog(id) {
  const confirmDelete = confirm('Are you sure you want to delete this blog?')
  if (!confirmDelete) return
  try {
    const res = await fetch(`https://jabumarket.com.ng/api/delete_blog.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    const data = await res.json()
    if (data.success) {
      blogs.value = blogs.value.filter(b => b.id !== id)
    } else {
      alert(data.error || 'Failed to delete blog.')
    }
  } catch (err) {
    alert('❌ Network error. Please try again.')
  }
}

function trimExcerpt(html = '') {
  const div = document.createElement('div')
  div.innerHTML = html
  const text = div.innerText || div.textContent || ''
  return text.length > 100 ? text.slice(0, 100) + '...' : text
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return []
  }
}

const filteredBlogs = computed(() => {
  return blogs.value.filter(blog =>
    blog.title.toLowerCase().includes(search.value.toLowerCase())
  )
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
 