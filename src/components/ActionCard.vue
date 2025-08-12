<template>
  <div
    class="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center space-y-2"
    @click="$emit('click')"
  >
    <div class="text-3xl">{{ icon }}</div>
    <div class="text-sm font-medium">{{ title }}</div>
  </div>
</template>

<script setup>
defineProps(['icon', 'title'])
</script>
