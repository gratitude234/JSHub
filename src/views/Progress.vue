<!-- src/views/Progress.vue -->
<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-32">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      🏆 My Progress
    </header>

    <!-- Refresh Button -->
    <div class="px-4 pt-4">
      <button
        @click="fetchProgress"
        class="bg-[#003f7f] text-white text-sm px-4 py-2 rounded-lg shadow hover:bg-[#002f5c] transition"
      >
        🔄 Refresh Progress
      </button>
    </div>

    <div class="p-4 space-y-6">
      <!-- 👋 Summary -->
      <div
        class="bg-white rounded-xl shadow p-4 border-l-4 border-[#28a745] animate-fade-in"
      >
        <h2 class="text-md font-semibold">Hey Scholar! 🎓</h2>
        <p class="text-sm mt-1">
          You've earned
          <span class="font-bold text-[#28a745]">{{ animatedXP }} XP</span>,
          are on a
          <span class="font-bold text-[#003f7f]">{{ streak }}-day streak</span>,
          and currently at
          <span class="font-bold">Level {{ gamificationLevel }}</span>.
        </p>

        <!-- XP Progress Bar -->
        <div class="mt-4">
          <div class="text-xs font-medium mb-1 text-gray-600">XP Progress</div>
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              class="bg-[#003f7f] h-3 rounded-full transition-all duration-700 ease-in-out"
              :style="{ width: xpPercent + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 📊 Weekly XP Graph -->
      <div class="bg-white rounded-xl shadow p-4 animate-fade-in">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-[#003f7f]">
            📊 Weekly XP Growth
          </h3>
          <span class="text-[10px] text-gray-400">last 7 days</span>
        </div>

        <div class="h-32 flex items-end justify-between px-1 py-2">
          <div
            v-for="(day, i) in weeklyXP"
            :key="i"
            class="flex flex-col items-center justify-end w-6 h-full"
          >
            <div
              class="w-full bg-[#003f7f] rounded transition-all duration-700 ease-in-out"
              :style="{ height: (day.xp / maxXP) * 100 + '%' }"
            ></div>
            <span class="text-[10px] text-gray-500 mt-1">{{ day.label }}</span>
          </div>
        </div>

        <div class="mt-2 text-center text-xs text-gray-400">
          Total XP this week: {{ totalWeeklyXP }}
        </div>
      </div>

      <!-- 🏋️‍♂️ Badges -->
      <div class="bg-white rounded-xl shadow p-4 animate-fade-in">
        <h3 class="text-sm font-semibold text-[#003f7f] mb-3">🏋️‍♂️ Badges</h3>
        <p class="text-xs text-gray-500 mb-2">
          You've unlocked
          {{ progress.badges.filter(b => b.unlocked).length }}
          out of {{ progress.badges.length }} badges
        </p>

        <div v-if="progress.badges.length" class="flex flex-wrap gap-3">
          <div
            v-for="(badge, idx) in progress.badges"
            :key="idx"
            class="px-3 py-1 text-xs rounded-full shadow flex items-center gap-1"
            :class="
              badge.unlocked
                ? 'bg-[#003f7f] text-white'
                : 'bg-gray-200 text-gray-500 cursor-help'
            "
            :title="badge.unlocked ? 'Unlocked' : '🔒 ' + badge.hint"
          >
            <span>{{ badge.name }}</span>
            <span v-if="badge.unlocked">⭐</span>
            <span v-else>🔒</span>
          </div>
        </div>

        <div v-else class="text-xs text-gray-400 italic">
          No badges yet. Complete some quizzes to start earning!
        </div>
      </div>

      <!-- 📝 Leaderboard -->
      <div class="bg-white rounded-xl shadow p-4 animate-fade-in">
        <h3 class="text-sm font-semibold text-[#003f7f] mb-2">
          📋 Leaderboard – {{ department }} {{ academicLevel }}L
        </h3>

        <div v-if="leaderboard.length">
          <ul class="text-sm divide-y mt-2">
            <li
              v-for="(entry, idx) in leaderboard"
              :key="entry.id"
              class="py-2 flex justify-between items-center"
              :class="{
                'bg-[#003f7f]/10 rounded font-semibold':
                  entry.id === user.id
              }"
            >
              <span class="flex items-center gap-1">
                <span class="font-bold">#{{ idx + 1 }}</span>
                {{ entry.name }}
                <span
                  v-if="entry.id === user.id"
                  class="bg-[#28a745] text-white text-[10px] rounded-full px-2 py-0.5 ml-1"
                >
                  You 🫵
                </span>
              </span>
              <span class="text-[#28a745] font-semibold">{{ entry.xp }} XP</span>
            </li>
          </ul>
        </div>

        <div v-else class="text-xs text-gray-400 mt-2">
          Loading leaderboard…
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { getGamificationProgress } from '@/utils/gamification';

/* === Pinia store === */
const userStore = useUserStore();
const { user } = storeToRefs(userStore);

/* === Basic reactive values === */
const totalXP   = computed(() => user.value?.xp ?? 0);
const streak    = computed(() => user.value?.streak ?? 0);
const department = computed(() => user.value?.department ?? '');
const academicLevel = computed(
  () => user.value?.academic_level ?? user.value?.level ?? ''
);

/* === Derived from XP using utility === */
const progressData     = computed(() => getGamificationProgress(totalXP.value));
const gamificationLevel = computed(() => progressData.value.level);
const xpPercent         = computed(() => progressData.value.percent);

/* === Local state === */
const progress    = ref({ badges: [] });
const leaderboard = ref([]);
const weeklyXP    = ref([]);
const maxXP       = ref(100);
const animatedXP  = ref(0);

/* === Weekly total === */
const totalWeeklyXP = computed(() =>
  weeklyXP.value.reduce((sum, d) => sum + d.xp, 0)
);

/* === XP counter animation === */
function animateXP(target) {
  animatedXP.value = 0;
  const step = Math.max(1, Math.floor(target / 50));
  const iv = setInterval(() => {
    if (animatedXP.value >= target) {
      animatedXP.value = target;
      clearInterval(iv);
    } else {
      animatedXP.value += step;
    }
  }, 20);
}

/* === Fetch progress data from backend === */
async function fetchProgress() {
  if (!user.value?.id) return;
  try {
    /* 1) XP, streak, level, badges */
    const res = await fetch(
      `https://jabumarket.com.ng/api/get_user_progress.php?user_id=${user.value.id}`
    );
    const data = await res.json();

    userStore.setUser({
      ...user.value,
      xp:                 data.xp,
      streak:             data.streak,
      gamification_level: data.gamification_level
    });

    progress.value.badges = data.badges || [];
    animateXP(data.xp);

    /* 2) Leaderboard */
    const lbRes = await fetch(
      `https://jabumarket.com.ng/api/get_leaderboard.php?department=${encodeURIComponent(
        department.value
      )}&level=${encodeURIComponent(academicLevel.value)}`
    );
    leaderboard.value = await lbRes.json();

    /* 3) Weekly XP */
    const wkRes = await fetch(
      `https://jabumarket.com.ng/api/get_weekly_xp.php?user_id=${user.value.id}`
    );
    const wkData = await wkRes.json();

    /* Align to last 7 days */
    const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const days = Array(7)
      .fill(0)
      .map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          date: d.toISOString().slice(0, 10),
          label: labels[d.getDay()]
        };
      });

    weeklyXP.value = days.map((d, i) => ({
      xp: wkData[i]?.xp || 0,
      label: d.label
    }));
    maxXP.value = Math.max(100, ...weeklyXP.value.map(d => d.xp));
  } catch (err) {
    console.error('Error loading progress:', err);
  }
}

/* === Initial load === */
onMounted(fetchProgress);
</script>

<style scoped>
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in {
  animation: fade-in 0.5s ease;
}
</style>
