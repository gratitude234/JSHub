<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-28 text-[#2C3E50]">
    <Header />

    <SearchInput v-model="searchQuery" />

    <CategoryFilters
      :categories="categories"
      :selectedCategory="selectedCategory"
      @update:category="updateCategory"
    />

    <section class="px-4 py-4">
      <!-- ░░ Timeout + Error-Aware Initial Loading ░░ -->
      <div v-if="loading && products.length === 0">
        <div v-if="!timeoutTriggered" class="flex justify-center items-center py-8">
          <LoadingSpinner />
        </div>
        <div v-else class="text-center py-8 text-[#2C3E50] space-y-2">
          <p class="text-lg font-semibold">⚠️ Server not responding</p>
          <p class="text-sm text-gray-500">Please check your internet connection or try again.</p>
          <button
            @click="retryFetch"
            class="mt-4 bg-[#003f7f] text-white px-4 py-2 rounded-lg shadow hover:bg-[#002a5c] transition"
          >
            🔄 Retry
          </button>
        </div>
      </div>

      <!-- ░░ Empty vs Fetch Error ░░ -->
      <div v-else-if="!loading && products.length === 0">
        <div v-if="fetchError" class="text-center py-8 text-[#7f4000] space-y-2">
          <p class="text-lg font-semibold">🚫 Unable to load products</p>
          <p class="text-sm text-gray-500">Check your internet or try again shortly.</p>
          <button
            @click="retryFetch"
            class="mt-4 bg-[#003f7f] text-white px-4 py-2 rounded-lg shadow hover:bg-[#002a5c] transition"
          >
            🔄 Retry
          </button>
        </div>
        <div v-else class="text-center py-8 text-[#7f4000]">
          No products found
        </div>
      </div>

      <!-- ░░ Products grid ░░ -->
      <div v-else class="grid grid-cols-2 gap-4">
        <ProductCard v-for="item in products" :key="item.id" :product="item" />
      </div>

      <!-- Sentinel element for infinite scroll -->
      <div ref="infiniteScrollTrigger"></div>

      <!-- ░░ Loading spinner for next pages ░░ -->
      <div v-if="loading && products.length > 0" class="flex justify-center items-center py-4">
        <LoadingSpinner />
      </div>
    </section>

    <ScrollToTopFab />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

import Header from '../components/Header.vue'
import SearchInput from '../components/SearchInput.vue'
import CategoryFilters from '../components/CategoryFilters.vue'
import ProductCard from '../components/ProductCard.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'

import { useProducts } from '../composables/useProducts'

const searchQuery = ref('')
const selectedCategory = ref('All')

const categories = [
  'All',
  'Fashion & Accessories',
  'Clothing & Footwear',
  'Electronics & Gadgets',
  'Beauty & Personal Care',
  'Snacks & Treats',
  'Provisions & Groceries',
  'Student Essentials',
  'Services',
  'Others',
]

const { products, loading, fetchProducts, hasMore } = useProducts(searchQuery, selectedCategory)

const timeoutTriggered = ref(false)
const fetchError = ref(false)

function startTimeout() {
  timeoutTriggered.value = false
  setTimeout(() => {
    if (loading.value && products.value.length === 0) {
      timeoutTriggered.value = true
    }
  }, 8000)
}

async function retryFetch() {
  timeoutTriggered.value = false
  fetchError.value = false
  try {
    await fetchProducts(true)
    startTimeout()
  } catch (err) {
    fetchError.value = true
  }
}

function handleReconnect() {
  if (!loading.value && products.value.length === 0 && fetchError.value) {
    retryFetch()
  }
}

watch(searchQuery, () => {
  fetchProducts(true)
  startTimeout()
})

watch(selectedCategory, () => {
  fetchProducts(true)
  startTimeout()
})

function updateCategory(cat) {
  selectedCategory.value = cat
}

const infiniteScrollTrigger = ref(null)
let observer

onMounted(async () => {
  const savedPosition = sessionStorage.getItem('marketplace-scroll')
  if (savedPosition) {
    window.scrollTo(0, parseInt(savedPosition))
  }

  try {
    await fetchProducts(true)
    startTimeout()
  } catch (err) {
    fetchError.value = true
  }

  window.addEventListener('online', handleReconnect)

  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !loading.value && hasMore.value) {
        fetchProducts()
      }
    })
  })
  if (infiniteScrollTrigger.value) {
    observer.observe(infiniteScrollTrigger.value)
  }
})

onBeforeUnmount(() => {
  sessionStorage.setItem('marketplace-scroll', window.scrollY)
  if (observer && infiniteScrollTrigger.value) {
    observer.unobserve(infiniteScrollTrigger.value)
  }

  window.removeEventListener('online', handleReconnect)
})
</script>
