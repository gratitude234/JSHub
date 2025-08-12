<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      📚 Exam Mode
    </header>

    <div class="p-4 space-y-6">
      <!-- Timer Progress Bar -->
      <div v-if="examStarted && !submitted" class="h-2 bg-gray-300 rounded-full overflow-hidden">
        <div class="bg-red-500 h-full transition-all duration-500" :style="{ width: timerProgress + '%' }"></div>
      </div>

      <!-- Timer Text -->
      <div v-if="examStarted && !submitted" class="text-center text-lg text-red-600 font-bold">
        ⏱ Time Left: {{ formattedTime }}
      </div>

      <!-- Intro -->
      <div class="text-center text-sm text-gray-600">
        Simulate a real JABU exam. Choose your course and begin.
      </div>

      <!-- Selection Panel -->
      <div class="bg-white p-4 rounded-lg shadow space-y-4" v-if="!examStarted">
        <h2 class="text-lg font-semibold text-[#003f7f]">Select Exam Options</h2>

        <select v-model="selectedCourse" class="w-full border rounded px-4 py-2">
          <option disabled value="">Select Course</option>
          <option v-for="course in courseOptions" :key="course" :value="course">{{ course }}</option>
        </select>

        <select v-model="selectedCount" class="w-full border rounded px-4 py-2">
          <option disabled value="">How many questions?</option>
          <option :value="10">10 Questions</option>
          <option :value="20">20 Questions</option>
          <option :value="30">30 Questions</option>
          <option :value="60">All Available (60)</option>
        </select>

        <button @click="loadQuestions" class="w-full bg-[#003f7f] text-white py-2 rounded font-semibold hover:bg-[#002a5c]">
          Start Exam
        </button>
      </div>

      <!-- Exam Questions -->
      <div v-if="questions.length" class="space-y-8">
        <div v-for="(q, index) in questions" :key="q.id" :id="'question-' + index" class="bg-white p-4 rounded-lg shadow">
          <h3 class="font-semibold text-md mb-2">Q{{ index + 1 }}. {{ q.question_text }}</h3>

          <div class="space-y-2">
            <button
              v-for="(option, key) in getOptions(q)"
              :key="key"
              :disabled="q.answered || submitted"
              @click="selectAnswer(q, key)"
              class="w-full text-left px-4 py-3 rounded border transition"
              :class="getOptionClass(q, key)"
            >
              <span class="font-bold uppercase">{{ key }}.</span> {{ option }}
            </button>
          </div>

          <p v-if="submitted && q.question_explanation" class="text-sm text-gray-500 mt-2">
            💡 Explanation: {{ q.question_explanation }}
          </p>
        </div>

        <!-- Final Score -->
        <div v-if="submitted" class="text-center font-bold text-lg text-[#28a745]">
          🎉 Final Score: {{ score }} / {{ questions.length }}
        </div>

        <!-- Submit Button -->
        <div v-if="!submitted" class="text-center">
          <button @click="submitExam" class="bg-[#003f7f] text-white py-2 px-6 rounded font-semibold hover:bg-[#002a5c] mt-4">
            Submit Exam
          </button>
        </div>
      </div>
    </div>

    <!-- Time Up Modal -->
    <div v-if="timeUp" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg text-center shadow-xl">
        <h2 class="text-lg font-bold text-red-600">⏱ Time’s Up!</h2>
        <p class="text-sm text-gray-600">Submitting your answers automatically...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'

const selectedCourse = ref('')
const selectedCount = ref('')
const questions = ref([])
const score = ref(0)
const submitted = ref(false)
const examStarted = ref(false)
const timeUp = ref(false)
const courseOptions = ref([])

const user = ref(JSON.parse(localStorage.getItem('user') || '{}'))
const userId = user.value.id || null

// Timer
const timer = ref(0)
const totalTime = ref(0)
const timerInterval = ref(null)
const formattedTime = computed(() => {
  const minutes = Math.floor(timer.value / 60).toString().padStart(2, '0')
  const seconds = (timer.value % 60).toString().padStart(2, '0')
  return `${minutes}:${seconds}`
})
const timerProgress = computed(() => {
  return totalTime.value > 0 ? ((timer.value / totalTime.value) * 100).toFixed(2) : 0
})

// Load courses
onMounted(async () => {
  if (!userId) return
  try {
    const res = await fetch(`https://jabumarket.com.ng/api/get_courses.php?user_id=${userId}`)
    const data = await res.json()
    courseOptions.value = data.courses || data
  } catch (err) {
    console.error('❌ Failed to load courses:', err)
  }
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => window.removeEventListener('keydown', handleKeyPress))

function getOptions(q) {
  return {
    a: q.option_a,
    b: q.option_b,
    c: q.option_c,
    d: q.option_d
  }
}

function selectAnswer(q, selectedKey) {
  if (q.answered || submitted.value) return
  q.answered = true
  q.selectedOption = selectedKey
  if (selectedKey === q.correct_option) score.value++

  setTimeout(() => {
    const nextIndex = questions.value.findIndex(qq => !qq.answered)
    if (nextIndex !== -1) {
      const nextEl = document.getElementById(`question-${nextIndex}`)
      nextEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 300)
}

function getOptionClass(q, key) {
  if (!q.answered) return 'bg-white border-gray-300 hover:bg-gray-100'
  if (key === q.correct_option) return 'bg-green-100 border-green-500 text-green-700 font-semibold'
  if (key === q.selectedOption) return 'bg-red-100 border-red-500 text-red-700'
  return 'bg-white border-gray-300'
}

async function loadQuestions() {
  if (!selectedCourse.value || !selectedCount.value || !userId) {
    alert('Please fill in all fields')
    return
  }

  const url = `https://jabumarket.com.ng/api/get_exam_questions.php?user_id=${userId}&course_code=${selectedCourse.value}&limit=${selectedCount.value}`

  try {
    const res = await fetch(url)
    const data = await res.json()

    questions.value = data.map(q => ({ ...q, answered: false, selectedOption: null }))

    score.value = 0
    submitted.value = false
    examStarted.value = true

    if (selectedCount.value == 10) timer.value = 15 * 60
    else if (selectedCount.value == 20) timer.value = 30 * 60
    else if (selectedCount.value == 30) timer.value = 45 * 60
    else timer.value = 90 * 60

    totalTime.value = timer.value
    startTimer()
  } catch (err) {
    console.error('❌ Error loading exam questions:', err)
  }
}

function startTimer() {
  if (timerInterval.value) clearInterval(timerInterval.value)
  timerInterval.value = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      clearInterval(timerInterval.value)
      timeUp.value = true
      setTimeout(() => {
        submitExam()
      }, 2000)
    }
  }, 1000)
}

function submitExam() {
  submitted.value = true
  clearInterval(timerInterval.value)
  examStarted.value = false

  // Send score to backend
  fetch('https://jabumarket.com.ng/api/save_exam_score.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      course_code: selectedCourse.value,
      score: score.value,
      total: questions.value.length,
      timestamp: new Date().toISOString()
    })
  })
}

function handleKeyPress(e) {
  if (!examStarted.value || submitted.value) return
  const current = questions.value.find(q => !q.answered)
  if (!current) return

  const key = e.key.toLowerCase()
  if (['a', 'b', 'c', 'd'].includes(key)) {
    selectAnswer(current, key)
  }
}
</script>

<style scoped>
html {
  scroll-behavior: smooth;
}
</style>
