<!-- src/views/PastQuestions.vue -->
<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-20">

    <!-- 🏷 Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold shadow-lg">
      📂 Past Question Repository
    </header>

    <!-- 🔍 Search + Filters -->
    <section class="p-4 space-y-4">
      <input
        v-model="search"
        type="text"
        placeholder="Search by title or course code…"
        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-[#003f7f]"
      />

      <div class="flex gap-3">
        <select
          v-model="selectedCourse"
          class="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-sm"
        >
          <option value="">All Courses</option>
          <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
        </select>

        <select
          v-model="selectedYear"
          class="w-32 px-3 py-2 rounded-lg border border-gray-300 text-sm"
        >
          <option value="">All Years</option>
          <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </section>

    <!-- ⏳ Loader (not used with dummy but kept for parity) -->
    <p v-if="loading" class="text-center text-[#003f7f] py-10 animate-pulse">
      Loading past questions…
    </p>

    <!-- 🚫 Empty -->
    <p
      v-else-if="!filtered.length"
      class="text-center text-gray-500 py-10"
    >
      No files match your filters.
    </p>

    <!-- 📑 List -->
    <ul v-else class="px-4 space-y-3 pb-24">
      <li
        v-for="doc in filtered"
        :key="doc.id"
        class="bg-white rounded-xl shadow p-4 flex items-center justify-between hover:shadow-md transition"
      >
        <div>
          <h3 class="font-semibold text-sm">{{ doc.title }}</h3>
          <p class="text-xs text-gray-500">
            📚 {{ doc.course }} • 📅 {{ doc.year }} • 💾 {{ doc.size }} KB
          </p>
        </div>
        <button
          class="text-sm text-[#003f7f] underline font-medium"
          @click="openPdf(doc.url)"
        >
          View
        </button>
      </li>
    </ul>

    <!-- 📖 PDF Viewer Modal -->
    <div
      v-if="showPdf"
      class="fixed inset-0 bg-black/70 flex flex-col z-50"
    >
      <header class="bg-[#003f7f] text-white py-3 px-4 flex justify-between items-center">
        <span class="font-semibold truncate">{{ currentTitle }}</span>
        <button @click="closePdf" class="text-white text-lg font-bold">&times;</button>
      </header>
      <iframe
        :src="currentUrl"
        class="flex-1 w-full"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

/* ── dummy data ── */
const dummyDocs = [
  {
    id: 1,
    title: 'PHY 102 – 2019 First Semester',
    course: 'PHY102',
    year: 2019,
    url: 'https://example.com/phy102_2019.pdf',
    size: 812
  },
  {
    id: 2,
    title: 'PHY 102 – 2020 Second Semester',
    course: 'PHY102',
    year: 2020,
    url: 'https://example.com/phy102_2020.pdf',
    size: 765
  },
  {
    id: 3,
    title: 'GNS 123 – 2021',
    course: 'GNS123',
    year: 2021,
    url: 'https://example.com/gns123_2021.pdf',
    size: 530
  },
  {
    id: 4,
    title: 'CHM 104 – 2018',
    course: 'CHM104',
    year: 2018,
    url: 'https://example.com/chm104_2018.pdf',
    size: 642
  }
]

/* ── reactive state ── */
const docs            = ref([])
const loading         = ref(true)

const search          = ref('')
const selectedCourse  = ref('')
const selectedYear    = ref('')

const showPdf         = ref(false)
const currentUrl      = ref('')
const currentTitle    = ref('')

/* ── load dummy data on mount ── */
onMounted(() => {
  docs.value = dummyDocs
  loading.value = false
})

/* ── options for selects ── */
const courseOptions = computed(() =>
  [...new Set(docs.value.map(d => d.course))].sort()
)
const yearOptions   = computed(() =>
  [...new Set(docs.value.map(d => d.year))].sort((a,b)=>b-a)
)

/* ── filtered list ── */
const filtered = computed(() =>
  docs.value.filter(d => {
    const s = search.value.toLowerCase()
    const matchSearch  = !s || d.title.toLowerCase().includes(s) || d.course.toLowerCase().includes(s)
    const matchCourse  = !selectedCourse.value || d.course === selectedCourse.value
    const matchYear    = !selectedYear.value   || d.year   === selectedYear.value
    return matchSearch && matchCourse && matchYear
  })
)

/* ── PDF modal helpers ── */
function openPdf (url) {
  currentUrl.value   = url
  currentTitle.value = docs.value.find(d => d.url === url)?.title || 'PDF'
  showPdf.value      = true
}
function closePdf () {
  showPdf.value = false
  currentUrl.value = ''
}
</script>

<style scoped>
iframe { overscroll-behavior: contain; }
</style>
