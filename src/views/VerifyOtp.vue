<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-lg p-6">
      <h1 class="text-2xl font-bold text-center mb-6 text-[#003f7f]">Verify Your Email 📩</h1>

      <div class="space-y-4">
        <input
          v-model="otp"
          type="text"
          placeholder="Enter the 6-digit OTP code"
          maxlength="6"
          class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003f7f] text-sm placeholder-gray-500 text-center"
        />
        <button
          @click="verifyOtp"
          :disabled="loading"
          class="w-full bg-[#003f7f] hover:bg-[#002f63] text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
        >
          <span v-if="!loading">Verify OTP</span>
          <span v-else class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Verifying...
          </span>
        </button>

        <div class="text-center text-sm text-gray-600 mt-4">
          <span v-if="timer > 0">Resend OTP in {{ timer }}s</span>
          <button v-else @click="resendOtp" class="text-[#003f7f] hover:underline">Resend OTP</button>
        </div>
      </div>

      <p v-if="error" class="text-red-600 text-sm mt-4 text-center">{{ error }}</p>
      <p v-if="success" class="text-green-600 text-sm mt-4 text-center">{{ success }}</p>

      <div class="text-center mt-6 text-sm text-gray-600">
        Didn't register?
        <router-link to="/register" class="text-[#003f7f] hover:underline">Start Again</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const otp      = ref('')
const loading  = ref(false)
const error    = ref('')
const success  = ref('')
const timer    = ref(30)
let intervalId = null
const router   = useRouter()

// timer for resend
onMounted(()   => startTimer())
onUnmounted(() => clearInterval(intervalId))

function startTimer() {
  timer.value = 30
  intervalId = setInterval(() => {
    if (timer.value > 0) timer.value-- 
    else clearInterval(intervalId)
  }, 1000)
}

async function verifyOtp() {
  error.value   = ''
  success.value = ''
  loading.value = true

  const pending = JSON.parse(localStorage.getItem('pendingRegistration') || '{}')
  if (!pending.email) {
    error.value = 'Session expired. Please register again.'
    router.push('/register')
    return
  }

  try {
    const res = await fetch(
      'https://jabumarket.com.ng/api/verify_otp.php?debug=1',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:           pending.email,
          otp:             otp.value,
          name:            pending.name,
          password:        pending.password,
          department:      pending.department,
          level:           pending.level,
          academic_level:  pending.academic_level
        })
      }
    )
    const data = await res.json()

    console.log('VERIFY-DEBUG → status:', res.status)
    console.log('VERIFY-DEBUG → payload:', data)

    if (data.debug) {
      console.group('🔍 REGISTRATION DEBUG INFO')
      console.log('Session OTP:    ', data.debug.session_otp)
      console.log('Input OTP:      ', data.debug.input_otp)
      console.log('OTP verify:     ', data.debug.otp_verify)
      console.log('Raw password:   ', data.debug.raw_password)
      console.log('DB hash:        ', data.debug.db_hash)
      console.log('Hash length:    ', data.debug.hash_length)
      console.groupEnd()
    }

    if (res.ok && data.success) {
      success.value = 'Account created! Redirecting to login…'
      localStorage.removeItem('pendingRegistration')
      setTimeout(() => router.push('/login'), 2000)
    } else {
      error.value = data.error || 'OTP verification failed.'
    }
  } catch (err) {
    console.error('VERIFY-DEBUG → network error', err)
    error.value = 'Network error'
  } finally {
    loading.value = false
  }
}

async function resendOtp() {
  error.value   = ''
  success.value = ''

  const pending = JSON.parse(localStorage.getItem('pendingRegistration') || '{}')
  if (!pending.email) {
    router.push('/register')
    return
  }

  try {
    const res = await fetch('https://jabumarket.com.ng/api/send_otp.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pending.email })
    })
    const data = await res.json()
    if (res.ok && data.success) {
      success.value = 'OTP resent!'
      startTimer()
    } else {
      error.value = data.error || 'Failed to resend OTP.'
    }
  } catch (err) {
    console.error(err)
    error.value = 'Network error'
  }
}
</script>
