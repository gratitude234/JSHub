<template>
  <div class="min-h-screen bg-gray-50 pb-28">
    <!-- Header -->
    <header class="bg-blue-900 text-white py-4 text-center font-semibold text-lg shadow">
      My Wishlist❤️
    </header>

    <!-- Wishlist Products -->
    <div class="p-4">
      <div v-if="wishlist.length === 0" class="text-center text-gray-500 py-10">
        <p class="text-lg">You haven’t added any items yet.</p>
        <p class="text-sm mt-1">Start exploring and tap the ❤️ icon!</p>
      </div>

      <div v-else class="grid grid-cols-2 gap-4">
        <div
          v-for="item in wishlist"
          :key="item.id"
          class="bg-white rounded-xl shadow hover:shadow-md transition p-2 relative"
        >
          <router-link :to="`/product/${item.id}`">
            <img
              :src="getImageUrl(item.image)"
              class="h-32 w-full object-cover rounded-md mb-2"
              :alt="item.title"
              loading="lazy"
            />
            <p class="text-sm font-medium text-gray-800 line-clamp-2">{{ item.title }}</p>
            <p class="text-blue-700 font-bold text-sm mt-1">₦{{ item.price }}</p>
          </router-link>

          <!-- Remove from wishlist -->
          <button
            @click="removeFromWishlist(item.id)"
            class="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-red-500 hover:bg-red-50"
            title="Remove from Wishlist"
          >
            ❌
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const wishlist = ref([])

function getImageUrl(path) {
  if (!path) return 'https://jabumarket.com.ng/assets/placeholder.png'
  if (path.startsWith('http')) return path
  return `https://jabumarket.com.ng/${path}`
}

async function fetchWishlist() {
  if (!user.value?.id) return

  try {
    const res = await fetch(`https://jabumarket.com.ng/api/user_wishlist.php?user_id=${user.value.id}`)
    const data = await res.json()
    wishlist.value = Array.isArray(data) ? data : []
  } catch (err) {
    console.error('Failed to load wishlist:', err)
  }
}

async function removeFromWishlist(productId) {
  if (!user.value?.id) return

  try {
    await fetch('https://jabumarket.com.ng/api/interested.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.value.id,
        product_id: productId,
        interested: false
      })
    })

    wishlist.value = wishlist.value.filter(item => item.id !== productId)
  } catch (err) {
    console.error('Failed to remove from wishlist:', err)
  }
}

onMounted(() => {
  fetchWishlist()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
