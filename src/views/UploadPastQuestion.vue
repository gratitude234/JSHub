<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- 🔹 Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      📤 Upload Past Question
    </header>

    <form @submit.prevent="handleUpload" class="p-4 space-y-4">
      <div>
        <label class="block text-sm font-semibold">📘 Title</label>
        <input
          v-model="form.title"
          type="text"
          required
          placeholder="E.g., PHY 102 – Electricity & Magnetism"
          class="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold">📚 Course Code</label>
        <input
          v-model="form.course_code"
          type="text"
          required
          placeholder="E.g., PHY102"
          class="w-full px-4 py-2 border rounded-lg"
        />
      </div>

      <div>
        <label class="block text-sm font-semibold">🎓 Level</label>
        <select v-model="form.level" required class="w-full px-4 py-2 border rounded-lg">
          <option value="" disabled>Select Level</option>
          <option>100</option>
          <option>200</option>
          <option>300</option>
          <option>400</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-semibold">📅 Semester</label>
        <select v-model="form.semester" required class="w-full px-4 py-2 border rounded-lg">
          <option value="" disabled>Select Semester</option>
          <option>First</option>
          <option>Second</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-semibold">📎 PDF File (Max 20MB)</label>
        <input ref="fileInput" type="file" accept="application/pdf" @change="handleFileChange" required />
      </div>

      <button
        type="submit"
        class="w-full py-2 bg-[#003f7f] text-white rounded-lg font-semibold hover:bg-[#002b5c]"
        :disabled="uploading"
      >
        {{ uploading ? 'Uploading...' : 'Upload Past Question' }}
      </button>

      <p v-if="success" class="text-green-600 text-sm">✅ Upload successful!</p>
      <p v-if="error" class="text-red-600 text-sm">❌ {{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  title: '',
  course_code: '',
  level: '',
  semester: '',
})

const selectedFile = ref(null)
const uploading = ref(false)
const success = ref(false)
const error = ref('')
const fileInput = ref(null)

function handleFileChange(event) {
  const file = event.target.files[0]
  const maxSize = 20 * 1024 * 1024 // 20MB

  if (file && file.size > maxSize) {
    error.value = `❌ File too large. You selected ${formatSize(file.size)}, max allowed is 20MB.`
    selectedFile.value = null
    event.target.value = null
  } else {
    selectedFile.value = file
    error.value = ''
  }
}

function formatSize(size) {
  return `${(size / (1024 * 1024)).toFixed(2)} MB`
}

async function handleUpload() {
  if (!selectedFile.value) {
    error.value = 'Please select a valid PDF file.'
    return
  }

  uploading.value = true
  success.value = false
  error.value = ''

  const body = new FormData()
  body.append('title', form.value.title)
  body.append('course_code', form.value.course_code)
  body.append('level', form.value.level)
  body.append('semester', form.value.semester)
  body.append('pdf_file', selectedFile.value)

  try {
    const res = await fetch('https://jabumarket.com.ng/api/upload_past_question.php', {
      method: 'POST',
      body,
    })

    const result = await res.json()
    if (result.success) {
      success.value = true
      form.value = { title: '', course_code: '', level: '', semester: '' }
      selectedFile.value = null
      fileInput.value.value = null // reset file input field
    } else {
      error.value = result.error || 'Upload failed. Try again.'
    }
  } catch (e) {
    error.value = 'Server error. Please try again.'
  } finally {
    uploading.value = false
  }
}
</script>
