<template>
  <button
    class="shrink-0 flex flex-col items-center w-20 mx-2 pt-3 pb-2 rounded-xl text-white shadow-lg"
    :class="gradientClass"
    @click="go"
  >
    <span class="text-xl">{{ icon }}</span>
    <span class="mt-1 text-[11px] font-medium leading-tight text-center">
      {{ title }}
    </span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  title:    { type: String, required: true },
  icon:     { type: String, required: true },
  to:       { type: String, required: true },
  gradient: { type: String, default: 'from-blue-600 to-indigo-600' }
})

const router = useRouter()
const go = () => router.push(props.to)

const gradientClass = computed(() => `bg-gradient-to-br ${props.gradient}`)
</script>
