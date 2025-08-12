<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-20 text-[#2C3E50]">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white shadow">
      <div class="container mx-auto flex items-center justify-between py-4 px-4">
        <button @click="goBack" class="text-white hover:underline">
          ← Back
        </button>
        <h1 class="text-xl font-bold text-center flex-1">
          ✍️ Write a Student Blog
        </h1>
        <div class="w-12"></div>
      </div>
    </header>

    <!-- Blog Form -->
    <section class="p-4 container mx-auto space-y-5">
      <!-- Blog Title -->
      <input
        v-model="title"
        type="text"
        placeholder="Title (e.g. My Hostel Struggles 101)"
        class="input"
      />

      <!-- Blog Content -->
      <textarea
        v-model="content"
        rows="10"
        placeholder="Tell your story... Share experiences, lessons, or funny moments on campus"
        class="input resize-none"
      ></textarea>

      <!-- Submit Button -->
      <button
        @click="submitPost"
        :disabled="loading"
        class="btn-primary"
      >
        {{ loading ? 'Publishing...' : 'Publish Blog' }}
      </button>

      <!-- Feedback -->
      <p v-if="message" class="text-[#28a745] text-sm text-center">{{ message }}</p>
      <p v-if="error" class="text-red-600 text-sm text-center">{{ error }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const title = ref('')
const content = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)

const router = useRouter()

function goBack() {
  router.push('/blog')
}

async function submitPost() {
  message.value = ''
  error.value = ''
  loading.value = true

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const user_id = user?.id
  const excerpt = content.value.slice(0, 100) + '...'

  if (!title.value || !content.value || !user_id) {
    error.value = 'Please fill in all fields.'
    loading.value = false
    return
  }

  try {
    const res = await fetch('https://jabumarket.com.ng/api/add_blog_post.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        title: title.value,
        content: content.value,
        excerpt
      })
    })

    const data = await res.json()

    if (res.ok) {
      message.value = 'Blog posted successfully!'
      title.value = ''
      content.value = ''
      setTimeout(() => router.push('/blog'), 1500)
    } else {
      error.value = data.error || 'Something went wrong.'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Network error. Please try again.'
  }

  loading.value = false
}
</script>

<style scoped>
.input {
  @apply w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003f7f];
}
.btn-primary {
  @apply w-full py-3 bg-[#7f4000] hover:bg-[#5f3000] text-white font-semibold rounded-xl shadow transition;
}
</style>
