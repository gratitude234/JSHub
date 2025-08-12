<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-20">

    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 px-4 shadow text-center text-xl font-bold">
      ✅ Approve Payments
    </header>

    <!-- Toast -->
    <div
      v-if="toast.message"
      :class="{
        'bg-green-100 text-green-700': toast.type === 'success',
        'bg-red-100 text-red-700': toast.type === 'error'
      }"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow z-50"
      aria-live="polite"
    >
      {{ toast.message }}
    </div>

    <!-- Main Content -->
    <section class="p-4">
      <div v-if="loading" class="text-center py-8 text-gray-500 animate-pulse">
        Loading pending payments...
      </div>

      <div v-else-if="error" class="text-center py-8 text-red-500">
        {{ error }}
      </div>

      <div v-else-if="transactions.length === 0" class="text-center py-10 text-gray-500">
        No pending payments to review.
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="trx in transactions"
          :key="trx.id"
          class="bg-white p-4 rounded-xl shadow space-y-3"
        >
          <div class="text-sm text-gray-600 space-y-1">
            <div><strong>Product:</strong> {{ trx.product_title }}</div>
            <div><strong>Buyer:</strong> {{ trx.buyer_name }}</div>
            <div><strong>Amount:</strong> ₦{{ formatAmount(trx.amount) }}</div>
            <div><strong>Submitted:</strong> {{ formatDate(trx.created_at) }}</div>
          </div>

          <!-- Clickable Receipt Thumbnail -->
          <img
            @click="openPreview(trx.proof_of_payment)"
            :src="getImageUrl(trx.proof_of_payment)"
            alt="Payment Receipt"
            loading="lazy"
            class="w-full h-56 object-cover rounded-md shadow cursor-pointer"
          />

          <!-- Actions -->
          <div class="flex justify-end gap-2">
            <button
              @click="handleAction(trx.id, 'reject')"
              :disabled="actionLoading[trx.id]"
              class="px-4 py-2 rounded-lg transition disabled:opacity-50"
              :class="actionLoading[trx.id] ? 'bg-red-200 text-red-400' : 'bg-red-100 text-red-700 hover:bg-red-200'"
            >
              ❌ Reject
            </button>
            <button
              @click="handleAction(trx.id, 'approve')"
              :disabled="actionLoading[trx.id]"
              class="px-4 py-2 rounded-lg transition disabled:opacity-50"
              :class="actionLoading[trx.id] ? 'bg-green-400 text-white' : 'bg-green-600 text-white hover:bg-green-700'"
            >
              ✅ Approve
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Fullscreen Preview Modal -->
    <div
      v-if="previewImage"
      class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      @click.self="closePreview"
    >
      <button
        @click="closePreview"
        class="absolute top-4 right-4 text-white text-2xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-75"
        aria-label="Close preview"
      >
        ✕
      </button>
      <img
        :src="getImageUrl(previewImage)"
        alt="Full Receipt"
        class="max-w-full max-h-full rounded-lg shadow-lg"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// State
const loading = ref(true)
const transactions = ref([])
const error = ref('')
const toast = ref({ message: '', type: '' })
const actionLoading = ref({})
const previewImage = ref(null)

// Utility: show a toast for 3s
function showToast(msg, type = 'success') {
  toast.value = { message: msg, type }
  setTimeout(() => { toast.value = { message: '', type: '' } }, 3000)
}

// Fetch pending transactions
async function fetchTransactions() {
  loading.value = true
  error.value = ''
  try {
    const res = await fetch('https://jabumarket.com.ng/api/get_pending_transactions.php')
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to load transactions')
    transactions.value = data.transactions
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Approve or reject a transaction
async function handleAction(transactionId, action) {
  const confirmText = action === 'approve'
    ? 'Approve this payment?'
    : 'Reject this payment?'
  if (!confirm(confirmText)) return

  actionLoading.value = { ...actionLoading.value, [transactionId]: true }

  try {
    const res = await fetch('https://jabumarket.com.ng/api/approve_transaction.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction_id: transactionId, action })
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.error || 'Failed to update transaction')

    transactions.value = transactions.value.filter(t => t.id !== transactionId)
    showToast(data.message, 'success')
  } catch (err) {
    showToast(err.message, 'error')
  } finally {
    actionLoading.value = { ...actionLoading.value, [transactionId]: false }
  }
}

// Open and close preview modal
function openPreview(path) {
  previewImage.value = path
}
function closePreview() {
  previewImage.value = null
}

// Helpers
const formatDate = d => new Date(d).toLocaleString()
const formatAmount = amt => Number(amt).toLocaleString('en-NG')
const getImageUrl = path =>
  path.startsWith('http')
    ? path
    : `https://jabumarket.com.ng/${path}`

// Initial fetch
onMounted(fetchTransactions)
</script>
