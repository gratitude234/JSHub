<!-- File: src/pages/UploadVibe.vue -->
<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-28 text-[#2C3E50]">
    <!-- 🔹 Header -->
    <header
      class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md"
    >
      💬 Post to Campus Vibes
    </header>

    <!-- 🔹 Form -->
    <form @submit.prevent="submitVibe" class="p-4 space-y-4">
      <div class="bg-white rounded-xl shadow p-4 space-y-4">
        <!-- Anonymous Toggle -->
        <div class="flex items-center gap-2">
          <input
            id="anonSwitch"
            type="checkbox"
            v-model="form.anonymous"
            class="form-checkbox"
          />
          <label for="anonSwitch" class="text-sm">Post Anonymously</label>
        </div>

        <!-- Textarea -->
        <textarea
          v-model="form.body"
          placeholder="What’s on your mind?"
          rows="6"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003f7f]"
        ></textarea>

        <!-- File Upload (images + documents) -->
        <div>
          <label class="text-sm font-medium text-gray-600"
            >📎 Add Image / Document (optional)</label
          >
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
            @change="handleFileUpload"
            class="w-full text-sm mt-1"
          />
        </div>

        <!-- Preview -->
        <div v-if="form.file" class="mt-2">
          <!-- Image preview -->
          <img
            v-if="isImage(form.file)"
            :src="previewUrl"
            class="rounded-md max-h-60 border"
            alt="Preview"
          />
          <!-- Document preview -->
          <div
            v-else
            class="flex flex-col items-center justify-center text-[#003f7f]"
          >
            <div class="text-4xl">📄</div>
            <p class="text-xs mt-1 break-all">{{ form.file.name }}</p>
          </div>

          <button
            type="button"
            @click="removeFile"
            class="text-red-500 text-xs mt-1 underline"
          >
            Remove
          </button>
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 bg-[#003f7f] text-white rounded-md font-medium hover:bg-[#002a5c] transition flex justify-center items-center"
        >
          <span v-if="!loading">📤 Post</span>
          <svg
            v-else
            class="animate-spin h-5 w-5 text-white"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
            />
          </svg>
        </button>
      </div>
    </form>

    <!-- ✅ Toast -->
    <transition name="fade">
      <div
        v-if="toastMessage"
        class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-[#003f7f] text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm"
      >
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

/* --- Stores & router --- */
const router = useRouter()
const userStore = useUserStore()

/* --- Reactive state --- */
const loading = ref(false)
const toastMessage = ref(null)
let toastTimer = null

const form = ref({
  body: '',
  file: null, // ⬅️ image OR document
  anonymous: false
})

const previewUrl = ref(null)

/* --- Helpers --- */
function isImage(file) {
  return file && file.type.startsWith('image/')
}

function handleFileUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  form.value.file = file

  if (isImage(file)) {
    const reader = new FileReader()
    reader.onload = evt => {
      previewUrl.value = evt.target.result
    }
    reader.readAsDataURL(file)
  } else {
    previewUrl.value = null
  }
}

function removeFile() {
  form.value.file = null
  previewUrl.value = null
  // Clear the file input element (optional)
  e?.target?.value && (e.target.value = null)
}

function showToast(message) {
  toastMessage.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = null
  }, 3000)
}

/* --- Submit post --- */
async function submitVibe() {
  const user_id = userStore.user?.id
  if (!form.value.body.trim() || !user_id) {
    showToast('❗ Please write something and make sure you’re logged in.')
    return
  }

  const fd = new FormData()
  fd.append('body', form.value.body)
  fd.append('user_id', user_id)
  fd.append('anonymous', form.value.anonymous ? 1 : 0)
  if (form.value.file) fd.append('file', form.value.file) // ⬅️ unified key

  loading.value = true
  try {
    const res = await fetch(
      'https://jabumarket.com.ng/api/post_community.php',
      {
        method: 'POST',
        body: fd
      }
    )
    const data = await res.json()

    if (data.status === 'success') {
      showToast('✅ Post uploaded successfully!')
      // Reset form
      form.value.body = ''
      form.value.file = null
      form.value.anonymous = false
      previewUrl.value = null
      // Redirect to community feed
      setTimeout(() => router.push('/community'), 1200)
    } else {
      showToast(
        `❌ Upload failed: ${data.message || 'Something went wrong'}`
      )
    }
  } catch (err) {
    console.error(err)
    showToast('❌ Something went wrong while posting.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
