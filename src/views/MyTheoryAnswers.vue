<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      📖 My Theory Answers
    </header>

    <section class="p-4 max-w-3xl mx-auto">
      <div v-if="loading" class="text-center text-sm text-gray-600">Loading...</div>
      <div v-else-if="answers.length === 0" class="text-center text-sm text-gray-500">
        You haven’t submitted any theory answers yet.
      </div>

      <div v-else class="space-y-6">
        <div
          v-for="item in answers"
          :key="item.id"
          class="bg-white shadow rounded-xl p-4 space-y-2 border-l-4 border-[#003f7f]"
        >
          <h3 class="font-semibold text-[#003f7f]">🧠 {{ item.question_text }}</h3>
          <p class="text-sm text-gray-800"><strong>Your Answer:</strong><br />{{ item.answer }}</p>
          <p class="text-sm text-gray-600"><strong>📖 Explanation:</strong><br />{{ item.question_explanation || 'No explanation provided.' }}</p>
          <p class="text-xs text-right text-gray-400">🕓 {{ formatDate(item.submitted_at) }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user';

const userStore = useUserStore();
const user = userStore.user;

const loading = ref(true);
const answers = ref([]);

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString();
}

async function loadAnswers() {
  try {
    const res = await fetch(`/api/get_my_theory_answers.php?user_id=${user.id}`);
    const json = await res.json();
    answers.value = json || [];
  } catch (err) {
    console.error('Failed to load answers:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(loadAnswers);
</script>
