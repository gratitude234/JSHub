<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] p-4">
    <h1 class="text-xl font-bold mb-4 text-[#003f7f]">🤖 AI Usage Monitor</h1>

    <div class="grid gap-4 mb-6">
      <div class="bg-white p-4 rounded-xl shadow border-l-4 border-[#28a745]">
        <p class="text-sm">Total Gemini Requests Today:</p>
        <p class="text-2xl font-bold">{{ summary.todayRequests }}</p>
      </div>

      <div class="bg-white p-4 rounded-xl shadow border-l-4 border-[#003f7f]">
        <p class="text-sm">Total Tokens Used Today:</p>
        <p class="text-2xl font-bold">{{ summary.todayTokens }}</p>
      </div>
    </div>

    <h2 class="text-lg font-semibold mb-2">📋 Recent AI Requests</h2>
    <div class="overflow-x-auto bg-white rounded-xl shadow">
      <table class="min-w-full text-sm table-auto">
        <thead class="bg-[#003f7f] text-white">
          <tr>
            <th class="px-4 py-2 text-left">Time</th>
            <th class="px-4 py-2 text-left">QID</th>
            <th class="px-4 py-2 text-left">Tokens</th>
            <th class="px-4 py-2 text-left">Status</th>
            <th class="px-4 py-2 text-left">Error</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.id" class="border-t">
            <td class="px-4 py-2">{{ log.request_time }}</td>
            <td class="px-4 py-2">{{ log.question_id }}</td>
            <td class="px-4 py-2">{{ log.tokens_used }}</td>
            <td class="px-4 py-2">
              <span :class="log.status === 'success' ? 'text-green-600' : 'text-red-600'">
                {{ log.status }}
              </span>
            </td>
            <td class="px-4 py-2 text-red-500 truncate max-w-xs" v-if="log.error_message">{{ log.error_message }}</td>
            <td class="px-4 py-2 text-gray-400" v-else>–</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const logs = ref([]);
const summary = ref({
  todayRequests: 0,
  todayTokens: 0
});

onMounted(async () => {
  try {
    const res = await fetch('https://jabumarket.com.ng/api/get_gemini_usage.php');
    const data = await res.json();
    logs.value = data.logs;
    summary.value = data.summary;
  } catch (e) {
    console.error('Failed to fetch usage logs:', e);
  }
});
</script>
