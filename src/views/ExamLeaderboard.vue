<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">

    <!-- ░░ Header ░░ -->
    <header
      class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md flex items-center justify-center gap-2">
      🏆 Exam Leaderboard
      <button @click="refresh" class="text-xs bg-white/10 px-2 py-1 rounded hover:bg-white/20">
        🔄
      </button>
    </header>

    <!-- ░░ Offline Banner ░░ -->
    <div
      v-if="!isOnline"
      class="bg-red-50 text-red-700 text-sm text-center py-2 sticky top-0 z-50">
      ⚠️ You’re offline – cached resources only.
    </div>

    <!-- ░░ Filter + Search ░░ -->
    <div class="bg-white shadow rounded-xl mx-4 mt-4 p-4 space-y-4">
      <!-- Course dropdown -->
      <div>
        <label class="block text-sm font-semibold text-[#003f7f] mb-1">View leaderboard</label>
        <select
          v-model="selectedCourse"
          @change="fetchLeaderboard"
          class="w-full border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#003f7f]">
          <option value="">Overall (All Courses)</option>
          <option v-for="c in courseList" :key="c" :value="c">{{ c }}</option>
        </select>
      </div>

      <!-- Name search -->
      <div>
        <input
          v-model="search"
          placeholder="Search student name…"
          class="w-full border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f7f]" />
      </div>
    </div>

    <!-- ░░ Loading ░░ -->
    <div v-if="loading" class="text-center mt-10">
      <div class="animate-spin h-10 w-10 border-4 border-t-transparent border-[#003f7f] rounded-full mx-auto"></div>
      <p class="mt-2 text-[#003f7f]">Loading leaderboard…</p>
    </div>

    <!-- ░░ Leaderboard Table ░░ -->
    <div v-if="!loading && displayRows.length" class="mt-6 mx-4">
      <!-- sticky titles -->
      <div
        class="hidden sm:grid grid-cols-[2.5rem_1fr_auto] text-xs font-semibold text-gray-500 uppercase sticky top-[64px] bg-[#F7F9FC] py-1">
        <span>#</span><span>Name / Dept.</span><span class="text-right">Score</span>
      </div>

      <div
        v-for="(entry, idx) in displayRows"
        :key="entry.user_id"
        :class="[
          'bg-white p-4 rounded-xl shadow-sm flex justify-between items-center mb-3',
          entry.user_id === userId ? 'ring-2 ring-[#28a745]/60' : '',
        ]">

        <!-- Rank & medal -->
        <div class="flex items-center gap-4">
          <div
            class="text-lg font-bold"
            :class="idx === 0 ? 'text-amber-500'
                   : idx === 1 ? 'text-gray-400'
                   : idx === 2 ? 'text-yellow-700'
                   : 'text-[#003f7f]'">
            {{ medal(idx) }}
          </div>
          <div>
            <p class="font-semibold flex items-center gap-1">
              {{ entry.full_name }}
              <span v-if="entry.user_id === userId" class="text-[#28a745] text-xs font-bold">• you</span>
            </p>
            <p class="text-xs text-gray-500">
              {{ entry.department }} • {{ entry.academic_level }}
            </p>
          </div>
        </div>

        <!-- Right-side metrics -->
        <div class="text-right text-sm leading-tight">
          <template v-if="isOverall">
            <p><strong>{{ entry.total_score }}</strong> pts</p>
            <p class="text-gray-500 text-xs">
              {{ entry.exams_attempted }} exams • {{ formatTime(entry.total_time) }}
            </p>
          </template>
          <template v-else>
            <p><strong>{{ entry.score }}</strong>/60</p>
            <p class="text-gray-500 text-xs">
              {{ formatTime(entry.time_taken) }} • {{ formatDate(entry.created_at) }}
            </p>
          </template>
        </div>
      </div>

      <!-- Load more -->
      <button
        v-if="displayRows.length < filteredRows.length"
        @click="showCount += 20"
        class="mx-auto mt-4 block text-sm text-[#003f7f] underline">
        Show more
      </button>
    </div>

    <!-- ░░ Empty ░░ -->
    <div
      v-if="!loading && !displayRows.length"
      class="text-center text-gray-500 mt-10">
      😔 No data yet for
      <strong>{{ isOverall ? 'overall rankings' : selectedCourse }}</strong>.
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'   // pinia user store

/* ── user id for highlighting ─ */
const { user } = useUserStore()
const userId = computed(() => user?.id)

/* ── Connection state ─── */
const isOnline = ref(navigator.onLine)
window.addEventListener('online',  () => (isOnline.value = true))
window.addEventListener('offline', () => (isOnline.value = false))

/* ── Data state ─── */
const courseList     = ref([])
const selectedCourse = ref('')       // '' = overall
const leaderboard    = ref([])
const loading        = ref(false)
const search         = ref('')
const showCount      = ref(20)

/* ── Derived ─── */
const isOverall = computed(() => selectedCourse.value === '')

const filteredRows = computed(() =>
  leaderboard.value.filter(row =>
    row.full_name.toLowerCase().includes(search.value.toLowerCase())
  )
)

const displayRows = computed(() => filteredRows.value.slice(0, showCount.value))

/* ── Lifecycle ─── */
onMounted(async () => {
  await Promise.all([fetchCourses(), fetchLeaderboard()])
})

/* ── Fetch courses ─ */
async function fetchCourses () {
  try {
    const res = await fetch('/api/fetch_exam_courses.php')
    courseList.value = await res.json()
  } catch (e) {
    console.error('Course fetch error:', e)
  }
}

/* ── Fetch leaderboard (overall or per-course) ─ */
async function fetchLeaderboard () {
  loading.value  = true
  leaderboard.value = []
  showCount.value = 20

  const url = isOverall.value
    ? '/api/get_overall_exam_leaderboard.php'
    : `/api/get_exam_leaderboard.php?course_code=${encodeURIComponent(selectedCourse.value)}`

  try {
    const res  = await fetch(url)
    const data = await res.json()

    if (!Array.isArray(data)) throw data
    leaderboard.value = data
  } catch (e) {
    console.error('Leaderboard fetch error:', e)
    leaderboard.value = []
  } finally {
    loading.value = false
  }
}

/* ── Helpers ─ */
function formatTime(sec = 0) {
  const m = Math.floor(sec / 60).toString()
  const s = (sec % 60).toString().padStart(2, '0')
  return `${m}m ${s}s`
}
function formatDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString()
}
function medal(idx) {
  return idx === 0 ? '🥇'
       : idx === 1 ? '🥈'
       : idx === 2 ? '🥉'
       : idx + 1
}
function refresh() {
  fetchLeaderboard()
}
</script>

<style scoped>
/* subtle hover for list rows on larger screens */
@media (hover:hover) {
  div[class*='shadow-sm']:hover { box-shadow: 0 4px 12px rgb(0 0 0 / .06); }
}
</style>
