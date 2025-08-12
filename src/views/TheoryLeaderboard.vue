<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-24">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      🏆 Theory Leaderboard
    </header>

    <!-- Content -->
    <section class="p-4 space-y-4">
      <div v-if="loading" class="text-center text-sm text-gray-500">Loading leaderboard...</div>
      <div v-if="error" class="text-center text-red-500 text-sm">{{ error }}</div>

      <div v-if="leaders.length > 0" class="space-y-4">
        <div
          v-for="(user, index) in leaders"
          :key="user.id"
          class="bg-white p-4 rounded-xl shadow border-l-4 flex items-center gap-4"
          :class="index === 0 ? 'border-yellow-500' : index === 1 ? 'border-gray-400' : index === 2 ? 'border-orange-500' : 'border-[#003f7f]'"
        >
          <!-- Avatar -->
          <div
            class="w-10 h-10 rounded-full bg-[#003f7f] text-white flex items-center justify-center text-sm font-bold"
          >
            {{ user.name ? user.name.charAt(0).toUpperCase() : 'A' }}
          </div>

          <!-- Info -->
          <div class="flex-1">
            <p class="font-bold text-lg text-[#003f7f] flex items-center gap-1">
              {{ index + 1 }}. {{ user.name || 'Anonymous' }}
              <span v-if="index === 0">🥇</span>
              <span v-else-if="index === 1">🥈</span>
              <span v-else-if="index === 2">🥉</span>
            </p>
            <p class="text-xs text-gray-500">{{ user.department || 'Unknown Department' }}</p>
            <!-- Progress Bar -->
            <div class="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div class="h-2 bg-[#28a745]" :style="{ width: (user.average_score / 5) * 100 + '%' }"></div>
            </div>
          </div>

          <!-- Score -->
          <div class="text-right text-sm font-semibold text-[#28a745]">
            <p>Avg: {{ parseFloat(user.average_score).toFixed(2) }} / 5</p>
            <p class="text-xs text-gray-500">{{ user.total_answers }} answered</p>
          </div>
        </div>
      </div>

      <p v-if="!loading && leaders.length === 0" class="text-center text-sm text-gray-500">
        No leaderboard data available yet.
      </p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const leaders = ref([]);
const loading = ref(true);
const error = ref('');

async function fetchLeaderboard() {
  try {
    const res = await fetch('/api/get_theory_leaderboard.php');
    const json = await res.json();
    if (json.success) {
      leaders.value = json.data;
    } else {
      error.value = json.error || 'Failed to load leaderboard';
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(fetchLeaderboard);
</script>

<style scoped>
</style>