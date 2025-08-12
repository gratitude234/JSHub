<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-28 text-[#2C3E50] relative">
    <!-- ░░ Header ░░ -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-semibold text-lg shadow">
      Product Details
    </header>

    <!-- ░░ Skeleton Loader ░░ -->
    <div v-if="loading" class="p-4 animate-pulse space-y-4">
      <div class="bg-gray-300 h-64 rounded-xl"></div>
      <div class="h-5 bg-gray-300 rounded w-3/4"></div>
      <div class="h-3 bg-gray-200 rounded w-full"></div>
      <div class="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>

    <!-- ░░ Product Image ░░ -->
    <div v-else class="bg-white p-4 relative">
      <div class="rounded-xl overflow-hidden bg-gray-100 relative">
        <!-- ✔︎ VERIFIED CHIP -->
        <span
          v-if="product.is_verified == 1 || product.is_verified === true"
          class="absolute top-2 left-2 flex items-center gap-1 bg-green-600/90 text-white text-[10px] font-semibold px-2 py-[2px] rounded-full shadow"
          title="Verified Seller"
        >
          <svg
            class="w-3 h-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="3"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Verified
        </span>

        <img
          v-if="product.image"
          :src="getImageUrl(product.image)"
          :alt="product.title || 'Product Image'"
          loading="lazy"
          class="w-full h-64 object-cover"
          @click="openImageModal(product.image)"
        />
      </div>

      <!-- ░░ Wishlist Icon ░░ -->
      <button
        @click="toggleWishlist"
        class="absolute top-5 right-5 bg-white rounded-full p-2 shadow text-xl"
        :disabled="wishlistLoading"
      >
        <span v-if="isWishlisted">❤️</span>
        <span v-else>🤍</span>
      </button>
    </div>

    <!-- ░░ Fullscreen Image Modal ░░ -->
    <teleport to="body">
      <div
        v-if="showImageModal"
        class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        @click.self="showImageModal = false"
      >
        <img :src="getImageUrl(activeImage)" class="max-w-full max-h-full rounded-xl shadow-lg" />
      </div>
    </teleport>

    <!-- ░░ Product Info ░░ -->
    <div v-if="!loading" class="p-4 space-y-4 bg-white rounded-t-2xl shadow -mt-4 z-10 relative">
      <div>
        <h1 class="text-xl font-semibold text-[#2C3E50]">{{ product.title }}</h1>
        <p class="text-[#003f7f] font-bold text-2xl mt-1">₦{{ product.price }}</p>
      </div>

      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in dummyTags"
          :key="tag"
          class="text-xs bg-[#003f7f]/10 text-[#003f7f] px-2 py-1 rounded-full"
        >
          #{{ tag }}
        </span>
      </div>

      <p class="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
        {{ product.description }}
      </p>

      <!-- ░░ Delivery Info ░░ -->
      <div class="bg-[#F7F9FC] border border-gray-200 rounded-lg p-3 text-sm text-gray-600 space-y-1">
        <p>🚚 Delivery: Within 24–48 hours on campus</p>
        <p>💳 Payment Options: Bank transfer or Pay on Delivery</p>
        <p class="text-xs text-gray-500 mt-1">
          Tap “Buy Now” to proceed to checkout and confirm your payment.
        </p>
      </div>

      <!-- ░░ Seller Info ░░ -->
      <div v-if="product.seller_name" class="text-xs text-gray-500 flex items-center gap-1">
        Seller:
        <span class="ml-1 font-medium">{{ product.seller_name }}</span>
        <svg
          v-if="product.is_verified == 1 || product.is_verified === true"
          class="w-3 h-3 ml-1 text-green-600 shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-label="Verified Seller"
          title="Verified Seller"
        >
          <path
            d="M16.707 8.293l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 14.586l7.293-7.293a1 1 0 011.414 1.414z"
          />
        </svg>
      </div>

      <!-- ░░ Action Buttons ░░ -->
      <div class="grid grid-cols-2 gap-4 mt-6">
        <button
          class="bg-[#003f7f] text-white py-2 rounded-lg font-medium shadow hover:bg-[#002a5c] transition"
          @click="goToPayment"
        >
          Buy Now
        </button>

        <router-link
          v-if="product.seller_id"
          :to="`/message/${product.seller_id}`"
          class="bg-gray-100 text-[#2C3E50] py-2 rounded-lg font-medium shadow text-center flex items-center justify-center hover:bg-gray-200 transition"
        >
          Message Seller
        </router-link>

        <!-- 📞 WhatsApp Button (spans full width) -->
        <a
          v-if="product.is_verified == 1 && product.whatsapp_number"
          :href="`https://wa.me/${formatWhatsApp(product.whatsapp_number)}?text=Hi%2C%20I'm%20interested%20in%20your%20product%20on%20JABU%20Student%20Hub%20(${encodeURIComponent(product.title)})`"
          target="_blank"
          class="col-span-2 bg-green-500 text-white py-2 rounded-lg font-medium shadow hover:bg-green-600 transition text-center"
        >
          📞 Contact via WhatsApp
        </a>
      </div>

      <!-- ░░ Wishlist Full Button ░░ -->
      <button
        @click="toggleWishlist"
        class="w-full mt-3 border border-[#003f7f] text-[#003f7f] font-medium py-2 rounded-lg hover:bg-[#003f7f]/10 transition flex items-center justify-center gap-2"
        :disabled="wishlistLoading"
      >
        <span v-if="isWishlisted">❤️ Saved to Wishlist</span>
        <span v-else>🤍 Add to Wishlist</span>
      </button>
    </div>

    <!-- ░░ Recommendations ░░ -->
    <div v-if="recommendations.length" class="px-4 pt-6 pb-10">
      <h3 class="text-lg font-semibold mb-3 text-[#2C3E50]">🛍️ People Also Liked</h3>
      <div class="flex gap-4 overflow-x-auto no-scrollbar">
        <div
          v-for="item in recommendations"
          :key="item.id"
          class="min-w-[150px] max-w-[150px] bg-white rounded-xl shadow p-2 flex-shrink-0 hover:shadow-md transition"
        >
          <router-link :to="`/product/${item.id}`">
            <img
              :src="getImageUrl(item.image)"
              class="h-24 w-full object-cover rounded-md mb-2"
              :alt="item.title"
              loading="lazy"
            />
            <p class="text-sm font-medium text-gray-800 line-clamp-2">{{ item.title }}</p>
            <p class="text-[#003f7f] font-bold text-sm mt-1">₦{{ item.price }}</p>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const route = useRoute()
const router = useRouter()

// Pinia auth state
const userStore = useUserStore()
const { user } = storeToRefs(userStore)
const currentUserId = computed(() => user.value?.id || null)

const product = ref({})
const recommendations = ref([])
const isWishlisted = ref(false)
const loading = ref(true)
const wishlistLoading = ref(false)

const showImageModal = ref(false)
const activeImage = ref(null)
const dummyTags = ['popular', 'trendy', 'student-deals']

function openImageModal(img) {
  activeImage.value = img
  showImageModal.value = true
}

const productId = computed(() => route.params.productId || route.params.id)

function getImageUrl(path) {
  if (!path) return 'https://jabumarket.com.ng/assets/placeholder.png'
  return path.startsWith('http') ? path : `https://jabumarket.com.ng/${path}`
}

function formatWhatsApp(number) {
  // Convert leading 0 to +234 (Nigeria). Adjust if needed for other formats.
  return number.replace(/^0/, '+234')
}

function goToPayment() {
  router.push(`/payment/${productId.value}`)
}

async function toggleWishlist() {
  if (!currentUserId.value) {
    return router.push('/login')
  }
  isWishlisted.value = !isWishlisted.value
  wishlistLoading.value = true
  try {
    await fetch('https://jabumarket.com.ng/api/interested.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUserId.value,
        product_id: productId.value,
        interested: isWishlisted.value,
      }),
    })
  } catch (error) {
    console.error('Failed to update wishlist:', error)
    alert('Something went wrong. Try again later.')
  } finally {
    wishlistLoading.value = false
  }
}

async function checkWishlist() {
  if (!currentUserId.value) return
  try {
    const res = await fetch(
      `https://jabumarket.com.ng/api/interested.php?user_id=${currentUserId.value}&product_id=${productId.value}&t=${Date.now()}`
    )
    const data = await res.json()
    isWishlisted.value = !!data.interested
  } catch (err) {
    console.error('Failed to check wishlist:', err)
  }
}

async function fetchProduct(id) {
  try {
    loading.value = true
    const productRes = await fetch(`https://jabumarket.com.ng/api/product.php?id=${id}`)
    product.value = await productRes.json()

    const recRes = await fetch(
      `https://jabumarket.com.ng/api/related_products.php?exclude=${id}`
    )
    const recData = await recRes.json()
    recommendations.value = Array.isArray(recData) ? recData : []
  } catch (err) {
    console.error('Error loading product:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProduct(productId.value)
  checkWishlist()
})

onBeforeRouteUpdate((to, _from, next) => {
  isWishlisted.value = false
  const newId = to.params.productId || to.params.id
  fetchProduct(newId)
  checkWishlist()
  next()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
