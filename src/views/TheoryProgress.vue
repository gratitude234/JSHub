<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-24">
    <!-- ▸ Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      📖 My Theory Progress
    </header>

    <section class="p-4 space-y-4">
      <!-- ▸ Stats Overview -->
      <div v-if="!loading && progress.length > 0" class="bg-white rounded-xl p-4 border-l-4 border-[#28a745] shadow">
        <p class="text-sm font-semibold">🧠 You've answered {{ progress.length }} theory questions.</p>
        <p class="text-sm">🎯 Average Score: <span :class="scoreColor">{{ averageScore.toFixed(2) }} / 5</span></p>
        <div class="w-full mt-2 bg-gray-200 h-2 rounded">
          <div
            class="h-2 bg-gradient-to-r from-[#28a745] to-green-400 rounded transition-all"
            :style="{ width: (averageScore / 5) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <!-- ▸ Filters -->
      <div class="flex flex-col sm:flex-row gap-2">
        <select v-model="selectedCourse" class="flex-1 p-2 border rounded-lg text-sm focus:outline-none">
          <option value="">All Courses</option>
          <option v-for="code in courseCodes" :key="code" :value="code">{{ code }}</option>
        </select>
        <select v-model="selectedTopic" class="flex-1 p-2 border rounded-lg text-sm focus:outline-none">
          <option value="">All Topics</option>
          <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <!-- ▸ Entries -->
      <div v-if="filteredProgress.length > 0" class="space-y-4">
        <div
          v-for="(item, index) in filteredProgress"
          :key="index"
          class="bg-white p-4 rounded-xl shadow border-l-4 border-[#003f7f]"
        >
          <div class="text-xs text-gray-400 mb-1">
            {{ item.course_code }} • {{ item.topic }} • {{ formatDate(item.submitted_at) }}
          </div>
          <p class="font-semibold text-[#003f7f] mb-2" v-html="stripHtml(item.question_text)"></p>

          <p class="text-sm"><strong>Your Answer:</strong> {{ item.answer }}</p>

          <div class="mt-2 text-sm">
            <p><strong>Score:</strong>
              <span :class="scoreColorClass(item.ai_score)">
                {{ item.ai_score }} / 5
              </span>
            </p>
            <p v-if="item.ai_reason"><strong>Reason:</strong> {{ item.ai_reason }}</p>
            <p v-if="item.ai_suggestion"><strong>Suggestion:</strong> {{ item.ai_suggestion }}</p>

            <button
              v-if="item.ai_score < 3"
              @click="retakeQuestion(item.question_id)"
              class="mt-2 text-[#003f7f] text-xs underline hover:text-blue-800"
            >
              🔁 Retry this question
            </button>
          </div>
        </div>
      </div>

      <p v-if="!loading && filteredProgress.length === 0" class="text-center text-sm text-gray-500">
        No matching answers found.
      </p>
      <p v-if="loading" class="text-center text-sm text-gray-500">Loading progress…</p>
      <p v-if="error" class="text-center text-sm text-red-500">{{ error }}</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = useUserStore().user

const progress = ref([])
const loading = ref(true)
const error = ref('')
const selectedCourse = ref('')
const selectedTopic = ref('')

function formatDate(dt) {
  return new Date(dt).toLocaleString()
}

function stripHtml(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}

const averageScore = computed(() => {
  if (!progress.value.length) return 0
  const total = progress.value.reduce((sum, item) => sum + Number(item.ai_score || 0), 0)
  return total / progress.value.length
})

const scoreColor = computed(() => {
  if (averageScore.value >= 4) return 'text-green-600 font-bold'
  if (averageScore.value >= 3) return 'text-yellow-600 font-semibold'
  return 'text-red-600 font-semibold'
})

function scoreColorClass(score) {
  if (score >= 4) return 'text-green-600 font-bold'
  if (score >= 3) return 'text-yellow-600 font-semibold'
  return 'text-red-600 font-semibold'
}

const filteredProgress = computed(() => {
  return [...progress.value]
    .filter(item =>
      (!selectedCourse.value || item.course_code === selectedCourse.value) &&
      (!selectedTopic.value || item.topic === selectedTopic.value)
    )
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)) // Latest first
})

const courseCodes = computed(() => [...new Set(progress.value.map(p => p.course_code))])
const topics = computed(() => [...new Set(progress.value.map(p => p.topic))])

function retakeQuestion(questionId) {
  router.push({ name: 'TheoryDrill', query: { question_id: questionId } })
}

async function fetchProgress() {
  try {
    const res = await fetch(`/api/get_theory_progress.php?user_id=${user.id}`)
    const json = await res.json()
    if (json.success) {
      progress.value = json.data
    } else {
      error.value = json.error || 'Failed to load progress'
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchProgress)
</script>
