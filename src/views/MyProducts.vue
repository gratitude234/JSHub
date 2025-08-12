<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-32">
    <!-- Header -->
    <header
      class="bg-[#003f7f] text-white py-4 px-4 shadow flex items-center justify-between sticky top-0 z-40"
    >
      <button @click="$router.back()" class="text-white text-xl font-bold">←</button>
      <h1 class="text-lg font-semibold flex-1 text-center -ml-4">🛒 My Products</h1>
      <div class="w-6" />
    </header>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-20 text-sm text-gray-500 animate-pulse">
      ⏳ Loading your products...
    </div>

    <!-- Empty State -->
    <div v-else-if="products.length === 0" class="text-center py-24 text-gray-600 px-6">
      <div class="text-6xl mb-4">📦</div>
      <h2 class="text-lg font-semibold mb-2">No Products Yet</h2>
      <p class="text-sm text-gray-500 max-w-xs mx-auto">
        You haven’t uploaded any products. Sell an item and make some cash on campus!
      </p>
      <router-link
        to="/sell"
        class="inline-block mt-6 bg-[#003f7f] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#002d5c] transition"
      >
        ➕ Upload Product
      </router-link>
    </div>

    <!-- Product List -->
    <section v-else class="p-4 space-y-5 animate-fade-in">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white rounded-xl shadow hover:shadow-md border border-gray-200 transition-all duration-300"
      >
        <div class="flex gap-4 p-4">
          <img
            v-if="product.image_url"
            :src="product.image_url"
            alt="product"
            class="w-24 h-24 rounded-lg object-cover shadow"
          />
          <div class="flex-1 overflow-hidden space-y-1">
            <h2 class="text-sm font-semibold truncate">{{ product.name }}</h2>
            <p class="text-sm text-green-600 font-bold">₦{{ product.price }}</p>
            <p class="text-xs text-gray-400">{{ product.status || 'Available' }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-4 border-t border-gray-100 px-4 py-2 text-sm font-semibold">
          <router-link :to="`/product/${product.id}`" class="text-[#003f7f] hover:underline">
            🔍 View
          </router-link>
          <router-link :to="`/sell?id=${product.id}`" class="text-blue-600 hover:underline">
            ✏️ Edit
          </router-link>
          <button @click="deleteProduct(product.id)" class="text-red-600 hover:underline">
            🗑 Delete
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

const products = ref([])
const loading = ref(true)

onMounted(fetchMyProducts)

async function fetchMyProducts() {
  loading.value = true
  try {
    if (!user.value?.id) {
      products.value = []
      return
    }
    const res = await fetch(
      `https://jabumarket.com.ng/api/get_my_products.php?user_id=${user.value.id}`
    )
    products.value = await safeJson(res)
  } catch (err) {
    console.error('Failed to load user products:', err)
    products.value = []
  } finally {
    loading.value = false
  }
}

async function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product?')) return
  try {
    const res = await fetch(`https://jabumarket.com.ng/api/delete_product.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        user_id: user.value.id  // ✅ FIX: send user_id along with id
      })
    })
    const data = await res.json()
    if (data.success) {
      products.value = products.value.filter(p => p.id !== id)
    } else {
      alert(data.error || 'Failed to delete product.')
    }
  } catch (err) {
    alert('Network error.')
  }
}

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return []
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
