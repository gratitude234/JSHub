<template>
  <div class="relative min-h-screen bg-gradient-to-b from-[#F7F9FC] via-[#edf2f7] to-[#F7F9FC] text-[#2C3E50] pt-20 pb-32">

    <!-- 🔷 Frosted Header -->
    <header
      class="fixed top-0 left-0 w-full backdrop-blur-md bg-[#003f7f]/80 text-white flex items-center justify-between px-4 py-3 shadow-lg z-40"
    >
      <button @click="router.back()" class="text-xl font-bold hover:scale-110 transition">←</button>
      <h1 class="flex-1 text-center font-bold text-lg flex items-center justify-center gap-1">
        <span class="animate-pulse">🕶️</span> Anonymous Confessions
      </h1>
      <div class="w-6" />
    </header>

    <!-- 📝 Floating Post Sheet -->
    <div
      class="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] rounded-t-3xl"
    >
      <textarea
        v-model="newPost"
        placeholder="Vent it out… (Stay kind & no real names)"
        class="w-full border border-gray-300 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#003f7f] min-h-[80px]"
      ></textarea>

      <button
        @click="submitPost"
        :disabled="loading || !newPost.trim()"
        class="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition disabled:opacity-50
               bg-[#003f7f] hover:bg-[#002a5c] active:scale-[.97]"
      >
        <svg v-if="loading" class="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" stroke-width="4" class="opacity-25"/>
          <path d="M4 12a8 8 0 0 1 8-8v8" stroke-width="4" class="opacity-75"/>
        </svg>
        <span>{{ loading ? 'Posting…' : 'Post Anonymously' }}</span>
      </button>
    </div>

    <!-- 🧾 Feed -->
    <div class="px-4 pb-4 space-y-4">
      <!-- skeleton -->
      <div v-if="initialLoading" class="space-y-4 pt-4">
        <div v-for="n in 3" :key="n" class="h-24 rounded-xl bg-white animate-pulse shadow"/>
      </div>

      <TransitionGroup name="list" tag="div" class="space-y-4 pt-4">
        <div
          v-for="(post, i) in anonymousPosts"
          :key="post.id"
          :class="['bg-white rounded-xl shadow relative overflow-hidden']"
        >
          <!-- colored accent -->
          <div :class="accentClass(i)" class="absolute left-0 top-0 h-full w-1.5"></div>

          <div class="p-4 space-y-2">
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <span class="font-bold text-[#003f7f]">Anon Student</span>
              <span>•</span>
              <span>{{ formatTime(post.created_at) }}</span>
            </div>
            <p class="text-sm">{{ post.text }}</p>

            <!-- Reaction pills -->
            <div class="flex gap-3 pt-1 text-sm select-none">
              <ReactionPill
                icon="❤️" :count="post.reactions.like" @click="react(post.id, 'like')"/>
              <ReactionPill
                icon="😂" :count="post.reactions.funny" @click="react(post.id, 'funny')"/>
              <ReactionPill
                icon="😲" :count="post.reactions.shock" @click="react(post.id, 'shock')"/>
              <ReactionPill
                icon="👎" :count="post.reactions.dislike" @click="react(post.id, 'dislike')"/>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

/* ▸ Small child component for reusable reaction UI */
const ReactionPill = {
  props: { icon: String, count: Number },
  emits: ['click'],
  template: `
    <button
      @click="$emit('click')"
      class="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full shadow-sm
             hover:bg-gray-200 active:scale-95 transition"
    >
      <span>{{ icon }}</span><span>{{ count }}</span>
    </button>
  `
}

const router = useRouter()
const newPost = ref('')
const loading = ref(false)
const initialLoading = ref(true)
const anonymousPosts = ref([])

/* ▸ rotating accent colors for left bar */
const accentClass = (index) =>
  ['bg-[#003f7f]', 'bg-[#28a745]', 'bg-[#7f4000]', 'bg-pink-600'][index % 4]

/* ▸ POST new confession */
const submitPost = async () => {
  if (!newPost.value.trim()) return
  loading.value = true
  try {
    const res = await fetch('https://jabumarket.com.ng/api/post_anonymous.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newPost.value })
    })
    const data = await res.json()
    if (data.success) {
      anonymousPosts.value.unshift({
        id: Date.now(),
        text: newPost.value,
        created_at: new Date(),
        reactions: { like: 0, funny: 0, shock: 0, dislike: 0 }
      })
      newPost.value = ''
    } else { alert(data.message || 'Post failed') }
  } catch (e) { alert('Network error'); console.error(e) }
  loading.value = false
}

/* ▸ Time formatting */
const formatTime = (d) => new Intl.DateTimeFormat('default', {
  month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'
}).format(new Date(d))

/* ▸ Get feed */
const loadPosts = async () => {
  try {
    const res = await fetch('https://jabumarket.com.ng/api/get_anonymous_posts.php')
    const data = await res.json()
    anonymousPosts.value = data.posts.map(p => ({
      ...p,
      reactions: {
        like: +p.like || 0,
        funny: +p.funny || 0,
        shock: +p.shock || 0,
        dislike: +p.dislike || 0
      }
    }))
  } catch (e) { console.error(e) }
  initialLoading.value = false
}

/* ▸ React to a post */
const react = async (id, type) => {
  try {
    await fetch('https://jabumarket.com.ng/api/react_anonymous_post.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: id, reaction: type })
    })
    const post = anonymousPosts.value.find(p => p.id === id)
    if (post) post.reactions[type]++
  } catch (e) { console.error(e) }
}

onMounted(loadPosts)
</script>

<style scoped>
/* slide & fade list animation */
.list-enter-from, .list-leave-to { opacity: 0; transform: translateY(8px) }
.list-enter-active, .list-leave-active { transition: all 0.25s ease }
</style>
