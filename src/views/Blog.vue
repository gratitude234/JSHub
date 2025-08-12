<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-32 text-[#2C3E50]">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white shadow">
      <div class="py-4 px-4">
        <h1 class="text-xl font-bold">📚 Student Blogs</h1>
        <p class="text-sm mt-1">Read, write, and share your stories with campus!</p>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4 px-4 pt-6">
      <div v-for="n in 3" :key="n" class="bg-white rounded-2xl p-4 shadow animate-pulse">
        <div class="w-full h-32 bg-gray-200 rounded-xl mb-3"></div>
        <div class="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-5/6 mb-1"></div>
        <div class="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>

    <!-- SU Campaigns -->
    <section v-else-if="suCampaignPosts.length" class="p-4 space-y-6">
      <h2 class="text-lg font-bold text-[#003f7f] mb-4">🗳️ Meet Your Candidates</h2>

      <div
        v-for="post in suCampaignPosts"
        :key="post.id"
        class="bg-white rounded-2xl p-4 shadow hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
        @click="goToPost(post.id)"
      >
        <!-- Cover Image or Placeholder -->
        <div class="w-full h-40 rounded-xl overflow-hidden mb-3 relative">
          <template v-if="post.cover_url">
            <img
              :src="getFullImageUrl(post.cover_url)"
              alt="Cover Image"
              class="w-full h-full object-cover transition-all duration-500 ease-in-out"
              :class="{ 'blur-md scale-105': loadingImages[post.id], 'blur-0 scale-100': !loadingImages[post.id] }"
              @load="onImageLoad(post.id)"
            />
          </template>
          <template v-else>
            <div
              :class="['w-full h-full flex items-center justify-center text-xs text-gray-500 font-semibold', getRandomPlaceholder(post.id)]"
            >
              Campaign Post
            </div>
          </template>
        </div>

        <!-- Badge + Title -->
        <div class="flex flex-col space-y-1">
          <div
            class="inline-block bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm"
          >
            🚨 SU Campaign
          </div>
          <h2 class="text-lg font-semibold text-[#003f7f]">{{ post.title }}</h2>
        </div>

        <!-- Excerpt -->
        <div class="text-sm mt-2 space-y-2 line-clamp-3" v-html="post.excerpt"></div>

        <!-- Footer -->
        <div class="text-xs text-[#2C3E50]/60 mt-3 flex justify-between">
          <span>By {{ post.author || 'Anonymous' }}</span>
          <span>{{ formatDate(post.created_at) }}</span>
        </div>
      </div>
    </section>

    <!-- Normal Blogs -->
    <section v-if="normalPosts.length" class="p-4 space-y-6">
      <h2 class="text-lg font-bold text-[#003f7f] mb-4">📚 Student Blogs</h2>

      <div
        v-for="post in normalPosts"
        :key="post.id"
        class="bg-white rounded-2xl p-4 shadow hover:shadow-lg hover:-translate-y-1 transition cursor-pointer"
        @click="goToPost(post.id)"
      >
        <!-- Cover Image or Placeholder -->
        <div class="w-full h-40 rounded-xl overflow-hidden mb-3 relative">
          <template v-if="post.cover_url">
            <img
              :src="getFullImageUrl(post.cover_url)"
              alt="Cover Image"
              class="w-full h-full object-cover transition-all duration-500 ease-in-out"
              :class="{ 'blur-md scale-105': loadingImages[post.id], 'blur-0 scale-100': !loadingImages[post.id] }"
              @load="onImageLoad(post.id)"
            />
          </template>
          <template v-else>
            <div
              :class="['w-full h-full flex items-center justify-center text-xs text-gray-500 font-semibold', getRandomPlaceholder(post.id)]"
            >
              No Cover
            </div>
          </template>
        </div>

        <!-- Title -->
        <h2 class="text-lg font-semibold text-[#003f7f]">{{ post.title }}</h2>

        <!-- Excerpt -->
        <div class="text-sm mt-2 space-y-2 line-clamp-3" v-html="post.excerpt"></div>

        <!-- Footer -->
        <div class="text-xs text-[#2C3E50]/60 mt-3 flex justify-between">
          <span>By {{ post.author || 'Anonymous' }}</span>
          <span>{{ formatDate(post.created_at) }}</span>
        </div>
      </div>
    </section>

    <!-- Empty State -->
    <div v-else class="text-center text-[#2C3E50]/70 mt-10">
      <p>No blog posts yet. Be the first to share your thoughts!</p>
      <button
        @click="goToAddBlog"
        class="mt-4 bg-[#003f7f] text-white px-4 py-2 rounded-lg hover:bg-[#002f5f] transition"
      >
        ✍️ Write Now
      </button>
    </div>

    <!-- Floating Button -->
    <button
      @click="goToAddBlog"
      class="fixed bottom-20 right-5 bg-[#7f4000] text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center"
      title="Write a Blog"
    >
      🖊️
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const posts = ref([])
const loading = ref(true)
const loadingImages = ref({})
const router = useRouter()

function goToPost(id) {
  router.push(`/blog/${id}`)
}

function goToAddBlog() {
  router.push('/add-blog')
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function getFullImageUrl(path) {
  if (!path) return '/placeholder-64.png'
  return path.startsWith('http')
    ? path
    : `https://jabumarket.com.ng/${path}`
}

function onImageLoad(postId) {
  loadingImages.value[postId] = false
}

function getRandomPlaceholder(postId) {
  const colors = [
    'bg-red-100',
    'bg-yellow-100',
    'bg-green-100',
    'bg-blue-100',
    'bg-purple-100',
    'bg-pink-100',
    'bg-indigo-100',
    'bg-amber-100'
  ]
  const index = postId % colors.length
  return colors[index]
}

const suCampaignPosts = computed(() =>
  posts.value.filter(p => p.post_type === 'su_campaign')
)

const normalPosts = computed(() =>
  posts.value.filter(p => p.post_type !== 'su_campaign')
)

onMounted(async () => {
  try {
    const res = await fetch('https://jabumarket.com.ng/api/blog_posts.php')
    const data = await res.json()
    posts.value = Array.isArray(data)
      ? data.map(p => ({
          ...p,
          excerpt: p.excerpt || p.content || ''
        }))
      : []
  } catch (err) {
    console.error('Failed to fetch blog posts:', err)
    posts.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
