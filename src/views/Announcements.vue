<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-20">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 px-4 flex items-center justify-between shadow">
      <button @click="router.back()" class="text-white text-xl font-bold">←</button>
      <h1 class="text-lg font-bold flex-1 text-center">📢 Announcements</h1>
      <div class="w-6"></div>
    </header>

    <!-- Loading -->
    <div v-if="loading" class="text-center text-sm text-gray-500 py-10 animate-pulse">
      ⏳ Loading announcements…
    </div>

    <!-- Announcements List -->
    <section v-else class="p-4 space-y-4">
      <div
        v-for="note in announcements"
        :key="note.id"
        class="bg-white rounded-xl shadow p-4"
      >
        <h2 class="font-semibold text-base mb-1">{{ note.title }}</h2>
        <p class="text-sm text-gray-700 leading-snug whitespace-pre-line">
          {{ note.message }}
        </p>
        <p class="text-xs text-gray-400 mt-2">{{ formatDate(note.created_at) }}</p>
      </div>

      <p v-if="announcements.length === 0" class="text-center text-sm text-gray-500 py-10">
        No announcements at the moment.
      </p>

      <!-- 📚 Upload Prompt -->
      <div class="text-center mt-10 p-4 bg-white rounded-xl shadow border border-dashed border-[#003f7f]">
        <p class="text-sm mb-3">
          Have past questions, study PDFs, or lecture notes you want to share?
        </p>
        <p class="text-xs text-gray-600 mb-4">
          📌 Once uploaded, your files may be included in <strong>Practice Mode</strong> and <strong>Theory Drill</strong> so other students can study and prepare for their exams too.
        </p>
        <button
          @click="router.push('/upload-vibe')"
          class="bg-[#003f7f] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#002b5a] transition"
        >
          📤 Upload Past Questions or PDFs
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const announcements = ref([])
const loading = ref(true)

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric'
  })
}

onMounted(async () => {
  try {
    const res = await fetch('https://jabumarket.com.ng/api/get_announcements.php')
    announcements.value = await res.json()
  } catch (err) {
    console.error('Failed to load announcements:', err)
  } finally {
    loading.value = false
  }
})
</script>
