<!-- File: src/views/TheoryDrill.vue -->
<template>
  <div class="flex min-h-screen flex-col bg-[#F7F9FC] text-[#2C3E50]">
    <!-- ▸ Header -->
    <header
      class="sticky top-0 z-30 flex items-center justify-center bg-[#003f7f] py-4 text-xl font-bold text-white shadow-md">
      ✍️ Theory Drill Mode
    </header>

    <!-- ▸ Scrollable body -->
    <main class="flex-1 overflow-y-auto pb-28">
      <!-- ▸ Progress Overview -->
      <section class="mx-auto mt-4 max-w-sm px-4 text-center">
        <span class="mb-2 block text-xs text-gray-500">📈 Theory Answers Submitted</span>

        <div class="relative h-3 w-full overflow-hidden rounded-lg bg-gray-200">
          <div
            class="h-3 bg-gradient-to-r from-[#28a745] to-[#28a745]/70 transition-all duration-500"
            :style="{ width: progressPercent + '%' }" />
          <span
            class="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white drop-shadow">
            {{ Math.round(progressPercent) }}%
          </span>
        </div>

        <span class="mt-1 block text-sm font-semibold">{{ totalTheoryAnswers }} submitted</span>

        <transition name="fade">
          <span
            v-if="badge"
            class="mt-2 inline-flex items-center gap-1 rounded-full bg-[#28a745]/10 px-2 py-[2px] text-xs font-semibold text-[#28a745]">
            🏅 {{ badge }}
          </span>
        </transition>

        <router-link
          to="/theory-progress"
          class="mt-2 inline-block text-xs font-semibold text-[#003f7f] underline hover:text-blue-800">
          View detailed progress ↗
        </router-link>
      </section>

      <!-- ▸ Drill Setup -->
      <section class="mx-auto mt-6 max-w-md px-4">
        <div class="space-y-4 rounded-2xl border-l-4 border-[#003f7f] bg-white p-4 shadow">
          <h2 class="text-md font-semibold text-[#003f7f]">📚 Setup Your Drill</h2>

          <!-- Course -->
          <select
            v-model="selectedCourse"
            @change="onCourseChange"
            class="w-full rounded border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f7f]">
            <option disabled value="">
              {{ loadingCourses ? '⏳ Loading courses…' : '🎓 Select Course' }}
            </option>
            <option v-for="c in courseOptions" :key="c" :value="c">{{ c }}</option>
          </select>

          <!-- Topic -->
          <select
            v-model="selectedTopic"
            :disabled="!selectedCourse"
            class="w-full rounded border p-2 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#003f7f]">
            <option disabled value="">🧠 Select Topic</option>
            <option v-for="t in topicOptions" :key="t" :value="t">{{ t }}</option>
          </select>

          <!-- Count -->
          <select
            v-model.number="selectedCount"
            :disabled="!selectedTopic"
            class="w-full rounded border p-2 text-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#003f7f]">
            <option disabled :value="null">🔢 Number of Questions</option>
            <option :value="2">2 Questions</option>
            <option :value="5">5 Questions</option>
            <option :value="50">All</option>
          </select>

          <!-- Load Button -->
          <button
            @click="loadQuestions"
            :disabled="loading"
            class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#003f7f] py-2 font-semibold text-white shadow transition hover:bg-[#00284f] disabled:cursor-not-allowed disabled:opacity-60">
            <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
            <span>{{ loading ? 'Loading…' : '🚀 Start Drill' }}</span>
          </button>

          <p v-if="fetchError" class="animate-fade-in text-xs text-red-600">{{ fetchError }}</p>
        </div>
      </section>

      <!-- ▸ Question Block -->
      <section
        id="drill-block"
        v-if="questions.length"
        class="mx-auto mt-8 max-w-2xl space-y-8 px-4">
        <div
          v-for="(q, i) in questions"
          :key="q.id"
          class="question-card space-y-4 rounded-2xl border-l-4 bg-white p-4 shadow transition-all duration-200"
          :class="q.submitted ? 'border-[#28a745]' : 'border-[#003f7f]'">
          <!-- header -->
          <h3 class="text-sm font-semibold text-[#003f7f]">
            Question {{ i + 1 }} / {{ questions.length }}
          </h3>

          <!-- question text -->
          <div
            class="prose prose-sm max-w-none"
            v-html="DOMPurify.sanitize(q.question_text, purifierOpts)" />

          <!-- hint toggle -->
          <div v-if="q.hint" class="text-right mt-1">
            <button
              @click="toggleHint(i)"
              class="text-xs font-semibold text-[#e67e22] underline hover:text-[#d35400]">
              {{ q.showHint ? 'Hide Hint 💡' : 'Show Hint 💡' }}
            </button>
          </div>

          <!-- hint card -->
          <transition name="fade">
            <div
              v-if="q.showHint"
              class="mt-2 rounded-lg bg-yellow-50 p-3 text-sm text-[#2C3E50]">
              <div
                class="prose prose-sm max-w-none"
                v-html="DOMPurify.sanitize(q.hint, purifierOpts)" />
            </div>
          </transition>

          <!-- answer textarea -->
          <textarea
            v-model="q.answer"
            :disabled="q.submitted"
            placeholder="Type your answer here…"
            rows="4"
            class="w-full resize-none rounded border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f7f] disabled:opacity-60" />

          <!-- submit / feedback -->
          <div class="flex flex-wrap items-center gap-3">
            <button
              v-if="!q.submitted"
              @click="submitAnswer(i)"
              :disabled="q.loading"
              class="rounded bg-[#003f7f] px-4 py-2 font-semibold text-white shadow hover:bg-[#00284f] disabled:cursor-not-allowed disabled:opacity-60">
              {{ q.loading ? 'Submitting…' : '✅ Submit' }}
            </button>

            <!-- spinner -->
            <svg
              v-if="q.gradeLoading"
              class="h-4 w-4 animate-spin text-[#28a745]"
              viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>

            <!-- score / explanation / flag -->
            <template v-else-if="q.submitted">
              <span
                class="inline-block rounded-full bg-[#28a745]/10 px-3 py-[2px] text-sm font-semibold text-[#28a745]">
                Score {{ q.ai_score }}/5
              </span>
              <span v-if="q.ai_reason" class="text-xs text-gray-600">— {{ q.ai_reason }}</span>

              <button
                class="text-xs font-semibold text-[#003f7f] underline hover:text-blue-800"
                @click="toggleExplanation(i)"
                :disabled="q.explanationLoading || !q.question_explanation">
                <template v-if="q.explanationLoading">Loading…</template>
                <template v-else>{{ q.showExplanation ? 'Hide' : 'Show' }} Explanation</template>
              </button>

              <!-- flag -->
              <button
                v-if="!q.flagged && !q.flagLoading"
                @click="openFlagModal(i)"
                class="text-xs font-semibold text-red-600 underline hover:text-red-800">
                🚩 Flag
              </button>
              <svg v-if="q.flagLoading" class="h-4 w-4 animate-spin text-red-600" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span v-if="q.flagged && !q.flagLoading" class="text-xs text-gray-500">🚩 Flagged</span>
            </template>
          </div>

          <!-- explanation -->
          <transition name="fade">
            <div
              v-if="q.showExplanation && !q.explanationLoading"
              class="w-full rounded-lg bg-gray-50 p-3 text-sm">
              <div class="prose prose-sm max-w-none" v-html="renderSummaryExplanation(q)" />
              <p v-if="q.ai_suggestion" class="mt-2 text-xs text-gray-600">
                <strong>Suggestion:</strong> {{ q.ai_suggestion }}
              </p>
            </div>
          </transition>
        </div>
      </section>

      <!-- ▸ Review button -->
      <div v-if="questions.length" class="mx-auto mt-6 max-w-2xl px-4 text-right">
        <button
          @click="openSummary"
          :disabled="!allSubmitted"
          class="rounded-full bg-[#28a745] px-4 py-2 font-semibold text-white shadow hover:bg-[#1e7a36] disabled:cursor-not-allowed disabled:opacity-60">
          📝 Review Drill
        </button>
      </div>
    </main>

    <!-- ▸ Score Summary Modal -->
    <transition name="fade">
      <div
        v-if="showScoreModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        @click.self="showScoreModal = false">
        <div class="bg-white rounded-xl p-6 text-center space-y-4 max-w-sm mx-auto">
          <h2 class="text-2xl font-bold text-[#28a745]">🎉 Drill Complete</h2>
          <p class="text-lg font-semibold">
            Score: {{ finalScore }} / {{ questions.length * 5 }}
          </p>
          <button
            @click="showScoreModal = false"
            class="bg-[#003f7f] text-white px-4 py-2 rounded font-semibold">
            Close
          </button>
        </div>
      </div>
    </transition>

    <!-- ▸ Summary Modal -->
    <transition name="fade">
      <div
        v-if="showReview"
        class="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40"
        @click.self="showReview = false">
        <div
          class="animate-fade-in-up relative my-10 w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
          <button
            @click="showReview = false"
            class="absolute right-3 top-2 text-xl text-gray-400 hover:text-red-400">
            &times;
          </button>

          <h2 class="flex items-center gap-1 text-xl font-bold text-[#28a745]">
            🎉 Drill Complete!
          </h2>
          <p class="text-sm text-gray-700">
            You answered <strong>{{ questions.length }}</strong> questions.
          </p>
          <hr class="my-4" />

          <ol class="space-y-3 text-sm">
            <li v-for="(q, i) in questions" :key="q.id" class="rounded-lg bg-gray-50 p-3">
              <div class="prose prose-sm max-w-none" v-html="formatSummaryQuestion(q, i)" />
              <div class="mt-1 text-xs" v-html="renderSummaryGrade(q)" />
              <span v-if="q.flagged" class="text-xs text-red-600">🚩 Flagged</span>
            </li>
          </ol>

          <div class="mt-6 flex justify-end gap-2">
            <button
              @click="resetDrill"
              class="rounded bg-[#003f7f] px-4 py-2 font-semibold text-white shadow hover:bg-[#00284f]">
              🔄 Practice Again
            </button>
            <router-link
              to="/theory-progress"
              class="rounded bg-[#28a745] px-4 py-2 font-semibold text-white shadow hover:bg-[#1e7a36]">
              📊 Go to My Progress
            </router-link>
          </div>
        </div>
      </div>
    </transition>

    <!-- ▸ Full Image Modal -->
    <transition name="fade">
      <div
        v-if="showImageModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
        @click.self="showImageModal = false">
        <img
          :src="modalImageUrl"
          alt="Full View"
          class="max-h-[90vh] max-w-[95vw] rounded-lg shadow-xl" />
        <button
          @click="showImageModal = false"
          class="absolute top-4 right-4 text-white text-3xl font-bold">
          &times;
        </button>
      </div>
    </transition>

    <!-- ▸ Flag Confirmation Modal -->
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
            Only flag if the grading or explanation is clearly wrong or unclear.
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

    <!-- ▸ Feedback Footer -->
    <footer class="relative z-10 mt-12 px-4 pb-6 text-center text-sm">
      <div class="inline-block rounded-xl border-l-4 border-yellow-500 bg-[#fff8e1] p-3 shadow-md">
        🛠️ Got any issue or suggestion?
        <a
          :href="whatsAppLink"
          target="_blank"
          class="font-semibold text-[#003f7f] underline">
          Reach out via WhatsApp
        </a>.
        We're here to help!
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import DOMPurify from 'dompurify'
import { useUserStore } from '@/stores/user'

/* ─── Constants ─────────────────────────────────────────────── */
const whatsAppLink = `https://wa.me/2347041022336?text=${encodeURIComponent('Hi, ')}`
const MAX_LIMIT = 50
const BADGE_THRESHOLDS = [
  { min: 20, label: 'Theory Master 🧠' },
  { min: 10, label: 'Thinker 🧩' },
  { min: 5, label: 'Writer ✍️' }
]

/* ─── Stores ─────────────────────────────────────────────────── */
const userStore = useUserStore()
const user = computed(() => userStore.user)

/* ─── Reactive State ─────────────────────────────────────────── */
const loadingCourses     = ref(false)
const selectedCourse     = ref('')
const selectedTopic      = ref('')
const selectedCount      = ref(null)
const courseOptions      = ref([])
const topicOptions       = ref([])
const questions          = ref([])
const loading            = ref(false)
const fetchError         = ref('')
const totalTheoryAnswers = ref(0)

const showReview         = ref(false)
const showScoreModal     = ref(false)
const finalScore         = ref(0)

const showImageModal     = ref(false)
const modalImageUrl      = ref('')

/* Flag modal state */
const showFlagModal      = ref(false)
const flagIdx            = ref(null)
const flagReason         = ref('')

/* ─── DOMPurify options ──────────────────────────────────────── */
const purifierOpts = {
  ALLOWED_TAGS : [
    'b','br','strong','em','i','u','p','span','ul','ol','li','sup','sub','img',
    'table','thead','tbody','tr','th','td'
  ],
  ALLOWED_ATTR : ['src','alt','style','colspan','rowspan']
}

/* ─── Computed ───────────────────────────────────────────────── */
const badge = computed(() => {
  const hit = [...BADGE_THRESHOLDS].reverse().find(b => totalTheoryAnswers.value >= b.min)
  return hit ? hit.label : ''
})
const progressPercent = computed(() => Math.min(100, (totalTheoryAnswers.value / 20) * 100))
const allSubmitted    = computed(() => questions.value.every(q => q.submitted))

/* ─── Helpers ────────────────────────────────────────────────── */
async function safeFetch (url, opts = {}) {
  // Only include credentials (cookies) for endpoints that really need them
  const needsCreds = /submit_theory_answer\.php|flag_theory_question\.php/.test(url)
  const res = await fetch(url, { credentials: needsCreds ? 'include' : 'omit', ...opts })
                      .catch(e => { throw new Error('Network error: ' + e.message) })

  const raw = await res.text()
  let parsed = raw
  try { parsed = JSON.parse(raw) } catch {/* keep raw */}

  if (!res.ok) {
    const msg = typeof parsed === 'object' && parsed.error
      ? parsed.error + (parsed.details ? ' — ' + parsed.details : '')
      : `HTTP ${res.status}: ${raw.slice(0, 80)}`
    throw new Error(msg)
  }
  if (typeof parsed === 'object' && parsed.error) {
    throw new Error(parsed.error + (parsed.details ? ' — ' + parsed.details : ''))
  }
  return parsed
}

async function getAIExplanation (question) {
  const r = await safeFetch('/api/generate_theory_explanation.php', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ question })
  })
  return typeof r === 'string' ? r : r.explanation ?? ''
}

async function getAIGrade (question, answer, qid) {
  const r = await safeFetch('/api/grade_theory_answer.php', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ question, answer, question_id: qid })
  })
  if (typeof r === 'string' || typeof r === 'number')
    return { ai_score: r, ai_reason: '', ai_suggestion: '' }
  return r
}

/* ─── Loaders ────────────────────────────────────────────────── */
async function loadCourses () {
  const uid = user.value?.id
  if (!uid) { fetchError.value = 'Please log in first.'; return }
  loadingCourses.value = true
  fetchError.value = ''
  try {
    const j = await safeFetch(`/api/get_theory_courses.php?user_id=${uid}`)
    courseOptions.value = Array.isArray(j) ? j : j.courses || []
  } catch { fetchError.value = 'Could not load courses.' }
  finally { loadingCourses.value = false }
}

async function loadTopics () {
  if (!selectedCourse.value) return
  try {
    topicOptions.value = await safeFetch(
      `/api/get_theory_topics.php?course_code=${encodeURIComponent(selectedCourse.value)}`
    )
  } catch { fetchError.value = 'Could not load topics.' }
}

function onCourseChange () {
  selectedTopic.value = ''
  selectedCount.value = null
  topicOptions.value = []
  loadTopics()
}

async function loadTheoryProgress () {
  const uid = user.value?.id
  if (!uid) { totalTheoryAnswers.value = 0; return }
  try {
    const j = await safeFetch(`/api/get_theory_progress.php?user_id=${uid}`)
    totalTheoryAnswers.value = j.total_theory_answers ?? 0
  } catch { totalTheoryAnswers.value = 0 }
}

async function loadQuestions () {
  if (!selectedCourse.value || !selectedTopic.value || !selectedCount.value) {
    fetchError.value = 'Please complete all selections.'; return
  }
  loading.value = true
  fetchError.value = ''
  try {
    const limit = Math.min(+selectedCount.value, MAX_LIMIT)
    const data = await safeFetch(
      `/api/get_theory_questions.php?course_code=${encodeURIComponent(
        selectedCourse.value
      )}&topic=${encodeURIComponent(selectedTopic.value)}&limit=${limit}`
    )
    if (!Array.isArray(data) || !data.length) {
      fetchError.value = 'No questions found.'; return
    }
    questions.value = data.map(q => ({
      ...q,
      answer: '',
      submitted: false,
      loading: false,
      gradeLoading: false,
      explanationLoading: false,
      flagLoading: false,
      flagged: false,
      ai_score: '',
      ai_reason: '',
      ai_suggestion: '',
      showExplanation: false,
      showHint: false
    }))
    await nextTick(() =>
      document.getElementById('drill-block')?.scrollIntoView({ behavior: 'smooth' })
    )
  } catch (e) { fetchError.value = e.message }
  finally { loading.value = false }
}

/* ─── Submit Answer ──────────────────────────────────────────── */
async function submitAnswer (idx) {
  const q   = questions.value[idx]
  const val = q.answer.trim()
  if (!val) { fetchError.value = 'Please type an answer first.'; return }

  q.loading            = true
  q.submitted          = true
  q.gradeLoading       = true
  q.explanationLoading = true
  fetchError.value     = ''

  try {
    const [exp, grade] = await Promise.all([
      getAIExplanation(q.question_text),
      getAIGrade(q.question_text, val, q.id)
    ])

    Object.assign(q, {
      question_explanation: exp,
      ai_score            : grade.ai_score,
      ai_reason           : grade.ai_reason,
      ai_suggestion       : grade.ai_suggestion,
      gradeLoading        : false,
      explanationLoading  : false
    })

    await safeFetch('/api/submit_theory_answer.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        user_id        : user.value?.id,
        question_id    : q.id,
        answer         : val,
        ai_score       : grade.ai_score,
        ai_reason      : grade.ai_reason,
        ai_suggestion  : grade.ai_suggestion
      })
    })

    totalTheoryAnswers.value++

    if (questions.value.every(qq => qq.submitted)) {
      finalScore.value = questions.value.reduce(
        (acc, qq) => acc + (parseInt(qq.ai_score) || 0), 0)
      showScoreModal.value = true
    }
  } catch (e) {
    fetchError.value = e.message || 'Submission failed.'
    q.gradeLoading = q.explanationLoading = false
  } finally { q.loading = false }
}

/* ─── Flagging Workflow ──────────────────────────────────────── */
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
  if (flagIdx.value === null) { showFlagModal.value = false; return }
  const idx = flagIdx.value
  const q   = questions.value[idx]

  q.flagLoading = true
  showFlagModal.value = false

  try {
    await safeFetch('/api/flag_theory_question.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({
        user_id    : user.value?.id,
        question_id: q.id,
        reason     : flagReason.value.trim()
      })
    })
    q.flagged = true
  } catch (e) { fetchError.value = e.message || 'Could not flag the question.' }
  finally {
    q.flagLoading = false
    flagIdx.value = null
    flagReason.value = ''
  }
}

/* ─── Misc UI helpers ───────────────────────────────────────── */
function handleImageClick (e) {
  const img = e.target
  if (img.tagName === 'IMG' && img.closest('.prose')) {
    e.preventDefault()
    modalImageUrl.value = img.src
    showImageModal.value = true
  }
}

function renderSummaryExplanation (q) {
  const raw =
    `<strong>📖 Explanation:</strong><br>` +
    (q.question_explanation || 'No explanation provided.')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/<br\s*\/?>/g, '<br>')
  return DOMPurify.sanitize(raw, purifierOpts)
}

function renderSummaryGrade (q) {
  const reason     = q.ai_reason     ? `<br><em>${q.ai_reason}</em>`     : ''
  const suggestion = q.ai_suggestion ? `<br><em><strong>Suggestion:</strong> ${q.ai_suggestion}</em>` : ''
  return DOMPurify.sanitize(
    `<strong>Score:</strong> ${q.ai_score}/5${reason}${suggestion}`,
    purifierOpts
  )
}

function formatSummaryQuestion (q, i) {
  return DOMPurify.sanitize(`<span>Q${i + 1}:</span> ${q.question_text}`, purifierOpts)
}

/* ─── Simple toggles & reset ─────────────────────────────────── */
const openSummary       = () => { if (allSubmitted.value) showReview.value = true }
const toggleExplanation = i => { questions.value[i].showExplanation = !questions.value[i].showExplanation }
const toggleHint        = i => { questions.value[i].showHint        = !questions.value[i].showHint }

function resetDrill () {
  questions.value     = []
  selectedTopic.value = ''
  selectedCount.value = null
  showReview.value    = false
  showScoreModal.value = false
  showImageModal.value = false
  finalScore.value    = 0
  fetchError.value    = ''
  loadTheoryProgress()
  loadCourses()
  if (selectedCourse.value) loadTopics()
}

/* ─── Watchers and lifecycle ─────────────────────────────────── */
watch(
  () => user.value?.id,
  (id, old) => {
    if (id && !old) {
      loadCourses()
      loadTheoryProgress()
    }
  },
  { immediate: true }
)

onMounted(() => { document.body.addEventListener('click', handleImageClick, true) })
onUnmounted(() => { document.body.removeEventListener('click', handleImageClick, true) })
</script>

<style scoped lang="postcss">
.fade-enter-active,
.fade-leave-active { @apply transition-opacity duration-200; }
.fade-enter-from,
.fade-leave-to     { @apply opacity-0; }

.animate-fade-in-up { animation: fade-in-up 0.45s ease-out; }
@keyframes fade-in-up {
  from { transform: translateY(32px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}

.animate-fade-in { animation: fade-in 0.35s ease-out; }
@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

img               { @apply mx-auto my-4 block h-auto max-w-full cursor-pointer; }
.prose :where(img){ @apply mx-auto; }
</style>
