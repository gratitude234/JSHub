<!-- File: src/pages/Community.vue -->
<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] flex flex-col">
    <!-- 🔹 Header -->
    <header
      class="bg-[#003f7f] text-white py-4 px-4 flex items-center justify-between shadow"
    >
      <button @click="router.back()" class="text-white text-xl font-bold">←</button>
      <h1 class="text-lg font-bold flex-1 text-center">Campus Vibes</h1>
      <div class="w-6" />
    </header>

    <!-- 🔹 Filter & View Toggle -->
    <div
      class="px-4 py-2 bg-white shadow-sm sticky top-0 z-50 flex items-center justify-between"
    >
      <select
        v-model="filterTag"
        class="border border-gray-300 rounded px-2 py-1 text-sm"
      >
        <option value="Recent">Recent</option>
        <option value="Trending">Trending</option>
        <option value="Lost &amp; Found">Lost &amp; Found</option>
        <option value="Relationship">Relationship</option>
        <option value="LecturerTins">LecturerTins</option>
      </select>

      <button @click="clearFilter" class="text-[#003f7f] text-sm">Clear</button>

      <div class="flex items-center gap-4">
        <label class="flex items-center gap-1 text-sm">
          <input type="radio" value="all" v-model="viewMode" class="form-radio" /> All
        </label>
        <label class="flex items-center gap-1 text-sm">
          <input type="radio" value="anon" v-model="viewMode" class="form-radio" /> Anonymous
        </label>
      </div>
    </div>

    <!-- 🔹 Pinned Posts -->
    <div
      v-if="pinnedPosts.length"
      class="px-4 py-2 bg-[#F7F9FC] border-y text-sm font-semibold text-[#003f7f]"
    >
      Pinned Posts
    </div>
    <div v-if="pinnedPosts.length" class="overflow-x-auto flex gap-4 px-4 py-2">
      <div
        v-for="post in pinnedPosts"
        :key="'pinned-' + post.id"
        class="flex-shrink-0 w-60 bg-white p-3 rounded-xl shadow hover:shadow-md transition"
      >
        <!-- Header -->
        <div class="flex items-center mb-1">
          <div
            class="w-8 h-8 rounded-full bg-[#003f7f] flex items-center justify-center text-white text-sm font-bold mr-2"
          >
            {{ post.is_anonymous ? 'A' : getUserInitials(post.username) }}
          </div>
          <div class="text-xs text-gray-600">
            {{ post.is_anonymous ? 'Anonymous' : post.username }} •
            {{ formatDate(post.created_at) }}
          </div>
        </div>
        <!-- Excerpt -->
        <p
          class="text-xs text-gray-600 mb-1 truncate"
          v-html="autoLink(post.body)"
        ></p>
      </div>
    </div>

    <!-- 🔹 Feed -->
    <div class="flex-1 overflow-y-auto px-4 py-2 space-y-4 mb-48">
      <!-- Loading skeletons -->
      <div v-if="loading" class="space-y-4">
        <div
          v-for="n in 3"
          :key="n"
          class="bg-white p-4 rounded-xl shadow animate-pulse space-y-2"
        >
          <div class="h-4 w-1/3 bg-gray-300 rounded"></div>
          <div class="h-3 w-full bg-gray-200 rounded"></div>
          <div class="h-40 w-full bg-gray-200 rounded"></div>
        </div>
      </div>

      <!-- No posts -->
      <div v-else-if="filteredPosts.length === 0" class="text-center text-gray-500 py-10">
        No posts yet. Be the first to share something!
      </div>

      <!-- Posts list -->
      <div v-else class="space-y-4">
        <div
          v-for="post in filteredPosts"
          :key="post.id"
          class="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
        >
          <!-- Header -->
          <div class="flex items-center mb-2">
            <div
              class="w-10 h-10 rounded-full bg-[#003f7f] flex items-center justify-center text-white font-bold mr-3"
            >
              {{ post.is_anonymous ? 'A' : getUserInitials(post.username) }}
            </div>
            <div>
              <p class="font-semibold text-sm">
                {{ post.is_anonymous ? 'Anonymous' : post.username }}
              </p>
              <p class="text-[10px] text-gray-500">
                <span :title="post.created_at">{{ formatDate(post.created_at) }}</span>
              </p>
            </div>
            <div v-if="post.likes > 10" class="ml-auto text-sm text-[#28a745] font-bold">
              🔥 Trending
            </div>
          </div>

          <!-- Body -->
          <p
            class="text-sm text-gray-600 whitespace-pre-wrap mb-2"
            v-html="autoLink(post.body)"
          />

          <!-- Attachment (image or document) -->
          <div v-if="post.image_url" class="mt-2">
            <!-- Image preview -->
            <div v-if="isImageFile(post.image_url)" class="relative w-full max-h-64">
              <div
                v-if="!imageLoaded[post.id]"
                class="absolute inset-0 bg-gray-200 rounded-lg animate-pulse"
              />
              <img
                :src="post.image_url"
                loading="lazy"
                @load="imageLoaded[post.id] = true"
                @error="hideBrokenImage"
                @click="openImageModal(post.image_url)"
                class="rounded-lg w-full max-h-64 object-cover border cursor-pointer hover:scale-105 transition"
                alt="post image"
              />
            </div>

            <!-- Document link -->
            <div v-else class="flex items-center gap-2 text-sm text-[#003f7f]">
              <span class="text-2xl">📄</span>
              <a
                :href="post.image_url"
                target="_blank"
                rel="noopener"
                class="underline hover:text-[#002a5c] break-all"
              >
                View attached document
              </a>
            </div>
          </div>

          <!-- Tags -->
          <div v-if="post.tags?.length" class="flex flex-wrap gap-2 my-2">
            <span
              v-for="tag in post.tags"
              :key="tag"
              class="text-xs bg-[#7f4000] text-white px-2 py-1 rounded cursor-pointer hover:opacity-90"
              >#{{ tag }}</span
            >
          </div>

          <!-- Reactions & Stats -->
          <div
            class="flex items-center justify-between text-xs text-gray-500 border-t pt-2 select-none"
          >
            <div class="flex items-center space-x-3">
              <div
                v-for="(icon, type) in reactionIcons"
                :key="type"
                :class="[
                  'cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg transition-transform duration-200',
                  post.userReaction === type
                    ? 'bg-[#003f7f]/10 text-[#003f7f] font-semibold'
                    : 'hover:bg-gray-100',
                  animateReaction[post.id] === type ? 'scale-125' : ''
                ]"
                @click="reactPost(post.id, type)"
              >
                <span>{{ icon }}</span>
                <span>{{ post.reactions?.[type] || 0 }}</span>
              </div>
            </div>

            <div class="flex items-center">
              <div
                class="flex items-center gap-1 cursor-pointer"
                @click="toggleComments(post.id)"
              >
                <span>
                  {{ post.commentsCount || 0 }}
                  {{ (post.commentsCount || 0) === 1 ? 'comment' : 'comments' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Comments & Replies -->
          <div v-if="post.showComments" class="mt-3 border-t pt-2">
            <div v-if="post.commentsLoading" class="text-xs text-gray-500">
              Loading comments…
            </div>
            <div v-else>
              <div v-if="post.comments.length" class="space-y-2">
                <CommentBlock
                  v-for="c in post.comments"
                  :key="c.id"
                  :comment="c"
                  :post-id="post.id"
                  @reply-submitted="reloadComments(post.id)"
                />
              </div>
              <div v-else class="text-xs text-gray-500 mb-2">No comments yet.</div>

              <!-- New Top-Level Comment -->
              <div class="flex space-x-2 mt-2">
                <input
                  v-model="post.newComment"
                  type="text"
                  placeholder="Add a comment…"
                  class="flex-1 px-2 py-1 border rounded text-xs focus:ring focus:border-[#003f7f]"
                />
                <button
                  @click="submitComment(post.id)"
                  :disabled="post.postingComment"
                  class="bg-[#003f7f] text-white px-3 py-1 rounded text-xs flex items-center justify-center gap-1"
                >
                  <span v-if="post.postingComment" class="animate-spin">⏳</span>
                  <span v-else>Post</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔹 Bottom Navigation -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner z-40">
      <ul class="flex justify-around text-xs text-[#2C3E50]">
        <li
          @click="router.push('/')"
          :class="{ 'text-[#003f7f] font-bold': isActive('/') }"
          class="flex flex-col items-center p-2"
        >
          <span class="text-sm">Home</span>
        </li>
        <li
          @click="router.push('/marketplace')"
          :class="{ 'text-[#003f7f] font-bold': isActive('/marketplace') }"
          class="flex flex-col items-center p-2"
        >
          <span class="text-sm">Market</span>
        </li>
        <li
          @click="router.push('/community')"
          :class="{ 'text-[#003f7f] font-bold': isActive('/community') }"
          class="flex flex-col items-center p-2"
        >
          <span class="text-sm">Vibes</span>
        </li>
        <template v-if="user && user.id">
          <li
            @click="router.push('/notifications')"
            :class="{ 'text-[#003f7f] font-bold': isActive('/notifications') }"
            class="flex flex-col items-center p-2"
          >
            <span class="text-sm">Alerts</span>
          </li>
          <li
            @click="router.push('/profile')"
            :class="{ 'text-[#003f7f] font-bold': isActive('/profile') }"
            class="flex flex-col items-center p-2"
          >
            <span class="text-sm">Profile</span>
          </li>
        </template>
        <template v-else>
          <li @click="router.push('/login')" class="flex flex-col items-center p-2">
            <span class="text-sm">Login</span>
          </li>
          <li @click="router.push('/register')" class="flex flex-col items-center p-2">
            <span class="text-sm">Signup</span>
          </li>
        </template>
      </ul>
    </nav>

    <!-- Floating Post Button -->
    <button
      @click="router.push('/upload-vibe')"
      class="fixed bottom-20 right-4 bg-[#003f7f] text-white px-4 py-3 rounded-full shadow-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#002b5a] z-50"
    >
      <span class="text-lg">📝</span> Post
    </button>

    <!-- 🔹 Image Modal -->
    <transition name="fade-scale">
      <div
        v-if="showImageModal"
        class="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center"
        @click.self="closeImageModal"
      >
        <img
          :src="currentImage"
          class="max-w-full max-h-full rounded-xl shadow-lg object-contain transition-transform duration-200 ease-in-out hover:scale-105"
          alt="post image"
        />
        <button
          @click="closeImageModal"
          class="absolute top-4 right-4 text-white text-3xl font-bold"
        >
          ×
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import CommentBlock from '@/components/CommentBlock.vue'

/* ───────────────── refs & stores ───────────────── */
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const posts = ref([])
const loading = ref(true)
const filterTag = ref('Recent')
const viewMode = ref('all')
const imageLoaded = ref({})

/* reaction animation state */
const animateReaction = reactive({})

/* reaction icons */
const reactionIcons = { thumbs_up: '👍', thumbs_down: '👎' }

/* ───────────────── helpers ───────────────── */
function formatDate(dt) {
  return new Date(dt).toLocaleString()
}
function getUserInitials(name) {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase() : 'U'
}
function autoLink(txt) {
  return txt
    .replace(
      /#(\w+)/g,
      '<span class="text-[#003f7f] font-semibold cursor-pointer hover:underline">#$1</span>',
    )
    .replace(
      /@(\w+)/g,
      '<span class="text-[#7f4000] font-semibold cursor-pointer hover:underline">@$1</span>',
    )
    .replace(/\n/g, '<br/>')
}
function hideBrokenImage(e) {
  e.target.style.display = 'none'
}
function isActive(path) {
  return route.path === path
}
function isImageFile(url) {
  return /\.(jpe?g|png|gif)$/i.test(url)
}

/* ───────────────── comment tree util ───────────── */
function groupComments(flat) {
  const map = {},
    tree = []
  flat.forEach(c => {
    c.replies = []
    map[c.id] = c
  })
  flat.forEach(c =>
    c.parent_id && map[c.parent_id]
      ? map[c.parent_id].replies.push(c)
      : tree.push(c),
  )
  return tree
}

/* ───────────────── LOAD POSTS ─────────────────── */
async function loadPosts() {
  loading.value = true
  try {
    const uid = user.value?.id || 0
    const res = await fetch(
      `https://jabumarket.com.ng/api/get_community_posts.php?user_id=${uid}`,
    )
    const data = await res.json()
    posts.value = data.map(p => ({
      ...p,
      showComments: false,
      comments: [],
      commentsLoading: false,
      commentsCount: p.commentsCount ?? 0,
      newComment: '',
      postingComment: false,
    }))
    posts.value.forEach(p => (imageLoaded.value[p.id] = false))
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

/* ───────────────── computed ───────────────────── */
const pinnedPosts = computed(() => posts.value.filter(p => p.is_pinned))

const filteredPosts = computed(() => {
  let list = posts.value
  if (filterTag.value !== 'Recent') {
    list =
      filterTag.value === 'Trending'
        ? list.filter(p => p.likes > 10)
        : list.filter(p => p.tags.includes(filterTag.value))
  }
  return viewMode.value === 'anon'
    ? list.filter(p => p.is_anonymous)
    : list
})

function clearFilter() {
  filterTag.value = 'Recent'
}

/* ───────────────── reactions ─────────────────── */
async function reactPost(postId, type) {
  if (!user.value?.id) return router.push('/login')

  animateReaction[postId] = type
  setTimeout(() => delete animateReaction[postId], 300)

  const post = posts.value.find(p => p.id === postId)
  const fd = new FormData()
  fd.append('post_id', postId)
  fd.append('user_id', user.value.id)
  fd.append('emoji', type)

  try {
    const res = await fetch('https://jabumarket.com.ng/api/react_to_post.php', {
      method: 'POST',
      body: fd,
    })
    const d = await res.json()
    if (d.status === 'success' && post) {
      post.reactions = d.counts
      post.userReaction = d.userReaction
    }
  } catch (e) {
    console.error(e)
  }
}

/* ───────────────── comments logic ─────────────── */
async function toggleComments(postId) {
  const post = posts.value.find(p => p.id === postId)
  if (!post) return

  post.showComments = !post.showComments
  if (post.showComments && !post.comments.length) {
    await reloadComments(postId)
  }
}

async function reloadComments(postId) {
  const post = posts.value.find(p => p.id === postId)
  if (!post) return

  post.commentsLoading = true
  try {
    const res = await fetch(
      `https://jabumarket.com.ng/api/get_comments.php?post_id=${postId}`,
    )
    const flatComments = await res.json()
    post.comments = groupComments(flatComments)
    post.commentsCount = flatComments.length
  } catch {
    post.comments = []
    post.commentsCount = 0
  } finally {
    post.commentsLoading = false
  }
}

async function submitComment(postId) {
  const post = posts.value.find(p => p.id === postId)
  if (!user.value?.id || !post.newComment.trim()) return

  post.postingComment = true
  const fd = new FormData()
  fd.append('post_id', postId)
  fd.append('user_id', user.value.id)
  fd.append('comment', post.newComment)

  try {
    const res = await fetch(
      'https://jabumarket.com.ng/api/post_comment.php',
      {
        method: 'POST',
        body: fd,
      },
    )
    const d = await res.json()
    if (d.status === 'success') {
      post.newComment = ''
      await reloadComments(postId)
    }
  } catch (e) {
    console.error(e)
  } finally {
    post.postingComment = false
  }
}

/* ───────────────── image modal ────────────────── */
const showImageModal = ref(false)
const currentImage = ref('')
function openImageModal(url) {
  currentImage.value = url
  showImageModal.value = true
  document.body.style.overflow = 'hidden'
}
function closeImageModal() {
  showImageModal.value = false
  document.body.style.overflow = ''
}

/* ───────────────── life-cycle ─────────────────── */
onMounted(loadPosts)
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
}

/* modal fade + scale */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* prevent text selection on reaction buttons */
.cursor-pointer {
  user-select: none;
}
</style>
