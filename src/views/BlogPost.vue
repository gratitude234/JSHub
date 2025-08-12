<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] overflow-x-hidden pb-32">
    <!-- 🔙 Header -->
    <header class="bg-[#003f7f] text-white py-4 px-4 shadow flex items-center justify-between sticky top-0 z-40">
      <button @click="goBack" class="text-white text-xl font-bold">←</button>
      <h1 class="text-lg font-semibold flex-1 text-center -ml-4 truncate">🎓 Blog Post</h1>
      <div class="w-6"></div>
    </header>

    <!-- 🖼 Cover Image -->
    <div v-if="post.cover_url" class="w-full h-56 relative overflow-hidden" @click="openImage(post.cover_url)">
      <img
        :src="getFullImageUrl(post.cover_url)"
        alt="cover"
        class="w-full h-full object-cover transition-all duration-500 ease-in-out cursor-pointer"
        :class="{ 'blur-md scale-105': loadingCover, 'blur-0 scale-100': !loadingCover }"
        @load="loadingCover = false"
      />
    </div>

    <!-- ⏳ Loading -->
    <div v-if="loading" class="text-center py-24 animate-pulse text-sm text-gray-500">
      ⏳ Loading blog post...
    </div>

    <!-- 📄 Content -->
    <div v-else class="px-5 pt-6 animate-fade-in">

      <!-- 🗳️ SU CAMPAIGN POST -->
      <template v-if="post.post_type === 'su_campaign'">
        <div class="flex flex-col items-center text-center mb-8">
          <div
            class="w-24 h-24 rounded-full overflow-hidden bg-[#003f7f] text-white text-3xl font-bold flex items-center justify-center shadow cursor-pointer"
            @click="post.profile_picture || post.author_avatar ? openImage(post.profile_picture || post.author_avatar) : null"
          >
            <template v-if="post.profile_picture || post.author_avatar">
              <img :src="getFullImageUrl(post.profile_picture || post.author_avatar)" class="w-full h-full object-cover" />
            </template>
            <template v-else>
              {{ getInitial(post.author) }}
            </template>
          </div>

          <h2 class="text-2xl font-bold mt-4 text-[#003f7f]">{{ post.author || 'Candidate' }}</h2>
          <div class="text-sm text-[#007c91] mt-1 bg-[#e0f7fa] px-3 py-1 rounded-full">
            🏛 Student Union Candidate
          </div>
        </div>

        <h1 class="text-3xl font-extrabold text-center mb-6">{{ post.title }}</h1>

        <div class="text-sm leading-relaxed text-[#2C3E50] max-w-2xl mx-auto text-left">
          <div v-if="post.content" v-html="post.content" />
          <p v-else class="text-gray-500 italic mb-10">No campaign content provided.</p>
        </div>

        <div class="mt-10 bg-[#d1f7f5] text-[#003f7f] text-sm py-3 px-6 rounded-xl text-center font-bold">
          🗳️ Don't forget to vote and support your favorite candidate!
        </div>
      </template>

      <!-- ✏️ REGULAR BLOG POST -->
      <template v-else>
        <!-- Title -->
        <h2 class="text-2xl font-bold text-[#003f7f] leading-tight mb-1">{{ post.title }}</h2>

        <!-- Author Info -->
        <div class="flex items-center gap-3 text-sm text-[#2C3E50]/70 mb-4">
          <div
            class="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-[#003f7f] text-white font-bold text-lg shrink-0 cursor-pointer"
            @click="post.profile_picture || post.author_avatar ? openImage(post.profile_picture || post.author_avatar) : null"
          >
            <template v-if="post.profile_picture || post.author_avatar">
              <img :src="getFullImageUrl(post.profile_picture || post.author_avatar)" class="w-full h-full object-cover" />
            </template>
            <template v-else>
              {{ getInitial(post.author) }}
            </template>
          </div>
          <div>
            <div class="font-semibold">{{ post.author || 'Anonymous' }}</div>
            <div class="text-xs flex items-center gap-1">
              <span>{{ formatDate(post.created_at) }}</span>
              <span class="mx-1">•</span>
              <span>{{ readingTime }} read</span>
            </div>
          </div>
        </div>

        <!-- Views -->
        <div class="text-xs text-[#2C3E50]/60 mb-6 flex items-center gap-3">
          <span>👁️ {{ post.views }} view{{ post.views == 1 ? '' : 's' }}</span>
        </div>

        <!-- Tags -->
        <div v-if="post.tags?.length" class="flex flex-wrap gap-2 mb-6">
          <button
            v-for="t in post.tags"
            :key="t"
            @click="router.push({ name: 'BlogTag', params: { tag: t } })"
            class="bg-gray-200 hover:bg-gray-300 transition text-[#003f7f] text-xs px-2 py-0.5 rounded-full"
          >
            #{{ t }}
          </button>
        </div>

        <!-- Full Blog Content -->
        <div v-if="post.content" v-html="post.content" class="prose prose-sm max-w-none text-left"></div>
        <p v-else class="text-gray-500 italic mb-10">No content available for this post.</p>
      </template>

    </div>

    <!-- 🖼 Fullscreen Image Modal -->
    <transition name="fade">
      <div
        v-if="showImageModal"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        @click.self="closeImage"
      >
        <img :src="getFullImageUrl(selectedImage)" class="max-w-full max-h-full rounded-lg shadow-lg" />
        <button
          class="absolute top-5 right-5 text-white bg-black/50 rounded-full p-2 hover:bg-black"
          @click="closeImage"
        >
          ✖
        </button>
      </div>
    </transition>

    <!-- 🎉 Sticky Reaction Bar -->
    <transition name="slide-up">
      <div
        v-if="!loading && showStickyBar"
        class="fixed bottom-0 inset-x-0 bg-white border-t p-3 flex justify-center gap-4 z-50 shadow-xl"
      >
        <button
          v-for="opt in reactions"
          :key="opt.type + '-sticky'"
          @click="toggleReaction(opt.type)"
          class="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#003f7f]"
          :class="userReaction === opt.type ? 'bg-[#003f7f] text-white' : 'bg-gray-100 hover:bg-gray-200'"
        >
          {{ opt.emoji }} <span>{{ reactionCounts[opt.type] || 0 }}</span>
        </button>
      </div>
    </transition>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const post = ref({})
const loading = ref(true)
const loadingCover = ref(true)
const selectedImage = ref(null)
const showImageModal = ref(false)
const reactionCounts = ref({})
const userReaction = ref('')
const reacting = ref(false)
const similarPosts = ref([])
const showStickyBar = ref(false)

const placeholderImg = '/placeholder-64.png'
const api = 'https://jabumarket.com.ng/api'

function goBack() {
  router.back()
}

function getInitial(name) {
  return name?.trim()?.charAt(0)?.toUpperCase() || 'U'
}

function getFullImageUrl(path) {
  if (!path) return placeholderImg
  return path.startsWith('http') ? path : `https://jabumarket.com.ng/${path}`
}

function openImage(path) {
  selectedImage.value = path
  showImageModal.value = true
}

function closeImage() {
  showImageModal.value = false
  selectedImage.value = null
}

function formatDate(s) {
  return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const readingTime = computed(() => {
  if (!post.value?.content) return '0'
  const plain = post.value.content.replace(/<[^>]+>/g, '')
  return Math.max(1, Math.ceil(plain.split(/\s+/).length / 180)) + ' min'
})

function ensureAnonId() {
  let id = localStorage.getItem('anonId')
  if (!id) {
    id = crypto.randomUUID?.() || Math.random().toString(36).slice(2)
    localStorage.setItem('anonId', id)
  }
  return id
}

async function fetchReactions() {
  const blogId = route.params.id
  const uid = userStore.user?.id || 0
  const res = await fetch(`${api}/get_blog_reactions.php?blog_id=${blogId}&user_id=${uid}&anon_id=${ensureAnonId()}`)
  const json = await res.json()
  reactionCounts.value = (json.counts || []).reduce((a, r) => {
    a[r.reaction] = +r.count
    return a
  }, {})
  userReaction.value = json.user_reaction || ''
}

async function toggleReaction(type) {
  if (reacting.value) return
  reacting.value = true
  try {
    const res = await fetch(`${api}/react_to_blog.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blog_id: route.params.id,
        user_id: userStore.user?.id || null,
        anon_id: ensureAnonId(),
        reaction: type
      })
    })
    const j = await res.json()
    if (j.status !== 'success') throw new Error(j.message || 'Unknown error')
    reactionCounts.value = j.counts.reduce((a, r) => {
      a[r.reaction] = +r.count
      return a
    }, {})
    userReaction.value = j.userReaction
  } catch (e) {
    console.error(e)
    alert('Failed to react: ' + e.message)
  } finally {
    reacting.value = false
  }
}

function onScroll() {
  showStickyBar.value = window.scrollY > 400
}

onMounted(async () => {
  const id = route.params.id
  try {
    const r = await fetch(`${api}/blog_post.php?id=${id}`)
    post.value = await r.json()
  } catch {
    post.value = { title: 'Post not found', content: '', author: 'System', views: 0 }
  } finally {
    loading.value = false
  }

  fetch(`${api}/track_blog_view.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      post_id: id,
      user_id: userStore.user?.id || null,
      anon_id: ensureAnonId()
    })
  }).catch(() => {})

  await fetchReactions()

  window.addEventListener('scroll', onScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>


<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s }
.fade-enter-from, .fade-leave-to { opacity: 0 }

.slide-up-enter-active, .slide-up-leave-active { transition: 0.25s ease }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); opacity: 0 }
.slide-up-enter-to, .slide-up-leave-from { transform: translateY(0); opacity: 1 }

.reacted { animation: pop 0.2s ease }
@keyframes pop { 0% { transform: scale(1) } 50% { transform: scale(1.3) } 100% { transform: scale(1) } }
</style>
