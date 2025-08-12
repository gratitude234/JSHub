<template>
  <button
    class="flex flex-col items-center justify-center gap-2 rounded-2xl p-4 text-white shadow-lg
           bg-gradient-to-br transition active:scale-95"
    :class="gradientClass"
    @click="$emit('click')"
  >
    <span class="text-3xl">{{ icon }}</span>
    <span class="text-sm font-medium leading-tight text-center">{{ label }}</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  icon:     { type: String, required: true },
  label:    { type: String, required: true },
  gradient: { type: String, default: 'from-blue-600 to-indigo-600' }
})
const gradientClass = computed(() => `bg-gradient-to-br ${props.gradient}`)
</script>
