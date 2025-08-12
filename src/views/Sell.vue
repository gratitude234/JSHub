<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-28 text-[#2C3E50] relative">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow">
      🛒 {{ editingId ? 'Edit Product' : 'Upload a Product to Sell' }}
    </header>

    <!-- Product Upload Form -->
    <form @submit.prevent="submitProduct" class="px-4 pt-6 space-y-4">
      <div class="bg-white rounded-xl shadow p-4 space-y-3">
        <h2 class="text-lg font-semibold mb-2">🛍️ Product Information</h2>

        <input v-model="form.title" type="text" placeholder="Product Title" class="input" />
        <input v-model="form.price" type="number" placeholder="Price (₦)" class="input" />
        <textarea v-model="form.description" placeholder="Product Description" rows="4" class="input" />

        <!-- Category Dropdown -->
        <label class="block text-sm font-medium text-gray-600">Category</label>
        <select v-model="form.category" class="input">
          <option disabled value="">Select a Category</option>
          <option>Fashion & Accessories</option>
          <option>Clothing & Footwear</option>
          <option>Electronics & Gadgets</option>
          <option>Beauty & Personal Care</option>
          <option>Snacks & Treats</option>
          <option>Provisions & Groceries</option>
          <option>Student Essentials</option>
          <option>Services</option>
          <option>Others</option>
        </select>

        <!-- Image Picker -->
        <label class="block text-sm font-medium text-gray-600">Product Image</label>
        <input type="file" accept="image/*" @change="handleFile" class="input-file" />

        <!-- Image Preview -->
        <div v-if="previewUrl" class="w-full h-48 overflow-hidden rounded-lg border border-gray-200">
          <img :src="previewUrl" alt="preview" class="w-full h-full object-cover" />
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading">{{ editingId ? 'Saving...' : 'Uploading...' }}</span>
          <span v-else>{{ editingId ? '💾 Save Changes' : '📤 Upload Product' }}</span>
        </button>
      </div>
    </form>

    <!-- Full-screen Loading Spinner -->
    <div v-if="loadingOverlay" class="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
      <div class="animate-spin h-12 w-12 border-4 border-t-transparent border-[#003f7f] rounded-full"></div>
      <p class="mt-4 text-[#003f7f] font-medium">{{ editingId ? 'Saving changes...' : 'Uploading product...' }}</p>
    </div>

    <!-- Full-screen Compressing Spinner -->
    <div v-if="compressing" class="absolute inset-0 flex flex-col items-center justify-center bg-white/70">
      <div class="animate-spin h-10 w-10 border-4 border-t-transparent border-[#003f7f] rounded-full"></div>
      <p class="mt-3 text-[#003f7f] font-medium">Compressing image...</p>
    </div>

    <!-- Toast Message -->
    <div v-if="toastMessage" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#003f7f] text-white px-4 py-2 rounded-full shadow-lg animate-fade-in-out">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import imageCompression from 'browser-image-compression'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const editingId = ref(route.query.id || null)

const form = ref({
  title: '',
  price: '',
  description: '',
  category: ''
})
const file = ref(null)
const previewUrl = ref('')
const loading = ref(false)
const loadingOverlay = ref(false)
const compressing = ref(false)
const toastMessage = ref('')

function showToast(message) {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

onMounted(async () => {
  if (editingId.value) {
    try {
      const res = await fetch(`https://jabumarket.com.ng/api/get_product_by_id.php?id=${editingId.value}`)
      const data = await res.json()

      if (data) {
        form.value.title = data.title
        form.value.price = data.price
        form.value.description = data.description
        form.value.category = data.category
        previewUrl.value = data.image_url
      } else {
        showToast('❌ Product not found')
        router.back()
      }
    } catch (err) {
      console.error(err)
      showToast('❌ Error loading product')
      router.back()
    }
  }
})

async function handleFile(e) {
  const selectedFile = e.target.files[0]
  if (!selectedFile) {
    showToast('⚠️ No file selected.')
    return
  }

  compressing.value = true

  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    useWebWorker: true
  }

  try {
    const compressedFile = await imageCompression(selectedFile, options)

    if (compressedFile.size > 20 * 1024 * 1024) {
      showToast('❌ Image must be 20MB or smaller.')
      e.target.value = ''
      compressing.value = false
      return
    }

    file.value = compressedFile
    previewUrl.value = URL.createObjectURL(compressedFile)
  } catch (error) {
    console.error('Compression error:', error)
    showToast('❌ Failed to compress image.')
  } finally {
    compressing.value = false
  }
}

async function submitProduct() {
  const userId = userStore.user?.id

  if (!form.value.title || !form.value.price || !form.value.category || !userId) {
    showToast('Please fill in all required fields.')
    return
  }

  loading.value = true
  loadingOverlay.value = true

  const fd = new FormData()
  fd.append('title', form.value.title)
  fd.append('price', form.value.price)
  fd.append('description', form.value.description)
  fd.append('category', form.value.category)
  fd.append('user_id', userId)

  if (file.value) {
    fd.append('image', file.value)
  }

  try {
    const endpoint = editingId.value
      ? `https://jabumarket.com.ng/api/update_product.php?id=${editingId.value}`
      : 'https://jabumarket.com.ng/api/upload_product.php'

    const res = await fetch(endpoint, {
      method: 'POST',
      body: fd
    })

    const data = await res.json()

    if (data.status === 'success') {
      showToast(editingId.value ? '✅ Product updated!' : '✅ Product uploaded successfully!')
      setTimeout(() => router.push('/marketplace'), 1500)
    } else {
      showToast(`Failed: ${data.message}`)
    }
  } catch (err) {
    console.error(err)
    showToast('Something went wrong.')
  } finally {
    loading.value = false
    loadingOverlay.value = false
  }
}
</script>

<style scoped>
.input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003f7f];
}
.input-file {
  @apply w-full text-sm cursor-pointer;
}
.btn-primary {
  @apply w-full py-2 bg-[#003f7f] text-white rounded-md font-medium hover:bg-[#002a5c] transition disabled:opacity-50 disabled:cursor-not-allowed;
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10%,90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}
.animate-fade-in-out {
  animation: fadeInOut 3s ease forwards;
}
</style>
