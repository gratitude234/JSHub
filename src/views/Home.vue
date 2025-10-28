<template>
  <div class="min-h-dvh bg-[#F7F9FC] text-[#2C3E50] flex flex-col pb-[72px]">
    <!-- App Bar -->
    <header class="sticky top-0 z-50 bg-[#003F7F] text-white shadow" :style="{ paddingTop: safeTop }">
      <div class="px-4 py-2.5 flex items-center gap-3">
        <button class="h-10 w-10 grid place-items-center rounded-full active:scale-95" aria-label="Menu" @click="openMenu">☰</button>
        <h1 class="flex-1 text-center font-extrabold tracking-wide text-[15px]">
          JABU Study Hub <span class="opacity-80 font-semibold">• Nursing 200L (beta)</span>
        </h1>
        <button class="h-10 w-10 grid place-items-center rounded-full relative active:scale-95" aria-label="Notifications" @click="goNotifications">
          🔔
          <span v-if="unreadCount>0" class="absolute -right-0.5 -top-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-bold grid place-items-center">{{ unreadCount }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="px-4 pb-3">
        <label for="search" class="sr-only">Search courses, topics or PDFs</label>
        <div class="relative">
          <input
            id="search"
            v-model.trim="q"
            type="search"
            inputmode="search"
            autocapitalize="off"
            autocomplete="off"
            spellcheck="false"
            placeholder="Search NSC 209, NSC 219, Lower limb…"
            class="w-full rounded-xl bg-white/95 text-[#2C3E50] border-0 px-4 py-3 pr-12 text-[15px] placeholder-gray-500 focus:outline-none"
            @input="onSearchInput"
            @keyup.enter="runSearch"
          />
          <button class="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg active:scale-95" aria-label="Search" @click="runSearch">🔎</button>

          <!-- Results -->
          <div v-if="showResults" class="absolute mt-2 w-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow max-h-80 overflow-auto z-40">
            <div v-if="isSearching" class="p-4 text-sm text-gray-600">Searching…</div>
            <div v-else-if="searchError" class="p-4 text-sm text-red-600">{{ searchError }}</div>
            <template v-else>
              <button v-for="r in results" :key="r.id + r.to" class="w-full text-left px-4 py-3 text-[15px] active:bg-gray-50" @click="goToResult(r)">
                <div class="flex items-center justify-between gap-3">
                  <span class="truncate">{{ r.title }}</span>
                  <span class="text-xs text-gray-500">{{ r.badge }}</span>
                </div>
                <p class="text-[12px] text-gray-600 mt-0.5 truncate">{{ r.sub }}</p>
              </button>
              <div v-if="!results.length" class="p-4 text-sm text-gray-600">No matches.</div>
            </template>
          </div>
        </div>
      </div>
    </header>

    <main class="flex-1">
      <!-- Greeting -->
      <section class="px-4 py-3 text-[13px] text-gray-600">
        👋 Welcome back, <span class="font-semibold">{{ userName || 'Student' }}</span> — Nursing 200L pack is ready.
      </section>

      <!-- Primary actions -->
      <section class="px-4">
        <div class="grid grid-cols-3 gap-2">
          <RouterLink to="/ask" class="qa-card">
            <div class="qa-icon">🤖</div>
            <div class="qa-title">Ask Tutor</div>
            <div class="qa-sub">Nursing help</div>
          </RouterLink>
          <button class="qa-card" @click="startQuickDrill">
            <div class="qa-icon">⚡</div>
            <div class="qa-title">Quick Drill</div>
            <div class="qa-sub">5 Qs</div>
          </button>
          <RouterLink to="/results" class="qa-card">
            <div class="qa-icon">📈</div>
            <div class="qa-title">My Stats</div>
            <div class="qa-sub">Progress</div>
          </RouterLink>
        </div>

        <!-- Continue practice -->
        <button v-if="resume" @click="resumePractice" class="mt-3 w-full rounded-xl bg-white p-3 text-left shadow active:scale-[0.99] transition">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl grid place-items-center bg-[#003F7F]/10 text-[#003F7F]">▶️</div>
            <div class="flex-1">
              <p class="text-sm font-semibold">Continue practice</p>
              <p class="text-xs text-gray-600 truncate">{{ resume.courseTitle }} — {{ resume.topic }} ({{ resume.progress }}%)</p>
            </div>
          </div>
        </button>
      </section>

      <!-- Library rail (PDF-first) -->
      <section class="px-4 mt-6">
        <div class="flex items-center justify-between">
          <h3 class="section-heading">Nursing 200L • Library (PDF)</h3>
          <RouterLink to="/library" class="link">View all</RouterLink>
        </div>
        <div class="mt-2 overflow-x-auto -mx-4 px-4 pb-1 no-scrollbar">
          <div class="flex gap-3">
            <article v-for="p in pdfs" :key="p.id" class="lib-card" @click="openPdf(p)">
              <div class="lib-row">
                <div class="lib-icon">📄</div>
                <div class="min-w-0">
                  <h4 class="lib-title">{{ p.title }}</h4>
                  <p class="lib-sub">{{ p.course }}</p>
                </div>
                <span class="lib-badge">{{ p.size }}</span>
              </div>
              <p class="lib-desc">{{ p.desc }}</p>
            </article>
            <SkeletonCard v-if="isLoadingDocs && !pdfs.length" />
          </div>
        </div>
      </section>

      <!-- Recommended today -->
      <section class="px-4 mt-6">
        <div class="flex items-center justify-between">
          <h3 class="section-heading">Recommended Today</h3>
          <button class="link" @click="refreshRecommendations">Refresh</button>
        </div>
        <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <RouterLink v-for="rec in recommendations" :key="rec.id + rec.to" :to="rec.to" class="rounded-xl bg-white p-4 shadow active:scale-[0.99] transition">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h4 class="font-semibold truncate">{{ rec.title }}</h4>
                <p class="text-[12px] text-gray-600 mt-0.5">{{ rec.badge }}</p>
              </div>
              <span class="text-[11px] px-2 py-1 rounded bg-[#003F7F]/10 text-[#003F7F]">{{ rec.tag }}</span>
            </div>
            <p class="mt-3 text-sm text-gray-700 line-clamp-2">{{ rec.desc }}</p>
          </RouterLink>
          <div v-if="!recommendations.length && !isLoadingRecs" class="text-sm text-gray-600">No recommendations yet.</div>
          <SkeletonCard v-if="isLoadingRecs && !recommendations.length" />
        </div>
      </section>

      <!-- Study Room (Community) -->
      <section class="px-4 mt-6">
        <div class="flex items-center justify-between">
          <h3 class="section-heading">Study Room • Nursing 200L</h3>
          <div class="flex items-center gap-3">
            <RouterLink to="/community" class="link">See all</RouterLink>
            <RouterLink to="/community?new=1" class="text-[12px] rounded-lg bg-[#003F7F] text-white px-3 py-1.5 font-semibold">New Thread</RouterLink>
          </div>
        </div>

        <div class="mt-2 space-y-2">
          <article
            v-for="t in communityThreads"
            :key="t.id"
            class="rounded-xl bg-white p-4 shadow active:scale-[0.99] transition"
            @click="openThread(t)"
          >
            <h4 class="font-semibold text-[14px] mb-1 line-clamp-1">{{ t.title }}</h4>
            <p class="text-[13px] text-gray-700 line-clamp-2">{{ t.preview }}</p>
            <div class="mt-2 text-[11px] text-gray-600 flex items-center gap-3">
              <span>💬 {{ t.reply_count }}</span>
              <span>👍 {{ t.like_count }}</span>
              <span>• {{ ago(t.created_at) }}</span>
            </div>
          </article>

          <SkeletonCard v-if="isLoadingCommunity && !communityThreads.length" />
          <div v-if="!communityThreads.length && !isLoadingCommunity" class="text-[12px] text-gray-500">
            No threads yet — be the first to start a study thread!
          </div>
        </div>
      </section>

      <!-- Anatomy quick access -->
      <section class="px-4 mt-6">
        <div class="flex items-center justify-between">
          <h3 class="section-heading">Anatomy • Lower Limb</h3>
          <RouterLink :to="pdfs.find(p=>p.id==='lower-limb')?.to || '#'" class="link">Open PDF</RouterLink>
        </div>
        <div class="mt-2 grid grid-cols-2 gap-2">
          <button v-for="m in anatomyTopics" :key="m.id" class="chip w-full text-left" @click="openTopic(m)">
            {{ m.title }}
          </button>
          <div v-if="!anatomyTopics.length && !isLoadingAnchors" class="text-[12px] text-gray-500">No anchors yet.</div>
        </div>
      </section>

      <!-- Ask Tutor CTA -->
      <section class="px-4 mt-8 mb-2">
        <RouterLink to="/ask" class="block rounded-2xl bg-white p-4 shadow text-center active:scale-[0.99] transition">
          <div class="text-[14px] font-semibold text-[#003F7F] mb-0.5">Need help? Ask the Tutor</div>
          <div class="text-[13px] text-gray-600 mb-2">Get step-by-step explanations from your PDFs.</div>
          <div class="inline-flex items-center gap-2 rounded-xl bg-[#003F7F] px-4 py-2 text-white text-[13px] font-semibold">🤖 Start chatting</div>
        </RouterLink>
      </section>
    </main>

    <!-- FAB -->
    <button
      class="fixed bottom-[88px] right-4 h-12 w-12 rounded-full bg-[#003F7F] text-white shadow-lg grid place-items-center text-2xl active:scale-95"
      @click="startQuickDrill" aria-label="Quick Drill"
    >⚡</button>

    <!-- Bottom tabs -->
    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'

const router = useRouter()
const safeTop = 'env(safe-area-inset-top)'

// -------- API base ----------
const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  '/api'

async function fetchJSON(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...init })
  const data = await res.json().catch(() => ({}))
  if (!res.ok || data?.ok === false) {
    const msg = data?.error || `HTTP ${res.status}`
    throw new Error(msg)
  }
  return data
}

// ----------------- State -----------------
const userName = ref<string>('')         
const unreadCount = ref<number>(0)       

const isLoadingDocs = ref(false)
const isLoadingRecs = ref(false)
const isLoadingAnchors = ref(false)
const isLoadingCommunity = ref(false)

type Pdf = { id:string; title:string; course:string; size:string; desc:string; to:string }
const pdfs = ref<Pdf[]>([])

type Rec = { id:string; title:string; desc:string; tag:string; badge:string; to:string }
const recommendations = ref<Rec[]>([])

type Thread = { id:number|string; title:string; preview:string; reply_count:number; like_count:number; created_at:string }
const communityThreads = ref<Thread[]>([])

const anatomyTopics = ref<any[]>([])

// Search
const q = ref('')
const isSearching = ref(false)
const searchError = ref<string|null>(null)
const results = ref<any[]>([])
const showResults = computed(() => q.value.trim().length > 0)
let timer: number | null = null

// Resume practice
type Resume = { courseId: string; courseTitle: string; topic: string; progress: number; sessionId: string }
const resume = ref<Resume | null>(null)

// ----------------- Loaders -----------------
async function loadUser() {
  try {
    const data = await fetchJSON('/user.php?action=me')
    userName.value = data?.user?.name || 'Student'
  } catch { userName.value = 'Student' }
}
async function loadNotifications() {
  try {
    const data = await fetchJSON('/notifications.php?action=count')
    unreadCount.value = Number(data?.unread || 0)
  } catch { unreadCount.value = 0 }
}
async function loadDocs() {
  isLoadingDocs.value = true
  try {
    const data = await fetchJSON('/documents.php?action=list')
    const items = (data?.items || []) as Array<{slug:string; title:string; tag:string; course:string}>
    pdfs.value = items.slice(0, 5).map(d => ({
      id: d.slug,
      title: d.title,
      course: d.course || d.tag,
      size: 'PDF',
      desc: `${d.tag} • ${d.course}`,
      to: `/reader?n=${d.slug}`
    }))
  } catch (e:any) {
    console.warn('docs load error:', e?.message)
    pdfs.value = []
  } finally { isLoadingDocs.value = false }
}
async function loadLowerLimbAnchors() {
  isLoadingAnchors.value = true
  try {
    const data = await fetchJSON('/documents.php?action=show&slug=lower-limb')
    const anchors = (data?.anchors || []) as Array<{anchor:string; page:number}>
    anatomyTopics.value = anchors.slice(0, 8).map(a => ({
      id: a.anchor,
      title: a.anchor.replace(/[-_]/g,' ').replace(/\b\w/g, s => s.toUpperCase()),
      to: `/library/highlight?n=lower-limb&u=${encodeURIComponent(a.anchor)}`
    }))
  } catch {} finally { isLoadingAnchors.value = false }
}
async function loadRecommendations() {
  isLoadingRecs.value = true
  try {
    const data = await fetchJSON('/recommendations.php')
    recommendations.value = (data?.items || []) as Rec[]
  } catch (e:any) {
    console.warn('recs error:', e?.message)
    recommendations.value = []
  } finally { isLoadingRecs.value = false }
}
async function loadResumeFromAPI() {
  try {
    const data = await fetchJSON('/sessions.php?action=resume')
    resume.value = data?.resume || null
  } catch { resume.value = null }
}
async function loadCommunity() {
  isLoadingCommunity.value = true
  try {
    const data = await fetchJSON('/community.php?action=threads&room=nursing-200l&limit=3')
    communityThreads.value = (data?.items || []) as Thread[]
  } catch (e:any) {
    console.warn('community error:', e?.message)
    communityThreads.value = []
  } finally { isLoadingCommunity.value = false }
}

// ----------------- Search -----------------
function onSearchInput(){
  if (timer) window.clearTimeout(timer)
  timer = window.setTimeout(runSearch, 200)
}
async function runSearch(){
  const term = q.value.trim()
  if (!term){ results.value = []; return }
  isSearching.value = true
  searchError.value = null
  try{
    const data = await fetchJSON(`/search.php?q=${encodeURIComponent(term)}&limit=10`)
    results.value = data?.results || []
  }catch(e:any){
    searchError.value = e?.message || 'Search error'
    results.value = []
  }finally{
    isSearching.value = false
  }
}
function goToResult(r:any){ q.value = ''; results.value = []; if (r.to) router.push(r.to) }

// ----------------- UI actions -----------------
function openPdf(p:Pdf){ router.push(p.to) }
function openTopic(m:any){ router.push(m.to) }

// ✅ FIX: send users to the real Quick Drill route
function startQuickDrill () {
  router.push({ name: 'quick-drill', query: { pack: 'nursing-200l', limit: 5 } })
}

function openMenu(){ router.push('/menu') }
function goNotifications(){ router.push('/notifications') }
function refreshRecommendations(){ loadRecommendations() }
function resumePractice(){ if (!resume.value) return; router.push(`/practice/${resume.value.courseId}?session=${resume.value.sessionId}`) }
function openThread(t: any){ router.push(`/community/thread/${t.id}`) }

// ----------------- Utils -----------------
function ago(dateOrTs: string | number){
  const ts = typeof dateOrTs === 'number' ? dateOrTs : Date.parse(dateOrTs.replace(' ', 'T'))
  const s = Math.max(0, Math.floor((Date.now() - ts)/1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s/60); if (m < 60) return `${m}m ago`
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`
  const d = Math.floor(h/24); return `${d}d ago`
}

// ----------------- Init -----------------
onMounted(async () => {
  await Promise.all([
    loadUser(),
    loadNotifications(),
    loadDocs(),
    loadLowerLimbAnchors(),
    loadRecommendations(),
    loadResumeFromAPI(),
    loadCommunity()
  ])
})
</script>

<script lang="ts">
export default {
  components: {
    SkeletonCard: {
      template: `
        <div class="rounded-xl bg-white p-4 shadow animate-pulse">
          <div class="h-4 w-2/3 bg-gray-200 rounded"></div>
          <div class="h-3 w-1/3 bg-gray-200 rounded mt-2"></div>
          <div class="h-16 w-full bg-gray-100 rounded mt-4"></div>
        </div>
      `
    }
  }
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

/* Palette-tuned bits */
.section-heading { @apply font-semibold text-[15px]; color:#003F7F; }
.link { @apply text-[12px] font-semibold; color:#003F7F; }
.chip { @apply shrink-0 px-3 py-2 rounded-full bg-white text-[13px] border border-gray-200 active:scale-[0.98] transition; }

.qa-card { @apply rounded-xl bg-white p-3 text-center shadow active:scale-[0.98] transition; }
.qa-icon { @apply text-2xl mb-1; }
.qa-title { @apply text-[12px] font-semibold leading-tight; color:#003F7F; }
.qa-sub { @apply text-[11px] text-gray-600 -mt-0.5; }

.lib-card { @apply min-w-[260px] w-[260px] rounded-xl bg-white p-4 shadow active:scale-[0.99] transition; }
.lib-row { @apply flex items-start justify-between gap-3; }
.lib-icon { @apply w-10 h-10 rounded-xl grid place-items-center bg-[#003F7F]/10 text-[#003F7F]; }
.lib-title { @apply font-semibold truncate; }
.lib-sub { @apply text-[12px] text-gray-600 mt-0.5; }
.lib-badge { @apply text-[11px] px-2 py-1 rounded bg-[#003F7F]/10 text-[#003F7F]; }
.lib-desc { @apply mt-3 text-sm text-gray-700 line-clamp-2; }
</style>
