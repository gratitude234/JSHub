<!-- components/GroupCard.vue -->
<template>
  <div
    class="bg-white rounded-xl p-3 shadow flex flex-col justify-between min-h-[90px]"
  >
    <h3 class="font-semibold text-sm leading-tight">{{ group.title }}</h3>
    <p class="text-xs text-gray-500">{{ group.members }} members</p>
  </div>
</template>
<script setup>
defineProps(['group'])
</script>
