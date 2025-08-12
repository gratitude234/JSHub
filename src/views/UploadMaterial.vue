<!-- src/views/UploadMaterial.vue -->
<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">

    <!-- 🏷 Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      ⬆️ Upload Study Material
    </header>

    <!-- 📑 Upload Form -->
    <section class="p-5 space-y-5">

      <!-- Drag-and-drop zone -->
      <div
        class="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
               transition hover:bg-gray-50"
        :class="dragging ? 'border-[#28a745]' : 'border-gray-400'"
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
      >
        <p class="text-sm" v-if="!file">
          <span class="font-semibold">Drag & drop</span> or click to browse<br />
          (PDF, JPG, PNG — max 10 MB)
        </p>
        <p v-else class="text-sm text-[#28a745] font-semibold">
          {{ file.name }} selected ✔️
        </p>
      </div>
      <input
        ref="fileInput"
        type="file"
        accept=".pdf,image/*"
        class="hidden"
        @change="handleSelect"
      />

      <!-- Meta fields -->
      <input
        v-model="title"
        type="text"
        placeholder="Title"
        class="w-full px-4 py-2 border rounded text-sm"
      />
      <div class="flex gap-3">
        <select v-model="course" class="flex-1 px-3 py-2 border rounded text-sm">
          <option disabled value="">Course</option>
          <option v-for="c in courseOpts" :key="c" :value="c">{{ c }}</option>
        </select>
        <select v-model="type" class="w-32 px-3 py-2 border rounded text-sm">
          <option disabled value="">Type</option>
          <option value="slides">Slides</option>
          <option value="notes">Notes</option>
        </select>
      </div>

      <!-- Upload button -->
      <button
        class="w-full bg-[#28a745] text-white py-2 rounded font-semibold disabled:opacity-40"
        :disabled="!canUpload"
        @click="startUpload"
      >
        Upload
      </button>

      <!-- Progress bar -->
      <div v-if="uploading" class="space-y-2">
        <div class="h-3 w-full bg-gray-300 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#003f7f] transition-all duration-200"
            :style="{ width: progress + '%' }"
          />
        </div>
        <div class="flex justify-between text-xs">
          <span>{{ progress }}%</span>
          <button class="underline" @click="cancelUpload">Cancel</button>
        </div>
      </div>
    </section>

    <!-- 🕒 Pending Approval List -->
    <section class="px-5">
      <h2 class="font-semibold mb-3 text-sm text-[#003f7f]">Pending Approval</h2>
      <p v-if="!pending.length" class="text-gray-500 text-sm">
        No pending uploads.
      </p>
      <ul v-else class="space-y-3">
        <li
          v-for="item in pending"
          :key="item.id"
          class="bg-white rounded-xl shadow p-4 flex justify-between items-center"
        >
          <div>
            <h3 class="font-semibold text-sm">{{ item.title }}</h3>
            <p class="text-xs text-gray-500">
              📚 {{ item.course }} • 🗂 {{ item.type }} • 💾 {{ item.size }} KB
            </p>
          </div>
          <span class="px-2 py-0.5 text-[11px] rounded-full font-semibold text-white bg-yellow-500">
            Pending
          </span>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'   // <-- added computed

/* ── dummy course list ── */
const courseOpts = ['PHY102', 'GNS123', 'CHM104', 'BIO105']

/* ── form state ── */
const file   = ref(null)
const title  = ref('')
const course = ref('')
const type   = ref('')

const dragging   = ref(false)
const uploading  = ref(false)
const progress   = ref(0)
let   progressId = null

/* ── pending list ── */
const pending = ref([])

/* ── refs ── */
const fileInput = ref(null)

/* ── helpers ── */
function handleSelect (e) {
  const f = e.target.files[0]
  if (validateFile(f)) file.value = f
}
function handleDrop (e) {
  dragging.value = false
  const f = e.dataTransfer.files[0]
  if (validateFile(f)) file.value = f
}
function validateFile (f) {
  if (!f) return false
  if (f.size > 10 * 1024 * 1024) {
    alert('File too large (max 10 MB).')
    return false
  }
  if (!/(\.pdf|\.png|\.jpg|\.jpeg)$/i.test(f.name)) {
    alert('Unsupported format. Use PDF or image.')
    return false
  }
  return true
}

const canUpload = computed(() =>
  file.value && title.value && course.value && type.value && !uploading.value
)

/* ── upload simulation ── */
function startUpload () {
  uploading.value = true
  progress.value  = 0

  progressId = setInterval(() => {
    progress.value += 5
    if (progress.value >= 100) finishUpload()
  }, 200)
}
function cancelUpload () {
  clearInterval(progressId)
  uploading.value = false
  progress.value  = 0
}
function finishUpload () {
  clearInterval(progressId)
  uploading.value = false

  /* add to pending list */
  const id = pending.value.length + 1
  pending.value.unshift({
    id,
    title : title.value,
    course: course.value,
    type  : type.value,
    size  : Math.round(file.value.size / 1024),
    uploadedAt: Date.now()
  })

  /* reset form */
  title.value = course.value = type.value = ''
  file.value  = null
  if (fileInput.value) fileInput.value.value = ''
  progress.value = 0
  alert('Dummy upload complete ✔️ (now pending approval)')
}
</script>

<style scoped>
iframe { overscroll-behavior: contain; }
</style>
