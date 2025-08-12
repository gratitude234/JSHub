<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- Page Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      📊 My Progress
    </header>

    <div class="p-4 space-y-6">
      <!-- Refresh Button -->
      <div class="flex justify-end">
        <button @click="loadStats" class="bg-[#003f7f] text-white px-3 py-1 rounded text-sm">
          🔄 Refresh Stats
        </button>
      </div>

      <!-- 🎓 Student Summary -->
      <div class="bg-white rounded-xl shadow p-4 space-y-2">
        <h2 class="text-lg font-bold text-[#003f7f] flex items-center gap-2">
          🎓 Student Summary
        </h2>
        <p class="text-sm text-gray-600">
          Department: {{ user.department }} | Level: {{ user.level }}
        </p>
        <div class="text-3xl font-bold text-[#28a745]">{{ user.xp }} XP</div>
        <p class="text-sm">Level {{ user.gamification_level }}</p>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-[#28a745] h-2 rounded-full transition-all duration-500"
               :style="{ width: xpProgress + '%' }"></div>
        </div>
        <p class="text-sm text-gray-500 mt-1">🚀 {{ xpToNextLevel }} XP to next level</p>
        <p class="text-sm text-gray-500">🔥 Current Streak: {{ user.streak }} days</p>
        <p class="text-sm text-gray-500">Last Quiz Attempt: {{ user.last_quiz_date || 'N/A' }}</p>
        <p class="text-center text-sm text-[#003f7f] italic">{{ motivationalMessage }}</p>
      </div>

      <!-- 🧠 Quiz Performance -->
      <div class="bg-white rounded-xl shadow p-4 space-y-2">
        <h2 class="text-lg font-bold text-[#003f7f] flex items-center gap-2">
          📈 Quiz Performance
        </h2>
        <ul class="text-sm space-y-1">
          <li>✔️ Correct Answers: {{ practice.total_correct ?? 0 }}</li>
          <li>❌ Wrong Answers: {{ (practice.total_questions ?? 0) - (practice.total_correct ?? 0) }}</li>
          <li>📅 Daily Quiz Wins: {{ daily.total_quizzes ?? 0 }}</li>
          <li>🧪 Practice Attempts: {{ practice.total_attempts ?? 0 }}</li>
          <li>📝 Exam Attempts: {{ exam.length ?? 0 }}</li>
          <li>🎯 Accuracy: {{ practice.accuracy ?? 0 }}%</li>
        </ul>
        <!-- Accuracy Progress Bar -->
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full transition-all duration-500"
               :style="{ width: practice.accuracy + '%' }"></div>
        </div>
      </div>

      <!-- 🏅 Badges -->
      <div class="bg-white rounded-xl shadow p-4 space-y-2">
        <h2 class="text-lg font-bold text-[#003f7f] flex items-center gap-2">
          🏅 Badges
        </h2>
        <div class="flex flex-wrap gap-2 mt-1">
          <span
            v-if="parsedBadges.length"
            v-for="(badge, index) in parsedBadges"
            :key="index"
            class="bg-[#003f7f] text-white px-3 py-1 rounded-full text-sm cursor-pointer"
            :title="getBadgeTooltip(badge)"
          >
            {{ badge }}
          </span>
          <span v-else class="text-sm text-gray-500">No badges yet</span>
        </div>
      </div>

      <!-- 📝 Exam History -->
      <div class="bg-white rounded-xl shadow p-4 space-y-2">
        <h2 class="text-lg font-bold text-[#003f7f] flex items-center gap-2">
          🗂️ Exam History
        </h2>
        <div v-if="!exam.length" class="text-sm text-gray-500">
          No exam attempts yet.
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(examEntry, index) in exam"
            :key="index"
            class="border rounded-lg p-3 bg-[#F7F9FC]"
          >
            <p class="font-semibold text-[#003f7f]">📚 {{ examEntry.course_code }}</p>
            <p class="text-sm">
              Score: <span class="font-medium">{{ examEntry.percentage }}%</span>
              ({{ examEntry.score }}/{{ examEntry.total_questions }})
            </p>
            <p class="text-sm text-gray-500">📅 {{ examEntry.quiz_date }}</p>
            <button @click="openReviewModal(examEntry)" class="mt-2 bg-[#003f7f] text-white text-sm py-1 px-3 rounded-lg">
              Review Answers
            </button>
          </div>
        </div>
      </div>

      <!-- 🗓️ Weekly/Monthly Summary (Placeholder) -->
      <div class="bg-white rounded-xl shadow p-4 space-y-2">
        <h2 class="text-lg font-bold text-[#003f7f] flex items-center gap-2">
          📅 Weekly/Monthly Summary
        </h2>
        <p class="text-sm text-gray-600">
          Summary charts and statistics coming soon...
        </p>
      </div>
    </div>

    <!-- Modal for Exam Review -->
    <div v-if="showReviewModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-11/12 md:w-1/2 relative">
        <button @click="closeReviewModal" class="absolute top-2 right-2 text-gray-500">
          ✖️
        </button>
        <h3 class="text-xl font-bold text-[#003f7f] mb-4">
          Exam Review - {{ selectedExam.course_code }}
        </h3>
        <p class="text-sm mb-2">
          Score: <span class="font-medium">{{ selectedExam.percentage }}%</span>
          ({{ selectedExam.score }}/{{ selectedExam.total_questions }})
        </p>
        <p class="text-sm text-gray-500 mb-4">Date: {{ selectedExam.quiz_date }}</p>
        <div class="overflow-auto max-h-64">
          <!-- Placeholder for detailed review content -->
          <p class="text-sm">Detailed review content coming soon...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const userId = localStorage.getItem('user_id') || 1

// Data storage for different API calls
const user = ref({})
const daily = ref({})
const practice = ref({})
const exam = ref([])

// Parse badges safely
const parsedBadges = computed(() => {
  try {
    return typeof user.value.badges === 'string'
      ? JSON.parse(user.value.badges)
      : user.value.badges || []
  } catch {
    return []
  }
})

// Computed properties for progress, XP and motivational message
const xpProgress = computed(() => {
  const levelXP = 100 * (user.value.gamification_level || 1)
  return Math.min(((user.value.xp || 0) / levelXP) * 100, 100).toFixed(1)
})

const xpToNextLevel = computed(() => {
  const levelXP = 100 * (user.value.gamification_level || 1)
  return levelXP - (user.value.xp || 0)
})

const motivationalMessage = computed(() => {
  if ((user.value.streak || 0) >= 7) return "🔥 You’re on fire! Keep the streak alive!"
  if ((user.value.xp || 0) > 500) return "💪 Leveling up fast!"
  return "🚀 Stay consistent and keep practicing!"
})

// Modal functionality for exam review
const showReviewModal = ref(false)
const selectedExam = ref({})

function openReviewModal(examEntry) {
  selectedExam.value = examEntry
  showReviewModal.value = true
}

function closeReviewModal() {
  showReviewModal.value = false
}

// Individual safe fetches with debug logs for each endpoint
async function loadStats() {
  console.log("🚀 Starting loadStats");

  const endpoints = {
    user: `https://jabumarket.com.ng/api/get_user_progress.php?user_id=${userId}`,
    daily: `https://jabumarket.com.ng/api/get_daily_quiz_stats.php?user_id=${userId}`,
    practice: `https://jabumarket.com.ng/api/get_practice_stats.php?user_id=${userId}`,
    exam: `https://jabumarket.com.ng/api/get_exam_history.php?user_id=${userId}`
  }

  // Fetch user progress
  try {
    console.log("🌐 Fetching user progress...");
    const userRes = await fetch(endpoints.user);
    const userData = await userRes.json();
    console.log("✅ User loaded:", userData);
    user.value = userData;
  } catch (error) {
    console.error("❌ Error fetching user progress:", error);
  }

  // Fetch daily quiz stats
  try {
    console.log("🌐 Fetching daily quiz stats...");
    const dailyRes = await fetch(endpoints.daily);
    const dailyData = await dailyRes.json();
    console.log("✅ Daily stats loaded:", dailyData);
    daily.value = dailyData;
  } catch (error) {
    console.error("❌ Error fetching daily quiz stats:", error);
  }

  // Fetch practice quiz stats
  try {
    console.log("🌐 Fetching practice quiz stats...");
    const practiceRes = await fetch(endpoints.practice);
    const practiceData = await practiceRes.json();
    console.log("✅ Practice stats loaded:", practiceData);
    practice.value = practiceData;
  } catch (error) {
    console.error("❌ Error fetching practice quiz stats:", error);
  }

  // Fetch exam history
  try {
    console.log("🌐 Fetching exam history...");
    const examRes = await fetch(endpoints.exam);
    const examData = await examRes.json();
    console.log("✅ Exam history loaded:", examData);
    exam.value = examData;
  } catch (error) {
    console.error("❌ Error fetching exam history:", error);
  }
}

onMounted(loadStats)

function getBadgeTooltip(badge) {
  const descriptions = {
    "Perfectionist": "Got 100% in an exam or practice quiz",
    "Streak Master": "Maintained a 7-day streak"
    // Add additional badge descriptions if needed
  }
  return descriptions[badge] || "Keep it up!"
}
</script>

