<template>
  <div class="min-h-screen flex flex-col bg-[#F7F9FC] text-[#2C3E50]">
    <!-- 🔹 Header -->
    <header class="bg-[#003f7f] text-white py-4 px-4 flex items-center gap-3 shadow-md sticky top-0 z-10">
      <button @click="goBack" class="p-2 bg-white/10 rounded-full hover:bg-white/20 transition">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path fill-rule="evenodd"
                d="M14.78 4.22a.75.75 0 010 1.06L9.81 10.25H20a.75.75 0 010 1.5H9.81l4.97 4.97a.75.75 0 11-1.06 1.06l-6.25-6.25a.75.75 0 010-1.06l6.25-6.25a.75.75 0 011.06 0z"
                clip-rule="evenodd"/>
        </svg>
      </button>
      <div class="flex-1 min-w-0">
        <p class="font-semibold text-base truncate">Chat with {{ sellerName || '...' }}</p>
        <p class="text-xs text-white/70 truncate">Active chat</p>
      </div>
    </header>

    <!-- 🔸 Messages Area -->
    <main ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-4 space-y-3 mb-[72px]">
      <template v-if="messages.length">
        <transition-group name="fade" tag="div">
          <div
            v-for="(msg, idx) in messages"
            :key="msg.id || idx"
            :class="[
              'flex mb-2',
              msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'
            ]"
          >
            <div :class="bubbleClass(msg)">
              <p>{{ msg.message }}</p>
              <span class="block text-[10px] opacity-60 text-right mt-1">
                {{ formatTime(msg.timestamp) }}
              </span>
            </div>
          </div>
        </transition-group>
      </template>
      <p v-else class="text-center text-gray-400 text-sm mt-20">
        No messages yet. Start the conversation 💬
      </p>
    </main>

    <!-- 📨 Input -->
    <form @submit.prevent="sendMessage"
          class="fixed bottom-0 left-0 right-0 bg-white px-4 py-3 flex items-end gap-3 shadow-md z-20">
      <textarea
        v-model="newMessage"
        placeholder="Type something..."
        rows="1"
        @keydown.enter.exact.prevent="sendMessage"
        class="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2 text-sm leading-tight
               focus:outline-none focus:ring-2 focus:ring-[#003f7f] transition overflow-hidden"
      ></textarea>
      <button
        type="submit"
        :disabled="sending || !newMessage.trim()"
        class="w-10 h-10 flex items-center justify-center bg-[#003f7f] rounded-full
               hover:bg-[#002b60] transition disabled:opacity-40"
      >
        <svg v-if="sending" xmlns="http://www.w3.org/2000/svg"
             class="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24"
             stroke="currentColor">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z"/>
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 rotate-90" viewBox="0 0 24 24"
             fill="white">
          <path
            d="M3.21 2.39a.75.75 0 01.83-.11l16 7.5a.75.75
               0 010 1.34l-16 7.5A.75.75 0 013 18.01v-5.69a.75.75
               0 01.45-.69l9.27-3.63-9.27-3.63a.75.75
               0 01-.45-.69V2.99a.75.75 0 01.21-.6z"/>
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user' // ✅ Pinia import

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

if (!userStore.user?.id) {
  router.push('/login')
  throw new Error('User not logged in')
}

const senderId = userStore.user.id
const currentUserId = senderId
const receiverId = parseInt(route.params.receiverId)
const sellerName = ref('')

const newMessage = ref('')
const messages = ref([])
const chatContainer = ref(null)
const sending = ref(false)
let pollIntervalId

function goBack() {
  router.back()
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Africa/Lagos'
  })
}

function bubbleClass(msg) {
  return [
    'px-4 py-2 rounded-xl text-sm shadow max-w-[75%] whitespace-pre-line break-words',
    msg.sender_id === currentUserId
      ? 'bg-[#003f7f] text-white rounded-br-none'
      : 'bg-white text-[#2C3E50] border border-gray-200 rounded-bl-none'
  ]
}

async function fetchMessages() {
  try {
    const res = await fetch(
      `https://jabumarket.com.ng/api/messages.php?sender_id=${senderId}&receiver_id=${receiverId}`
    )
    const data = await res.json()
    messages.value = Array.isArray(data) ? data : []
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Error loading messages:', err)
  }
}

async function fetchSellerName() {
  try {
    const res = await fetch(
      `https://jabumarket.com.ng/api/get_user.php?id=${receiverId}`
    )
    const data = await res.json()
    if (data.name) sellerName.value = data.name
  } catch (err) {
    console.error('Error fetching seller name:', err)
  }
}

async function sendMessage() {
  const trimmed = newMessage.value.trim()
  if (!trimmed) return

  const msg = {
    sender_id: senderId,
    receiver_id: receiverId,
    message: trimmed,
    timestamp: new Date().toISOString()
  }

  messages.value.push(msg)
  newMessage.value = ''
  sending.value = true
  await nextTick()
  scrollToBottom()

  try {
    await fetch('https://jabumarket.com.ng/api/send_message.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(msg)
    })
    await fetchMessages()
  } catch (err) {
    console.error('Error sending message:', err)
  } finally {
    sending.value = false
  }
}

function scrollToBottom() {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

onMounted(() => {
  fetchMessages()
  fetchSellerName()
  pollIntervalId = setInterval(fetchMessages, 4000)
})

onUnmounted(() => clearInterval(pollIntervalId))
</script>


<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
</style>
