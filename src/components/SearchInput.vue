<template>
  <div class="p-4 bg-white sticky top-0 z-10 shadow-sm">
    <input
      :value="modelValue"
      @input="onInput"
      type="text"
      placeholder="Search products..."
      aria-label="Search products"
      class="w-full px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#003f7f]"
    />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})
const emits = defineEmits(['update:modelValue'])
let timer = null
function onInput(event) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    emits('update:modelValue', event.target.value)
  }, 300)
}
</script>
