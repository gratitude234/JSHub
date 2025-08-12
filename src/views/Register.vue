<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
      <h1 class="text-2xl font-bold text-center mb-6 text-[#003f7f]">
        Create Your Account 🎉
      </h1>

      <div class="space-y-4">
        <!-- Name Input -->
        <input
          v-model="name"
          type="text"
          placeholder="Full Name"
          class="field"
        />

        <!-- Email Input -->
        <input
          v-model="email"
          type="email"
          placeholder="Email Address"
          class="field"
        />

        <!-- Password with Toggle -->
        <div class="relative">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Create Password"
            class="field pr-10"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="toggle-eye"
          >
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>

        <!-- Department Select -->
        <select v-model="department" class="field">
          <option disabled value="">Select Department</option>
          <option
            v-for="d in departments"
            :key="d"
            :value="d"
          >
            {{ d }}
          </option>
        </select>

        <!-- Level Select -->
        <select v-model="level" class="field">
          <option disabled value="">Select Level</option>
          <option v-for="l in [100,200,300,400]" :key="l">
            {{ l }}
          </option>
        </select>

        <!-- Register Button -->
        <button
          @click="register"
          :disabled="loading"
          class="btn-primary"
        >
          <span v-if="!loading">Register</span>
          <span v-else class="flex items-center gap-2">
            <svg class="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Registering…
          </span>
        </button>

        <!-- Error Message -->
        <p v-if="error" class="text-red-600 text-sm text-center">{{ error }}</p>

        <!-- Link to Login -->
        <p class="text-center text-sm mt-6">
          Already have an account?
          <router-link to="/login" class="link">Login</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const name       = ref('')
const email      = ref('')
const password   = ref('')
const department = ref('')
const level      = ref('')
const error      = ref('')
const loading    = ref(false)
const showPassword = ref(false)

const departments = [
  'Nursing',
  'Computer Science',
  'Medical Laboratory Science',
  'Biochemistry',
  'Microbiology',
  'Mass Communication',
  'Economics',
  'Business Administration',
  'Accounting',
  'Public Administration',
  'Political Science',
  'Physics',
  'Chemistry',
  'Mathematics',
  'Architecture',
  'Agricultural Science',
  'Law',
  'Philosophy',
  'English'
]

const base = import.meta.env.DEV
  ? 'https://jabumarket.com.ng/api'
  : '/api'

async function register() {
  error.value = ''
  loading.value = true

  if (!name.value ||
      !email.value ||
      !password.value ||
      !department.value ||
      !level.value
  ) {
    error.value = 'Please fill in all fields.'
    loading.value = false
    return
  }

  try {
    const res = await fetch(`${base}/register.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
        department: department.value,
        level: level.value
      })
    })
    const data = await res.json()

    if (res.ok && data.success) {
      router.push('/login')
    } else {
      error.value = data.error || 'Registration failed.'
    }
  } catch {
    error.value = 'Network error.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.field {
  @apply w-full px-4 py-3 border border-gray-300 rounded-xl
         focus:outline-none focus:ring-2 focus:ring-[#003f7f] text-sm;
}
.btn-primary {
  @apply w-full bg-[#003f7f] hover:bg-[#002f63] text-white py-3
         rounded-xl font-semibold flex items-center justify-center gap-2;
}
.spinner {
  @apply animate-spin h-5 w-5 text-white opacity-75;
}
.toggle-eye {
  @apply absolute top-1/2 right-4 -translate-y-1/2 text-gray-500
         hover:text-gray-800;
}
.link {
  @apply text-[#003f7f] font-medium hover:underline;
}
</style>
