import { ref } from 'vue'

export function useProducts(searchQuery, selectedCategory) {
  const products = ref([])
  const loading = ref(false)
  const page = ref(1)
  const perPage = 10
  const hasMore = ref(true)

  /**
   * Fetch products from the API.
   * @param {boolean} reset - If true, reset the product list and pagination.
   */
  async function fetchProducts(reset = false) {
    if (reset) {
      page.value = 1
      products.value = []
      hasMore.value = true
    }
    if (!hasMore.value) return

    loading.value = true
    try {
      const params = new URLSearchParams()
      if (searchQuery.value) params.append('search', searchQuery.value)
      if (selectedCategory.value !== 'All') params.append('category', selectedCategory.value)
      params.append('page', page.value)
      params.append('limit', perPage)

      const res = await fetch(`https://jabumarket.com.ng/api/products.php?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        products.value.push(...data)
        page.value++
      } else {
        hasMore.value = false
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    fetchProducts,
    hasMore
  }
}
