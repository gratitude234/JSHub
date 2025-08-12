<!-- src/App.vue -->
<template>
  <div id="app" class="min-h-screen bg-gray-100 text-gray-800">
    <!-- ⬇️ Your routed pages -->
    <router-view />

    <!-- ⬇️ Toast overlay -->
    <div
      class="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none"
      aria-live="polite"
    >
      <transition-group name="toast" tag="div">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded shadow-lg"
          :class="toastClass(t.type)"
        >
          <span class="text-sm font-medium">{{ t.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useToast }      from './composables/toast'
import { initOneSignal } from './onesignal'    // ← point at src/onesignal.js

const { toasts } = useToast()

/* Map toast.type → Tailwind classes */
const toastClass = (type = 'info') =>
  ({
    success: 'bg-green-600 text-white',
    error:   'bg-red-600   text-white',
    warning: 'bg-yellow-500 text-white',
    info:    'bg-blue-600  text-white',
  }[type] || 'bg-blue-600 text-white')

onMounted(() => {
  if (typeof window !== 'undefined') {
    initOneSignal()
  }
})
</script>

<style scoped>
/* Fade-and-slide animation for the toast list */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
