<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-lg shadow">
      🧾 My Orders
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-10">
      <svg class="animate-spin h-8 w-8 text-[#003f7f]" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>

    <!-- Error -->
    <div v-if="error" class="text-center text-red-600 mt-6 px-4">
      Failed to load your orders. Try again later.
    </div>

    <!-- Orders List -->
    <div v-if="!loading && orders.length" class="p-4 space-y-4">
      <div
        v-for="order in orders"
        :key="order.id"
        class="bg-white rounded-xl p-4 shadow hover:shadow-md transition"
      >
        <div class="flex gap-3">
          <img
            :src="getImageUrl(order.product_image)"
            alt="Product Image"
            class="w-20 h-20 object-cover rounded-lg border"
          />
          <div class="flex-1">
            <h3 class="font-semibold text-sm">{{ order.product_title }}</h3>
            <p class="text-xs text-gray-500 mt-1">₦{{ formatAmount(order.amount) }}</p>
            <p class="text-xs mt-1">
              Status:
              <span
                :class="{
                  'text-green-600 font-semibold': order.status === 'confirmed',
                  'text-yellow-600 font-semibold': order.status === 'pending',
                  'text-red-600 font-semibold': order.status === 'rejected'
                }"
              >
                {{ order.status }}
              </span>
            </p>
            <p class="text-[10px] text-gray-400 mt-1">
              Placed: {{ formatDate(order.created_at) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- No Orders -->
    <div v-if="!loading && !orders.length && !error" class="text-center text-sm text-gray-500 mt-10">
      You haven’t placed any orders yet.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const userStore = useUserStore()
const { user } = storeToRefs(userStore)

const orders = ref([])
const loading = ref(true)
const error = ref(false)

function formatAmount(amount) {
  return Number(amount).toLocaleString('en-NG')
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString()
}

function getImageUrl(path) {
  if (!path) return 'https://jabumarket.com.ng/assets/placeholder.png'
  return path.startsWith('http') ? path : `https://jabumarket.com.ng/${path}`
}

onMounted(async () => {
  if (!user.value?.id) {
    error.value = true
    loading.value = false
    return
  }

  try {
    const res = await fetch(`https://jabumarket.com.ng/api/get_user_orders.php?buyer_id=${user.value.id}`)
    const data = await res.json()
    if (Array.isArray(data)) {
      orders.value = data
    } else {
      throw new Error('Unexpected response')
    }
  } catch (err) {
    console.error(err)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
</style>
