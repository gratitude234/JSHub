<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white text-center py-4 shadow">
      <h1 class="text-xl font-bold">📘 Course Materials</h1>
      <p class="text-xs opacity-80 mt-1">All your study resources in one place</p>
    </header>

    <!-- Loader -->
    <div v-if="loading" class="p-6 space-y-4 animate-pulse">
      <div v-for="n in 3" :key="n" class="h-20 bg-white rounded-xl shadow" />
    </div>

    <!-- Content -->
    <div v-else class="p-4 space-y-6">
      <!-- Summary Info -->
      <div class="bg-[#003f7f] text-white text-center py-2 rounded-xl shadow text-sm font-medium">
        Showing materials for
        <span class="font-bold">{{ level }}L {{ department }}</span>
      </div>

      <!-- No Materials -->
      <div v-if="!groupedMaterials.length" class="text-center text-gray-500 text-sm py-10">
        📭 No materials uploaded yet. Check back later.
      </div>

      <!-- Materials List -->
      <div
        v-for="course in groupedMaterials"
        :key="course.code"
        class="bg-white rounded-xl shadow-md"
      >
        <!-- Course Title -->
        <div
          @click="course.expanded = !course.expanded"
          class="flex justify-between items-center px-4 py-3 border-b cursor-pointer hover:bg-gray-50"
        >
          <div class="text-sm font-semibold">
            📚 {{ course.code }}
            <span
              v-if="course.title && course.title !== course.code"
              class="font-normal"
            >
              – {{ course.title }}
            </span>
          </div>
          <span :class="{ 'rotate-180': course.expanded }" class="transition-transform">⌄</span>
        </div>

        <!-- Materials -->
        <transition name="fade">
          <div v-if="course.expanded" class="p-4 space-y-3">
            <div
              v-for="mat in course.materials"
              :key="mat.id"
              class="bg-gray-50 rounded-lg p-3 space-y-2"
            >
              <!-- Material Info Row -->
              <div class="flex items-center gap-3">
                <!-- Thumbnail or Icon -->
                <div v-if="isImage(mat.file_path)">
                  <img
                    :src="`https://jabumarket.com.ng/${mat.file_path}`"
                    alt="Material Image"
                    class="w-14 h-14 object-cover rounded-lg shadow-sm"
                  />
                </div>
                <div v-else class="text-2xl">
                  {{ isPdf(mat.file_path) ? '📄' : '🗂️' }}
                </div>

                <!-- Title and Downloads -->
                <div class="flex-1">
                  <p class="font-medium text-sm">{{ mat.title }}</p>
                  <p class="text-xs text-gray-500">
                    📥 {{ mat.download_count || 0 }} downloads
                  </p>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="flex flex-wrap justify-end gap-2 text-xs">
                <button
                  @click="openPreview(mat)"
                  class="underline text-[#003f7f] hover:text-[#002a5c]"
                >
                  Preview
                </button>
                <button
                  @click="download(mat)"
                  class="bg-[#28a745] text-white px-3 py-1 rounded-full hover:bg-[#23913d]"
                >
                  Download
                </button>
                <button
                  @click="goToPractice(course.code, mat.title)"
                  class="bg-[#003f7f] text-white px-3 py-1 rounded-full hover:bg-[#002a5c]"
                >
                  Practice
                </button>
              </div>
            </div>

            <!-- Empty Course Notice -->
            <p
              v-if="!course.materials.length"
              class="text-xs text-center text-gray-400 italic"
            >
              🚫 No materials found for this course
            </p>
          </div>
        </transition>
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="showPreviewModal"
      class="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
    >
      <div
        class="bg-white w-full max-w-3xl max-h-[90vh] rounded-lg overflow-hidden flex flex-col"
      >
        <!-- Header -->
        <div
          class="bg-[#003f7f] text-white flex justify-between items-center p-3 text-sm font-semibold"
        >
          <span>📄 Preview</span>
          <button @click="showPreviewModal = false" class="text-white text-lg">
            &times;
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-3 bg-gray-100">
          <iframe
            v-if="previewType === 'pdf'"
            :src="previewUrl"
            type="application/pdf"
            class="w-full h-[75vh] rounded"
          ></iframe>

          <img
            v-else-if="previewType === 'image'"
            :src="previewUrl"
            alt="Preview Image"
            class="w-full h-auto max-h-[75vh] object-contain rounded"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

/* ------------------------------------------------------------------ */
/* 🌐 GLOBAL STATE                                                    */
/* ------------------------------------------------------------------ */
const groupedMaterials = ref([])
const loading          = ref(true)
const courseMap        = ref({})

/* Preview modal */
const showPreviewModal = ref(false)
const previewUrl       = ref('')
const previewType      = ref('') // 'pdf' | 'image'

/* ------------------------------------------------------------------ */
/* 📊 USER INFO from Pinia                                             */
/* ------------------------------------------------------------------ */
const department = computed(() => userStore.user?.department || '')
const level      = computed(() => userStore.user?.level      || '')

/* ------------------------------------------------------------------ */
/* 🚀 LIFECYCLE — sequential                                          */
/* ------------------------------------------------------------------ */
onMounted(async () => {
  try {
    await loadCourseMap()
    await fetchMaterials()
  } finally {
    loading.value = false
  }
})

/* ------------------------------------------------------------------ */
/* 📊 LOAD COURSE MAP                                                 */
/* ------------------------------------------------------------------ */
async function loadCourseMap () {
  try {
    const res  = await fetch('https://jabumarket.com.ng/api/get_course_map.php')
    const data = await res.json()

    const map = {}
    data.forEach(r => {
      const dep = (r.department || '').trim()
      if (!map[dep])          map[dep]        = {}
      if (!map[dep][r.level]) map[dep][r.level] = {}
      map[dep][r.level][r.course_code] = r.course_title
    })
    courseMap.value = map
  } catch (err) {
    console.error('❌ Failed to load course map:', err)
  }
}

/* ------------------------------------------------------------------ */
/* 📚 LOAD MATERIALS                                                  */
/* ------------------------------------------------------------------ */
async function fetchMaterials () {
  try {
    loading.value          = true
    groupedMaterials.value = []

    const res  = await fetch('https://jabumarket.com.ng/api/get_materials.php')
    const data = await res.json()

    const userCourses = Object.keys(
      courseMap.value[department.value]?.[level.value] || {}
    )

    const filtered = data.filter(
      m => userCourses.includes(m.course_code) && m.status === 'approved'
    )

    const byCourse = {}
    filtered.forEach(mat => {
      const key = (mat.course_code || 'OTH').toUpperCase()
      if (!byCourse[key]) {
        byCourse[key] = {
          code: key,
          title: mat.course_title || key,
          materials: []
        }
      }
      byCourse[key].materials.push(mat)
    })

    groupedMaterials.value = Object.values(byCourse).map((c, i) => ({
      ...c,
      expanded: i === 0
    }))
  } catch (err) {
    console.error('❌ Failed to fetch materials:', err)
  } finally {
    loading.value = false
  }
}

/* ------------------------------------------------------------------ */
/* 🛠 UTILS                                                           */
/* ------------------------------------------------------------------ */
const isPdf   = p => p?.toLowerCase().endsWith('.pdf')
const isImage = p => /\.(png|jpe?g|gif|webp)$/i.test(p || '')

async function download (mat) {
  window.open(`https://jabumarket.com.ng/api/download_material.php?id=${mat.id}`, '_blank')
  try {
    await fetch('https://jabumarket.com.ng/api/increment_download.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ material_id: mat.id })
    })
    mat.download_count = (mat.download_count || 0) + 1
  } catch (err) {
    console.error('❌ Download count update failed:', err)
  }
}

function openPreview (mat) {
  const url = `https://jabumarket.com.ng/${mat.file_path}`
  if (isPdf(mat.file_path)) {
    previewType.value      = 'pdf'
    previewUrl.value       = url
    showPreviewModal.value = true
  } else if (isImage(mat.file_path)) {
    previewType.value      = 'image'
    previewUrl.value       = url
    showPreviewModal.value = true
  } else {
    alert('Preview not supported for this file type yet.')
  }
}

function goToPractice (courseCode, topicTitle) {
  router.push({ path: '/practice-mode', query: { course: courseCode, topic: topicTitle } })
}

const normalizeDepartment = dep => dep?.trim() || ''
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: all .2s ease }
.fade-enter-from,
.fade-leave-to    { opacity: 0; transform: translateY(-6px) }
</style>
