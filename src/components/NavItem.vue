<template>
  <button @click="router.push(to)" class="flex flex-col items-center text-xs">
    <span class="text-lg">{{ icon }}</span>
    {{ label }}
  </button>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

defineProps({
  to:    { type: String, required: true },
  icon:  { type: String, required: true },
  label: { type: String, required: true }
})
</script>
