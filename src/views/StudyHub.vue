<!-- File: src/views/StudyHub.vue (FULL UPDATED, THEORY DRILL OPENS AS NORMAL) -->
<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28 flex flex-col">
    <!-- ░░ Header ░░ -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md">
      📚 Study Hub
    </header>

    <!-- ░░ Offline banner ░░ -->
    <div
      v-if="!isOnline"
      class="bg-red-50 text-red-700 text-sm text-center py-2 sticky top-0 z-50">
      ⚠️ You’re offline – cached resources only.
    </div>

    <!-- ░░ 👉 UNAVAILABLE-MODAL (Commented Out) ░░ -->
    <!--
    <transition name="fade">
      <div
        v-if="showUnavailableModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-xl p-6 max-w-xs mx-auto text-center space-y-4 shadow-lg">
          <h2 class="text-xl font-bold text-[#003f7f]">🛠️ Theory Drill Unavailable</h2>
          <p class="text-sm leading-relaxed">
            Our Theory Drill service is temporarily down for maintenance.<br>
            Please check back <span class="font-semibold">tomorrow</span>. 🙏
          </p>
          <button
            @click="closeUnavailableModal"
            class="px-4 py-2 rounded-lg bg-[#003f7f] text-white font-medium w-full"
          >
            Okay, got it
          </button>
        </div>
      </div>
    </transition>
    -->

    <div class="p-4 space-y-6 flex-1 overflow-y-auto">
      <!-- 🏅 Gamified Progress Overview -->
      <div class="bg-white rounded-xl shadow p-4 border-l-4 border-[#28a745] animate-fade-in mb-2">
        <h2 class="text-md font-semibold">Hey Scholar! 🎓</h2>
        <p class="text-sm mt-1">
          You've earned
          <span class="font-bold text-[#28a745]">{{ animatedXP }} XP</span>,
          are on a
          <span class="font-bold text-[#003f7f]">{{ streak }}-day streak</span>,
          and currently at
          <span class="font-bold">Level {{ level }}</span>.
        </p>

        <!-- XP Progress Bar -->
        <div class="mt-4">
          <div class="text-xs font-medium mb-1 text-gray-600">XP Progress</div>
          <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              class="bg-[#003f7f] h-3 rounded-full transition-all duration-700 ease-in-out"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
          <div class="text-[10px] text-gray-400 mt-1 text-right">
            {{ xpThisLevel }} / {{ levelThreshold }} XP
          </div>
        </div>
      </div>

      <!-- 🧠 Practice Zone -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-[#003f7f]">🧠 Practice Zone</h3>

        <BaseCard
          title="⚡ Practice Mode"
          subtitle="Sharpen skills by topic"
          @click="router.push('/practice-mode')"
        />
        <BaseCard
          title="🧪 Exam Mode"
          subtitle="Full-length mocks"
          @click="router.push('/exam-mode')"
        />
        <BaseCard
          title="📝 Theory Drill"
          subtitle="Practice theory questions by topic"
          @click="router.push('/theory-drill')"
        />
      </div>

      <!-- 🏆 Leaderboards -->
      <BaseCard
        title="🏆 Exam Leaderboard"
        subtitle="See top performers across all exams"
        @click="router.push('/exam-leaderboard')"
      />
      <BaseCard
        title="📚 Theory Leaderboard"
        subtitle="Top scores in theory drills"
        @click="router.push('/theory-leaderboard')"
      />

      <!-- 📁 Resources -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-[#003f7f]">📁 Resources</h3>
        <BaseCard
          title="📘 Course Materials"
          subtitle="Notes & handouts"
          @click="router.push('/materials')"
        />
      </div>

      <!-- 🎯 Gamification -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-[#003f7f]">🏅 Gamification</h3>
        <BaseCard
          title="📊 My Progress"
          subtitle="XP • Levels • Badges"
          @click="router.push('/progress')"
        />
      </div>

      <!-- 📬 Contribution / Help Box -->
      <div class="bg-white rounded-xl shadow p-4 border-l-4 border-[#003f7f] animate-fade-in">
        <h3 class="text-md font-semibold text-[#003f7f]">📬 Got Past Questions or Issues?</h3>
        <p class="text-sm mt-2">
          If you have access to <span class="font-medium">past questions</span> and want them added
          to Practice Mode, kindly
          <a
            href="https://wa.me/2347041022336"
            target="_blank"
            class="text-[#28a745] underline font-medium"
            >DM us on WhatsApp</a
          >
          with the file or image.
        </p>
        <p class="text-sm mt-2">
          Also, if you encounter any <span class="font-medium">issues or challenges</span>, feel
          free to reach out directly. We’ll fix it ASAP!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/BaseCard.vue'
import { getGamificationProgress } from '@/utils/gamification'

const router = useRouter()
const store = useUserStore()
const { user } = storeToRefs(store)

const totalXp = computed(() => Number(user.value?.xp ?? 0))
const streak = computed(() => Number(user.value?.streak ?? 0))
const progress = computed(() => getGamificationProgress(totalXp.value))
const level = computed(() => progress.value.level)
const xpThisLevel = computed(() => progress.value.intoLevel)
const levelThreshold = computed(() => progress.value.threshold)
const progressPercent = computed(() => progress.value.percent)

const animatedXP = ref(totalXp.value)
function animateXP(target) {
  const start = animatedXP.value
  const dist = target - start
  if (!dist) return
  const steps = 30
  let cur = 0
  clearInterval(animateXP._timer)
  animateXP._timer = setInterval(() => {
    animatedXP.value = Math.round(start + (dist * ++cur) / steps)
    if (cur >= steps) clearInterval(animateXP._timer)
  }, 20)
}
watch(totalXp, animateXP, { immediate: true })

const isOnline = ref(navigator.onLine)
window.addEventListener('online', () => (isOnline.value = true))
window.addEventListener('offline', () => (isOnline.value = false))

// Modal control (unused now)
// const showUnavailableModal = ref(false)
// function openUnavailableModal() { showUnavailableModal.value = true }
// function closeUnavailableModal() { showUnavailableModal.value = false }

async function refreshProgress() {
  const uid = user.value?.id
  if (!uid) return
  try {
    const res = await fetch(
      `https://jabumarket.com.ng/api/get_user_progress.php?user_id=${uid}`
    )
    const data = await res.json()
    store.setUser({
      ...user.value,
      xp: Number(data.xp),
      streak: Number(data.streak),
      gamification_level: Number(data.gamification_level)
    })
  } catch (err) {
    console.error('[StudyHub] progress sync failed:', err)
  }
}
onMounted(refreshProgress)
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

/* simple fade transition used by all modals */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
