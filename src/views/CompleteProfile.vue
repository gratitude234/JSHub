<template>
  <div class="min-h-screen flex items-center justify-center bg-[#F7F9FC] px-4">
    <div class="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 space-y-6">
      <!-- Header -->
      <div class="text-center">
        <h1 class="text-2xl font-bold text-[#003f7f]">Complete Your Profile</h1>
        <p class="text-sm text-gray-500 mt-1">Let’s personalize your experience 🧠</p>
      </div>

      <!-- Avatar Upload -->
      <div class="flex justify-center">
        <div class="relative w-24 h-24">
          <img
            v-if="profilePicture"
            :src="profilePicture"
            alt="Profile"
            class="w-24 h-24 rounded-full object-cover shadow"
          />
          <div
            v-else
            class="w-24 h-24 bg-[#003f7f] text-white flex items-center justify-center text-xl font-bold rounded-full shadow"
          >
            {{ initials }}
          </div>
          <label
            class="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer shadow hover:scale-105 transition"
          >
            📷
            <input type="file" accept="image/*" class="hidden" @change="handleFile" />
          </label>
        </div>
      </div>

      <!-- Profile Info -->
      <div class="space-y-4 text-sm">
        <div>
          <label class="block text-gray-600">Full Name</label>
          <input
            v-model="name"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-700"
          />
        </div>
        <div>
          <label class="block text-gray-600">Email</label>
          <input
            :value="user.email"
            disabled
            class="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-700"
          />
        </div>
      </div>

      <!-- Select Fields -->
      <div class="space-y-4">
        <div>
          <label class="block text-gray-700 text-sm mb-1">Select Department</label>
          <select
            v-model="department"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003f7f] text-sm"
          >
            <option disabled value="">-- Choose --</option>
            <option>Nursing</option>
            <option>Computer Science</option>
            <option>Medical Laboratory Science</option>
            <option>Biochemistry</option>
            <option>Microbiology</option>
            <option>Mass Communication</option>
            <option>Economics</option>
            <option>Business Administration</option>
            <option>Accounting</option>
            <option>Public Administration</option>
            <option>Political Science</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>Architecture</option>
            <option>Agricultural Science</option>
            <option>Law</option>
            <option>Philosophy</option>
            <option>English</option>
          </select>
        </div>
        <div>
          <label class="block text-gray-700 text-sm mb-1">Select Level</label>
          <select
            v-model="level"
            class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#003f7f] text-sm"
          >
            <option disabled value="">-- Choose --</option>
            <option>100</option>
            <option>200</option>
            <option>300</option>
            <option>400</option>
          </select>
        </div>
      </div>

      <!-- Save Button -->
      <button
        @click="submitForm"
        :disabled="loading"
        class="w-full bg-[#003f7f] hover:bg-[#002f63] text-white py-3 rounded-xl font-semibold transition duration-300"
      >
        <span v-if="loading">Saving...</span>
        <span v-else>Save & Continue</span>
      </button>

      <!-- Feedback -->
      <p v-if="error" class="text-red-600 text-sm text-center">{{ error }}</p>
      <p v-if="success" class="text-green-600 text-sm text-center">{{ success }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

// Router + store
const router     = useRouter()
const userStore  = useUserStore()
const { user }   = storeToRefs(userStore)

// Local form state
const name            = ref(user.value.name        || '')
const department      = ref(user.value.department  || '')
const level           = ref(user.value.level       || '')
const profilePicture  = ref(user.value.profile_picture || '')
const selectedFile    = ref(null)

const loading = ref(false)
const error   = ref('')
const success = ref('')

// Compute initials
const initials = computed(() =>
  (name.value || '')
    .split(' ')
    .map(n => n[0]||'')
    .join('')
    .slice(0,2)
    .toUpperCase()
)

function handleFile(e) {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    profilePicture.value = URL.createObjectURL(file)
  }
}

async function submitForm() {
  error.value = ''
  success.value = ''
  loading.value = true

  if (!name.value || !department.value || !level.value) {
    error.value = 'Please fill all fields.'
    loading.value = false
    return
  }

  const formData = new FormData()
  formData.append('user_id',        user.value.id)
  formData.append('name',           name.value)
  formData.append('department',     department.value)
  formData.append('level',          level.value)
  formData.append('academic_level', level.value)
  if (selectedFile.value) {
    formData.append('profile_picture', selectedFile.value)
  }

  try {
    const res = await fetch(
      'https://jabumarket.com.ng/api/update_full_profile.php',
      {
        method:      'POST',
        credentials: 'include',        // ← send cookies for session auth
        body:        formData
      }
    )
    const data = await res.json()

    console.log('⚙️ UPDATE PROFILE STATUS:', res.status, data)

    if (res.ok && data.success && data.user) {
      userStore.setUser(data.user)
      success.value = '✅ Profile updated successfully!'
      const firstTime = !localStorage.getItem('first_time_profile_complete')
      if (firstTime) {
        localStorage.setItem('first_time_profile_complete', 'true')
        setTimeout(() => router.push('/'), 1500)
      } else {
        setTimeout(() => router.push('/profile'), 1500)
      }
    } else {
      // show whatever the server sent back
      error.value = data.error || '❌ Update failed.'
    }
  } catch (err) {
    console.error('⚠️ Network error', err)
    error.value = '❌ Network error. Try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Tailwind @apply rules */
.action-button {
  @apply bg-white border border-[#003f7f] text-[#003f7f] py-3 rounded-xl font-semibold shadow text-center hover:bg-[#f0faff] transition-transform duration-200 hover:scale-105;
}
.upload-card {
  @apply bg-white border border-gray-300 rounded-xl p-4 shadow hover:shadow-md transition duration-300;
}
</style>
