<!-- src/views/Ask.vue -->
<template>
  <div class="min-h-dvh bg-[#F7F9FC] text-[#2C3E50] flex flex-col">
    <!-- App Bar -->
    <header class="sticky top-0 z-50 bg-[#003F7F] text-white shadow" :style="{ paddingTop: safeTop }">
      <div class="px-4 py-2.5 flex items-center gap-3">
        <button class="h-10 w-10 grid place-items-center rounded-full active:scale-95" aria-label="Back" @click="$router.back()">←</button>
        <h1 class="flex-1 text-center font-extrabold tracking-wide text-[15px]">
          Ask Tutor <span class="opacity-80 font-semibold">• Nursing 200L</span>
        </h1>
        <div class="w-10" />
      </div>

      <!-- Context picker -->
      <div class="px-4 pb-3">
        <div class="rounded-xl bg-white/95 border border-white/20 p-3 text-[#2C3E50]">
          <div class="flex flex-wrap items-center gap-2">
            <!-- Document select -->
            <select v-model="ctx.docSlug" class="ctx-select" @change="onDocChange">
              <option value="">No PDF context</option>
              <option v-for="d in docs" :key="d.slug" :value="d.slug">{{ d.title }}</option>
            </select>

            <!-- Anchor (chip list) -->
            <div v-if="anchors.length" class="flex gap-2 overflow-x-auto no-scrollbar w-full pt-1">
              <button
                class="chip"
                :class="!ctx.anchor ? 'chip-active' : ''"
                @click="ctx.anchor=''"
              >All</button>
              <button
                v-for="a in anchors"
                :key="a.anchor"
                class="chip"
                :class="ctx.anchor===a.anchor ? 'chip-active' : ''"
                @click="ctx.anchor=a.anchor"
              >{{ humanAnchor(a.anchor) }}</button>
            </div>

            <!-- Quick tips -->
            <div class="w-full pt-2 flex gap-2 overflow-x-auto no-scrollbar">
              <button class="tip" @click="useTip('Explain this concept like I am a beginner, and cite the PDF section.')">Explain simply</button>
              <button class="tip" @click="useTip('Summarize the key steps and give a 5-bullet checklist.')">Give a checklist</button>
              <button class="tip" @click="useTip('Create 5 MCQs with answers and short explanations based on this topic.')">Make 5 MCQs</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Messages -->
    <main ref="scroller" class="flex-1 overflow-auto px-3 py-2">
      <div class="max-w-[720px] mx-auto w-full">
        <div
          v-for="m in messages"
          :key="m.id"
          class="mb-3"
          :class="m.role==='user' ? 'text-right' : 'text-left'"
        >
          <div
            class="inline-block max-w-[88%] rounded-2xl px-3 py-2.5 text-[14px] leading-relaxed shadow whitespace-pre-wrap"
            :class="m.role==='user' ? 'bg-[#003F7F] text-white' : 'bg-white text-[#2C3E50]'"
          >
            {{ m.content }}
            <!-- Sources -->
            <div v-if="m.sources?.length" class="mt-2 flex flex-wrap gap-2">
              <RouterLink
                v-for="s in m.sources"
                :key="s.doc + (s.anchor||'') + (s.page||'')"
                class="source"
                :to="readerLink(s)"
              >
                📄 {{ s.title || s.doc }} <template v-if="s.anchor">• {{ humanAnchor(s.anchor) }}</template>
                <template v-else-if="s.page">• p. {{ s.page }}</template>
              </RouterLink>
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isSending" class="mb-3 text-left">
          <div class="inline-block rounded-2xl px-3 py-2.5 text-[14px] bg-white shadow">
            <span class="inline-block animate-pulse">Tutor is typing…</span>
          </div>
        </div>
      </div>
    </main>

    <!-- Composer -->
    <footer class="sticky bottom-0 bg-white border-t border-gray-200/70 px-3 py-2">
      <div class="max-w-[720px] mx-auto w-full flex items-end gap-2">
        <textarea
          v-model="draft"
          rows="1"
          @input="autosize"
          @keydown.enter.exact.prevent="send"
          placeholder="Ask anything from your Nursing 200-level courses… (attach a PDF context above for citations)"
          class="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-[15px] focus:outline-none"
        />
        <button
          class="send"
          :disabled="!canSend"
          @click="send"
        >Send</button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter, RouterLink } from 'vue-router'

const router = useRouter()
const safeTop = 'env(safe-area-inset-top)'

// ---------- API base ----------
const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  '/api'
async function fetchJSON(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...init })
  const data = await res.json().catch(() => ({} as any))
  if (!res.ok || data?.ok === false) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

// ---------- Types ----------
type Doc = { id:number; slug:string; title:string; tag:string; course:string }
type Anchor = { anchor:string; page:number }
type Source = { doc:string; title?:string; anchor?:string; page?:number }
type Msg = { id:string; role:'user'|'assistant'; content:string; ts:number; sources?:Source[] }

// ---------- State ----------
const docs = ref<Doc[]>([])
const anchors = ref<Anchor[]>([])
const ctx = ref<{ docSlug:string; anchor:string }>({ docSlug:'', anchor:'' })

const messages = ref<Msg[]>([])
const draft = ref('')
const isSending = ref(false)

const scroller = ref<HTMLElement|null>(null)
const canSend = computed(() => draft.value.trim().length > 0 && !isSending.value)

// ---------- Helpers ----------
function humanAnchor(a:string){ return a.replace(/[-_]/g,' ').replace(/\b\w/g, s => s.toUpperCase()) }
function readerLink(s: Source) {
  if (s.anchor) return `/library/highlight?n=${s.doc}&u=${encodeURIComponent(s.anchor)}`
  if (s.page)   return `/reader?n=${s.doc}&page=${s.page}`
  return `/reader?n=${s.doc}`
}
function scrollToBottom(){ nextTick(() => scroller.value?.scrollTo({ top: 9e6, behavior: 'smooth' })) }
function uid(){ return Math.random().toString(36).slice(2) }

// Persist per-doc (or global if no doc)
function threadKey(){ return `ask_thread_${ctx.value.docSlug || 'global'}` }
function saveThread(){ try{ localStorage.setItem(threadKey(), JSON.stringify(messages.value)) }catch{} }
function loadThread(){
  try{
    const raw = localStorage.getItem(threadKey())
    messages.value = raw ? JSON.parse(raw) : defaultGreeting()
  }catch{ messages.value = defaultGreeting() }
}
function defaultGreeting(): Msg[] {
  return [{
    id: uid(),
    role: 'assistant',
    ts: Date.now(),
    content:
      "Hi 👋 I’m your Tutor. Ask anything from your Nursing 200-level courses. " +
      "Attach any PDF above for grounded answers — I’ll cite the exact section."
  }]
}

function autosize(e: any){
  const el = e?.target as HTMLTextAreaElement
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(180, el.scrollHeight) + 'px'
}

// ---------- Loaders ----------
async function loadDocs(){
  try{
    const data = await fetchJSON('/documents.php?action=list')
    docs.value = data?.items || []
  }catch{ docs.value = [] }
}
async function onDocChange(){
  anchors.value = []
  saveThread()  // save previous thread state
  if (!ctx.value.docSlug) { loadThread(); return }
  try {
    const data = await fetchJSON(`/documents.php?action=show&slug=${encodeURIComponent(ctx.value.docSlug)}`)
    anchors.value = data?.anchors || []
  } catch { anchors.value = [] }
  // switch thread memory when changing context
  loadThread()
}

// ---------- Actions ----------
function useTip(text:string){ draft.value = text }

async function send(){
  const text = draft.value.trim()
  if (!text) return
  isSending.value = true
  const myMsg: Msg = { id: uid(), role:'user', content: text, ts: Date.now() }
  messages.value.push(myMsg)
  draft.value = ''
  scrollToBottom()
  saveThread()

  try{
    // Short convo history (last 6 turns)
    const history = messages.value.slice(-6).map(m => ({ role: m.role, content: m.content }))
    const body = {
      message: text,
      doc: ctx.value.docSlug || undefined,
      anchor: ctx.value.anchor || undefined,
      history
    }
    const data = await fetchJSON('/ask.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const tutor: Msg = {
      id: uid(),
      role: 'assistant',
      content: (data?.reply || 'Sorry, I could not generate a response.'),
      ts: Date.now(),
      sources: (data?.sources || []).map((s:any) => ({
        doc: s.slug || s.doc || ctx.value.docSlug || '',
        title: s.title,
        anchor: s.anchor,
        page: s.page
      }))
    }
    messages.value.push(tutor)
  }catch(e:any){
    messages.value.push({
      id: uid(),
      role: 'assistant',
      content: `⚠️ ${e?.message || 'Network error'}`,
      ts: Date.now()
    })
  }finally{
    isSending.value = false
    scrollToBottom()
    saveThread()
  }
}

// ---------- Init ----------
onMounted(async () => {
  await loadDocs()
  loadThread()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

.ctx-select {
  @apply border border-white/30 rounded-lg px-3 py-2 text-[13px] bg-white/90 text-[#2C3E50];
  min-width: 180px;
}
.chip {
  @apply shrink-0 px-3 py-1.5 rounded-full bg-white text-[12px] border border-gray-200 active:scale-[0.98] transition;
}
.chip-active { @apply bg-[#003F7F] text-white border-[#003F7F]; }
.tip { @apply text-[12px] px-3 py-1.5 rounded-lg bg-white border border-gray-200 active:scale-95; }

.source {
  @apply text-[12px] px-2 py-1 rounded bg-[#003F7F]/10 text-[#003F7F] font-semibold;
}
.send {
  @apply rounded-xl bg-[#003F7F] text-white px-4 py-2 font-semibold active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
