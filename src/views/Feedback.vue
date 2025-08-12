<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-28">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center text-xl font-bold shadow">
      💬 We Value Your Feedback
    </header>

    <!-- Feedback Form -->
    <form @submit.prevent="submitFeedback" class="p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">What's on your mind?</label>
        <textarea
          v-model="message"
          rows="5"
          placeholder="Tell us how we can improve, report an issue, or share an idea..."
          class="w-full p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003f7f] text-sm"
          required
        ></textarea>
      </div>

      <button
        type="submit"
        class="w-full py-2 bg-[#003f7f] text-white rounded-lg hover:bg-[#002a5c] transition font-semibold"
      >
        📤 Submit Feedback
      </button>

      <p v-if="success" class="text-green-600 font-medium text-center mt-2">
        ✅ Feedback sent successfully. Thank you!
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('')
const success = ref(false)

async function submitFeedback() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const feedbackData = {
    user_id: user?.id || null,
    message: message.value
  }

  try {
    const res = await fetch('https://jabumarket.com.ng/api/submit_feedback.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData)
    })

    const data = await res.json()
    if (data.success) {
      success.value = true
      message.value = ''
    } else {
      alert(data.message || 'Something went wrong.')
    }
  } catch (err) {
    console.error(err)
    alert('Error submitting feedback.')
  }
}
</script>
