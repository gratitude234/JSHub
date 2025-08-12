<template>
  <!-- ░░ MAIN COMMENT ░░ -->
  <div
    class="border-b border-gray-200 last:border-none px-2 py-3"
  >
    <div
      class="flex items-start gap-3 rounded-lg hover:bg-gray-50 transition"
    >
      <!-- Avatar -->
      <div
        class="w-8 h-8 bg-[#003f7f] text-white rounded-full flex items-center justify-center
               text-[11px] font-bold shrink-0 shadow"
        :title="comment.username || 'User'"
      >
        {{ getInitials(comment.username) }}
      </div>

      <!-- Body -->
      <div class="flex-1 min-w-0">
        <!-- Name + date -->
        <div class="flex flex-wrap items-center gap-x-2 text-xs leading-snug">
          <span class="font-semibold text-[#2C3E50] truncate">
            {{ comment.username || 'User' }}
          </span>
          <span class="text-gray-400">
            {{ formatDate(comment.created_at) }}
          </span>
        </div>

        <!-- Text -->
        <p
          class="text-sm text-gray-800 whitespace-pre-line break-words mt-0.5"
        >
          {{ comment.comment }}
        </p>

        <!-- Actions -->
        <div class="mt-1">
          <button
            @click="toggleReply"
            class="text-xs text-[#003f7f] font-medium hover:underline focus:outline-none"
          >
            {{ replying ? 'Cancel' : 'Reply' }}
          </button>
        </div>

        <!-- ░░ REPLY INPUT ░░ -->
        <div
          v-if="replying"
          class="flex items-center gap-2 mt-2 animate-fade-in"
        >
          <input
            v-model="replyText"
            ref="inputRef"
            type="text"
            class="flex-1 border border-gray-300 rounded px-2 py-1 text-xs
                   focus:ring-[#003f7f] focus:border-[#003f7f]"
            placeholder="Write a reply…"
            @keydown.enter.prevent="submitReply"
          />
          <button
            @click="submitReply"
            :disabled="!replyText.trim() || loading"
            class="bg-[#003f7f] text-white text-xs font-semibold px-3 py-1 rounded
                   disabled:opacity-50"
          >
            <span v-if="loading" class="animate-spin inline-block">⏳</span>
            <span v-else>Post</span>
          </button>
        </div>
        <p v-if="error" class="text-xs text-red-500 mt-1">{{ error }}</p>

        <!-- ░░ REPLIES ░░ -->
        <div v-if="comment.replies?.length" class="mt-3">
          <button
            v-if="!showReplies"
            @click="showReplies = true"
            class="text-xs text-[#003f7f] hover:underline"
          >
            View {{ comment.replies.length }} repl{{ comment.replies.length > 1 ? 'ies' : 'y' }}
          </button>

          <button
            v-else
            @click="showReplies = false"
            class="text-xs text-[#003f7f] hover:underline mb-1"
          >
            Hide replies
          </button>

          <transition-group
            name="fade"
            tag="div"
            class="space-y-1 mt-2"
            v-if="showReplies"
          >
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="flex items-start gap-2 bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition"
            >
              <!-- Avatar -->
              <div
                class="w-5 h-5 bg-[#003f7f] text-white rounded-full flex items-center
                       justify-center text-[10px] font-bold shrink-0"
                :title="reply.username || 'User'"
              >
                {{ getInitials(reply.username) }}
              </div>

              <!-- Reply body -->
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-x-2 text-[11px] leading-tight">
                  <span class="font-semibold truncate">{{ reply.username || 'User' }}</span>
                  <span class="text-gray-400">{{ formatDate(reply.created_at) }}</span>
                </div>
                <p class="text-xs text-gray-700 break-words">{{ reply.comment }}</p>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

const props = defineProps({
  comment: Object,
  postId:  [String, Number],
})
const emit = defineEmits(['reply-submitted'])

const router      = useRouter()
const userStore   = useUserStore()
const { user }    = storeToRefs(userStore)

const replyText   = ref('')
const replying    = ref(false)
const loading     = ref(false)
const error       = ref('')
const showReplies = ref(false)
const inputRef    = ref(null)

function getInitials(name) {
  return name ? name.split(' ').map(w => w[0]).join('').toUpperCase() : 'U'
}

function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  return Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(d)
}

function toggleReply() {
  replying.value = !replying.value
  error.value = ''
  if (replying.value) {
    nextTick(() => inputRef.value?.focus())
  }
}

async function submitReply() {
  if (!user.value?.id) return router.push('/login')
  if (!replyText.value.trim()) return

  loading.value = true
  error.value = ''

  const fd = new FormData()
  fd.append('post_id', props.postId)
  fd.append('user_id', user.value.id)
  fd.append('comment', replyText.value)
  fd.append('parent_id', props.comment.id)

  try {
    const res = await fetch('https://jabumarket.com.ng/api/post_comment.php', {
      method: 'POST',
      body: fd
    })
    const data = await res.json()
    if (data.status === 'success') {
      replyText.value = ''
      replying.value = false
      showReplies.value = true
      emit('reply-submitted')
    } else {
      error.value = data.message || 'Something went wrong.'
    }
  } catch (e) {
    console.error(e)
    error.value = 'Network error. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Fade for replies */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

/* Simple fade-in for reply box */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}
</style>
