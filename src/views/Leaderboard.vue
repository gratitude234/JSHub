<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-28 text-[#2C3E50]">
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      👑 Leaderboard
    </header>

    <div class="p-4">
      <h2 class="text-lg font-semibold text-center mb-4">Top 10 Quiz Masters 🧠</h2>

      <div v-if="loading" class="text-center py-10 text-gray-500">Loading leaderboard...</div>

      <div v-else>
        <div
          v-for="(player, index) in leaderboard"
          :key="player.id"
          class="flex items-center justify-between bg-white rounded-lg shadow px-4 py-3 mb-3"
          :class="{
            'border-l-4 border-yellow-400': index === 0,
            'border-l-4 border-gray-400': index === 1,
            'border-l-4 border-orange-500': index === 2
          }"
        >
          <div class="flex items-center gap-3">
            <div class="text-xl font-bold text-[#003f7f] w-6 text-center">{{ index + 1 }}</div>
            <div>
              <p class="font-semibold">{{ player.name }}</p>
              <p class="text-xs text-gray-500">{{ player.department }} | {{ player.level }}L</p>
            </div>
          </div>
          <div class="text-sm font-semibold text-[#28a745]">{{ player.xp }} XP</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const leaderboard = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('https://jabumarket.com.ng/api/get_leaderboard.php')
    leaderboard.value = await res.json()
  } catch (err) {
    console.error('Error loading leaderboard:', err)
  } finally {
    loading.value = false
  }
})
</script>
