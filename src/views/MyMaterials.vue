<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28 relative">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 px-4 shadow-md flex items-center justify-between sticky top-0 z-40">
      <button @click="$router.back()" class="text-white text-xl font-bold">←</button>
      <h1 class="text-lg font-semibold text-center flex-1 -ml-4">📚 My Study Materials</h1>
      <div class="w-6" />
    </header>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20 text-sm text-gray-500 animate-pulse">
      ⏳ Loading your uploads...
    </div>

    <!-- Empty State -->
    <div v-else-if="materials.length === 0" class="text-center py-24 text-gray-600 px-6">
      <div class="text-6xl mb-4">📚</div>
      <h2 class="text-lg font-semibold mb-2">No Study Materials Uploaded</h2>
      <p class="text-sm text-gray-500 max-w-xs mx-auto">
        You haven’t uploaded any study resources yet. Help your fellow students by sharing materials, notes, or past questions.
      </p>
      <router-link
        to="/upload-material"
        class="inline-block mt-6 bg-[#003f7f] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#002d5c] transition"
      >
        📤 Upload Material
      </router-link>
    </div>

    <!-- Materials List -->
    <section v-else class="p-4 space-y-4 animate-fade-in">
      <div
        v-for="material in materials"
        :key="material.id"
        class="bg-white rounded-xl p-4 shadow border border-gray-200 space-y-2"
      >
        <div class="flex justify-between items-start">
          <div>
            <h2 class="font-semibold text-sm">{{ material.title }}</h2>
            <p class="text-xs text-gray-500">{{ material.course_code }} · {{ material.level }} Level</p>
          </div>
          <span class="text-xs text-gray-400 whitespace-nowrap">
            {{ timeAgo(material.created_at) }}
          </span>
        </div>

        <div class="flex justify-end gap-4 text-sm font-semibold">
          <a
            :href="material.file_url"
            target="_blank"
            class="text-[#003f7f] hover:underline"
          >
            🔍 Preview
          </a>
          <a
            :href="material.file_url"
            :download="material.title"
            class="text-green-600 hover:underline"
          >
            ⬇️ Download
          </a>
          <button
            @click="confirmDelete(material.id)"
            class="text-red-600 hover:underline"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const materials = ref([])
const loading = ref(true)

onMounted(() => {
  loadUserMaterials()
})

function loadUserMaterials() {
  if (!user.value?.id) {
    loading.value = false
    return
  }

  loading.value = true

  fetch(`https://jabumarket.com.ng/api/get_my_materials.php?user_id=${user.value.id}`)
    .then(res => res.json())
    .then(data => {
      materials.value = Array.isArray(data) ? data : []
    })
    .catch(err => {
      console.error('Failed to load user materials:', err)
      materials.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

function confirmDelete(id) {
  if (!confirm('Are you sure you want to delete this material?')) return

  fetch('https://jabumarket.com.ng/api/delete_material.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        materials.value = materials.value.filter(m => m.id !== id)
      } else {
        alert('Failed to delete material.')
      }
    })
    .catch(() => {
      alert('An error occurred while deleting the material.')
    })
}

function timeAgo(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = Math.floor((now - date) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`

  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(date)
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
