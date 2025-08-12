<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-20">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-5 text-center text-xl font-bold shadow-md">
      ✍️ Application Form
    </header>

    <!-- Form Section -->
    <section class="p-6 space-y-6">
      <form @submit.prevent="submitForm" class="space-y-4 bg-white shadow-lg p-6 rounded-xl">
        <!-- Full Name -->
        <div>
          <label class="block text-sm font-medium mb-1">Full Name</label>
          <input v-model="form.name" type="text" :disabled="loading" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003f7f] focus:outline-none" />
        </div>

        <!-- Department -->
        <div>
          <label class="block text-sm font-medium mb-1">Department</label>
          <input v-model="form.department" type="text" :disabled="loading" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003f7f] focus:outline-none" />
        </div>

        <!-- Level -->
        <div>
          <label class="block text-sm font-medium mb-1">Level</label>
          <select v-model="form.level" :disabled="loading" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003f7f] focus:outline-none">
            <option disabled value="">Select level</option>
            <option>100</option>
            <option>200</option>
            <option>300</option>
            <option>400</option>
          </select>
        </div>

        <!-- Role -->
        <div>
          <label class="block text-sm font-medium mb-1">Role You're Applying For</label>
          <select v-model="form.role" :disabled="loading" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003f7f] focus:outline-none">
            <option disabled value="">Choose a role</option>
            <option>📸 Content Creator</option>
            <option>📢 Campus Marketer</option>
            <option>💬 Community Manager</option>
            <option>📚 Study Rep</option>
            <option>🧠 Student Advisor</option>
          </select>
        </div>

        <!-- Reason -->
        <div>
          <label class="block text-sm font-medium mb-1">Why do you want to join?</label>
          <textarea v-model="form.reason" rows="4" :disabled="loading" required class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003f7f] focus:outline-none"></textarea>
        </div>

        <!-- Submit Button -->
        <div class="text-center">
          <button
            type="submit"
            :disabled="loading"
            class="bg-[#003f7f] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#002a5c] transition flex items-center justify-center mx-auto"
          >
            <span v-if="!loading">🚀 Submit Application</span>
            <span v-else class="flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Submitting...
            </span>
          </button>
        </div>
      </form>

      <!-- Success Message -->
      <div v-if="submitted" class="text-center text-green-600 font-semibold">
        ✅ Your application has been submitted!
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  department: '',
  level: '',
  role: '',
  reason: ''
})

const submitted = ref(false)
const loading = ref(false)

const submitForm = async () => {
  loading.value = true
  try {
    const response = await fetch('https://jabumarket.com.ng/api/submit_application.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })

    const result = await response.json()

    if (result.success) {
      submitted.value = true
      form.value = { name: '', department: '', level: '', role: '', reason: '' }
    } else {
      alert(result.message)
    }
  } catch (error) {
    console.error('Submission error:', error)
    alert('Submission failed. Please try again.')
  } finally {
    loading.value = false
  }
}
</script>
