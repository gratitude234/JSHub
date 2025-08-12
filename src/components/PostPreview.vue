<!-- components/PostPreview.vue -->
<template>
  <div class="bg-white rounded-lg p-3 shadow hover:bg-gray-50">
    <p class="text-sm leading-snug">
      <span class="font-semibold">{{ post.author }}:</span>
      {{ post.content }}
    </p>
    <p class="mt-1 text-[11px] text-gray-500">{{ post.comments }} comments</p>
  </div>
</template>
<script setup>
defineProps(['post'])
</script>
