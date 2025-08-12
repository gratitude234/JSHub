<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-20">
    <!-- 🔷 Header -->
    <header class="bg-gradient-to-r from-[#003f7f] to-[#005c9f] text-white py-4 px-4 flex items-center justify-between shadow">
      <button @click="router.back()" class="text-white text-xl font-bold">←</button>
      <h1 class="text-lg font-bold flex-1 text-center">📤 Post Announcement</h1>
      <div class="w-6"></div>
    </header>

    <!-- ❌ Unauthorized -->
    <div v-if="!isAdmin" class="text-center text-red-600 font-medium mt-20 px-4">
      🚫 You are not authorized to post announcements.
    </div>

    <!-- ✅ Announcement Form -->
    <form
      v-else
      @submit.prevent="submitAnnouncement"
      class="p-4 space-y-4 bg-white shadow rounded-xl mx-4 mt-6"
    >
      <input
        v-model="title"
        type="text"
        placeholder="Announcement Title"
        maxlength="100"
        class="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f7f] shadow-sm"
        required
      />

      <div>
        <textarea
          v-model="message"
          placeholder="Write your announcement here..."
          maxlength="500"
          class="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#003f7f] shadow-sm"
          rows="6"
          ref="messageTextarea"
          required
          @input="autoResize"
        ></textarea>
        <p class="text-right text-xs text-gray-500 mt-1">{{ message.length }}/500</p>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full bg-[#003f7f] text-white py-3 rounded-lg font-semibold shadow hover:opacity-90 transition"
      >
        <template v-if="loading">
          <svg class="animate-spin h-5 w-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="white" stroke-width="4"></circle>
            <path class="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          Posting...
        </template>
        <template v-else>
          📢 Post Announcement
        </template>
      </button>

      <p v-if="feedback.message" :class="['text-sm text-center font-medium', feedback.success ? 'text-green-600' : 'text-red-600']">
        {{ feedback.message }}
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const user = userStore.user

const isAdmin = computed(() => user?.role === 'admin')

const title = ref('')
const message = ref('')
const loading = ref(false)
const feedback = ref({ message: '', success: false })

const messageTextarea = ref(null)

const autoResize = () => {
  const el = messageTextarea.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }
}

onMounted(() => {
  autoResize()
})

const submitAnnouncement = async () => {
  loading.value = true
  feedback.value = { message: '', success: false }

  try {
    const res = await fetch('https://jabumarket.com.ng/api/post_announcement.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title.value,
        message: message.value,
        user_id: user.id
      })
    })

    const result = await res.json()

    if (result.success) {
      feedback.value = { message: '✅ Announcement posted successfully!', success: true }
      setTimeout(() => router.back(), 1000)
    } else {
      feedback.value = { message: '❌ ' + (result.error || 'Failed to post.'), success: false }
    }
  } catch (err) {
    console.error('Error posting announcement:', err)
    feedback.value = { message: '⚠️ Something went wrong. Please try again.', success: false }
  } finally {
    loading.value = false
  }
}
</script>
