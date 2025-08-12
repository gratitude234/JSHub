<!-- components/ActionChip.vue -->
<template>
  <button
    class="flex-shrink-0 bg-white rounded-full px-3 py-2 shadow text-sm font-medium 
           flex items-center gap-2 hover:scale-105 active:scale-95 transition"
  >
    <span class="text-lg">{{ icon }}</span>
    <span>{{ label }}</span>
  </button>
</template>
<script setup>
defineProps(['icon', 'label'])
</script>
