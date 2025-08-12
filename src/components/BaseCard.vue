<!-- File: src/components/BaseCard.vue -->
<template>
  <div
    class="bg-white p-4 rounded-lg shadow flex items-center justify-between
           hover:shadow-md transition cursor-pointer select-none"
    @click="$emit('click')"
  >
    <div>
      <h2 class="text-md font-semibold">{{ title }}</h2>
      <p v-if="subtitle" class="text-xs text-gray-500 mt-1">{{ subtitle }}</p>
    </div>
    <span class="text-[#003f7f] text-xl">›</span>
  </div>
</template>

<script setup>
defineProps({
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' }
})
</script>
