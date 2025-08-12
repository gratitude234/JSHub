<template>
  <div class="min-h-screen flex flex-col bg-[#F7F9FC] text-[#2C3E50]">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      🤖 AI Study Tools
    </header>

    <!-- Under Construction Notice -->
    <div class="bg-yellow-100 text-yellow-800 text-sm px-4 py-3 text-center flex items-center justify-center gap-2">
      🚧 This page is still under construction. Some tools may not work yet.
    </div>

    <!-- Toolbar -->
    <section
      class="bg-white border-b border-gray-200 p-3 flex flex-col sm:flex-row items-center gap-2 shadow-sm">
      <select
        v-model="selectedMode"
        class="flex-1 border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f7f]">
        <option value="chat">💬 Ask Anything</option>
        <option value="questions">📝 Generate Questions</option>
        <option value="explanation">🧠 Explain a Concept</option>
        <option value="summary">📄 Summarize Notes</option>
        <option value="correction">✅ Check My Answer</option>
        <option value="flashcards">🗂️ Create Flashcards</option>
      </select>

      <button
        @click="toggleVoice"
        class="flex items-center gap-1 bg-[#003f7f] text-white px-3 py-2 rounded-lg text-sm shadow disabled:opacity-50"
        :disabled="recordingUnsupported">
        <span v-if="!recording">🎤 Speak</span>
        <span v-else class="animate-pulse">⏹ Stop</span>
      </button>
    </section>

    <!-- Messages -->
    <main ref="chatBox" class="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
      <template v-if="messages.length === 0 && !aiLoading">
        <p class="text-sm text-center text-gray-500">
          Start by asking a question, selecting a tool, or uploading a PDF.
        </p>
      </template>

      <div
        v-for="(msg, idx) in messages"
        :key="idx"
        :class="[
          'max-w-xs md:max-w-md rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words',
          msg.role === 'user'
            ? 'bg-[#003f7f] text-white self-end'
            : 'bg-gray-100 text-[#2C3E50] self-start'
        ]">
        <template v-if="msg.type === 'pdf'">
          <span class="italic text-xs">📄 {{ msg.filename }}</span>
        </template>
        <div v-html="msg.content" />

        <div
          v-if="msg.role === 'assistant' && idx === messages.length - 1"
          class="mt-2 flex gap-2 text-xs">
          <button @click="quickFollow('Explain deeper')" class="text-[#003f7f] underline">
            Explain deeper
          </button>
          <button @click="quickFollow('Give an example')" class="text-[#003f7f] underline">
            Give an example
          </button>
          <button @click="quickFollow('Quiz me')" class="text-[#003f7f] underline">
            Quiz me
          </button>
        </div>
      </div>

      <div
        v-if="aiLoading"
        class="self-start bg-gray-100 text-[#2C3E50] rounded-xl px-3 py-2 text-sm">
        <span class="animate-pulse">🧠 Thinking…</span>
      </div>
    </main>

    <!-- Composer -->
    <footer class="border-t bg-white p-3 space-y-2">
      <textarea
        v-model="userInput"
        rows="2"
        :placeholder="placeholder"
        class="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#003f7f]"
        @keydown.enter.prevent="sendText" />

      <div class="flex items-center gap-2">
        <input type="file" accept=".pdf" @change="handleFileUpload" class="text-sm" />
        <button
          class="ml-auto bg-[#003f7f] text-white px-4 py-2 rounded font-semibold disabled:opacity-50 flex items-center gap-1"
          :disabled="aiLoading || (!userInput.trim() && !pendingPdf)"
          @click="sendText">
          🚀 Send
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, computed } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker?url'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

const messages             = ref([])
const userInput            = ref('')
const aiLoading            = ref(false)
const selectedMode         = ref('chat')
const recording            = ref(false)
const recordingUnsupported = !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
const pendingPdf           = ref(false)

let recognition = null
if (!recordingUnsupported) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  recognition = new SpeechRecognition()
  recognition.lang = 'en-US'
  recognition.interimResults = false
  recognition.onresult = e => {
    userInput.value = e.results[0][0].transcript
    sendText()
  }
  recognition.onend = () => (recording.value = false)
}
function toggleVoice () {
  if (recordingUnsupported) return
  if (recording.value) {
    recognition.stop()
    recording.value = false
  } else {
    recognition.start()
    recording.value = true
  }
}

const placeholder = computed(() => {
  switch (selectedMode.value) {
    case 'questions':   return 'Paste notes or ask to generate questions…'
    case 'explanation': return 'Type a concept you need explained…'
    case 'summary':     return 'Paste text to summarize…'
    case 'correction':  return 'Paste your answer to check…'
    case 'flashcards':  return 'Paste notes to convert to flashcards…'
    default:            return 'Ask me anything…'
  }
})

const chatBox = ref(null)
watch(messages, async () => {
  await nextTick()
  chatBox.value?.scrollTo({ top: chatBox.value.scrollHeight, behavior: 'smooth' })
  localStorage.setItem('ai_chat_history', JSON.stringify(messages.value))
})

onMounted(() => {
  const saved = localStorage.getItem('ai_chat_history')
  if (saved) messages.value = JSON.parse(saved)
})

function pushMessage (msg) {
  if (msg.role === 'assistant') {
    msg.content = DOMPurify.sanitize(marked.parse(msg.content))
  }
  messages.value.push(msg)
}

async function sendText () {
  if (pendingPdf.value) {
    await queryAssistant(pendingPdf.value, selectedMode.value)
    pendingPdf.value = false
    return
  }
  const content = userInput.value.trim()
  if (!content) return
  pushMessage({ role: 'user', content })
  userInput.value = ''
  await queryAssistant(content, selectedMode.value)
}
function quickFollow (text) {
  userInput.value = text
  selectedMode.value = 'chat'
  sendText()
}

async function handleFileUpload (e) {
  const file = e.target.files[0]
  if (!file || file.type !== 'application/pdf') return
  pushMessage({ role: 'user', content: `Uploaded PDF – extracting text…`, type: 'pdf', filename: file.name })
  const text = await extractPdfText(file)
  if (text) {
    pendingPdf.value = text.slice(0, 15000)
    userInput.value  = ''
    selectedMode.value = 'questions'
  }
}
async function extractPdfText (file) {
  try {
    const buf  = await file.arrayBuffer()
    const pdf  = await pdfjsLib.getDocument({ data: buf }).promise
    let txt = ''
    for (let p = 1; p <= pdf.numPages; p++) {
      const page  = await pdf.getPage(p)
      const items = await page.getTextContent()
      txt += items.items.map(i => i.str).join(' ') + '\n'
      if (txt.length > 15000) break
    }
    return txt
  } catch (err) {
    pushMessage({ role: 'assistant', content: '❌ Failed to read that PDF.' })
    return ''
  }
}

async function queryAssistant (prompt, type = 'chat') {
  aiLoading.value = true
  try {
    const res  = await fetch('https://jabumarket.com.ng/api/ai_study_assistant.php', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ input: prompt, type })
    })
    const data = await res.json()
    pushMessage({ role: 'assistant', content: data.error || data.response || '⚠️ No reply.' })
  } catch (err) {
    pushMessage({ role: 'assistant', content: 'Network error: ' + err.message })
  } finally {
    aiLoading.value = false
  }
}
</script>

<style scoped>
main > div { animation: fade 0.3s ease }
@keyframes fade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
