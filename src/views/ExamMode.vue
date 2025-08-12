<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- ░░ Header ░░ -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md space-y-1">
      <div>📚 Exam Mode</div>
      <p class="text-xs font-normal text-gray-200">Focus. Breathe. Ace it. ✨</p>
    </header>

    <!-- ░░ Yellow notice ░░ -->
    <div
      class="bg-yellow-50 border border-yellow-300 text-yellow-800 rounded-xl px-4 py-3 mx-4 my-3 flex items-center gap-3 shadow-sm"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none"
           viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
      </svg>
      <p class="text-sm font-medium">
        📢 <span class="font-semibold">Note:</span> These exam questions are based on real past questions.
      </p>
    </div>

    <!-- ░░ Exam Progress banner ░░ -->
    <div
      class="flex flex-col md:flex-row items-center justify-between gap-3 bg-white rounded-xl shadow-md border p-4 mx-4 mb-4"
    >
      <div>
        <p class="font-semibold text-[#003f7f] flex items-center gap-2">
          📝 <span>Exam Progress</span>
        </p>
        <p class="text-sm text-gray-700">
          <span v-if="userExamCount !== null">
            You’ve attempted <span class="font-bold">{{ userExamCount }}</span>
            out of <span class="font-bold">{{ totalExamCourses }}</span> exam courses.
          </span>
          <span v-else>Loading your progress…</span>
        </p>
        <p v-if="remainingCourses !== null" class="text-xs text-gray-500">
          Courses remaining: <span class="font-medium">{{ remainingCourses }}</span>
        </p>
        <p v-if="userBestScore !== null" class="text-xs text-gray-500">
          Best score so far: <span class="font-medium">{{ userBestScore }}</span> / 60
        </p>
      </div>

      <button
        @click="goToGlobalLeaderboard"
        class="bg-[#003f7f] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#002a5c] transition"
      >
        🏆 View Exam Leaderboard
      </button>
    </div>

    <!-- ░░ Loading Spinner ░░ -->
    <div v-if="loadingQuestions" class="p-4 text-center">
      <div class="animate-spin h-10 w-10 border-4 border-t-transparent border-[#003f7f] rounded-full mx-auto"></div>
      <p class="mt-2 text-[#003f7f]">Loading exam questions…</p>
    </div>

    <!-- ░░ Main Interface ░░ -->
    <div v-else class="p-4 space-y-6">
      <!-- ░░ Timer bar ░░ -->
      <template v-if="examStarted && !submitted">
        <div class="h-2 bg-gray-300 rounded-full overflow-hidden">
          <div class="bg-red-500 h-full transition-all duration-500" :style="{ width: timerProgress + '%' }"></div>
        </div>
        <div class="text-center text-lg text-red-600 font-bold mt-2">
          ⏱ Time Left: {{ formattedTime }}
        </div>
        <p class="text-center text-xs text-gray-500 mt-1">
          ⏳ You have 25 minutes to complete this exam.
        </p>
        <div class="text-right">
          <button @click="handleManualSave" class="text-sm text-gray-600 underline">Save Progress</button>
        </div>
      </template>

      <!-- ░░ Selection screen ░░ -->
      <div
        v-if="!examStarted && !questions.length"
        class="bg-white p-6 rounded-xl shadow-md space-y-4 animate-fadeIn"
      >
        <h2 class="text-lg font-semibold text-[#003f7f] flex items-center gap-2">
          📝 <span>Select Exam Course</span>
        </h2>

        <select
          v-model="selectedCourse"
          class="w-full border rounded-full px-4 py-2 focus:ring-2 focus:ring-[#003f7f]"
        >
          <option disabled value="">Select Course</option>
          <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
        </select>

        <button
          @click="loadQuestions"
          :class="[
            'w-full text-white py-2 rounded-full font-semibold',
            selectedCourse
              ? 'bg-[#003f7f] hover:bg-[#002a5c] animate-pulse'
              : 'bg-gray-400 cursor-not-allowed'
          ]"
          :disabled="!selectedCourse"
        >
          🎯 Begin 60-Question Exam
        </button>
      </div>

      <!-- ░░ Question list ░░ -->
      <div v-if="questions.length" class="space-y-8">
        <div
          v-for="(q, i) in questions"
          :key="q.id"
          :id="'question-' + i"
          class="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all"
        >
          <div class="text-sm text-gray-500 mb-2">
            Question {{ i + 1 }} of {{ questions.length }}
          </div>
          <h3 class="font-semibold mb-3">
            Q{{ i + 1 }}. {{ q.question_text }}
          </h3>

          <div class="space-y-2">
            <button
              v-for="(opt, key) in getOptions(q)"
              :key="key"
              :disabled="q.answered || submitted"
              @click="selectAnswer(q, key)"
              :class="[
                'w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 hover:ring-2 hover:ring-[#003f7f]',
                getOptionClass(q, key)
              ]"
            >
              <span class="font-bold uppercase">{{ key }}.</span> {{ opt }}
            </button>
          </div>

          <!-- ░░ Explanation (review mode) ░░ -->
          <div
            v-if="submitted && showCorrections && q.question_explanation"
            class="mt-3 p-4 bg-[#F0F6FD] border-l-4 border-[#003f7f] text-sm text-[#003f7f] rounded-lg"
          >
            <div class="font-semibold mb-1 flex items-center gap-1 text-[#003f7f]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                   viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13 16h-1v-4h-1m0-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
              Why this is the correct answer:
            </div>
            <p class="leading-relaxed">{{ q.question_explanation }}</p>
          </div>
        </div>

        <!-- ░░ Submit button ░░ -->
        <div v-if="!submitted" class="text-center">
          <button
            @click="attemptSubmit"
            class="bg-[#003f7f] text-white py-3 px-8 rounded-full font-bold hover:bg-[#002a5c] transition-all duration-300 mt-6"
          >
            Submit Exam
          </button>
        </div>
      </div>
    </div>

    <!-- ░░ Summary modal ░░ -->
    <transition name="fade">
      <div
        v-if="showSummary"
        @click="handleBackdropClick"
        class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 summary-backdrop"
      >
        <div
          @click.stop
          class="bg-white p-6 rounded-xl shadow-lg max-w-md w-full space-y-4"
        >
          <h2 class="text-2xl font-semibold text-gray-800 text-center">
            {{ score >= passMark ? '🎉 Outstanding Job!' : '🏁 Exam Complete' }}
          </h2>
          <div class="flex justify-between text-gray-700">
            <div>
              <p class="text-sm">Score</p>
              <p class="text-lg font-medium">{{ score }} / {{ questions.length }}</p>
            </div>
            <div>
              <p class="text-sm">Accuracy</p>
              <p class="text-lg font-medium">{{ percentage }}%</p>
            </div>
            <div>
              <p class="text-sm">Time</p>
              <p class="text-lg font-medium">{{ timeTaken }}</p>
            </div>
          </div>
          <p class="text-gray-600 text-center">{{ feedbackMessage }}</p>

          <button
            @click="() => { showSummary = false; showCorrections = true }"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold"
          >
            🔍 Review Your Answers
          </button>
          <button
            @click="goToLeaderboard"
            class="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-2 rounded-lg border border-yellow-300 font-medium"
          >
            🏆 See Where You Rank on the Leaderboard
          </button>
          <button
            @click="goToPractice"
            class="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg border border-gray-300 font-medium"
          >
            📘 Practice More Questions
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

/* ── User store ─────────────────────────────────────────────── */
const userStore = useUserStore()
const { user }  = storeToRefs(userStore)
const userId    = computed(() => user.value?.id ?? null)
const userDept  = computed(() => (user.value?.department || '').trim())
const userLevel = computed(() => user.value?.academic_level ?? user.value?.level)

/* ── New progress stats ─────────────────────────────────────── */
const userExamCount     = ref(null)
const userBestScore     = ref(null)
const attemptedCourses  = ref([])

/* ── Dynamic course map ─────────────────────────────────────── */
const dynamicCourseMap = ref({})
async function loadDynamicCourseMap() {
  const res  = await fetch('/api/get_course_map.php')
  const data = await res.json()
  const map  = {}
  data.forEach(r => {
    const d = r.department.trim()
    map[d] ??= {}
    map[d][r.level] ??= {}
    map[d][r.level][r.course_code] = r.course_title
  })
  dynamicCourseMap.value = map
}

/* ── Exam state ─────────────────────────────────────────────── */
const courseOptions           = ref([])
const selectedCourse          = ref('')
const questions               = ref([])
const score                   = ref(0)
const submitted               = ref(false)
const examStarted             = ref(false)
const showSummary             = ref(false)
const loadingQuestions        = ref(false)
const passMark                = ref(0)
const timer                   = ref(0)
const totalTime               = ref(0)
let   timerId                 = null
const showCorrections         = ref(false)
const visibilityCount         = ref(0)
let   autoSaveInterval        = null

/* ── Computed helpers ───────────────────────────────────────── */
const formattedTime = computed(() => {
  const m = String(Math.floor(timer.value / 60)).padStart(2, '0')
  const s = String(timer.value % 60).padStart(2, '0')
  return `${m}:${s}`
})
const timerProgress = computed(() =>
  totalTime.value ? (timer.value / totalTime.value) * 100 : 0
)
const timeTaken = computed(() => {
  const used = totalTime.value - timer.value
  const m = String(Math.floor(used / 60)).padStart(2, '0')
  const s = String(used % 60).padStart(2, '0')
  return `${m}:${s}`
})
const questionsCount = 60
const percentage = computed(() =>
  questions.value.length
    ? ((score.value / questions.value.length) * 100).toFixed(1)
    : 0
)
const feedbackMessage = computed(() => {
  const pct = Number(percentage.value)
  if (pct >= 90) return 'Excellent work! You clearly understand this material.'
  if (pct >= 70) return 'Good job! A quick review could get you even higher.'
  if (pct >= 50) return 'Not bad — let’s solidify these concepts with a review.'
  return 'Keep going! Reviewing your mistakes is the fastest way to improve.'
})

/* ── Progress derived values ───────────────────────────────── */
 // all courses = attempted + still-available
 const totalExamCourses = computed(() =>
   (attemptedCourses.value?.length || 0) + courseOptions.value.length
)

 // remaining is simply what’s still in the dropdown
 const remainingCourses = computed(() => courseOptions.value.length)

/* ── Lifecycle ─────────────────────────────────────────────── */
onMounted(async () => {
  await loadCourses()
  await loadUserExamStats()
  startAutoSave()
  window.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('keydown', handleKeyPress)
  window.addEventListener('beforeunload', warnExit)
})

onUnmounted(() => {
  clearInterval(timerId)
  clearInterval(autoSaveInterval)
  window.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('keydown', handleKeyPress)
  window.removeEventListener('beforeunload', warnExit)
})

/* ── Load user stats ───────────────────────────────────────── */
async function loadUserExamStats() {
  if (!userId.value) return
  try {
    const res  = await fetch(`/api/get_exam_progress.php?user_id=${userId.value}`)
    const data = await res.json()
    if (data.status === 'success') {
      userExamCount.value    = data.attempted
      userBestScore.value    = data.best_score
      attemptedCourses.value = data.courses_attempted
    }
  } catch (err) {
    console.error('Error loading exam stats:', err)
  }
}

/* ── Load courses ──────────────────────────────────────────── */
async function loadCourses() {
  if (!userId.value) return
  await loadDynamicCourseMap()
  const deptMap = dynamicCourseMap.value[userDept.value] || {}
  const mapped  = Object.keys(deptMap[userLevel.value] || {})
  try {
    const res   = await fetch(`/api/get_valid_exam_courses.php?user_id=${userId.value}`)
    const valid = await res.json()
    courseOptions.value = mapped.filter(c => valid.includes(c)).sort()
  } catch {
    courseOptions.value = mapped.sort()
  }
}

/* ── Already-taken check ───────────────────────────────────── */
async function checkIfAlreadyTaken() {
  if (!userId.value || !selectedCourse.value) return false
  try {
    const res  = await fetch(`/api/has_taken_exam.php?user_id=${userId.value}&course_code=${selectedCourse.value}`)
    const data = await res.json()
    return data.taken === true
  } catch {
    return false
  }
}

/* ── Timer helper ──────────────────────────────────────────── */
function startTimer() {
  clearInterval(timerId)
  timerId = setInterval(() => {
    if (timer.value > 0) timer.value--
    else {
      clearInterval(timerId)
      setTimeout(submitExam, 2000)
    }
  }, 1000)
}

/* ── Option helpers ───────────────────────────────────────── */
const getOptions = q => ({ a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d })
function getOptionClass(q, k) {
  if (!q.answered) return 'bg-white border-gray-300 hover:bg-gray-100'
  if (submitted.value && showCorrections.value) {
    if (k === q.correct_option) return 'bg-green-100 border-green-500 text-green-700 font-semibold'
    if (k === q.selectedOption) return 'bg-red-100 border-red-500 text-red-700'
  }
  return k === q.selectedOption
    ? 'bg-blue-100 border-blue-300 text-blue-700 font-semibold'
    : 'bg-white border-gray-300'
}

/* ── Load exam questions ───────────────────────────────────── */
async function loadQuestions() {
  if (!selectedCourse.value) {
    alert('Fill all fields')
    return
  }

  loadingQuestions.value = true
  const limit = questionsCount

  const alreadyTaken = await checkIfAlreadyTaken()
  if (alreadyTaken) {
    alert('❌ You’ve already taken the exam for this course. You cannot retake it.')
    loadingQuestions.value = false
    return
  }

  try {
    const url  = `/api/get_exam_questions.php?user_id=${userId.value}&course_code=${selectedCourse.value}&limit=${limit}`
    const data = await (await fetch(url)).json()
    questions.value   = data.map(q => ({ ...q, answered: false, selectedOption: null }))
    score.value       = 0
    submitted.value   = false
    examStarted.value = true

    totalTime.value = timer.value = 25 * 60
    passMark.value  = Math.ceil(limit * 0.7)
    startTimer()
  } catch (e) {
    console.error('Load questions error:', e)
  } finally {
    loadingQuestions.value = false
  }
}

/* ── Answer & submit helpers ───────────────────────────────── */
function selectAnswer(q, k) {
  if (q.answered || submitted.value) return
  q.answered = true
  q.selectedOption = k
  if (k === q.correct_option) score.value++
  setTimeout(() => {
    const nxt = questions.value.findIndex(x => !x.answered)
    if (nxt !== -1) {
      document
        .getElementById(`question-${nxt}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 200)
}

function attemptSubmit() {
  const idx = questions.value.findIndex(q => !q.answered)
  if (idx !== -1) {
    document
      .getElementById(`question-${idx}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    alert(`Please answer Question ${idx + 1} before submitting.`)
    return
  }
  submitExam()
}

async function submitExam() {
  submitted.value   = true
  examStarted.value = false
  clearInterval(timerId)
  localStorage.removeItem('examState')

  const payload = {
    user_id:     userId.value,
    course_code: selectedCourse.value,
    score:       score.value,
    total:       questions.value.length,
    questions:   questions.value,
    time_taken:  totalTime.value - timer.value,
    xp_earned:   Math.round((score.value / questions.value.length) * 100)
  }

  try {
    const res    = await fetch('/api/save_exam_score.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    const result = await res.json()
    if (result.status !== 'success') {
      console.error('Save failed:', result.message || result)
      alert('⚠️ There was an error saving your exam. Please contact an administrator.')
    }
  } catch (e) {
    console.error('Network error saving exam:', e)
  }

  showSummary.value = true
}

/* ── Anti-cheat & key helpers ──────────────────────────────── */
function handleKeyPress(e) {
  if (!examStarted.value || submitted.value) return
  const k = e.key.toLowerCase()
  if (!['a', 'b', 'c', 'd'].includes(k)) return
  const cur = questions.value.find(q => !q.answered)
  if (cur) selectAnswer(cur, k)
}

function warnExit(e) {
  if (examStarted.value && !submitted.value) {
    e.preventDefault()
    e.returnValue = ''
  }
}

function handleVisibilityChange() {
  if (document.hidden && examStarted.value && !submitted.value) {
    visibilityCount.value++
    if (visibilityCount.value >= 2) {
      alert('Too many tab switches. Auto-submitting your exam.')
      submitExam()
    } else {
      alert('⚠️ You switched away—next time will auto-submit.')
    }
  }
}

/* ── Auto-save helpers ─────────────────────────────────────── */
function saveExamState() {
  localStorage.setItem(
    'examState',
    JSON.stringify({
      selectedCourse: selectedCourse.value,
      questions:      questions.value,
      score:          score.value,
      timer:          timer.value,
      totalTime:      totalTime.value,
      examStarted:    examStarted.value
    })
  )
}

function startAutoSave() {
  autoSaveInterval = setInterval(() => {
    if (examStarted.value && !submitted.value) saveExamState()
  }, 60000)
}

function handleManualSave() {
  saveExamState()
}

/* ── Navigation helpers ────────────────────────────────────── */
function goToPractice() {
  window.location.href = '/practice-mode'
}

function goToLeaderboard() {
  window.location.href = `/exam-leaderboard?course=${encodeURIComponent(selectedCourse.value)}`
}

function goToGlobalLeaderboard() {
  window.location.href = '/exam-leaderboard'
}

function handleBackdropClick(e) {
  if (e.target.classList.contains('summary-backdrop')) showSummary.value = false
}
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(.95); }
  to   { opacity: 1; transform: scale(1); }
}
.animate-fadeIn { animation: fadeIn 0.3s ease-out; }
html { scroll-behavior: smooth; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
