<!-- components/BottomNav.vue -->
<template>
  <nav
    class="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2"
  >
    <NavItem to="/" label="Home" icon="🏠" />
    <NavItem to="/study-hub" label="Study" icon="📚" />
    <NavItem to="/community" label="Feed" icon="💬" />
    <NavItem to="/profile" label="Me" icon="👤" />
  </nav>
</template>
<script setup>
import NavItem from './NavItem.vue'
</script>
