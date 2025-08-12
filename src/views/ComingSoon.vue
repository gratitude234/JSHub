<template>
  <div class="min-h-screen flex flex-col justify-center items-center text-center bg-[#F7F9FC] px-6">
    <h1 class="text-2xl font-bold text-[#003f7f] mb-4">🚀 Coming Soon!</h1>
    <p class="text-sm text-[#2C3E50] mb-6">
      We're working on something awesome for you — quizzes, flashcards, study plans and more to help you succeed at JABU!
    </p>

    <img
      src="https://undraw.co/api/illustrations/5a96ef23-6f6e-4bd4-b1cf-3edbf78a32e5" 
      alt="Coming Soon"
      class="w-60 max-w-full mb-6 rounded-xl shadow"
    />

    <button
      @click="router.push('/')"
      class="bg-[#003f7f] text-white px-6 py-2 rounded-full text-sm hover:bg-[#002a5c] transition"
    >
      ← Back to Home
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>
