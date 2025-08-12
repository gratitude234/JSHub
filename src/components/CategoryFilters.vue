<template>
  <div class="px-4 py-2 overflow-x-auto whitespace-nowrap no-scrollbar" aria-label="Category Filters">
    <button
      v-for="cat in categories"
      :key="cat"
      @click="selectCategory(cat)"
      :class="[
        'inline-block px-4 py-2 mr-2 rounded-full text-sm font-medium focus:outline-none focus:ring-2',
        selectedCategory === cat
          ? 'bg-[#003f7f] text-white'
          : 'bg-white border border-gray-300 text-[#2C3E50]'
      ]"
      :aria-pressed="selectedCategory === cat"
    >
      {{ cat }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    default: () => []
  },
  selectedCategory: {
    type: String,
    default: 'All'
  }
})
const emits = defineEmits(['update:category'])
function selectCategory(cat) {
  emits('update:category', cat)
}
</script>
