<!-- src/components/CourseProgressCard.vue -->
<template>
  <div class="bg-white rounded-lg shadow p-3 flex items-center">
    <div
      class="flex-shrink-0 w-11 h-11 rounded-full grid place-content-center text-lg font-bold text-white"
      :style="{ background: course.color }"
    >
      {{ course.icon }}
    </div>
    <div class="flex-1 ml-3">
      <div class="flex justify-between items-center">
        <p class="font-medium text-sm">{{ course.title }}</p>
        <span class="text-xs text-gray-500 font-semibold">{{ course.completed }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div
          class="h-2 rounded-full"
          :style="{ width: course.completed + '%', background: course.color }"
        />
      </div>
    </div>
    <button class="ml-3 text-xs text-[#003f7f] underline" @click="$emit('review')">
      Review
    </button>
  </div>
</template>

<script setup>
defineProps({ course: Object })
</script>
