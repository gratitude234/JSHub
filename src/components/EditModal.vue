<template>
  <div class="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
    <transition name="fade-slide">
      <div
        class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-5 animate-pop-in"
      >
        <div class="space-y-1">
          <h3 class="text-xl font-bold text-[#003f7f]">{{ title }}</h3>
          <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
        </div>

        <!-- Form fields from parent slot -->
        <slot />

        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="$emit('cancel')"
            class="px-4 py-2 text-sm rounded-md text-gray-600 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="$emit('save')"
            class="px-4 py-2 text-sm rounded-md bg-[#003f7f] text-white hover:bg-[#002a5c]"
          >
            Save
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String
})
</script>

<style scoped>
/* Animation */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(30px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.animate-pop-in {
  animation: pop 0.25s ease;
}

@keyframes pop {
  0% {
    opacity: 0;
    transform: scale(0.96);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
