<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
      <h1 class="text-2xl font-bold text-center mb-6 text-[#003f7f]">
        Welcome Back 👋
      </h1>

      <div class="space-y-4">
        <!-- Email Input -->
        <input
          v-model="email"
          type="email"
          placeholder="Email"
          class="field"
        />

        <!-- Password Input with Toggle -->
        <div class="relative">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="password"
            placeholder="Password"
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

        <!-- Login Button -->
        <button
          @click="login"
          :disabled="loading"
          class="btn-primary"
        >
          <span v-if="!loading">Login</span>
          <span v-else class="flex items-center gap-2">
            <svg class="spinner" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Loading…
          </span>
        </button>

        <!-- Error Message -->
        <p v-if="error" class="text-red-600 text-sm text-center">{{ error }}</p>

        <!-- Sign Up Link -->
        <p class="text-center text-sm mt-6">
          Don’t have an account?
          <router-link to="/register" class="link">Sign up</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const user   = useUserStore()

const email        = ref('')
const password     = ref('')
const error        = ref('')
const loading      = ref(false)
const showPassword = ref(false)

const base = import.meta.env.DEV
  ? 'https://jabumarket.com.ng/api'
  : '/api'

async function login() {
  error.value = ''
  loading.value = true

  try {
    const res = await fetch(`${base}/login.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await res.json()

    if (res.status === 403 && data.non_jabu) {
      return router.push({
        path: '/register',
        query: { reason: 'non-jabu', oldEmail: email.value }
      })
    }

    if (res.ok && data.success) {
      user.setUser(data.user)
      router.push(
        !data.user.department || !data.user.level
          ? '/complete-profile'
          : '/'
      )
    } else {
      error.value = data.error || 'Login failed.'
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
