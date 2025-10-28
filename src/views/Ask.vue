<!-- src/views/Ask.vue (mobile-polished) -->
<template>
  <div class="min-h-dvh flex flex-col bg-[#F7F9FC] text-[#1f2a37]">
    <!-- APP BAR -->
    <header
      class="sticky top-0 z-50 backdrop-blur bg-[#003F7F]/95 text-white shadow-sm border-b border-white/10"
      :style="{ paddingTop: safeTop }"
    >
      <!-- Top row: back • title/subtitle • overflow -->
      <div class="mx-auto w-full max-w-[720px] h-12 px-2 flex items-center">
        <button class="btn-icon -ml-1" aria-label="Back" title="Go back" @click="$router.back()">
          <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M15.5 19.5L8 12l7.5-7.5"/></svg>
        </button>
        <div class="flex-1 min-w-0 text-center leading-tight">
          <div class="text-[15px] font-extrabold tracking-tight">Ask Tutor</div>
          <div class="text-[11px] opacity-90">{{ COURSE_LEVEL }}</div>
        </div>
        <button class="btn-icon -mr-1" aria-label="Menu" title="Menu" @click="toggle('menuOpen')">⋯</button>
      </div>

      <!-- Context row: Add/Show PDF chip + (optional) controls -->
      <div class="mx-auto w-full max-w-[720px] px-3 pb-2">
        <div class="flex items-center gap-2">
          <button class="pill" @click="toggle('ctxOpen')" :aria-expanded="ui.ctxOpen">
            <template v-if="!ctx.docSlug">＋ Add PDF for citations</template>
            <template v-else>
              📄 {{ docTitle }}<span v-if="ctx.anchor"> • {{ humanAnchor(ctx.anchor) }}</span>
            </template>
            <svg viewBox="0 0 24 24" class="h-4 w-4 ml-1 shrink-0" :class="ui.ctxOpen ? 'rotate-180' : ''"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
          </button>

          <!-- quick model switches kept compact -->
          <div class="seg ml-auto">
            <button class="seg-btn" :class="{ 'seg-active': tier==='flash' }" @click="setTier('flash')" aria-label="Flash" title="Fast/cheap">⚡</button>
            <button class="seg-btn" :class="{ 'seg-active': tier==='pro' }" @click="setTier('pro')" aria-label="Pro" title="Deeper reasoning">🧠</button>
          </div>
        </div>

        <!-- collapsible context + modes + anchors -->
        <div v-if="ui.ctxOpen" class="mt-2 space-y-2">
          <label class="sr-only" for="doc">PDF context</label>
          <select id="doc" v-model="ctx.docSlug" class="ctx-select" @change="onDocChange">
            <option value="">No PDF context</option>
            <option v-for="d in docs" :key="d.slug" :value="d.slug">{{ d.title }}</option>
          </select>

          <div v-if="!ctx.docSlug" class="text-[12px] text-gray-600">
            Tip: Select a PDF for grounded answers with citations.
            <RouterLink to="/library" class="underline">Open Library</RouterLink>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <div class="seg">
              <button class="seg-btn" :class="{ 'seg-active': mode==='chat' }" @click="setMode('chat')" title="Chat">💬</button>
              <button class="seg-btn" :class="{ 'seg-active': mode==='quiz' }" @click="setMode('quiz')" title="Quiz">📝</button>
              <button class="seg-btn" :class="{ 'seg-active': mode==='flash' }" @click="setMode('flash')" title="Cards">🎴</button>
              <button class="seg-btn" :class="{ 'seg-active': mode==='plan' }" @click="setMode('plan')" title="Plan">📅</button>
            </div>

            <button v-if="ctx.docSlug" class="tip ml-auto" @click="clearContext">Remove PDF</button>
          </div>

          <div v-if="anchors.length" class="relative">
            <div class="fade-left"></div>
            <div class="fade-right"></div>
            <div class="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 pt-1">
              <button class="chip" :class="!ctx.anchor ? 'chip-active' : ''" @click="onAnchorPick('')">All</button>
              <button v-for="a in anchors" :key="a.anchor" class="chip" :class="ctx.anchor===a.anchor ? 'chip-active' : ''" @click="onAnchorPick(a.anchor)">{{ humanAnchor(a.anchor) }}</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- MESSAGES -->
    <main
      ref="scroller"
      role="log"
      aria-live="polite"
      aria-relevant="additions text"
      class="flex-1 overflow-auto px-2 pb-2 pt-1 overscroll-contain"
      @scroll.passive="updateAtBottom"
    >
      <div class="max-w-[720px] mx-auto w-full">
        <div v-for="m in messages" :key="m.id" class="mb-2" :class="m.role==='user' ? 'text-right' : 'text-left'">
          <div
            class="inline-block max-w-[86%] rounded-2xl px-3 py-2.5 text-[14px] leading-relaxed shadow-sm border"
            :class="bubbleClass(m)"
          >
            <div v-if="m.role==='assistant'" class="prose" v-html="asHtml(m.content)"></div>
            <div v-else class="whitespace-pre-wrap">{{ m.content }}</div>

            <!-- Sources -->
            <div v-if="m.sources?.length" class="mt-2 flex flex-wrap gap-2">
              <RouterLink v-for="s in m.sources" :key="s.doc + (s.anchor||'') + (s.page||'')" class="source" :to="readerLink(s)">
                📄 {{ s.title || s.doc }}
                <template v-if="s.anchor">• {{ humanAnchor(s.anchor) }}</template>
                <template v-else-if="s.page">• p. {{ s.page }}</template>
              </RouterLink>
            </div>

            <!-- Suggestions -->
            <div v-if="m.role==='assistant' && m.suggestions?.length" class="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
              <button v-for="sug in m.suggestions" :key="sug" class="tip shrink-0" @click="draft = sug; focusComposerSoon()">{{ sug }}</button>
            </div>

            <!-- Compact action strip (icons) -->
            <div v-if="m.role==='assistant'" class="mt-2 flex items-center gap-1.5 text-xs text-[#4b5563]">
              <button class="icon-mini" title="Retry with Pro" @click="retryWithPro(m)">↻</button>
              <button class="icon-mini" title="Copy" @click="copyText(m.content)">📋</button>
              <button class="icon-mini" title="Listen" @click="toggleSpeak(m)">{{ speakingFor===m.id ? '⏹' : '🔊' }}</button>
              <button class="icon-mini" title="Save" @click="saveAnswer(m)">⭐</button>
              <button v-if="looksTruncated(m.content)" class="icon-mini" title="Continue" @click="draft='Continue'; focusComposerSoon(); nextTick(()=>send())">⤵︎</button>
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isSending" class="mb-2 text-left">
          <div class="inline-block rounded-2xl px-3 py-2.5 text-[14px] bg-white shadow-sm border">
            <span class="inline-block animate-pulse">Tutor is typing…</span>
            <button class="tip ml-2" @click="currentRequest?.cancel?.()">Cancel</button>
          </div>
        </div>
      </div>

      <!-- Scroll to bottom -->
      <button
        v-if="!atBottom"
        class="fixed right-3 bottom-[106px] h-10 w-10 rounded-full bg-white shadow-lg grid place-items-center border text-[#003F7F] active:scale-95"
        @click="scrollToBottomSmooth(true)"
        aria-label="Scroll to bottom"
      >↓</button>
    </main>

    <!-- QUICK PROMPTS (sticky above keyboard) -->
    <div class="sticky bottom-[64px] z-30">
      <div class="mx-auto w-full max-w-[720px] px-2">
        <div class="flex gap-2 overflow-x-auto no-scrollbar">
          <button class="tip shrink-0" @click="useTip('Explain this concept simply and cite the PDF section.')">Explain simply</button>
          <button class="tip shrink-0" @click="useTip('Summarize key steps and give a 5-bullet checklist.')">5-bullet checklist</button>
          <button class="tip shrink-0" @click="useTip('Create 5 MCQs with answers and 1-line rationales based on this topic.')">Make 5 MCQs</button>
          <button class="tip shrink-0" @click="useTip('Turn this into 10 flashcards. Keep answers ≤25 words.')">Flashcards</button>
        </div>
      </div>
    </div>

    <!-- COMPOSER -->
    <footer class="sticky bottom-0 bg-white border-t border-gray-200/70" :style="{ paddingBottom: safeBottom }" :aria-busy="isSending ? 'true' : 'false'">
      <div class="mx-auto w-full max-w-[720px] px-2 py-2 flex items-end gap-2 relative">
        <label for="composer" class="sr-only">Ask a question</label>
        <div class="relative flex-1">
          <textarea
            v-model="draft"
            id="composer"
            rows="1"
            ref="composerEl"
            @input="autosize"
            @keydown.enter.exact.prevent="send"
            @keydown.meta.enter.prevent="send"
            @keydown.ctrl.enter.prevent="send"
            @keydown.shift.enter.stop
            placeholder="Ask anything… Attach a PDF above for citations"
            class="w-full resize-none rounded-2xl border border-gray-300 px-3 py-[11px] pr-12 text-[15px] focus:outline-none bg-white"
          ></textarea>
          <button
            class="absolute right-1 bottom-1 h-10 w-10 rounded-full grid place-items-center bg-[#003F7F] text-white shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canSend"
            aria-label="Send"
            @click="send"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5"><path fill="currentColor" d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>
          </button>
        </div>
        <div class="text-[11px] text-gray-500 pr-1 min-w-[58px] text-right" :class="!tokenHint.ok ? 'text-red-600' : ''">~{{ tokenHint.approx }}/{{ tokenHint.cap }}</div>
      </div>
    </footer>

    <!-- OVERFLOW MENU (bottom sheet) -->
    <div v-if="ui.menuOpen" class="fixed inset-0 z-[60] bg-black/30" @click.self="ui.menuOpen=false">
      <div class="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl p-3 shadow-2xl">
        <div class="mx-auto w-full max-w-[720px]">
          <div class="h-1 w-10 bg-gray-200 rounded-full mx-auto mb-2"></div>
          <button class="menu-item" @click="ui.menuOpen=false; createThread({ keepContext:true, title:'New chat • keep PDF' })">New chat — keep current PDF</button>
          <button class="menu-item" @click="ui.menuOpen=false; createThread({ keepContext:false, clearContext:true, title:'New chat' })">New chat — no context</button>
          <button class="menu-item" @click="ui.menuOpen=false; setTier('pro'); createThread({ keepContext:true, title:'New chat • Pro' })">New chat — Pro mode</button>
          <hr class="my-2"/>
          <button class="menu-item" @click="ui.menuOpen=false; ui.savedOpen=true">Saved answers</button>
          <button class="menu-item" @click="ui.menuOpen=false; exportThread()">Export chat</button>
          <button class="menu-item" @click="ui.menuOpen=false; ui.helpOpen=true">Help / Shortcuts</button>
        </div>
      </div>
    </div>

    <!-- SAVED DRAWER -->
    <div v-if="ui.savedOpen" class="fixed inset-0 bg-black/30 z-[60]" @click.self="ui.savedOpen=false">
      <div class="absolute right-0 top-0 h-full w-full sm:w-[460px] bg-white shadow-xl p-4 overflow-auto">
        <div class="flex items-center justify-between mb-3">
          <h2 class="font-bold text-lg">⭐ Saved answers</h2>
          <button class="tip" @click="ui.savedOpen=false">Close</button>
        </div>

        <h3 class="font-semibold mt-1 mb-2">Chats</h3>
        <div v-if="!threads.length" class="text-sm text-gray-500">No chats yet.</div>
        <div v-for="t in threads" :key="t.id" class="flex items-center justify-between gap-2 py-1">
          <button class="text-left flex-1 truncate hover:underline" @click="switchThread(t.id)">
            {{ t.title }} <span class="text-gray-400">• {{ new Date(t.createdAt).toLocaleDateString() }}</span>
          </button>
          <button class="tip" @click="deleteThread(t.id)">Delete</button>
        </div>

        <hr class="my-3"/>

        <p v-if="!saved.length" class="text-sm text-gray-500">Nothing saved yet. Tap ⭐ under any answer.</p>
        <div v-for="s in saved" :key="s.id" class="mb-3 p-3 rounded-xl border">
          <div class="prose" v-html="asHtml(s.content)"></div>
          <div v-if="s.sources?.length" class="mt-2 flex flex-wrap gap-2">
            <RouterLink v-for="src in s.sources" :key="src.doc + (src.anchor||'') + (src.page||'')" class="source" :to="readerLink(src)">
              📄 {{ src.title || src.doc }}
              <template v-if="src.anchor">• {{ humanAnchor(src.anchor) }}</template>
              <template v-else-if="src.page">• p. {{ src.page }}</template>
            </RouterLink>
          </div>
          <div class="mt-2 flex gap-2">
            <button class="tip" @click="copyText(s.content)">Copy</button>
            <button class="tip" @click="removeSaved(s.id)">Remove</button>
          </div>
        </div>
      </div>
    </div>

    <!-- HELP MODAL -->
    <div v-if="ui.helpOpen" class="fixed inset-0 bg-black/30 z-[60]" @click.self="ui.helpOpen=false">
      <div class="max-w-[520px] mx-auto mt-20 bg-white rounded-2xl p-4 shadow-xl">
        <div class="flex items-center justify-between mb-2">
          <h2 class="font-bold text-lg">Shortcuts</h2>
          <button class="tip" @click="ui.helpOpen=false">Close</button>
        </div>
        <ul class="text-sm grid grid-cols-1 gap-1">
          <li><strong>Enter</strong>: Send • <strong>Shift+Enter</strong>: New line</li>
          <li><strong>Alt+1</strong>/<strong>Alt+2</strong>: Flash/Pro</li>
          <li><strong>C</strong>, <strong>Q</strong>, <strong>F</strong>, <strong>P</strong>: Chat/Quiz/Cards/Plan</li>
          <li><strong>N</strong>: New chat • <strong>S</strong>: Saved • <strong>E</strong>: Export • <strong>?</strong>: Help</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { RouterLink } from 'vue-router'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const safeTop = 'env(safe-area-inset-top)'
const safeBottom = 'env(safe-area-inset-bottom)'

/* ---------- Constants ---------- */
const COURSE_LEVEL = 'Nursing • 200-level'

/* ---------- API base ---------- */
const API_BASE =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE) ||
  '/api'

async function fetchJSON(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include', ...init })
  let data: any = null
  try { data = await res.json() }
  catch {
    const text = await res.text().catch(() => '')
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`)
    data = { ok: true, raw: text }
  }
  if (!res.ok || data?.ok === false) throw new Error(data?.error || `HTTP ${res.status}`)
  return data
}

/* ---------- Markdown (safe) ---------- */
const md = new MarkdownIt({ html:false, linkify:true, breaks:true })
const defaultLinkOpen = md.renderer.rules.link_open || ((t, i, o, e, s) => s.renderToken(t, i, o, e, s))
md.renderer.rules.link_open = (t, i, o, e, s) => {
  const idx = t[i].attrIndex('target')
  if (idx < 0) t[i].attrPush(['target', '_blank'])
  else t[i].attrs![idx][1] = '_blank'
  t[i].attrPush(['rel', 'noopener noreferrer'])
  return defaultLinkOpen(t, i, o, e, s)
}
function asHtml(text: string) {
  const html = md.render(text || '')
  return DOMPurify.sanitize(html)
}

/* ---------- Types ---------- */
type Doc = { id:number; slug:string; title:string; tag:string; course:string }
type Anchor = { anchor:string; page:number }
type Source = { doc:string; title?:string; anchor?:string; page?:number }
type Msg = { id:string; role:'user'|'assistant'; content:string; ts:number; sources?:Source[]; suggestions?:string[] }
type ThreadMeta = { id:string; title:string; createdAt:number; doc?:string; anchor?:string; mode?:string }

/* ---------- State ---------- */
const docs = ref<Doc[]>([])
const anchors = ref<Anchor[]>([])
const ctx = ref<{ docSlug:string; anchor:string }>({ docSlug:'', anchor:'' })
const tier = ref<'flash'|'pro'>(localStorage.getItem('ask_tier')==='pro' ? 'pro' : 'flash')

type Mode = 'chat'|'quiz'|'flash'|'plan'
const mode = ref<Mode>((localStorage.getItem('ask_mode') as Mode) || 'chat')

const messages = ref<Msg[]>([])
const draft = ref('')
const isSending = ref(false)

const scroller = ref<HTMLElement|null>(null)
const atBottom = ref(true)
const composerEl = ref<HTMLTextAreaElement|null>(null)

/* Threads */
const threadId = ref<string>(localStorage.getItem('ask_thread_id') || '')
const threads = ref<ThreadMeta[]>(loadThreads())

/* Saved answers + UI modals */
const saved = ref<Msg[]>(loadSaved())
const ui = ref({ savedOpen:false, helpOpen:false, newOpen:false, ctxOpen:false, menuOpen:false })

/* In-flight request control */
const currentRequest = ref<{ cancel: () => void } | null>(null)

/* ---------- Computed ---------- */
const canSend = computed(() => !!draft.value.trim() && !isSending.value)
const docTitle = computed(() => docs.value.find(d => d.slug === ctx.value.docSlug)?.title || 'Context')

function bubbleClass(m: Msg){
  if (m.role === 'user') return 'bg-[#003F7F] text-white border-[#003F7F]'
  if (m.content.startsWith('⚠️')) return 'bg-red-50 text-red-700 border-red-200'
  return 'bg-white text-[#1f2a37] border-gray-200'
}

/* ---------- Helpers ---------- */
function humanAnchor(a:string){ return a.replace(/[-_]/g,' ').replace(/\b\w/g, s => s.toUpperCase()) }
function readerLink(s: Source) {
  if (s.anchor) return `/library/highlight?n=${s.doc}&u=${encodeURIComponent(s.anchor)}`
  if (s.page)   return `/reader?n=${s.doc}&page=${s.page}`
  return `/reader?n=${s.doc}`
}
function updateAtBottom(){
  const el = scroller.value
  if (!el) return
  atBottom.value = (el.scrollHeight - el.scrollTop - el.clientHeight) < 30
}
function scrollToBottomSmooth(force=false){
  nextTick(() => {
    if (force || atBottom.value) scroller.value?.scrollTo({ top: 9e6, behavior: 'smooth' })
  })
}
function uid(){ return Math.random().toString(36).slice(2) }

/* Throttled save */
let saveT = 0
function saveThread(){
  const now = performance.now()
  if (now - saveT < 500) return
  saveT = now
  try{ localStorage.setItem(threadKey(), JSON.stringify(messages.value)) }catch{}
}

/* Threads: storage */
function loadThreads(): ThreadMeta[] {
  try { return JSON.parse(localStorage.getItem('ask_threads')||'[]') } catch { return [] }
}
function persistThreads(){
  try { localStorage.setItem('ask_threads', JSON.stringify(threads.value.slice(0,20))) } catch {}
}
function newThreadId(){ return Math.random().toString(36).slice(2) }

/* Thread-aware history key (per doc + thread) */
function threadKey(){
  const slug = ctx.value.docSlug || 'global'
  const id = threadId.value || 'default'
  return `ask_thread_${slug}_${id}`
}

function loadThread(){
  try{
    const raw = localStorage.getItem(threadKey())
    messages.value = raw ? JSON.parse(raw) : defaultGreeting()
  }catch{ messages.value = defaultGreeting() }
}

/* Greeting */
function defaultGreeting(): Msg[] {
  return [{ id: uid(), role: 'assistant', ts: Date.now(), content: 'Hi 👋 I’m your Tutor. Ask anything from your Nursing 200-level courses. Attach any PDF above for grounded answers — I’ll cite the exact section.' }]
}

function autosize(e?: any){
  const el = (e?.target as HTMLTextAreaElement) || composerEl.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(180, el.scrollHeight) + 'px'
}
function estTokens(s:string){ return Math.ceil(s.length / 4) }
const tokenHint = computed(() => {
  const historyTxt = messages.value.slice(-6).map(m=>m.content).join('\n')
  const approx = estTokens(historyTxt + '\n' + draft.value)
  const cap = 1500
  return { approx, cap, ok: approx < cap }
})

/* ---------- Auto-title helpers ---------- */
function isPlaceholderTitle(t?: string){ return !t || /^New chat/.test(t) }
function setThreadTitleOnce(title: string){
  const meta = threads.value.find(t => t.id === threadId.value)
  if (!meta) return
  if (isPlaceholderTitle(meta.title)) { meta.title = title; persistThreads() }
}

/* ---------- Data ---------- */
async function loadDocs(){
  try{ const data = await fetchJSON('/documents.php?action=list'); docs.value = data?.items || [] }catch{ docs.value = [] }
}
async function onDocChange(){
  anchors.value = []
  saveThread()
  if (!ctx.value.docSlug) { loadThread(); return }
  try {
    const data = await fetchJSON(`/documents.php?action=show&slug=${encodeURIComponent(ctx.value.docSlug)}`)
    anchors.value = data?.anchors || []
    const t = (docs.value.find(d => d.slug === ctx.value.docSlug)?.title) || 'Document'
    setThreadTitleOnce(t)
  } catch { anchors.value = [] }
  loadThread()
}
function onAnchorPick(anchor: string){
  ctx.value.anchor = anchor
  const t = (docs.value.find(d => d.slug === ctx.value.docSlug)?.title) || 'Document'
  setThreadTitleOnce(anchor ? `${t} — ${humanAnchor(anchor)}` : t)
}
function clearContext(){ ctx.value.docSlug=''; ctx.value.anchor=''; anchors.value = []; loadThread() }

/* ---------- Modes & Model ---------- */
function setMode(m:Mode){ mode.value = m; localStorage.setItem('ask_mode', m); vibrate(8) }
function setTier(t:'flash'|'pro'){ tier.value = t; localStorage.setItem('ask_tier', t); vibrate(8) }

/* ---------- Threads: create/switch/delete ---------- */
function ensureThreadId(){
  if (!threadId.value) { threadId.value = newThreadId(); localStorage.setItem('ask_thread_id', threadId.value) }
  if (!threads.value.find(t => t.id === threadId.value)) {
    threads.value.unshift({ id: threadId.value, title: 'New chat', createdAt: Date.now(), doc: ctx.value.docSlug || undefined, anchor: ctx.value.anchor || undefined, mode: mode.value })
    persistThreads()
  }
}
function createThread({ keepContext = true, clearContext = false, title = 'New chat' } = {}){
  const hasContent = draft.value.trim().length > 0 || messages.value.some(m => m.role==='user')
  if (hasContent && !confirm('Start a new chat? Your current conversation will remain in the thread list.')) return
  if (clearContext){ ctx.value.docSlug=''; ctx.value.anchor=''; anchors.value=[] }
  threadId.value = newThreadId(); localStorage.setItem('ask_thread_id', threadId.value)
  messages.value = defaultGreeting(); saveThread()
  const meta: ThreadMeta = { id: threadId.value, title, createdAt: Date.now(), doc: keepContext ? (ctx.value.docSlug || undefined) : undefined, anchor: keepContext ? (ctx.value.anchor || undefined) : undefined, mode: mode.value }
  threads.value.unshift(meta); if (threads.value.length > 20) threads.value.length = 20
  if (keepContext && ctx.value.docSlug) { const t = docs.value.find(d => d.slug === ctx.value.docSlug)?.title || 'Document'; setThreadTitleOnce(ctx.value.anchor ? `${t} — ${humanAnchor(ctx.value.anchor)}` : t) }
  persistThreads(); scrollToBottomSmooth(true)
}
function switchThread(id:string){
  const t = threads.value.find(x => x.id === id)
  if (t){ ctx.value.docSlug = t.doc || ''; ctx.value.anchor = t.anchor || '' }
  threadId.value = id; localStorage.setItem('ask_thread_id', id)
  if (ctx.value.docSlug) { onDocChange() } else { loadThread() }
  scrollToBottomSmooth(true)
}
function deleteThread(id:string){
  if (!confirm('Delete this chat permanently?')) return
  const t = threads.value.find(x => x.id === id)
  const slug = (t?.doc || 'global')
  localStorage.removeItem(`ask_thread_${slug}_${id}`)
  threads.value = threads.value.filter(x => x.id !== id)
  persistThreads()
  if (threadId.value === id){ if (threads.value[0]) switchThread(threads.value[0].id); else createThread() }
}

/* ---------- Actions ---------- */
function useTip(text:string){ draft.value = text; focusComposerSoon() }
function cleanServerError(e:any){ const raw = String(e?.message || 'Network error'); return raw.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim() }
function copyText(t: string){ navigator.clipboard?.writeText(t).catch(()=>{}) }
function retryWithPro(last: Msg) {
  setTier('pro')
  draft.value = `Go deeper and provide clinical reasoning. Base it on the selected PDF if provided.\n\nContext from previous answer:\n${last.content.slice(0, 500)}`
  nextTick(() => send())
}
function focusComposerSoon(){ nextTick(() => composerEl.value?.focus()) }

const speakingFor = ref<string|null>(null)
function toggleSpeak(m: Msg){
  if (!('speechSynthesis' in window)) return
  const synth = window.speechSynthesis
  if (speakingFor.value === m.id) { synth.cancel(); speakingFor.value = null; return }
  synth.cancel()
  const u = new SpeechSynthesisUtterance(stripMarkdown(m.content))
  const voices = synth.getVoices()
  const prefer = voices.find(v => /en(-|_)NG|en-GB|english/i.test(v.lang)) || voices[0]
  if (prefer) u.voice = prefer
  u.rate = 0.95
  u.onend = () => { speakingFor.value = null }
  speakingFor.value = m.id
  synth.speak(u)
}
function stripMarkdown(s:string){ return s.replace(/[#*_`>-]/g,'').replace(/\[(.+?)\]\(.+?\)/g,'$1') }

/* Saved answers */
function loadSaved(): Msg[] { try{ return JSON.parse(localStorage.getItem('ask_saved')||'[]') }catch{ return [] } }
function persistSaved(){ try{ localStorage.setItem('ask_saved', JSON.stringify(saved.value)) }catch{} }
function saveAnswer(m: Msg){ if (m.role!=='assistant') return; saved.value.unshift({ ...m, id: uid(), ts: Date.now() }); persistSaved(); ui.value.savedOpen = true }
function removeSaved(id: string){ saved.value = saved.value.filter(s => s.id !== id); persistSaved() }

/* Export chat */
function exportThread(){
  const rows = messages.value.map(m => {
    const who = m.role==='user' ? '**You**' : '**Tutor**'
    const src = (m.sources||[]).map(s => `> Source: ${s.title||s.doc}${s.anchor?` • ${humanAnchor(s.anchor)}`:''}${s.page?` • p.${s.page}`:''}`).join('\n')
    return `${who}\n\n${m.content}\n${src ? '\n'+src : ''}`
  })
  const md = `# Ask Tutor — ${COURSE_LEVEL}\n\n${rows.join('\n\n---\n\n')}\n`
  const blob = new Blob([md], {type:'text/markdown'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'ask-tutor-chat.md'; a.click(); URL.revokeObjectURL(url)
}

/* Truncation detector */
function looksTruncated(txt: string){ const t = (txt || '').trim(); if (t.length <= 60) return false; return (!/[.!?]"?$/.test(t) || /[:;–-]$/.test(t)) }

/* Timeout + cancel */
function withTimeout(ms: number){ const c = new AbortController(); const id = setTimeout(() => c.abort('Timeout'), ms); return { signal: c.signal, cancel: () => clearTimeout(id), controller: c } }

/* Micro-haptic feedback */
function vibrate(ms:number){ try{ (navigator as any).vibrate?.(ms) }catch{} }

/* Prevent double-send spam */
let lastSendAt = 0

/* Send */
async function send(){
  const now = Date.now(); if (now - lastSendAt < 600) return; lastSendAt = now
  let text = draft.value.trim(); if (!text) return
  isSending.value = true; vibrate(10)
  const topic = text
  if (mode.value === 'quiz') {
    text = `Create 5 MCQs (single best answer) from the topic below for ${COURSE_LEVEL}. Show answers with 1–2 line rationales and cite the selected PDF if applicable.\n\nTopic: ${topic}`
  } else if (mode.value === 'flash') {
    text = `Generate 10 concise Q→A flashcards (front/back) for ${COURSE_LEVEL}. Keep each answer ≤25 words; cite the PDF section if present.\n\nTopic: ${topic}`
  } else if (mode.value === 'plan') {
    text = `Make a focused 7-day study plan for ${COURSE_LEVEL} with daily goals, key readings (by anchor/page if PDF attached), and a quick self-check at the end of each day.\n\nFocus: ${topic}`
  }
  const myMsg: Msg = { id: uid(), role:'user', content: topic, ts: Date.now() }
  messages.value.push(myMsg)
  const meta = threads.value.find(t => t.id === threadId.value)
  if (meta && isPlaceholderTitle(meta.title)) { meta.title = topic.slice(0, 48) + (topic.length > 48 ? '…' : ''); persistThreads() }
  draft.value = ''; scrollToBottomSmooth(); saveThread()
  const { signal, cancel } = withTimeout(30000); currentRequest.value = { cancel }
  try{
    const history = messages.value.slice(-6).map(m => ({ role: m.role, content: m.content }))
    const body: any = { message: text, doc: ctx.value.docSlug || undefined, anchor: ctx.value.anchor || undefined, history, tier: tier.value, mode: mode.value, level: COURSE_LEVEL }
    const data = await fetchJSON('/ask.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal })
    const tutor: Msg = { id: uid(), role: 'assistant', content: (data?.reply || 'Sorry, I could not generate a response.'), ts: Date.now(), sources: (data?.sources || []).map((s:any) => ({ doc: s.slug || s.doc || ctx.value.docSlug || '', title: s.title, anchor: s.anchor, page: s.page })), suggestions: (data?.suggestions || []) }
    messages.value.push(tutor)
  }catch(e:any){ messages.value.push({ id: uid(), role: 'assistant', content: `⚠️ ${cleanServerError(e)}`, ts: Date.now() }) }
  finally{ isSending.value = false; currentRequest.value?.cancel?.(); currentRequest.value = null; scrollToBottomSmooth(); saveThread() }
}

/* ---------- Init ---------- */
onMounted(async () => {
  await loadDocs(); ensureThreadId(); loadThread(); autosize()
  window.addEventListener('keydown', (e) => {
    const tag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase()
    const isTyping = tag === 'textarea' || tag === 'input'
    if (isTyping && !e.altKey && !e.ctrlKey && !e.metaKey && e.key.length === 1) return
    if (e.key==='?' || (e.shiftKey && e.key==='/' )) { ui.value.helpOpen = true }
    if (e.key==='S' || e.key==='s') ui.value.savedOpen = true
    if (e.key==='E' || e.key==='e') exportThread()
    if (e.key==='C' || e.key==='c') setMode('chat')
    if (e.key==='Q' || e.key==='q') setMode('quiz')
    if (e.key==='F' || e.key==='f') setMode('flash')
    if (e.key==='P' || e.key==='p') setMode('plan')
    if (e.key==='N' || e.key==='n') createThread({ keepContext:true, title:'New chat • keep PDF' })
    if (e.altKey && e.key==='1') setTier('flash')
    if (e.altKey && e.key==='2') setTier('pro')
  })
})

/* tiny toggler helper */
function toggle(key: keyof typeof ui.value){ ui.value[key] = !ui.value[key] }
</script>

<style scoped>
/***** Utility tweaks *****/
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.overscroll-contain { overscroll-behavior: contain; }

/* Glass card */
.glass { background: rgba(255,255,255,0.92); backdrop-filter: saturate(160%) blur(6px); }

/* Buttons */
.btn-icon { @apply h-11 w-11 grid place-items-center rounded-full active:scale-95 hover:bg-white/10; }
.icon-mini { @apply h-8 px-2 rounded hover:bg-black/5 active:scale-95; min-width: 2rem; }

/* Context pill */
.pill { @apply inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/90 text-[#1f2a37] border border-gray-200 text-[12px] active:scale-95; }

/* Inputs */
.ctx-select { @apply w-full border rounded-xl px-3 py-2 text-[14px] bg-white text-[#1f2a37] border-gray-200; }

/* Chips & tips */
.chip { @apply shrink-0 px-3 py-1.5 rounded-full bg-white text-[12px] border border-gray-200 active:scale-[0.98] transition; }
.chip-active { @apply bg-[#003F7F] text-white border-[#003F7F]; }
.tip { @apply text-[12px] px-3 py-1.5 rounded-xl bg-white border border-gray-200 active:scale-95 shadow-sm; }
.source { @apply text-[12px] px-2 py-1 rounded bg-[#003F7F]/10 text-[#003F7F] font-semibold; }

/* Segmented controls */
.seg { @apply inline-flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden; }
.seg-btn { @apply px-2.5 py-1.5 text-[12px] font-medium; }
.seg-active { @apply bg-[#003F7F] text-white; }

/* Popover items */
.menu-item { @apply block w-full text-left px-3 py-2 hover:bg-gray-50 text-[14px]; }

/* Markdown look inside bubbles */
.prose :where(p){ margin: 0.25rem 0; }
.prose :where(ul){ padding-left: 1.15rem; margin: 0.25rem 0; list-style: disc; }
.prose :where(ol){ padding-left: 1.15rem; margin: 0.25rem 0; list-style: decimal; }
.prose :where(li){ margin: 0.1rem 0; }
.prose :where(strong){ font-weight: 700; }
.prose :where(em){ font-style: italic; }
.prose :where(code){ background:#f3f4f6; padding:2px 4px; border-radius:4px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
.prose :where(pre){ background:#f3f4f6; padding:0.75rem; border-radius:0.5rem; overflow:auto; }
.prose :where(a){ color:#003F7F; text-decoration: underline; }

/* Fades for horizontal chips */
.fade-left, .fade-right { position: absolute; top: 0; height: 100%; width: 1.5rem; pointer-events: none; }
.fade-left { left: 0; background: linear-gradient(to right, rgba(255,255,255,0.96), rgba(255,255,255,0)); border-top-left-radius: 1rem; border-bottom-left-radius: 1rem; }
.fade-right { right: 0; background: linear-gradient(to left, rgba(255,255,255,0.96), rgba(255,255,255,0)); border-top-right-radius: 1rem; border-bottom-right-radius: 1rem; }
</style>
