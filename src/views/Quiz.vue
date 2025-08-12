<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      🧠 Quiz Center
    </header>

    <!-- Intro -->
    <div class="p-4 text-center">
      <p class="text-sm text-gray-700">Choose how you want to test your knowledge today!</p>
    </div>

    <!-- Quiz Mode Options -->
    <div class="px-4 space-y-4">
      <!-- Daily Quiz -->
      <div
        class="bg-white rounded-lg shadow p-4 hover:bg-[#e6f0fa] transition cursor-pointer border-l-4 border-[#003f7f]"
        @click="router.push('/daily-quiz')"
      >
        <h2 class="text-lg font-bold">🎯 Daily Quiz Challenge</h2>
        <p class="text-sm text-gray-600">Be the first to answer and win rewards. New question daily!</p>
      </div>

      <!-- Practice Mode -->
      <div
        class="bg-white rounded-lg shadow p-4 hover:bg-[#e6f0fa] transition cursor-pointer border-l-4 border-[#003f7f]"
        @click="router.push('/practice-mode')"
      >
        <h2 class="text-lg font-bold">🛠️ Practice Mode</h2>
        <p class="text-sm text-gray-600">Choose topics and quiz freely with instant feedback.</p>
      </div>

      <!-- Exam Mode -->
      <div
        class="bg-white rounded-lg shadow p-4 hover:bg-[#e6f0fa] transition cursor-pointer border-l-4 border-[#003f7f]"
        @click="router.push('/exam-mode')"
      >
        <h2 class="text-lg font-bold">📚 Exam Mode</h2>
        <p class="text-sm text-gray-600">Timed full-length course exams. Real JABU exam style.</p>
      </div>

      <!-- Leaderboard -->
      <div
        class="bg-white rounded-lg shadow p-4 hover:bg-[#e6f0fa] transition cursor-pointer border-l-4 border-[#003f7f]"
        @click="router.push('/leaderboard')"
      >
        <h2 class="text-lg font-bold">👑 Leaderboard</h2>
        <p class="text-sm text-gray-600">See who’s dominating the quizzes this week.</p>
      </div>

      <!-- Progress -->
      <div
        class="bg-white rounded-lg shadow p-4 hover:bg-[#e6f0fa] transition cursor-pointer border-l-4 border-[#003f7f]"
        @click="router.push('/progress')"
      >
        <h2 class="text-lg font-bold">📈 My Progress</h2>
        <p class="text-sm text-gray-600">Track your XP, streaks, and quiz accuracy.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
