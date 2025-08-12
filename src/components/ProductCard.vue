<template>
  <router-link
    :to="`/product/${product.id}`"
    class="block bg-white rounded-2xl shadow-sm hover:shadow-md transition duration-200 ease-in-out overflow-hidden group"
    aria-label="View product details"
  >
    <!-- ░░ Product Image + Verified Chip ░░ -->
    <div class="relative w-full h-40 bg-[#F7F9FC] overflow-hidden">
      <!-- ✔︎ CHIP (shows only for verified sellers) -->
      <span
        v-if="product.is_verified == 1 || product.is_verified === true"
        class="absolute top-2 left-2 flex items-center gap-1 bg-green-600/90 text-white text-[10px] font-semibold px-2 py-[2px] rounded-full shadow"
        title="Verified Seller"
      >
        <!-- tiny check icon -->
        <svg
          class="w-3 h-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="3"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        Verified
      </span>

      <!-- product photo -->
      <img
        :src="getImageUrl(product.image)"
        alt="Product image"
        loading="lazy"
        class="w-full h-full object-cover object-center transition-transform duration-200 group-hover:scale-105"
      />
    </div>

    <!-- ░░ Product Info ░░ -->
    <div class="px-3 py-2">
      <h3 class="text-sm font-medium text-[#2C3E50] line-clamp-2">
        {{ product.title }}
      </h3>

      <p class="text-[#003f7f] font-bold mt-1 text-base">
        ₦{{ product.price }}
      </p>
    </div>
  </router-link>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

function getImageUrl(path) {
  return `https://jabumarket.com.ng/${path}`
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
