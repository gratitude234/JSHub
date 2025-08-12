<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-28 text-[#2C3E50] relative">
    <!-- 🔷 Header -->
    <header class="bg-gradient-to-r from-[#003f7f] to-[#005c9f] text-white py-5 text-center font-bold text-xl shadow-md">
      📤 Upload to JABU Hub
    </header>

    <!-- 🔹 Upload Type Selector -->
    <div class="p-4">
      <div class="grid grid-cols-3 gap-3 text-center text-sm font-medium">
        <button
          :disabled="loading"
          class="selector-btn"
          :class="uploadType === 'product' && 'selector-active'"
          @click="setType('product')"
        >🛒 Product</button>

        <button
          :disabled="loading"
          class="selector-btn"
          :class="uploadType === 'post' && 'selector-active'"
          @click="setType('post')"
        >💬 Post</button>

        <button
          :disabled="loading"
          class="selector-btn"
          :class="uploadType === 'lost' && 'selector-active'"
          @click="setType('lost')"
        >🎒 Lost Item</button>
      </div>
    </div>

    <!-- 🔸 Forms -->
    <Transition name="fade">
      <div :key="uploadType" class="px-4 space-y-6">
        <!-- Product -->
        <form
          v-if="uploadType === 'product'"
          @submit.prevent="submitProduct"
          class="card"
        >
          <h2 class="form-heading">Upload Product</h2>
          <input ref="focusField" v-model="form.title" type="text" placeholder="Product Title" class="input" />
          <input v-model="form.price" type="number" placeholder="Price (₦)" class="input" />
          <textarea
            v-model="form.description"
            placeholder="Product Description"
            class="input h-24"
            maxlength="300"
          ></textarea>
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

          <input type="file" @change="handleFile" class="input-file" />
          <img v-if="previewUrl" :src="previewUrl" class="preview-img" />

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading">Uploading…</span>
            <span v-else>Submit Product</span>
          </button>
        </form>

        <!-- Post -->
        <form
          v-if="uploadType === 'post'"
          @submit.prevent="submitPost"
          class="card"
        >
          <h2 class="form-heading">Campus Post</h2>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" v-model="form.anonymous" class="form-checkbox" />
            Post Anonymously
          </label>
          <textarea
            ref="focusField"
            v-model="form.body"
            placeholder="What's on your mind?"
            class="input h-32"
            maxlength="280"
          ></textarea>

          <input type="file" @change="handleFile" class="input-file" />
          <img v-if="previewUrl" :src="previewUrl" class="preview-img" />

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading">Posting…</span>
            <span v-else>Post</span>
          </button>
        </form>

        <!-- Lost Item -->
        <form
          v-if="uploadType === 'lost'"
          @submit.prevent="submitLost"
          class="card"
        >
          <h2 class="form-heading">Report Lost Item</h2>
          <input ref="focusField" v-model="form.item" type="text" placeholder="Item Name" class="input" />
          <input v-model="form.location" type="text" placeholder="Found At" class="input" />
          <textarea
            v-model="form.details"
            placeholder="More Details (optional)"
            class="input h-24"
            maxlength="300"
          ></textarea>

          <input type="file" @change="handleFile" class="input-file" />
          <img v-if="previewUrl" :src="previewUrl" class="preview-img" />

          <button type="submit" class="btn-primary" :disabled="loading">
            <span v-if="loading">Reporting…</span>
            <span v-else>Report</span>
          </button>
        </form>
      </div>
    </Transition>

    <!-- 🔃 Fullscreen Loading Overlay -->
    <Transition name="fade">
      <div
        v-if="loadingOverlay"
        class="fixed inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-50"
      >
        <svg class="animate-spin h-12 w-12 text-white" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
          />
        </svg>
        <p class="mt-4 text-white font-medium tracking-wide">Processing…</p>
      </div>
    </Transition>

    <!-- ✅ Toast -->
    <div
      v-if="toastMessage"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#003f7f] text-white px-4 py-2 rounded-full shadow-lg animate-fade-in-out z-50"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router         = useRouter()
const uploadType     = ref('product')
const file           = ref(null)
const previewUrl     = ref(null)
const loading        = ref(false)
const loadingOverlay = ref(false)
const toastMessage   = ref('')
const focusField     = ref(null)

const form = ref({
  title:       '',
  price:       '',
  description: '',
  category:    '',
  body:        '',
  item:        '',
  location:    '',
  details:     '',
  anonymous:   false
})

function setType(type) {
  uploadType.value = type
  file.value       = null
  nextTick(() => focusField.value?.focus())
}

function handleFile(e) {
  file.value = e.target.files[0] || null
}

// generate & revoke blob-URL on file change
watch(file, (newFile, oldFile) => {
  if (oldFile && previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = newFile ? URL.createObjectURL(newFile) : null
})
onUnmounted(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

function showToast(msg) {
  toastMessage.value = msg
  setTimeout(() => (toastMessage.value = ''), 3000)
}

/* -------------------------------------------------------------------------- */
/*                            PRODUCT SUBMIT                                  */
/* -------------------------------------------------------------------------- */
async function submitProduct() {
  const { id: user_id } = JSON.parse(localStorage.getItem('user') || '{}')
  if (!form.value.title || !form.value.price || !form.value.category || !user_id || !file.value) {
    return showToast('Please fill in all required fields.')
  }

  loading.value = loadingOverlay.value = true
  const fd = new FormData()
  fd.append('title',       form.value.title)
  fd.append('price',       form.value.price)
  fd.append('description', form.value.description)
  fd.append('category',    form.value.category)
  fd.append('user_id',     user_id)
  fd.append('image',       file.value)

  try {
    const res  = await fetch('https://jabumarket.com.ng/api/upload_product.php', { method: 'POST', body: fd })
    const json = await res.json()
    if (json.status === 'success') {
      showToast('✅ Product uploaded successfully!')
      Object.assign(form.value, { title: '', price: '', description: '', category: '' })
      file.value = null
      setTimeout(() => router.push('/marketplace'), 1500)
    } else {
      showToast(`Upload failed: ${json.message}`)
    }
  } catch (e) {
    console.error(e)
    showToast('Something went wrong while uploading.')
  } finally {
    loading.value = loadingOverlay.value = false
  }
}

/* -------------------------------------------------------------------------- */
/*                             POST SUBMIT                                     */
/* -------------------------------------------------------------------------- */
async function submitPost() {
  const { id: user_id } = JSON.parse(localStorage.getItem('user') || '{}')
  if (!form.value.body || !user_id) {
    return showToast('Please fill in all fields.')
  }

  loading.value = loadingOverlay.value = true
  const fd = new FormData()
  fd.append('body',      form.value.body)
  fd.append('user_id',   user_id)
  fd.append('anonymous', form.value.anonymous ? 1 : 0)
  if (file.value) fd.append('image', file.value)

  try {
    const res  = await fetch('https://jabumarket.com.ng/api/post_community.php', { method: 'POST', body: fd })
    const json = await res.json()
    if (json.status === 'success') {
      showToast('✅ Post submitted!')
      Object.assign(form.value, { body: '', anonymous: false })
      file.value = null
    } else {
      showToast(`Post failed: ${json.message}`)
    }
  } catch (e) {
    console.error(e)
    showToast('Something went wrong while posting.')
  } finally {
    loading.value = loadingOverlay.value = false
  }
}

/* -------------------------------------------------------------------------- */
/*                        LOST ITEM SUBMIT                                    */
/* -------------------------------------------------------------------------- */
async function submitLost() {
  const { id: user_id } = JSON.parse(localStorage.getItem('user') || '{}')
  if (!form.value.item || !form.value.location || !user_id) {
    return showToast('Please fill in all required fields.')
  }

  loading.value = loadingOverlay.value = true
  const fd = new FormData()
  fd.append('item',     form.value.item)
  fd.append('location', form.value.location)
  fd.append('details',  form.value.details)
  fd.append('user_id',  user_id)
  if (file.value) fd.append('image', file.value)

  try {
    const res  = await fetch('https://jabumarket.com.ng/api/report_lost.php', { method: 'POST', body: fd })
    const json = await res.json()
    if (json.status === 'success') {
      showToast('✅ Lost item reported!')
      Object.assign(form.value, { item: '', location: '', details: '' })
      file.value = null
    } else {
      showToast(`Report failed: ${json.message}`)
    }
  } catch (e) {
    console.error(e)
    showToast('Something went wrong while reporting.')
  } finally {
    loading.value = loadingOverlay.value = false
  }
}
</script>

<style scoped>
/* ----------  Tiny helpers  ---------- */
.selector-btn    { @apply bg-white rounded-lg shadow px-3 py-2 border transition; }
.selector-active { @apply border-[#003f7f] ring-2 ring-[#003f7f]; }

.card            { @apply space-y-3 bg-white p-5 rounded-2xl shadow-md; }
.form-heading    { @apply text-lg font-semibold mb-1; }

.input           { @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003f7f]; }
.input-file      { @apply w-full text-sm; }
.preview-img     { @apply w-full h-40 object-cover rounded-md mt-2; }

.btn-primary     { @apply w-full py-2 bg-[#003f7f] text-white rounded-md font-medium hover:bg-[#002a5c] transition disabled:opacity-50 disabled:cursor-not-allowed; }

.fade-enter-from, .fade-leave-to   { opacity: 0; transform: scale(0.96); }
.fade-enter-active, .fade-leave-active { transition: all .2s ease; }

/* Toast */
@keyframes fadeInOut {
  0%   { opacity: 0; transform: translateY(20px); }
  10%  { opacity: 1; transform: translateY(0); }
  90%  { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}
.animate-fade-in-out { animation: fadeInOut 3s forwards; }
</style>
