<!-- File: src/views/PracticeMode.vue (FULL – 5-option support) -->
<template>
  <div class="relative min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- ▸ Guest Notice -->
    <div
      v-if="!user.id && !initialLoading"
      class="bg-yellow-100 text-yellow-800 text-center py-2">
      ⚠️ You’re practicing as a guest. Your XP and progress will not be saved.
    </div>

    <!-- ▸ Level-Up Modal -->
    <transition name="fade">
      <div
        v-if="showLevelUpModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 text-center space-y-4">
          <h2 class="text-2xl font-bold text-[#003f7f]">🎉 Level Up!</h2>
          <p class="text-lg">You've reached Level {{ gamificationLevel }}!</p>
          <button
            @click="showLevelUpModal = false"
            class="bg-[#003f7f] text-white px-4 py-2 rounded font-semibold">
            Awesome!
          </button>
        </div>
      </div>
    </transition>

    <!-- ▸ Summary Modal -->
    <transition name="fade">
      <div
        v-if="showSummaryModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-xl p-6 text-center space-y-4 max-w-sm mx-auto">
          <h2 class="text-2xl font-bold text-[#28a745]">🎉 You’re Done!</h2>
          <p class="text-lg">Score: {{ score }} / {{ questions.length }}</p>
          <p class="text-lg">XP Earned: {{ sessionXP }}</p>
          <button
            @click="showSummaryModal = false"
            class="bg-[#003f7f] text-white px-4 py-2 rounded font-semibold">
            Close
          </button>
        </div>
      </div>
    </transition>

    <!-- ▸ Initial Loading Overlay -->
    <div
      v-if="initialLoading"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <svg class="animate-spin h-12 w-12 text-white" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10"
                stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
      </svg>
    </div>

    <!-- ▸ Header -->
    <header
      class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      🛠️ Practice Mode
    </header>

    <!-- ▸ Gamification Summary -->
    <section class="p-4">
      <div
        v-if="!initialLoading"
        class="bg-white rounded-xl shadow p-4 text-center space-y-2 border-l-4 border-[#28a745]">
        <p class="text-sm font-semibold text-[#003f7f]">
          🎯 Level {{ gamificationLevel }}</p>
        <div class="relative group">
          <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              class="bg-[#28a745] h-2 transition-all duration-700"
              :style="{ width: xpProgress + '%' }"></div>
          </div>
          <div
            class="absolute left-1/2 -translate-x-1/2 mt-1 hidden text-xs text-gray-600 group-hover:block">
            {{ combinedXP }} XP / {{ nextXPThreshold }} XP
          </div>
        </div>
        <div class="flex justify-between text-xs text-gray-500">
          <span>{{ combinedXP }} XP</span>
          <span>🔥 Practice Streak: {{ streak }} day(s)</span>
        </div>
      </div>
    </section>

    <!-- ▸ Motivation -->
    <section class="p-4 pt-0">
      <div
        class="text-center text-[#003f7f] text-lg font-semibold italic animate-fadeInSlow">
        🔁 Repetition creates mastery
      </div>
    </section>

    <!-- ▸ Filters -->
    <section class="p-4">
      <div class="bg-white rounded-xl shadow p-4 space-y-4">
        <h2 class="text-lg font-semibold text-[#003f7f]">
          📚 Choose Practice Settings</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- course -->
          <select
            v-model="selectedCourse"
            class="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-[#003f7f]">
            <option disabled value="">🎓 Select Course</option>
            <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
          </select>

          <!-- topic -->
          <select
            v-model="selectedTopic"
            :disabled="!selectedCourse"
            class="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-[#003f7f] disabled:opacity-50">
            <option disabled value="">🧠 Select Topic</option>
            <option v-for="t in topicOptions" :key="t" :value="t">{{ t }}</option>
          </select>

          <!-- count -->
          <select
            v-model="selectedCount"
            :disabled="!selectedCourse"
            class="w-full border px-4 py-2 rounded focus:ring-2 focus:ring-[#003f7f] disabled:opacity-50">
            <option disabled value="">❓ Number of Questions</option>
            <option :value="5">5 Questions</option>
            <option :value="10">10 Questions</option>
            <option :value="20">20 Questions</option>
            <option :value="9999">All</option>
          </select>
        </div>

        <!-- timed switch -->
        <label class="inline-flex items-center mt-2">
          <input type="checkbox" v-model="timed" class="h-5 w-5 text-[#003f7f]" />
          <span class="ml-2 text-sm">⏲️ Timed Practice</span>
        </label>

        <!-- start btn -->
        <button
          @click="loadQuestions"
          :disabled="loadingQuestions"
          class="w-full bg-[#003f7f] text-white py-2 rounded font-semibold flex items-center justify-center gap-2">
          <span v-if="!loadingQuestions">🚀 Start Practice</span>
          <span v-else class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            Loading…
          </span>
        </button>
      </div>
    </section>

    <!-- ▸ Timed banner -->
    <div
      v-if="timed && questions.length"
      class="bg-[#fff3cd] text-[#856404] text-sm text-center py-2 mb-2 rounded">
      ⏲️ Time Elapsed: {{ formattedTime }}
    </div>

    <!-- ▸ Questions + Error -->
    <section class="px-4 mt-6">
      <!-- loading -->
      <div
        v-if="loadingQuestions && !errorLoadingQuestions"
        class="flex justify-center py-10">
        <svg class="animate-spin h-8 w-8 text-[#003f7f]" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10"
                  stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
      </div>

      <!-- error -->
      <div
        v-else-if="errorLoadingQuestions"
        class="text-center py-10 space-y-4">
        <p class="text-red-600 font-semibold">
          🚫 Taking too long to load questions.
        </p>
        <button
          @click="loadQuestions"
          class="bg-[#003f7f] text-white px-4 py-2 rounded font-semibold">
          🔄 Retry
        </button>
      </div>

      <!-- questions -->
      <div v-else-if="questions.length">
        <!-- top bar -->
        <div class="flex justify-between items-center mb-4">
          <span class="text-sm">
            Question {{ currentIndex + 1 }} / {{ questions.length }}
          </span>
          <button
            @click="restartQuiz"
            class="bg-[#003f7f] text-white px-3 py-1 rounded text-sm">
            🔄 Restart
          </button>
        </div>

        <!-- cards -->
        <div class="space-y-6">
          <div
            v-for="(q, i) in questions"
            :key="q.id"
            class="bg-white p-4 rounded-xl shadow space-y-3 relative">
            <!-- bookmark -->
            <button
              @click="toggleBookmark(i)"
              class="absolute top-2 right-2 text-xl"
              :class="q.bookmarked ? 'text-yellow-500' : 'text-gray-300'">
              ★
            </button>

            <!-- question text -->
            <div
              class="prose prose-sm max-w-none font-semibold text-[#003f7f]"
              v-html="sanitizeHTML(q.question_text)"></div>

            <!-- options -->
            <div class="space-y-2">
              <button
                v-for="(opt, key) in getOptions(q)"
                :key="key"
                :disabled="q.answered"
                @click="selectAnswer(q, key, i)"
                :class="[
                  'w-full text-left px-4 py-3 rounded-lg border transition hover:scale-[1.02]',
                  getOptionClass(q, key)
                ]">
                <span class="font-bold uppercase">{{ key }}.</span>
                {{ opt }}
              </button>
            </div>

            <!-- explanation -->
            <div
              v-if="q.answered"
              class="mt-3 bg-gray-50 border-l-4 border-[#003f7f] p-3 rounded">
              <p class="font-bold text-[#003f7f] mb-1">📖 Explanation:</p>
              <p class="text-sm">
                {{ q.question_explanation || 'No explanation.' }}
              </p>
            </div>

            <!-- flag controls -->
            <div v-if="q.answered" class="text-right mt-1">
              <!-- loading spinner -->
              <svg
                v-if="q.flagLoading"
                class="h-4 w-4 animate-spin text-red-600 inline-block mr-1"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10"
                        stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>

              <!-- flag btn -->
              <button
                v-if="!q.flagged && !q.flagLoading"
                @click="openFlagModal(i)"
                class="text-xs font-semibold text-red-600 underline hover:text-red-800">
                🚩 Flag
              </button>

              <!-- flagged label -->
              <span
                v-if="q.flagged && !q.flagLoading"
                class="text-xs text-gray-500">
                🚩 Flagged
              </span>
            </div>
          </div>

          <!-- summary card -->
          <div
            class="bg-white p-4 rounded-xl shadow text-center border-t-4 border-[#28a745]">
            <h2 class="text-[#28a745] text-xl font-bold mb-1">🎉 Great Job!</h2>
            <p class="text-sm mb-1">
              ✅ Score: <strong>{{ score }}</strong> /
              <strong>{{ questions.length }}</strong>
            </p>
            <p class="text-sm">
              🏅 XP Earned: <strong>{{ sessionXP }}</strong>
            </p>
          </div>
        </div>

        <!-- bookmarks -->
        <section
          v-if="bookmarkedQuestions.length"
          class="mt-6 p-4 bg-white rounded-xl shadow">
          <h3 class="text-[#003f7f] font-semibold mb-2">
            🔖 Bookmarked Questions</h3>
          <ul class="list-disc list-inside text-sm space-y-1">
            <li v-for="b in bookmarkedQuestions" :key="b.index">
              {{ b.index + 1 }}. {{ b.text }}
            </li>
          </ul>
        </section>
      </div>
    </section>

    <!-- ▸ Scroll-to-top -->
    <button
      class="fixed bottom-24 right-4 bg-[#003f7f] text-white rounded-full p-3 shadow-lg hover:bg-[#002a5c]"
      @click="scrollToTop">
      ⬆️
    </button>

    <!-- ▸ Full Image Modal -->
    <transition name="fade">
      <div
        v-if="showImageModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        @click.self="showImageModal = false">
        <img
          :src="modalImageUrl"
          alt="Full view"
          class="max-h-[90vh] max-w-[95vw] rounded-lg shadow-xl" />
        <button
          @click="showImageModal = false"
          class="absolute top-4 right-4 text-white text-3xl font-bold">
          &times;
        </button>
      </div>
    </transition>

    <!-- ▸ Flag Modal -->
    <transition name="fade">
      <div
        v-if="showFlagModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="closeFlagModal">
        <div class="w-full max-w-sm space-y-4 rounded-xl bg-white p-6">
          <h3 class="flex items-center gap-1 text-lg font-bold text-red-600">
            🚩 Flag This Question?
          </h3>
          <p class="text-sm text-gray-700">
            Only flag if the question, options, answer key, or explanation is
            clearly wrong or confusing.
          </p>
          <textarea
            v-model="flagReason"
            rows="3"
            placeholder="Optional: tell us why…"
            class="w-full rounded border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600"></textarea>
          <div class="flex justify-end gap-2">
            <button
              @click="closeFlagModal"
              class="rounded bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300">
              Cancel
            </button>
            <button
              @click="confirmFlag"
              class="rounded bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-700">
              Flag Now
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
/* eslint-disable no-console */
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  nextTick
} from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getGamificationProgress } from '@/utils/gamification'
import confetti from 'canvas-confetti'
import DOMPurify from 'dompurify'

/* ─── Stores ──────────────────────────────────────────────── */
const userStore = useUserStore()
const user = computed(() => userStore.user || {})

/* ─── XP / Level Computations ─────────────────────────────── */
const totalXP    = computed(() => user.value.xp ?? 0)
const sessionXP  = ref(0)
const combinedXP = computed(() => totalXP.value + sessionXP.value)

const progressData      = computed(() => getGamificationProgress(combinedXP.value))
const gamificationLevel = computed(() => progressData.value.level)
const nextXPThreshold   = computed(() => progressData.value.threshold)
const xpProgress        = computed(() => progressData.value.percent)
const streak            = computed(() => user.value.streak ?? 0)

/* ─── Static UI State ─────────────────────────────────────── */
const dynamicCourseMap      = ref({})
const courseOptions         = ref([])
const topicOptions          = ref([])
const initialLoading        = ref(true)
const loadingQuestions      = ref(false)
const errorLoadingQuestions = ref(false)
let   loadTimeoutId         = null

/* ─── Practice Filters ────────────────────────────────────── */
const route          = useRoute()
const selectedCourse = ref('')
const selectedTopic  = ref('')
const selectedCount  = ref('')
const timed          = ref(false)

/* ─── Runtime Refs ────────────────────────────────────────── */
const questions        = ref([])
const score            = ref(0)
const currentIndex     = ref(0)
const showSummaryModal = ref(false)
const showLevelUpModal = ref(false)

/* ─── Bookmarks ───────────────────────────────────────────── */
const bookmarks = ref([])
const bookmarkedQuestions = computed(() =>
  bookmarks.value.map(b => ({
    index: b.index,
    text : questions.value[b.index]?.question_text
  }))
)

/* ─── Timer (timed mode) ──────────────────────────────────── */
let timerInterval = null
const elapsed = ref(0)
const formattedTime = computed(() => {
  const m = String(Math.floor(elapsed.value / 60)).padStart(2, '0')
  const s = String(elapsed.value % 60).padStart(2, '0')
  return `${m}:${s}`
})
function startTimer () { timerInterval = setInterval(() => ++elapsed.value, 1000) }
function clearTimer () { clearInterval(timerInterval); elapsed.value = 0 }

/* ─── Image Modal ─────────────────────────────────────────── */
const showImageModal = ref(false)
const modalImageUrl  = ref('')
function handleImageClick (e) {
  const img = e.target
  if (img.tagName === 'IMG' && img.closest('.prose')) {
    e.preventDefault()
    modalImageUrl.value = img.src
    showImageModal.value = true
  }
}

/* ─── Flag Modal State ────────────────────────────────────── */
const showFlagModal = ref(false)
const flagReason    = ref('')
const flagIdx       = ref(null)

/* ─── Sanitize Helper ─────────────────────────────────────── */
function sanitizeHTML (html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS : [
      'b','br','strong','em','i','u','p','span','ul','ol','li','sup','sub','img',
      'table','thead','tbody','tr','th','td'
    ],
    ALLOWED_ATTR : ['src','alt','style','colspan','rowspan']
  })
}

/* ─── LOADERS ─────────────────────────────────────────────── */
async function loadCourseMap () {
  try {
    const res  = await fetch('/api/get_course_map.php')
    const data = await res.json()
    const map  = {}
    data.forEach(r => {
      const d = (r.department || '').trim()
      map[d] ??= {}
      map[d][r.level] ??= {}
      map[d][r.level][r.course_code] = r.course_title
    })
    dynamicCourseMap.value = map
  } catch (e) { console.error('Error loading course map:', e) }
}

async function loadCourses () {
  try {
    let api = '/api/get_courses.php'
    if (user.value.id) api += `?user_id=${user.value.id}`

    const res  = await fetch(api)
    const json = await res.json() // { courses: [...] }

    const codesWithTitle = json.courses.filter(code => {
      for (const lvlMap of Object.values(dynamicCourseMap.value)) {
        for (const courseMap of Object.values(lvlMap)) {
          if (courseMap[code]) return true
        }
      }
      return false
    })
    courseOptions.value = codesWithTitle.sort()
  } catch (e) {
    console.error('Error loading active courses:', e)
    courseOptions.value = []
  }
}

async function loadGamificationStats () {
  if (!user.value.id) return
  try {
    const res  = await fetch(`/api/get_user_progress.php?user_id=${user.value.id}`)
    const json = await res.json()
    userStore.setUser({
      ...user.value,
      xp                : json.xp,
      gamification_level: json.gamification_level,
      streak            : json.streak
    })
  } catch (e) { console.error('Error loading gamification stats:', e) }
}

/* ─── Mounted ─────────────────────────────────────────────── */
onMounted(async () => {
  try {
    bookmarks.value = JSON.parse(localStorage.getItem('bookmarks') || '[]')
  } catch {}

  await loadCourseMap()
  await loadCourses()
  await loadGamificationStats()
  applyURLPrefill()

  document.body.addEventListener('click', handleImageClick, true)
  initialLoading.value = false
})

onBeforeUnmount(() => {
  clearTimer()
  clearTimeout(loadTimeoutId)
  document.body.removeEventListener('click', handleImageClick, true)
})

/* ─── Watch Topic ─────────────────────────────────────────── */
watch(selectedCourse, async c => {
  selectedTopic.value = ''
  topicOptions.value  = []
  if (!c) return
  try {
    const res = await fetch(
      `/api/get_topics.php?course_code=${encodeURIComponent(c)}`
    )
    topicOptions.value = await res.json()
  } catch (e) { console.error('Error loading topics:', e) }
})

/* ─── URL Prefill ─────────────────────────────────────────── */
function applyURLPrefill () {
  const { course: preC, topic: preT } = route.query
  if (preC && courseOptions.value.includes(preC)) selectedCourse.value = preC
  if (preT) {
    fetch(`/api/get_topics.php?course_code=${encodeURIComponent(preC)}`)
      .then(r => r.json())
      .then(arr => {
        topicOptions.value = arr
        if (arr.includes(preT)) selectedTopic.value = preT
      })
      .catch(() => {})
  }
}

/* ─── PRACTICE LOGIC ─────────────────────────────────────── */
async function loadQuestions () {
  if (!selectedCourse.value || !selectedTopic.value || !selectedCount.value) {
    return alert('Please fill all fields')
  }

  loadingQuestions.value = true
  errorLoadingQuestions.value = false
  clearTimeout(loadTimeoutId)
  clearTimer()

  loadTimeoutId = setTimeout(() => {
    if (loadingQuestions.value) {
      errorLoadingQuestions.value = true
      loadingQuestions.value = false
    }
  }, 10000)

  try {
    const uid = user.value.id ?? 'guest'
    const url =
      `/api/get_practice_questions.php?user_id=${uid}` +
      `&course_code=${encodeURIComponent(selectedCourse.value)}` +
      `&topic=${encodeURIComponent(selectedTopic.value)}` +
      `&limit=${selectedCount.value}`

    const res  = await fetch(url)
    const data = await res.json()

    questions.value = data.map(q => ({
      ...q,
      answered   : false,
      bookmarked : false,
      flagged    : false,
      flagLoading: false
    }))
    score.value = sessionXP.value = currentIndex.value = 0
    if (timed.value) startTimer()

    // log attempt
    await fetch('/api/log_practice_attempt.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        user_id      : uid,
        course_code  : selectedCourse.value,
        topic        : selectedTopic.value,
        num_questions: selectedCount.value,
        timed        : timed.value ? 1 : 0
      })
    })
  } catch (err) {
    console.error('Failed to load questions or log session:', err)
    errorLoadingQuestions.value = true
  } finally {
    clearTimeout(loadTimeoutId)
    loadingQuestions.value = false
  }
}

/* ─── Helpers ─────────────────────────────────────────────── */
function getOptions (q) {
  return {
    a: q.option_a,
    b: q.option_b,
    c: q.option_c,
    d: q.option_d,
    e: q.option_e   // ← NEW (5th option)
  }
}
function getOptionClass (q, k) {
  if (!q.answered) return 'bg-white border-gray-300 hover:bg-gray-100'
  if (k === q.correct_option)
    return 'bg-green-100 border-green-500 text-green-700 font-semibold'
  if (k === q.selectedOption)
    return 'bg-red-100 border-red-500 text-red-700'
  return 'bg-white border-gray-300'
}

/* ─── Answer Handler ─────────────────────────────────────── */
async function selectAnswer (q, k, i) {
  if (q.answered) return
  q.answered = true
  q.selectedOption = k

  try {
    const uid  = user.value.id ?? 'guest'
    const res  = await fetch('/api/submit_practice_answer.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        user_id        : uid,
        question_id    : q.id,
        selected_option: k
      })
    })
    const json = await res.json()

    if (json.correct) score.value++
    if (user.value.id) sessionXP.value += json.xp_gain || 0

    if (user.value.id) {
      const oldLevel = user.value.gamification_level ?? 1
      userStore.setUser({
        ...user.value,
        xp                : json.new_xp,
        streak            : json.new_streak,
        gamification_level: json.new_gamification_level
      })
      if (json.new_gamification_level > oldLevel) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } })
        showLevelUpModal.value = true
      }
    }
  } catch (err) { console.error('Error submitting answer:', err) }

  await nextTick()
  currentIndex.value = i + 1
  if (questions.value.every(x => x.answered)) {
    clearTimer()
    showSummaryModal.value = true
  }
}

/* ─── FLAG WORKFLOW ───────────────────────────────────────── */
function openFlagModal (idx) {
  const q = questions.value[idx]
  if (q.flagged || q.flagLoading) return
  flagIdx.value   = idx
  flagReason.value = ''
  showFlagModal.value = true
}
function closeFlagModal () {
  showFlagModal.value = false
  flagIdx.value       = null
  flagReason.value    = ''
}
async function confirmFlag () {
  if (flagIdx.value === null) { closeFlagModal(); return }
  const idx = flagIdx.value
  const q   = questions.value[idx]

  q.flagLoading = true
  showFlagModal.value = false

  try {
    await fetch('/api/flag_practice_question.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        user_id    : user.value?.id,
        question_id: q.id,
        reason     : flagReason.value.trim()
      })
    })
    q.flagged = true
  } catch (e) { console.error('Error flagging question:', e) }
  finally {
    q.flagLoading = false
    flagIdx.value = null
    flagReason.value = ''
  }
}

/* ─── Misc Helpers ───────────────────────────────────────── */
function restartQuiz () {
  clearTimer()
  questions.value = []
  score.value = sessionXP.value = currentIndex.value = 0
  showSummaryModal.value = false
}
function toggleBookmark (i) {
  questions.value[i].bookmarked = !questions.value[i].bookmarked
  if (questions.value[i].bookmarked) bookmarks.value.push({ index: i })
  else bookmarks.value = bookmarks.value.filter(b => b.index !== i)
  localStorage.setItem('bookmarks', JSON.stringify(bookmarks.value))
}
function scrollToTop () {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped lang="postcss">
@keyframes fadeIn       { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }
@keyframes fadeInSlow   { from { opacity: 0; transform: translateY(15px) } to { opacity: 1; transform: translateY(0) } }
.animate-fadeIn         { animation: fadeIn 0.5s ease; }
.animate-fadeInSlow     { animation: fadeInSlow 1.5s ease; }
.fade-enter-active,
.fade-leave-active       { @apply transition-opacity duration-300; }
.fade-enter-from,
.fade-leave-to           { @apply opacity-0; }

/* images in prose */
img               { @apply mx-auto my-4 block h-auto max-w-full cursor-pointer; }
.prose :where(img){ @apply mx-auto; }
</style>
