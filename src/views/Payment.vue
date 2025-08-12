<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-24 text-[#2C3E50] relative">
    <!-- Initial Product‐load Spinner -->
    <div
      v-if="loadingProduct"
      class="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex items-center justify-center"
    >
      <svg
        class="animate-spin h-10 w-10 text-[#003f7f]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
    </div>

    <!-- Confirm‐Payment Spinner Overlay -->
    <div
      v-if="loading"
      class="fixed inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center"
    >
      <svg
        class="animate-spin h-10 w-10 text-[#003f7f]"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8H4z"
        />
      </svg>
    </div>

    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow">
      💳 Checkout
    </header>

    <!-- Step Indicator -->
    <div class="text-center text-sm text-gray-600 py-3">
      <span class="font-bold text-[#003f7f]">Step 2</span> of 2 — Confirm Your Payment
    </div>

    <!-- Product Loading / Error / Summary -->
    <section class="mx-4">
      <div
        v-if="fetchError"
        class="bg-red-100 text-red-700 p-4 rounded-md text-center"
      >
        Failed to load product. Please try again later.
      </div>
      <section
        v-else-if="product.id"
        class="bg-white p-4 shadow-sm rounded-xl"
      >
        <img
          :src="getImageUrl(product.image)"
          alt="Product"
          class="w-full h-48 object-cover rounded-md"
        />
        <h2 class="mt-3 text-xl font-semibold">{{ product.title }}</h2>
        <p class="text-[#003f7f] font-bold text-lg">₦{{ formattedPrice }}</p>
        <p class="text-sm text-gray-500 mt-1">
          Sold by: {{ product.seller_name }}
        </p>
      </section>
    </section>

    <!-- Payment Form -->
    <fieldset :disabled="loading" class="mt-6 px-4">
      <!-- Payment Method -->
      <section>
        <h3 class="font-semibold mb-3">Choose Payment Method:</h3>
        <div class="space-y-2">
          <label class="flex items-center bg-white p-3 rounded-lg shadow-sm cursor-pointer">
            <input type="radio" v-model="paymentMethod" value="bank" class="mr-2" />
            Bank Transfer
          </label>
          <label class="flex items-center bg-white p-3 rounded-lg shadow-sm opacity-50 cursor-not-allowed">
            <input type="radio" disabled class="mr-2" />
            Wallet (Coming Soon)
          </label>
        </div>
      </section>

      <!-- Bank Instructions -->
      <section v-if="paymentMethod === 'bank'" class="pt-4">
        <div class="bg-white border border-yellow-400 p-4 rounded-xl shadow-sm text-sm space-y-2">
          <div class="flex justify-between items-center">
            <span><strong>Amount:</strong> ₦{{ formattedPrice }}</span>
            <button @click="copyToClipboard(formattedPrice)" class="text-xs text-[#003f7f]">Copy</button>
          </div>
          <div class="flex justify-between items-center">
            <span><strong>Bank:</strong> {{ bankName }}</span>
            <button @click="copyToClipboard(bankName)" class="text-xs text-[#003f7f]">Copy</button>
          </div>
          <div class="flex justify-between items-center">
            <span><strong>Account No:</strong> {{ accountNumber }}</span>
            <button @click="copyToClipboard(accountNumber)" class="text-xs text-[#003f7f]">Copy</button>
          </div>
          <div class="flex justify-between items-center">
            <span><strong>Account Name:</strong> {{ accountName }}</span>
            <button @click="copyToClipboard(accountName)" class="text-xs text-[#003f7f]">Copy</button>
          </div>
          <p class="mt-3 font-semibold">📸 Upload receipt after transfer:</p>
        </div>

        <!-- Upload -->
        <input
          type="file"
          accept="image/png, image/jpeg"
          @change="handleFileChange"
          class="mt-3 w-full p-2 bg-white rounded border shadow-sm"
        />

        <!-- Preview -->
        <img
          v-if="previewUrl"
          :src="previewUrl"
          class="mt-3 w-full h-48 object-cover rounded-lg shadow"
        />

        <!-- Submit -->
        <button
          type="button"
          :disabled="!receiptFile"
          @click="confirmPayment"
          class="mt-4 w-full bg-[#003f7f] text-white py-2 rounded shadow hover:bg-[#002b60] transition disabled:opacity-50"
        >
          {{ loading ? 'Submitting...' : 'Confirm Payment' }}
        </button>
      </section>
    </fieldset>

    <!-- Success / Error Feedback -->
    <div v-if="message" class="mt-6 px-4" aria-live="polite">
      <div
        class="p-3 rounded text-center"
        :class="{
          'bg-green-100 text-green-700': messageType === 'success',
          'bg-red-100 text-red-700': messageType === 'error'
        }"
      >
        {{ message }}
      </div>
    </div>

    <!-- Need Help? -->
    <p class="text-center text-sm text-gray-500 mt-6">
      Need help?
      <a href="https://wa.me/2347041022336" class="text-[#003f7f] underline">
        Contact Support
      </a>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

const route = useRoute()
const router = useRouter()
const productId = route.params.id

const product = ref({})
const loadingProduct = ref(true)
const fetchError = ref(false)

const paymentMethod = ref('bank')
const receiptFile = ref(null)
const previewUrl = ref('')
const loading = ref(false)

const message = ref('')
const messageType = ref('')

const userStore = useUserStore()
const buyerId = computed(() => userStore.user?.id || null)

// Hard-coded bank details (move to config/env as needed)
const bankName = 'OPAY'
const accountNumber = '8148191204'
const accountName = 'ADETOLUWANI GRATITUDE'

const formattedPrice = computed(() =>
  product.value.price != null
    ? Number(product.value.price).toLocaleString('en-NG')
    : ''
)

function getImageUrl(path) {
  if (!path) return 'https://jabumarket.com.ng/assets/placeholder.png'
  return path.startsWith('http') ? path : `https://jabumarket.com.ng/${path}`
}

function handleFileChange(e) {
  console.log('file change event:', e.target.files[0])
  const file = e.target.files[0]
  if (!file) return

  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)

  if (!ALLOWED_TYPES.includes(file.type)) {
    message.value = 'Only JPEG/PNG images are allowed'
    messageType.value = 'error'
    receiptFile.value = null
    previewUrl.value = ''
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    message.value = 'File too large (max 5 MB)'
    messageType.value = 'error'
    receiptFile.value = null
    previewUrl.value = ''
    return
  }

  receiptFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  message.value = ''
  messageType.value = ''
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
}

async function confirmPayment() {
  console.log('confirmPayment guard:', {
    hasFile: !!receiptFile.value,
    buyerId: buyerId.value,
    productId: product.value.id
  })

  if (!receiptFile.value) {
    message.value = 'Please upload your payment receipt first.'
    messageType.value = 'error'
    return
  }
  if (!buyerId.value) {
    message.value = 'You must be logged in to confirm a payment.'
    messageType.value = 'error'
    return
  }
  if (!product.value.id) {
    message.value = 'Product information is missing. Please try again later.'
    messageType.value = 'error'
    return
  }

  loading.value = true
  message.value = ''
  messageType.value = ''

  // Let the spinner render before doing the work
  await nextTick()

  try {
    // 1️⃣ Upload receipt
    const formData = new FormData()
    formData.append('receipt', receiptFile.value)
    const uploadRes = await fetch('https://jabumarket.com.ng/api/upload_receipt.php', {
      method: 'POST',
      body: formData
    })
    const uploadData = await uploadRes.json()
    if (!uploadData.success) throw new Error(uploadData.error || 'Upload failed')

    // 2️⃣ Create transaction
    const trxPayload = {
      user_id: product.value.seller_id,
      buyer_id: buyerId.value,
      product_id: product.value.id,
      amount: product.value.price,
      payment_method: paymentMethod.value,
      proof_of_payment: uploadData.path
    }
    const trxRes = await fetch('https://jabumarket.com.ng/api/create_transaction.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trxPayload)
    })
    const trxData = await trxRes.json()
    if (!trxData.success) throw new Error(trxData.error || 'Transaction failed')

    message.value = 'Payment submitted successfully. Redirecting...'
    messageType.value = 'success'
    setTimeout(() => router.push('/orders'), 2000)

  } catch (err) {
    console.error(err)
    message.value = err.message || 'Something went wrong'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const res = await fetch(`https://jabumarket.com.ng/api/product.php?id=${productId}`)
    const data = await res.json()
    product.value = data
  } catch (err) {
    console.error('Error loading product:', err)
    fetchError.value = true
  } finally {
    // keep the initial spinner visible briefly even on fast connections
    setTimeout(() => {
      loadingProduct.value = false
    }, 400)
  }
})

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

