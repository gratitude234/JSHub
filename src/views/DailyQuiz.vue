<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- 🏷 Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      🎯 Daily Quiz Challenge
    </header>

    <!-- 🔥 Streak Indicator -->
    <div v-if="currentStreak" class="flex items-center justify-center mt-2 space-x-2">
      <span class="text-2xl animate-pulse">🔥</span>
      <span class="font-semibold">Streak: {{ currentStreak }} days</span>
    </div>

    <!-- 📈 Next Milestone Hint -->
    <div v-if="nextMilestone" class="text-center text-sm text-gray-600">
      {{ nextMilestone - currentStreak }} days until {{ nextMilestone }}-Day Champ badge!
    </div>

    <div class="p-4 space-y-6">
      <!-- 🔒 Time lock with countdown -->
      <div
        v-if="isLocked"
        class="text-center py-16 text-[#003f7f] font-semibold space-y-2 animate-fade-in"
      >
        <div class="text-3xl mb-2">🔒 Daily Quiz Locked</div>
        <div class="text-base">
          ⏰ Opens at <span class="underline">{{ quizOpensAtDisplay }}</span>
        </div>
        <div class="text-lg text-[#28a745] font-bold animate-pulse">
          Unlocks in {{ countdown }}
        </div>
      </div>

      <!-- ✅ Already answered -->
      <div
        v-else-if="hasAnsweredToday && !loading && !showSummary"
        class="text-center py-10 text-[#003f7f] font-semibold"
      >
        ✅ You’ve already completed today’s challenge. Scroll to see leaderboard & participants!
      </div>

      <!-- ⏳ Loader -->
      <div v-else-if="loading" class="text-center py-10 animate-pulse text-[#003f7f]">
        Loading today’s quiz...
      </div>

      <!-- 🚫 No quiz today -->
      <div v-else-if="!questions.length" class="text-center text-gray-600">
        🚫 No quiz available for today yet. Check back later!
      </div>

      <!-- 🧠 Quiz -->
      <div v-else-if="!showSummary" class="space-y-6">
        <!-- Progress bar -->
        <div class="h-2 w-full bg-gray-300 rounded-full overflow-hidden">
          <div
            class="h-full bg-[#003f7f] transition-all duration-500"
            :style="{ width: (answeredCount / questions.length) * 100 + '%' }"
          />
        </div>
        <p class="text-center text-sm mt-1 text-[#2C3E50]">
          Answered {{ answeredCount }} of {{ questions.length }}
        </p>

        <!-- Countdown / expiry -->
        <div v-if="!quizExpired" class="text-center font-semibold text-[#003f7f]">
          ⏳ Time Left: {{ formatTime(timeLeft) }}
        </div>
        <div v-else class="text-center font-semibold text-red-600">
          🚫 Time’s up! Auto-submitted.
        </div>

        <!-- Question cards -->
        <div
          v-for="(q, idx) in questions"
          :key="q.id"
          class="bg-white p-4 rounded-xl shadow hover:shadow-md transition"
        >
          <h2 class="font-semibold mb-3 text-base">
            <span class="text-[#003f7f] font-bold">Q{{ idx + 1 }}</span>: {{ q.question_text }}
          </h2>
          <div class="space-y-2">
            <button
              v-for="(opt, key) in getOptions(q)"
              :key="key"
              class="w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all"
              :class="getOptionClass(q, key)"
              :disabled="q.answered || quizExpired"
              @click="submitAnswer(q, key)"
            >
              <span class="font-bold uppercase">{{ key }}.</span> {{ opt }}
            </button>
          </div>
          <div v-if="q.answered" class="mt-3 bg-gray-50 rounded p-3 text-sm">
            <p class="font-semibold text-[#003f7f] mb-1">Explanation:</p>
            <p class="text-gray-700">
              {{ q.question_explanation || 'No explanation provided.' }}
            </p>
          </div>
        </div>
      </div>

      <!-- 🎉 Completion Summary -->
      <div v-if="showSummary" class="bg-white rounded-xl p-6 shadow space-y-3 text-center">
        <h2 class="text-xl font-bold text-[#003f7f]">🎉 Quiz Complete!</h2>
        <p>🧠 Score: <strong>{{ score }}</strong> / {{ questions.length }}</p>
        <p>🎯 Accuracy: <strong>{{ accuracy }}%</strong></p>
        <p>🌟 XP Earned: <strong>{{ xpEarned }}</strong></p>
        <p>⏱ Time Taken: <strong>{{ formatTime(totalTimeTaken) }}</strong></p>
        <p>🏫 Department: {{ user.department || '—' }}</p>
        <p v-if="userRank">🥇 Rank: <strong>#{{ userRank }}</strong></p>

        <!-- 🚀 Practice more -->
        <div class="pt-4">
          <p class="text-sm text-gray-600 mb-2">Ready to keep the momentum going?</p>
          <button
            @click="router.push('/practice-mode')"
            class="bg-[#28a745] text-white px-4 py-2 rounded-xl shadow font-semibold hover:bg-green-600 transition"
          >
            🔁 Practice More Questions
          </button>
        </div>

        <!-- Share to Vibes -->
        <button
          @click="showVibeModal = true"
          class="bg-[#003f7f] text-white px-4 py-2 rounded mt-4 text-sm font-medium"
        >
          📢 Share to Campus Vibes
        </button>
      </div>

      <!-- 🏆 Leaderboard -->
      <div v-if="showLeaderboard" class="mt-8 space-y-4">
        <h3 class="text-center text-lg font-bold text-[#003f7f]">🏆 Today’s Top Performers</h3>
        <div class="space-y-3">
          <div
            v-for="(entry, i) in leaderboard"
            :key="entry.user_id"
            class="bg-white rounded-xl p-3 shadow-sm flex justify-between items-center border-l-4"
            :class="i === 0 ? 'border-[#28a745]' : 'border-[#003f7f]'"
          >
            <div>
              <p class="font-bold text-sm">{{ i + 1 }}. {{ entry.name }}</p>
              <p class="text-xs text-gray-500">
                🧠 {{ entry.score }} |
                🌟 {{ entry.xp_earned }} |
                ⏱ {{ formatTime(entry.time_taken) }} |
                🏫 {{ entry.department }}
              </p>
            </div>
            <div class="text-sm font-semibold text-[#28a745]" v-if="i === 0">🥇</div>
          </div>
        </div>
        <button
          @click="showAllParticipants = !showAllParticipants"
          class="text-sm mt-2 text-[#003f7f] underline font-medium"
        >
          {{ showAllParticipants ? '🙈 Hide Participants' : '📋 Show Participants' }}
        </button>
        <ul
          v-if="showAllParticipants && participants.length"
          class="bg-white rounded-xl p-4 shadow text-sm text-gray-700 space-y-1 max-h-56 overflow-auto mt-4"
        >
          <li v-for="(p, i) in participants" :key="p.user_id">
            {{ i + 1 }}. {{ p.name }} — {{ p.department }}
          </li>
        </ul>
      </div>
    </div>

<!-- 🎉 Level Up Modal -->
<div
  v-if="showLevelUpModal"
  class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
>
  <div class="bg-white rounded-xl p-6 w-11/12 max-w-sm text-center shadow-lg animate-fade-in">
    <h2 class="text-2xl font-bold text-[#003f7f] mb-2">🎉 Level Up!</h2>
    <p class="text-lg">You reached <strong>Level {{ newLevel }}</strong>!</p>
    <p class="text-sm text-gray-600 mt-1">
      Keep learning to unlock more XP, badges, and leaderboard ranks.
    </p>
    <button
      @click="showLevelUpModal = false"
      class="mt-5 bg-[#003f7f] text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-900 transition"
    >
      Close
    </button>
  </div>
</div>


    <!-- 📝 Share-to-Vibes Modal -->
    <div
      v-if="showVibeModal"
      class="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl p-6 w-11/12 max-w-md shadow-lg">
        <h2 class="text-lg font-bold text-[#003f7f] mb-2">Post to Campus Vibes?</h2>
        <textarea
          v-model="vibeMessage"
          rows="4"
          class="w-full border border-gray-300 rounded p-2 text-sm"
        />
        <div class="flex justify-end space-x-3 mt-4">
          <button
            @click="showVibeModal = false"
            class="text-sm text-gray-500 hover:underline"
          >
            Skip
          </button>
          <button
            @click="submitVibePost"
            class="bg-[#003f7f] text-white px-4 py-2 rounded text-sm font-medium"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import { useUserStore } from '@/stores/user'

/* ----------------------------------------
   Router & User Store
---------------------------------------- */
const router    = useRouter()
const userStore = useUserStore()
const user      = computed(() => userStore.user)

/* ----------------------------------------
   Reactive State
---------------------------------------- */
const questions           = ref([])
const loading             = ref(true)
const hasAnsweredToday    = ref(false)
const isLocked            = ref(true)
const countdown           = ref('--h --m --s')
const quizOpensAt         = '8:55'
const quizClosesAt        = '23:59'
const quizOpensAtDisplay  = '09:30 PM'
let   countdownTimer      = null

const durationMinutes     = ref(5)
const timeLeft            = ref(0)
const quizExpired         = ref(false)
let   timerInterval       = null
let   quizStartTime       = 0

const showSummary         = ref(false)
const score               = ref(0)
const xpEarned            = ref(0)
const accuracy            = ref(0)
const totalTimeTaken      = ref(0)

const leaderboard         = ref([])
const userRank            = ref(null)
const participants        = ref([])
const showLeaderboard     = ref(false)
const showAllParticipants = ref(false)

const showVibeModal       = ref(false)
const vibeMessage         = ref('🎯 I just completed today’s quiz on JABU Student Hub! #DailyQuiz')

/* 👉 Level-Up System */
const leveledUp        = ref(false)
const newLevel         = ref(0)
const showLevelUpModal = ref(false)

/* ----------------------------------------
   Computed & Helpers
---------------------------------------- */
const answeredCount = computed(() =>
  questions.value.filter(q => q.answered).length
)
const currentStreak = computed(() => userStore.currentStreak || 0)
const nextMilestone = computed(() => {
  const m = [3, 7, 30].find(x => x > currentStreak.value)
  return m || null
})

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${m}:${s}`
}

function getOptions(q) {
  return { a: q.option_a, b: q.option_b, c: q.option_c, d: q.option_d }
}

function getOptionClass(q, k) {
  if (!q.answered)            return 'bg-white border-gray-300 hover:bg-gray-100'
  if (k === q.correct_option) return 'bg-green-100 border-green-500 text-green-700 font-semibold'
  if (k === q.selectedOption) return 'bg-red-100 border-red-500 text-red-700'
  return 'bg-white border-gray-300'
}

/* ----------------------------------------
   Lock / Unlock Logic
---------------------------------------- */
function updateLockStatus() {
  const now = new Date()
  const [oH, oM] = quizOpensAt.split(':').map(Number)
  const [cH, cM] = quizClosesAt.split(':').map(Number)

  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const openTime = new Date(today);  openTime.setHours(oH, oM, 0, 0)
  const closeTime= new Date(today);  closeTime.setHours(cH, cM, 0, 0)
  if (closeTime <= openTime) closeTime.setDate(closeTime.getDate() + 1)

  if (now >= openTime && now < closeTime) {
    if (isLocked.value) {
      isLocked.value = false
      loadQuiz()
    }
    countdown.value = '✅ Quiz is open now'
  } else {
    if (!isLocked.value) {
      isLocked.value = true
      questions.value = []
    }
    let nextOpen = new Date(openTime)
    if (now >= closeTime) nextOpen.setDate(nextOpen.getDate() + 1)
    const diff = nextOpen - now
    const hrs  = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    const secs = Math.floor((diff % 60000) / 1000)
    countdown.value =
      `Unlocks in ${String(hrs).padStart(2,'0')}h ` +
      `${String(mins).padStart(2,'0')}m ${String(secs).padStart(2,'0')}s`
  }
}

/* ----------------------------------------
   Fetch & Load Quiz
---------------------------------------- */
async function loadQuiz() {
  if (!user.value?.id) return
  loading.value = true
  try {
    const res  = await fetch(`/api/get_daily_quiz.php?user_id=${user.value.id}`)
    const data = await res.json()

    hasAnsweredToday.value = !!data.has_answered_today
    durationMinutes.value  = data.duration_minutes || 5

    const answeredIds = Array.isArray(data.answered) ? data.answered : []
    questions.value = (data.questions || []).map(q => ({
      ...q,
      answered      : answeredIds.includes(q.id),
      selectedOption: null
    }))

    if (!hasAnsweredToday.value) {
      sessionStorage.setItem('quizStarted','true')
      startTimer()
      enableAntiCheat()
    } else {
      fetchLeaderboard()
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

/* ----------------------------------------
   Timer & Anti-Cheat
---------------------------------------- */
function startTimer() {
  clearInterval(timerInterval)
  quizStartTime    = Date.now()
  timeLeft.value   = durationMinutes.value * 60
  quizExpired.value= false

  timerInterval = setInterval(() => {
    if (timeLeft.value > 0) {
      timeLeft.value--
    } else {
      clearInterval(timerInterval)
      quizExpired.value = true
      finishQuiz()
    }
  }, 1000)
}

let tabSwitchCount = 0
function incrementViolation() {
  tabSwitchCount++
  if (tabSwitchCount === 1) {
    alert('⚠️ You left the quiz window. Leave again and we’ll auto-submit.')
  } else if (tabSwitchCount >= 2 && !quizExpired.value) {
    quizExpired.value = true
    finishQuiz()
    alert('🚫 Left twice – quiz auto-submitted.')
  }
}
function handleVisibility() { if (document.hidden && inQuiz()) incrementViolation() }
function enableAntiCheat()  { document.addEventListener('visibilitychange', handleVisibility) }
function disableAntiCheat() { document.removeEventListener('visibilitychange', handleVisibility) }

function beforeUnloadHandler(e) {
  if (!inQuiz()) return
  incrementViolation()
  e.returnValue = ''
}

let backPressedOnce = false
function handlePopState() {
  if (!inQuiz()) return
  if (!backPressedOnce) {
    alert('⚠️ Going back will auto-submit your quiz. Press back again to confirm.')
    backPressedOnce = true
    history.pushState(null,'',location.href)
  } else {
    quizExpired.value = true
    finishQuiz()
    alert('🚫 Quiz auto-submitted because you navigated back.')
    router.back()
  }
}

function inQuiz() {
  return (
    questions.value.length &&
    !isLocked.value &&
    !quizExpired.value &&
    !showSummary.value &&
    !hasAnsweredToday.value
  )
}

/* ----------------------------------------
   Submit an Answer
---------------------------------------- */
async function submitAnswer(q, key) {
  if (q.answered || !user.value?.id || quizExpired.value) return
  q.selectedOption = key
  q.answered       = true

  try {
    const res    = await fetch('/api/submit_daily_answer.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        user_id        : user.value.id,
        question_id    : q.id,
        selected_option: key
      })
    })
    const result = await res.json()

    /* --- XP & Level sync --------------------------------------------- */
    if (typeof result.xp_awarded === 'number') {
      xpEarned.value = result.xp_awarded
      accuracy.value = result.percentage || 0
      userStore.updateXP(userStore.xp + result.xp_awarded)

      if (result.new_level && result.leveled_up) {
        leveledUp.value     = true
        newLevel.value      = result.new_level
        userStore.updateLevel(result.new_level)
        showLevelUpModal.value = true
      }
    }

    /* --- NEW: Streak sync ------------------------------------------- */
    if (typeof result.new_streak === 'number') {
      userStore.updateStreak(result.new_streak)
    }

    /* ---------------------------------------------------------------- */
    if (answeredCount.value === questions.value.length) {
      clearInterval(timerInterval)
      disableAntiCheat()
      finishQuiz()
    }
  } catch (e) {
    console.error(e)
  }
}

/* ----------------------------------------
   Auto-submit & Finish
---------------------------------------- */
function getWrongOption(correct) {
  return ['a','b','c','d'].find(o => o !== correct)
}

async function autoSubmitRemaining() {
  const unfinished = questions.value.filter(q => !q.answered)
  await Promise.all(unfinished.map(q =>
    fetch('/api/submit_daily_answer.php', {
      method : 'POST',
      headers: { 'Content-Type':'application/json' },
      body   : JSON.stringify({
        user_id        : user.value.id,
        question_id    : q.id,
        selected_option: getWrongOption(q.correct_option)
      })
    })
  ))
}

async function finishQuiz() {
  disableAntiCheat()
  sessionStorage.removeItem('quizStarted')
  await autoSubmitRemaining()

  hasAnsweredToday.value = true
  score.value            = questions.value.filter(q => q.selectedOption === q.correct_option).length
  totalTimeTaken.value   = Math.max(1, Math.floor((Date.now() - quizStartTime) / 1000))

  confetti()
  fetchLeaderboard()
  showSummary.value = true
}

/* ----------------------------------------
   Leaderboard & Share
---------------------------------------- */
async function fetchLeaderboard() {
  try {
    const res  = await fetch(`/api/get_daily_leaderboard.php?user_id=${user.value.id}`)
    const data = await res.json()
    leaderboard.value     = data.leaderboard  || []
    userRank.value        = data.user_rank    || null
    participants.value    = data.participants || []
    showLeaderboard.value = true
  } catch (e) {
    console.error(e)
  }
}

async function submitVibePost() {
  try {
    await fetch('/api/post_community.php', {
      method: 'POST',
      body  : new URLSearchParams({
        user_id: user.value.id,
        body   : vibeMessage.value
      })
    })
    showVibeModal.value = false
    alert('✅ Shared to Campus Vibes!')
  } catch (e) {
    console.error(e)
    alert('Posting failed, try again later.')
  }
}

/* ----------------------------------------
   Helper: initial streak fetch
---------------------------------------- */
async function fetchUserStreak() {
  if (!user.value?.id) return
  try {
    const res  = await fetch(`/api/get_user_streak.php?user_id=${user.value.id}`)
    const data = await res.json()
    if (typeof data.current_streak === 'number') {
      userStore.updateStreak(data.current_streak)
    }
  } catch (e) {
    console.error(e)
  }
}

/* ----------------------------------------
   Lifecycle Hooks
---------------------------------------- */
onMounted(async () => {
  backPressedOnce = false
  history.pushState(null,'',location.href)

  await fetchUserStreak()   // ⭐ preload streak so 🔥 shows immediately

  if (sessionStorage.getItem('quizStarted') === 'true' && questions.value.length) {
    quizExpired.value = true
    finishQuiz()
    return
  }

  updateLockStatus()
  countdownTimer = setInterval(updateLockStatus, 1000)

  window.addEventListener('beforeunload', beforeUnloadHandler)
  window.addEventListener('popstate',     handlePopState)
})

onUnmounted(() => {
  clearInterval(countdownTimer)
  clearInterval(timerInterval)
  disableAntiCheat()
  window.removeEventListener('beforeunload', beforeUnloadHandler)
  window.removeEventListener('popstate',     handlePopState)
})

watchEffect(() => {
  if (hasAnsweredToday.value && !loading.value && !showSummary.value) {
    fetchLeaderboard()
  }
})
</script>




<style scoped>
@keyframes fade-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.6s ease-in-out; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to        { opacity: 0; }
</style>
