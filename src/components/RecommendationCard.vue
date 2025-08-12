<!-- src/components/RecommendationCard.vue -->
<template>
  <div class="p-3 bg-[#003f7f]/10 rounded-md flex items-center">
    <span class="text-xl mr-3">{{ rec.icon }}</span>
    <span class="flex-1 text-sm">{{ rec.text }}</span>
    <button
      v-if="rec.link"
      class="ml-2 text-xs text-[#28a745] underline"
      @click="$emit('go')"
    >
      Go
    </button>
  </div>
</template>

<script setup>
defineProps({ rec: Object })
</script>
