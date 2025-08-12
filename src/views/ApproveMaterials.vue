<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] p-4 pb-28">
    <h1 class="text-xl font-bold text-center text-[#003f7f] mb-6">📂 Pending Course Materials</h1>

    <div v-if="pendingMaterials.length" class="space-y-4">
      <div
        v-for="material in pendingMaterials"
        :key="material.id"
        class="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-400"
      >
        <h2 class="font-semibold text-md mb-1">{{ material.title }}</h2>
        <p class="text-sm text-gray-600">
          {{ material.course_code }} • {{ material.department }} • {{ material.level }} Level
        </p>
        <p class="text-xs text-gray-400">Uploaded by ID: {{ material.uploaded_by }} on {{ formatDate(material.created_at) }}</p>

        <div class="flex justify-end gap-3 mt-4">
          <a
            :href="getFileUrl(material.file_path)"
            target="_blank"
            class="text-[#003f7f] underline text-sm"
          >
            🔍 Preview
          </a>
          <button
            @click="approve(material.id)"
            class="bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-1 rounded"
          >
            ✅ Approve
          </button>
          <button
            @click="reject(material.id)"
            class="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded"
          >
            ❌ Reject
          </button>
        </div>
      </div>
    </div>

    <p v-else class="text-center text-gray-500">No pending materials at the moment.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const pendingMaterials = ref([])

onMounted(async () => {
  try {
    const res = await fetch('https://jabumarket.com.ng/api/get_pending_materials.php')
    const data = await res.json()
    if (Array.isArray(data)) pendingMaterials.value = data
  } catch (err) {
    console.error('❌ Failed to load pending materials:', err)
  }
})

function getFileUrl(path) {
  return `https://jabumarket.com.ng/${path}`
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString()
}

async function approve(id) {
  try {
    await fetch('https://jabumarket.com.ng/api/approve_material.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    pendingMaterials.value = pendingMaterials.value.filter(mat => mat.id !== id)
  } catch (err) {
    console.error('❌ Approval failed:', err)
  }
}

async function reject(id) {
  try {
    await fetch('https://jabumarket.com.ng/api/reject_material.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    pendingMaterials.value = pendingMaterials.value.filter(mat => mat.id !== id)
  } catch (err) {
    console.error('❌ Rejection failed:', err)
  }
}
</script>
