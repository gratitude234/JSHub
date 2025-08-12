<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-20">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 px-4 shadow text-center text-xl font-bold">
      👑 Admin Dashboard
    </header>

    <!-- Admin Overview Cards -->
    <section class="p-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      <button @click="goTo('/admin/transactions')" class="admin-card">
        💳 <span>Approve Payments</span>
      </button>
      <button @click="goTo('/admin/materials')" class="admin-card">
        📚 <span>Study Materials</span>
      </button>
      <button @click="goTo('/admin/blogs')" class="admin-card">
        📝 <span>Blog Posts</span>
      </button>
      <button @click="goTo('/admin/users')" class="admin-card">
        👥 <span>Manage Users</span>
      </button>
      <button @click="goTo('/admin/announcements')" class="admin-card">
        📢 <span>Announcements</span>
      </button>
      <button @click="goTo('/admin/reports')" class="admin-card">
        🚨 <span>Flagged Content</span>
      </button>
      <button @click="goTo('/admin/quizzes')" class="admin-card">
        🧠 <span>Manage Quizzes</span>
      </button>
      <button @click="goTo('/admin/analytics')" class="admin-card">
        📊 <span>Site Analytics</span>
      </button>
    </section>

    <!-- Footer -->
    <footer class="text-xs text-gray-500 text-center mt-10">
      © {{ new Date().getFullYear() }} JABU Student Hub • Admin Panel
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goTo = (path) => router.push(path)
</script>

<style scoped>
.admin-card {
  @apply bg-white rounded-xl shadow p-4 flex flex-col items-center justify-center text-center space-y-2 text-sm font-semibold transition hover:bg-[#e5efff];
}
</style>
