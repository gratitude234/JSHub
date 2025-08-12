<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] relative">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 px-4 flex items-center justify-between shadow">
      <button @click="router.back()" class="text-white text-xl font-bold">←</button>
      <h1 class="text-lg font-bold text-center flex-1 -ml-6">🎒 Lost & Found</h1>
    </header>

    <!-- Lost Items List -->
    <div class="p-4 space-y-4">
      <div v-if="loading" class="text-center text-gray-500 py-10">
        Loading items...
      </div>

      <div v-else-if="items.length === 0" class="text-center text-gray-500 py-10">
        No lost items reported yet.
      </div>

      <div
        v-else
        v-for="item in items"
        :key="item.id"
        class="bg-white p-4 rounded-lg shadow text-sm space-y-2"
      >
        <!-- Image or placeholder -->
        <div @click="openImage(item.image_url)" class="cursor-pointer">
          <img
            v-if="item.image_url"
            :src="item.image_url"
            loading="lazy"
            alt="Lost Item"
            class="w-full h-40 object-cover rounded-md"
          />
          <div
            v-else
            class="w-full h-40 flex items-center justify-center text-gray-400 bg-gray-100 rounded-md"
          >
            No image provided
          </div>
        </div>

        <!-- Text -->
        <p><strong>Item:</strong> {{ item.item }}</p>
        <p><strong>Found at:</strong> {{ item.location }}</p>
        <p v-if="item.details" class="text-gray-600">{{ item.details }}</p>
        <p class="text-[11px] text-right mt-2 text-gray-400">
          {{ formatDate(item.created_at) }}
        </p>
      </div>
    </div>

    <!-- Zoom Modal -->
    <div
      v-if="modalImage"
      @click.self="closeImage"
      class="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
    >
      <img
        :src="modalImage"
        loading="lazy"
        class="zoom-target max-h-[90vh] max-w-[95vw] rounded-md shadow-xl"
      />
      <button
        @click="closeImage"
        class="absolute top-4 right-4 text-white text-3xl font-bold"
      >
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import mediumZoom from 'medium-zoom'

const router = useRouter()
const items = ref([])
const loading = ref(true)
const modalImage = ref(null)

onMounted(async () => {
  try {
    const res = await fetch('https://jabumarket.com.ng/api/get_lost_items.php')
    const data = await res.json()
    if (Array.isArray(data)) {
      items.value = data
    }
  } catch (err) {
    console.error('Failed to fetch lost items:', err)
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString()
}

function openImage(url) {
  if (url) {
    modalImage.value = url
    nextTick(() => {
      mediumZoom('.zoom-target', {
        margin: 24,
        background: 'rgba(0,0,0,0.85)',
        scrollOffset: 40
      }).show()
    })
  }
}

function closeImage() {
  modalImage.value = null
}
</script>

<style scoped>
img {
  transition: transform 0.2s ease;
}
img:hover {
  transform: scale(1.01);
}
</style>
