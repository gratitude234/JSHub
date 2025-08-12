<!-- src/views/Notifications.vue -->
<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-[88px] text-[#2C3E50] overflow-hidden">
    <!-- Header -->
    <header class="flex items-center justify-between px-5 pt-7 pb-3 bg-white shadow">
      <h1 class="text-xl font-bold" :style="{ color: primary }">Notifications</h1>
      <button class="text-xs text-[#003f7f] underline" @click="markAllRead">
        Mark all read
      </button>
    </header>

    <!-- Tabs -->
    <nav class="sticky top-0 bg-white z-10 px-5 shadow-sm">
      <ul class="flex gap-6 text-sm font-medium">
        <li
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          class="cursor-pointer py-3 border-b-2 transition"
          :class="activeTab === tab.key
            ? 'border-[#003f7f] text-[#003f7f]'
            : 'border-transparent text-gray-500'"
        >
          {{ tab.label }}
          <span
            v-if="tab.count"
            class="ml-1 text-[11px] px-1 py-0.5 rounded bg-[#003f7f] text-white"
          >
            {{ tab.count }}
          </span>
        </li>
      </ul>
    </nav>

    <!-- Pull-to-refresh hint -->
    <p class="text-center text-[11px] text-gray-400 mt-1">Pull down to refresh</p>

    <!-- Notification list -->
    <main
      class="px-5 pt-3 space-y-3 overflow-y-auto"
      style="height: calc(100vh - 180px)"
    >
      <div
        v-for="n in filtered"
        :key="n.id"
        class="relative overflow-hidden group"
        @touchstart.passive="startDrag($event, n)"
        @touchmove.passive="onDrag($event, n)"
        @touchend.passive="endDrag(n)"
      >
        <!-- red delete bg -->
        <div
          class="absolute inset-0 bg-red-500 flex items-center justify-end pr-6 text-white font-bold"
          :style="{ transform: `translateX(${n.swipeX}px)` }"
        >
          Delete
        </div>

        <!-- foreground card -->
        <div
          class="relative bg-white rounded-lg shadow px-4 py-3 flex items-start gap-3"
          :style="{ transform: `translateX(${n.swipeX}px)` }"
          @click="n.read = true"
        >
          <span
            class="mt-1 w-2 h-2 rounded-full"
            :class="n.read ? 'bg-transparent' : 'bg-[#28a745]'"
          />
          <div class="flex-1 text-sm">
            {{ n.msg }}
            <p class="text-[11px] text-gray-500 mt-0.5">{{ n.time }} ago</p>
          </div>
        </div>
      </div>

      <p v-if="!filtered.length" class="text-center text-sm text-gray-400">
        No notifications here 🎉
      </p>
    </main>

    <!-- Bottom nav placeholder -->
    <!-- <BottomNav class="fixed bottom-0 left-0 right-0" /> -->
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'

const primary = '#003f7f'

/* Notifications state (replace with API later) */
const notes = reactive([
  { id: 1, type: 'study',  msg: 'Daily Quiz available! 🔥',            read: false, time:'2m',  swipeX:0 },
  { id: 2, type: 'social', msg: 'Grace invited you to PHY 102 group.', read: false, time:'10m', swipeX:0 },
  { id: 3, type: 'study',  msg: 'You earned 5 XP for streak.',         read: true,  time:'1h',  swipeX:0 },
  { id: 4, type: 'social', msg: 'Exam result posted (GNS 123).',       read: false, time:'2h',  swipeX:0 }
])

/* Tabs */
const activeTab = ref('all')
const tabs = computed(() => [
  { key:'all',    label:'All',    count: notes.filter(n=>!n.read).length },
  { key:'study',  label:'Study',  count: notes.filter(n=>!n.read && n.type==='study').length },
  { key:'social', label:'Social', count: notes.filter(n=>!n.read && n.type==='social').length }
])
const filtered = computed(() =>
  activeTab.value === 'all' ? notes : notes.filter(n => n.type === activeTab.value)
)

/* Swipe-to-delete */
let startX = 0
function startDrag(e, n){ startX = e.touches[0].clientX }
function onDrag(e, n){
  const delta = e.touches[0].clientX - startX
  n.swipeX = Math.min(0, delta)      // only left
}
function endDrag(n){
  if (Math.abs(n.swipeX) > 80){
    const idx = notes.findIndex(x => x.id === n.id)
    if (idx > -1) notes.splice(idx,1)
  } else {
    n.swipeX = 0
  }
}

/* Mark all read */
function markAllRead(){ notes.forEach(n => n.read = true) }
</script>

<style scoped>
/* smooth swipe */
div[style*="translateX"]{ transition: transform .2s; }
</style>
