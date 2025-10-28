<!-- src/views/QuickDrill.vue (Mobile-first, app-like redesign) -->
<template>
  <div class="min-h-dvh bg-[#F7F9FC] text-[#1f2a37] flex flex-col pb-[76px]" :style="{ paddingBottom: 'calc(76px + env(safe-area-inset-bottom))' }">
    <!-- APP BAR -->
    <header class="sticky top-0 z-50 bg-[#003F7F] text-white shadow" :style="{ paddingTop: 'env(safe-area-inset-top)' }">
      <div class="px-3 pt-2 pb-3 flex items-center gap-2">
        <button
          class="h-10 w-10 grid place-items-center rounded-full hover:bg-white/10 active:scale-95"
          aria-label="Back"
          @click="router.back()"
          title="Go back"
        >←</button>

        <div class="flex-1 min-w-0">
          <h1 class="font-extrabold tracking-wide text-[15px] leading-none truncate">
            Quick Drill <span class="opacity-80 font-semibold">• {{ packLabel }}</span>
          </h1>
          <div class="mt-1 flex items-center gap-2 text-[11px] opacity-90">
            <span>{{ limit }} questions</span>
            <span class="opacity-60">•</span>
            <span>{{ timed ? 'Timed' : 'Untimed' }}</span>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <!-- Timer chip with progress ring -->
          <div v-if="stage==='live'" class="relative w-9 h-9" :title="timed ? mmss(secondsLeft) : 'Untimed'">
            <div
              class="absolute inset-0 rounded-full grid place-items-center text-[10px] font-semibold"
              :class="timed ? 'bg-white/10' : 'bg-white/5'"
              :style="timed ? ringStyle : ''"
            >
              <span v-if="timed">{{ Math.floor(secondsLeft/60) }}</span>
              <span v-else>—</span>
            </div>
          </div>

          <button
            class="h-9 w-9 grid place-items-center rounded-full hover:bg-white/10 active:scale-95"
            aria-label="More"
            @click="openConfig()"
          >⋯</button>
        </div>
      </div>

      <!-- Progress bar + chips -->
      <div class="px-3 pb-2 space-y-2">
        <!-- Thin progress bar -->
        <div class="h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div class="h-full bg-white rounded-full transition-all" :style="{ width: progressPct + '%' }"></div>
        </div>

        <!-- Chips: horizontally scrollable, big tap targets -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            v-for="(q,i) in questions"
            :key="q.id"
            @click="go(i)"
            class="shrink-0 h-8 w-8 rounded-full grid place-items-center text-[11px] font-semibold active:scale-95 transition"
            :class="chipClass(i)"
            :title="`Q${i+1}`"
          >{{ i+1 }}</button>
        </div>

        <!-- Meta row: position + timer/pause -->
        <div class="flex items-center justify-between text-[12px]">
          <div>Q {{ index+1 }} / {{ questions.length }}</div>
          <div class="flex items-center gap-3" v-if="stage==='live'">
            <button v-if="timed && !isPaused" class="underline underline-offset-2" @click="pause()">Pause</button>
            <button v-if="timed && isPaused" class="underline underline-offset-2" @click="resume()">Resume</button>
            <button class="underline underline-offset-2" @click="timed = !timed; if(timed && secondsLeft===0) secondsLeft = defaultTime;">{{ timed ? 'Timer On' : 'Timer Off' }}</button>
          </div>
          <div v-else class="opacity-90">{{ scoreLine }}</div>
        </div>
      </div>
    </header>

    <!-- MAIN -->
    <main class="flex-1">
      <div class="max-w-screen-sm mx-auto p-3">
        <!-- LOADING / ERROR -->
        <div v-if="loading" class="p-4 rounded-2xl bg-white shadow">
          <div class="animate-pulse space-y-3">
            <div class="h-5 bg-slate-200/70 rounded w-2/3"></div>
            <div class="h-4 bg-slate-200/70 rounded w-11/12"></div>
            <div class="h-4 bg-slate-200/70 rounded w-10/12"></div>
            <div class="grid gap-2 mt-3">
              <div class="h-10 bg-slate-200/70 rounded-xl"></div>
              <div class="h-10 bg-slate-200/70 rounded-xl"></div>
              <div class="h-10 bg-slate-200/70 rounded-xl"></div>
              <div class="h-10 bg-slate-200/70 rounded-xl"></div>
            </div>
          </div>
        </div>
        <div v-else-if="error" class="p-6 rounded-2xl bg-white shadow text-center text-red-600">{{ error }}</div>

        <!-- LIVE QUESTION -->
        <div v-else-if="stage==='live'">
          <QuestionCard
            :q="current"
            :index="index"
            :picked="picked(current.id)"
            :marked="isMarked(current.id)"
            :auto-next="autoNext"
            @pick="pick(current.id, $event)"
            @toggle-mark="toggleMark(current.id)"
            @swipe-left="next()"
            @swipe-right="prev()"
          />
        </div>

        <!-- REVIEW / SUMMARY -->
        <div v-else>
          <div class="p-4 rounded-2xl bg-white shadow">
            <div class="flex items-center gap-3">
              <div class="relative h-14 w-14 rounded-full grid place-items-center text-[#003F7F] font-bold"
                   :style="{ background: `conic-gradient(#10b981 ${scoreArc}deg, #e2e8f0 0deg)` }">
                <div class="absolute inset-[6px] bg-white rounded-full grid place-items-center text-sm">{{ summary.correct }}</div>
              </div>
              <div class="flex-1">
                <div class="text-base font-semibold">Result</div>
                <div class="text-[12px] opacity-80">Score: <b>{{ summary.correct }}/{{ summary.total }}</b> • Time: <b>{{ mmss(summary.time_sec) }}</b></div>
              </div>
            </div>
          </div>

          <div class="mt-3 space-y-3">
            <div v-for="(r,i) in review" :key="r.id" class="p-4 rounded-2xl bg-white shadow">
              <div class="flex items-start gap-2">
                <div class="text-[11px] shrink-0 px-2 py-1 rounded bg-slate-100">Q{{ i+1 }}</div>
                <div class="flex-1">
                  <p class="font-medium leading-relaxed">{{ r.stem }}</p>
                  <ul class="mt-2 space-y-1 text-[14px]">
                    <li v-for="(opt,oi) in r.options" :key="oi" class="flex items-start gap-2">
                      <span class="mt-1 inline-block h-2.5 w-2.5 rounded-full"
                            :class="{
                              'bg-emerald-500': oi===r.correct_index,
                              'bg-red-500': oi===r.picked_index && !r.is_correct,
                              'bg-slate-300': oi!==r.correct_index && oi!==r.picked_index
                            }"/>
                      <span :class="{'line-through opacity-60': oi===r.picked_index && !r.is_correct}">{{ opt }}</span>
                    </li>
                  </ul>

                  <div class="mt-3 text-[13px] bg-emerald-50 border border-emerald-200 p-3 rounded" v-if="r.rationale">
                    <div class="font-semibold text-emerald-900">Why</div>
                    <p class="text-emerald-900/90">{{ r.rationale }}</p>
                  </div>

                  <div class="mt-2 text-[12px] text-slate-500 flex flex-wrap items-center gap-2">
                    <span v-for="t in r.tags" :key="t" class="px-2 py-0.5 rounded bg-slate-100">#{{ t }}</span>
                    <a v-if="r.source" :href="sourceLink(r.source)" class="underline underline-offset-2" target="_blank">{{ r.source.title }}{{ r.source.page? (' • p.'+r.source.page):'' }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="h-2"></div>
        </div>
      </div>
    </main>

    <!-- BOTTOM ACTION BAR -->
    <div v-if="stage==='live'" class="fixed inset-x-0 bottom-0 bg-white/80 backdrop-blur border-t border-slate-200 px-3 pt-2 pb-2.5" :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)' }">
      <div class="max-w-screen-sm mx-auto grid grid-cols-4 gap-2">
        <button class="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.99]" @click="prev()" :disabled="index===0">Prev</button>
        <button class="h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.99]" @click="next()" :disabled="index===questions.length-1">Next</button>
        <button class="h-11 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 active:scale-[0.99]" @click="skip()">Skip</button>
        <button class="h-11 rounded-xl bg-emerald-600 text-white disabled:opacity-50 active:scale-[0.99]" :disabled="!canSubmit" @click="submit()">Submit</button>
      </div>
    </div>

    <!-- CONFIG SHEET (Bottom Sheet) -->
    <transition name="fade">
      <div v-if="showConfig" class="fixed inset-0 z-[60]" @click.self="closeConfig()">
        <div class="absolute inset-0 bg-black/40"></div>
        <div class="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-2xl p-4 space-y-3 max-w-screen-sm mx-auto" :style="{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)' }">
          <div class="h-1 w-10 bg-slate-200 rounded-full mx-auto mb-1"></div>
          <div class="flex items-center gap-2">
            <div class="text-[13px] font-semibold">Drill Settings</div>
            <div class="ms-auto">
              <button class="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-[12px]" @click="restart()">Start Over</button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="col-span-2">
              <div class="text-[12px] mb-1 opacity-80">Count</div>
              <div class="grid grid-cols-3 gap-2">
                <button v-for="n in [5,10,20]" :key="n" @click="limit = n" class="h-10 rounded-xl border active:scale-[0.99]"
                        :class="limit===n ? 'border-[#003F7F] bg-[#003F7F]/5' : 'border-slate-200 bg-white'">{{ n }}</button>
              </div>
            </div>

            <label class="col-span-2 flex items-center justify-between h-12 px-3 rounded-xl border border-slate-200">
              <span class="text-[13px]">Auto-next</span>
              <input type="checkbox" v-model="autoNext" class="h-5 w-9 accent-[#003F7F]" />
            </label>

            <label class="col-span-2 flex items-center justify-between h-12 px-3 rounded-xl border border-slate-200">
              <span class="text-[13px]">Shuffle</span>
              <input type="checkbox" v-model="shuffle" class="h-5 w-9 accent-[#003F7F]" />
            </label>

            <label class="col-span-2 flex items-center justify-between h-12 px-3 rounded-xl border border-slate-200">
              <span class="text-[13px]">Timed ({{ defaultTime/60 }}m)</span>
              <input type="checkbox" v-model="timed" class="h-5 w-9 accent-[#003F7F]" />
            </label>

            <div class="col-span-2 flex items-center gap-2 pt-2">
              <button class="flex-1 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.99]" @click="closeConfig()">Close</button>
              <button class="flex-1 h-11 rounded-xl bg-[#003F7F] text-white active:scale-[0.99]" @click="applyAndRestart()">Apply</button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- PAUSE OVERLAY -->
    <transition name="fade">
      <div v-if="isPaused" class="fixed inset-0 bg-black/50 grid place-items-center z-[70]">
        <div class="bg-white rounded-2xl p-6 shadow max-w-sm text-center mx-3">
          <div class="text-lg font-semibold">Paused</div>
          <p class="text-[13px] opacity-70 mt-1">Timer is stopped. Resume when ready.</p>
          <div class="mt-4 flex items-center justify-center gap-2">
            <button class="px-3 py-2 rounded bg-slate-100 hover:bg-slate-200" @click="isPaused=false">Close</button>
            <button class="px-3 py-2 rounded bg-[#003F7F] text-white" @click="resume()">Resume</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, defineComponent, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/* ---------- Types ---------- */
interface SourceRef { slug: string; title: string; page?: number }
interface Question {
  id: string | number
  stem: string
  options: string[]
  answer_index?: number
  rationale?: string
  tags?: string[]
  source?: SourceRef
}
interface StartPayload {
  ok: boolean
  drill_id: string
  limit: number
  time_limit_sec: number
  questions: Question[]
}
interface SubmitPayload {
  ok: boolean
  score: number
  correct: number
  total: number
  time_sec: number
  per_question: Array<{
    id: Question['id']
    correct_index: number
    picked_index: number | null
    is_correct: boolean
    stem: string
    options: string[]
    rationale?: string
    tags?: string[]
    source?: SourceRef
  }>
}

/* ---------- Router / Params ---------- */
const route = useRoute()
const router = useRouter()
const pack = ref(String(route.query.pack ?? 'nursing-200l'))
const packLabel = computed(() => {
  const map: Record<string, string> = { 'nursing-200l': 'Nursing 200L' }
  return map[pack.value] ?? pack.value
})

/* ---------- State ---------- */
const showConfig = ref(false)
const loading = ref(true)
const error = ref<string | null>(null)
const stage = ref<'live' | 'summary'>('live')
const index = ref(0)
const questions = ref<Question[]>([])
const selections = ref<Record<string | number, number | null>>({})
const marks = ref<Record<string | number, boolean>>({})
const shuffle = ref(true)
const autoNext = ref(true)
const limit = ref<number>(Number(route.query.limit ?? 5))
const defaultTime = 60 * 5
const timed = ref(true)
const secondsLeft = ref<number>(defaultTime)
const timer = ref<number | undefined>(undefined)
const isPaused = ref(false)
const startedAt = ref<number>(0)
const drillId = ref<string>('')

const current = computed(() => questions.value[index.value])
const canSubmit = computed(() => Object.values(selections.value).some(v => v !== null && v !== undefined))
const answeredCount = computed(() => Object.values(selections.value).filter(v => v !== null && v !== undefined).length)
const progressPct = computed(() => questions.value.length ? Math.round((answeredCount.value / questions.value.length) * 100) : 0)

/* Timer ring style */
const ringStyle = computed(() => {
  if (!timed.value) return {}
  const total = secondsLeft.value <= 0 ? 1 : secondsLeft.value
  const pct = (secondsLeft.value / defaultTime) * 360
  return { background: `conic-gradient(#f0f9ff ${pct}deg, transparent 0)` }
})

/* ---------- Summary ---------- */
const summary = ref({ correct: 0, total: 0, time_sec: 0 })
const scoreLine = computed(() => `${summary.value.correct}/${summary.value.total} • ${mmss(summary.value.time_sec)}`)
const review = ref<SubmitPayload['per_question']>([])
const missedIds = computed(() => review.value.filter(r => !r.is_correct).map(r => String(r.id)))
const scoreArc = computed(() => {
  if (!summary.value.total) return 0
  return (summary.value.correct / summary.value.total) * 360
})

/* ---------- Lifecycle ---------- */
onMounted(async () => { await start(); bindHotkeys() })
onBeforeUnmount(() => { clear(); unbindHotkeys() })

/* ---------- Drill control ---------- */
async function start () {
  try {
    loading.value = true
    error.value = null
    stage.value = 'live'
    index.value = 0
    selections.value = {}
    marks.value = {}

    const res = await fetch('/api/drill_start.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack: pack.value, limit: limit.value, shuffle: shuffle.value })
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as StartPayload
    if (!data.ok) throw new Error('Start failed')

    drillId.value = data.drill_id
    questions.value = data.questions
    if (shuffle.value) questions.value = shuffleArray([...questions.value])

    startedAt.value = Date.now()
    secondsLeft.value = data.time_limit_sec ?? defaultTime
    if (timed.value) run()
  } catch (e: any) {
    // Offline fallback
    drillId.value = `local-${Math.random().toString(36).slice(2)}`
    questions.value = offlineSample(limit.value)
    startedAt.value = Date.now()
    secondsLeft.value = defaultTime
    if (timed.value) run()
    console.warn('QuickDrill: using offline sample. Reason:', e?.message)
  } finally {
    loading.value = false
  }
}

function restart () { clear(); start() }
function applyAndRestart () { closeConfig(); restart() }
function clear () { if (timer.value) window.clearInterval(timer.value); timer.value = undefined }
function run () {
  clear()
  timer.value = window.setInterval(() => {
    if (isPaused.value) return
    if (secondsLeft.value > 0) secondsLeft.value--
    else { clear(); submit() }
  }, 1000)
}

function pause () { isPaused.value = true }
function resume () { isPaused.value = false; run() }

function go (i: number) { index.value = i }
function next () { if (index.value < questions.value.length - 1) index.value++ }
function prev () { if (index.value > 0) index.value-- }
function skip () { next() }

function pick (id: Question['id'], choice: number) {
  selections.value[id] = choice
  if (autoNext.value) {
    const i = index.value
    const nextIdx = questions.value.findIndex((q, qi) => qi > i && (selections.value[q.id] === null || selections.value[q.id] === undefined))
    if (nextIdx !== -1) index.value = nextIdx
    else next()
  }
}
function isMarked (id: Question['id']) { return !!marks.value[id] }
function toggleMark (id: Question['id']) { marks.value[id] = !marks.value[id] }
function picked (id: Question['id']) { return selections.value[id] ?? null }

async function submit () {
  if (stage.value !== 'live') return
  stage.value = 'summary'
  clear()

  const payload = {
    drill_id: drillId.value,
    answers: questions.value.map(q => ({ id: q.id, choice: selections.value[q.id] ?? null })),
    time_sec: Math.round((Date.now() - startedAt.value) / 1000)
  }

  try {
    const res = await fetch('/api/drill_submit.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = (await res.json()) as SubmitPayload
    if (!data.ok) throw new Error('Submit failed')

    summary.value = { correct: data.correct, total: data.total, time_sec: data.time_sec }
    review.value = data.per_question
  } catch {
    // Local grade
    const per = questions.value.map(q => {
      const correct_index = q.answer_index ?? 0
      const picked_index = selections.value[q.id] ?? null
      const is_correct = picked_index === correct_index
      return {
        id: q.id,
        stem: q.stem,
        options: q.options,
        correct_index,
        picked_index,
        is_correct,
        rationale: q.rationale,
        tags: q.tags ?? [],
        source: q.source
      }
    })
    const correct = per.filter(p => p.is_correct).length
    const total = per.length
    const time_sec = payload.time_sec
    summary.value = { correct, total, time_sec }
    review.value = per
  }

  // lightweight recent
  try {
    const recent = JSON.parse(localStorage.getItem('drill:recent') || '[]')
    recent.unshift({ pack: pack.value, at: Date.now(), summary: summary.value })
    localStorage.setItem('drill:recent', JSON.stringify(recent.slice(0, 5)))
  } catch {}
}

/* ---------- UI helpers ---------- */
function mmss (n: number) {
  const m = Math.floor(n / 60).toString().padStart(2, '0')
  const s = Math.floor(n % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
function chipClass (i: number) {
  const q = questions.value[i]
  const pickedAns = selections.value[q?.id as any]
  const isCurrent = i === index.value
  return [
    pickedAns !== undefined && pickedAns !== null ? 'bg-white text-[#003F7F] ring-2 ring-white/80' : 'bg-white/10 text-white',
    isCurrent ? 'outline outline-2 outline-white' : ''
  ]
}
function sourceLink (s: SourceRef) { return `/reader?slug=${encodeURIComponent(s.slug)}${s.page ? ('#page=' + s.page) : ''}` }
function shuffleArray<T> (arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/* ---------- Hotkeys (desktop) ---------- */
function onKey (e: KeyboardEvent) {
  if (stage.value === 'live') {
    if (['1', '2', '3', '4', '5'].includes(e.key)) {
      const num = Number(e.key) - 1
      const q = current.value
      if (q && q.options[num] !== undefined) pick(q.id, num)
    }
    if (e.key === 'n' || e.key === 'N') next()
    if (e.key === 'p' || e.key === 'P') prev()
    if (e.key === 'm' || e.key === 'M') toggleMark(current.value.id)
    if (e.key === 'Enter') submit()
  }
}
function bindHotkeys () { window.addEventListener('keydown', onKey) }
function unbindHotkeys () { window.removeEventListener('keydown', onKey) }

/* ---------- Config helpers ---------- */
function openConfig () { showConfig.value = true }
function closeConfig () { showConfig.value = false }

/* ---------- Offline sample ---------- */
function offlineSample (n: number): Question[] {
  const pool: Question[] = [
    {
      id: 'ana-ulna-nerve',
      stem: 'Which nerve is most likely injured in a fracture of the surgical neck of the humerus?',
      options: ['Radial nerve', 'Median nerve', 'Ulnar nerve', 'Axillary nerve', 'Musculocutaneous nerve'],
      answer_index: 3,
      rationale:
        'The axillary nerve winds around the surgical neck with the posterior circumflex humeral artery and supplies deltoid/teres minor.',
      tags: ['Anatomy', 'Upper limb'],
      source: { slug: 'upper-limb-osteology', title: 'Upper Limb • Osteology', page: 42 }
    },
    {
      id: 'nsc219-ethics',
      stem:
        'In professional nursing practice, which principle best describes the duty to respect a patient’s choices even when you disagree?',
      options: ['Beneficence', 'Justice', 'Autonomy', 'Fidelity', 'Veracity'],
      answer_index: 2,
      rationale: 'Autonomy is the right of a competent client to make informed decisions about their care.',
      tags: ['NSC 219', 'Ethics'],
      source: { slug: 'nsc-219-foundations', title: 'NSC 219 • Foundations of Nursing', page: 15 }
    },
    {
      id: 'nsc209-epi',
      stem:
        'During a community survey, 40 new cases of malaria occurred in a population of 2,000 over one month. What is the incidence rate per 1,000 people for that month?',
      options: ['2/1000', '10/1000', '20/1000', '40/1000', '200/1000'],
      answer_index: 2,
      rationale: 'Incidence = new cases/population = 40/2000 = 0.02 → 20 per 1,000.',
      tags: ['NSC 209', 'Epidemiology', 'Community'],
      source: { slug: 'nsc-209-health-edu', title: 'NSC 209 • Health Education & Promotion', page: 88 }
    },
    {
      id: 'ana-bone-type',
      stem: 'The sternum is classified as which type of bone?',
      options: ['Sesamoid', 'Flat', 'Long', 'Irregular', 'Short'],
      answer_index: 1,
      rationale:
        'The sternum is a flat bone formed by intramembranous ossification; it protects thoracic viscera.',
      tags: ['Anatomy', 'Osteology'],
      source: { slug: 'lower-limb-osteology', title: 'Lower Limb • Osteology', page: 9 }
    },
    {
      id: 'nsc219-asepsis',
      stem:
        'Before inserting an IV cannula, the nurse scrubs the skin with 2% chlorhexidine in 70% alcohol. This action is primarily an example of…',
      options: ['Medical asepsis', 'Surgical asepsis', 'Sterilization', 'Disinfection of instruments', 'Isolation technique'],
      answer_index: 0,
      rationale: 'Skin antisepsis to reduce microbial load is part of medical asepsis (clean technique).',
      tags: ['NSC 219', 'Asepsis'],
      source: { slug: 'nsc-219-foundations', title: 'NSC 219 • Foundations of Nursing', page: 62 }
    }
  ]
  return shuffleArray(pool).slice(0, n)
}

/* ---------- Inline QuestionCard component ---------- */
const QuestionCard = defineComponent({
  name: 'QuestionCard',
  props: {
    q: { type: Object, required: true },
    index: { type: Number, required: true },
    picked: { type: Number, default: null },
    marked: { type: Boolean, default: false },
    autoNext: { type: Boolean, default: true }
  },
  emits: ['pick', 'toggle-mark', 'swipe-left', 'swipe-right'],
  setup (props, { emit }) {
    const letter = (i: number) => String.fromCharCode(65 + i)

    // Simple swipe detection
    let startX = 0, startY = 0, touching = false
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      touching = true
      startX = t.clientX
      startY = t.clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!touching) return
      touching = false
      const t = e.changedTouches[0]
      const dx = t.clientX - startX
      const dy = Math.abs(t.clientY - startY)
      if (dy > 60) return // ignore mostly vertical scrolls
      if (dx <= -60) emit('swipe-left')
      else if (dx >= 60) emit('swipe-right')
    }

    return () =>
      h('div', { class: 'p-4 rounded-2xl bg-white shadow', onTouchstart: onTouchStart, onTouchend: onTouchEnd }, [
        h('div', { class: 'flex items-start gap-2' }, [
          h('div', { class: 'text-[11px] shrink-0 px-2 py-1 rounded bg-slate-100' }, `Q${props.index + 1}`),
          h('div', { class: 'flex-1' }, [
            h('div', { class: 'flex items-start gap-2' }, [
              h('p', { class: 'font-semibold leading-relaxed text-[15px] flex-1' }, (props.q as any).stem),
              h('button', {
                class: 'ms-1 px-2 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-[12px] shrink-0',
                onClick: () => emit('toggle-mark')
              }, props.marked ? '★ Marked' : '☆ Mark')
            ]),

            h(
              'div',
              { class: 'mt-3 grid gap-2' },
              (props.q as any).options.map((opt: string, i: number) =>
                h(
                  'button',
                  {
                    class: [
                      'flex items-center gap-3 p-3 rounded-xl border shadow-sm text-left active:scale-[0.99] transition',
                      props.picked !== i
                        ? 'border-slate-200 bg-white hover:bg-slate-50'
                        : 'border-[#003F7F] bg-[#003F7F]/5 ring-1 ring-[#003F7F]'
                    ],
                    onClick: () => emit('pick', i)
                  },
                  [
                    h('span', {
                      class: 'inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 text-[12px] font-semibold'
                    }, letter(i)),
                    h('span', { innerHTML: opt })
                  ]
                )
              )
            ),

            h('div', { class: 'mt-3 text-[12px] opacity-60' }, `Tap an option${props.autoNext ? ' — auto-next on' : ''}. Swipe left/right to navigate.`)
          ])
        ])
      ])
  }
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Simple fade for overlays */
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
