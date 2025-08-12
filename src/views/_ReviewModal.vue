<!--  src/views/_ReviewModal.vue  -->
<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  entry: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div
    class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    @click.self="emit('close')"
  >
    <div class="bg-white rounded-xl p-6 w-11/12 md:w-1/2 relative">
      <button
        class="absolute top-2 right-2 text-gray-500"
        @click="emit('close')"
      >✖️</button>

      <h3 class="text-xl font-bold text-[#003f7f] mb-4">
        Exam Review – {{ entry.course_code }}
      </h3>

      <p class="text-sm mb-2">
        Score:
        <span class="font-medium">{{ entry.percentage }}%</span>
        ({{ entry.score }}/{{ entry.total_questions }})
      </p>
      <p class="text-sm text-gray-500 mb-4">Date: {{ entry.quiz_date }}</p>

      <!-- Placeholder for detailed review -->
      <div class="overflow-auto max-h-64 text-sm">
        Detailed review coming soon…
      </div>
    </div>
  </div>
</template>
