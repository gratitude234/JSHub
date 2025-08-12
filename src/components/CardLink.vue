<template>
  <div
    @click="router.push(to)"
    class="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md transition cursor-pointer"
  >
    <div>
      <h2 class="text-md font-semibold">{{ title }}</h2>
      <p class="text-xs text-gray-500 mt-1">{{ desc }}</p>
    </div>
    <span class="text-[#003f7f] text-xl">›</span>
  </div>
</template>

<script setup>
defineProps(['title', 'desc', 'to'])
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
