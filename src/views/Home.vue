<!-- src/views/Home.vue -->
<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-24">
    <!-- Header (mobile sticky) -->
   <!-- Mobile Header (drop-in) -->
<header
  class="sticky top-0 z-50 bg-[#003F7F] text-white shadow"
  :style="{ paddingTop: safeTop }"
>
  <!-- Top row -->
  <div class="px-4 py-2.5 flex items-center gap-3">
    <button
      class="h-10 w-10 grid place-items-center rounded-full active:scale-95"
      aria-label="Open menu"
      @click="openMenu"
    >
      ☰
    </button>

    <h1 class="flex-1 text-center font-extrabold tracking-wide text-[15px]">
      JABU MARKET yoo
    </h1>

    <button
      class="h-10 w-10 grid place-items-center rounded-full relative active:scale-95"
      aria-label="Notifications"
      @click="goNotifications"
    >
      🔔
      <span
        v-if="unreadCount>0"
        class="absolute -right-0.5 -top-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-[10px] font-bold grid place-items-center"
      >
        {{ unreadCount }}
      </span>
    </button>
  </div>

  <!-- Search pill -->
  <div class="px-4 pb-3">
    <label class="relative block">
      <input
        v-model.trim="q"
        type="search"
        inputmode="search"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
        class="w-full rounded-xl bg-white/95 text-[#2C3E50] border-0 px-4 py-3 pr-11 text-[15px] placeholder-gray-400 focus:outline-none"
        :placeholder="searchPlaceholder"
        @keyup.enter="onSearch"
      />
      <button
        class="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-lg active:scale-95"
        aria-label="Search"
        @click="onSearch"
      >
        🔎
      </button>
    </label>
  </div>
</header>


    <!-- Quick greet -->
    <section class="px-4 py-3 text-[13px] text-gray-600">
      👋 Welcome back, <span class="font-semibold">{{ userName }}</span>!
    </section>

    <!-- Quick actions (3 cards) -->
    <section class="px-4">
      <div class="grid grid-cols-3 gap-2">
        <RouterLink
          v-for="card in quickCards"
          :key="card.title"
          :to="card.to"
          class="rounded-xl bg-white p-3 text-center shadow active:scale-[0.98] transition"
        >
          <div class="text-2xl mb-1">{{ card.icon }}</div>
          <div class="text-[12px] font-semibold text-[#003F7F] leading-tight">
            {{ card.title }}
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Hot Deals (horizontal) -->
    <section class="mt-5">
      <div class="px-4 flex items-center justify-between">
        <h3 class="font-semibold text-[#003F7F] text-[15px]">🔥 Hot Deals</h3>
        <RouterLink to="/market" class="text-[12px] text-[#003F7F]">See all</RouterLink>
      </div>

      <div class="mt-2 overflow-x-auto no-scrollbar">
        <div class="flex gap-3 px-4 pb-1">
          <article
            v-for="d in deals"
            :key="d.id"
            class="min-w-[136px] w-[136px] rounded-xl bg-white shadow"
          >
            <div class="h-24 w-full rounded-t-xl bg-gray-100 overflow-hidden">
              <img :src="d.img" :alt="d.name" class="h-full w-full object-cover" loading="lazy" />
            </div>
            <div class="p-3">
              <h4 class="line-clamp-1 text-[13px] font-semibold">{{ d.name }}</h4>
              <p class="text-[11px] text-gray-500 mb-1">{{ d.badge }}</p>
              <p class="text-[13px] font-bold text-green-700">₦{{ formatPrice(d.price) }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Announcements -->
    <section class="mt-6 px-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-[#003F7F] text-[15px]">📣 Announcements</h3>
        <RouterLink to="/announcements" class="text-[12px] text-[#003F7F]">See all</RouterLink>
      </div>

      <div class="mt-2 space-y-2">
        <article
          v-for="a in announcements"
          :key="a.id"
          class="rounded-xl bg-white p-3.5 shadow active:scale-[0.99] transition"
        >
          <div class="flex items-center gap-2 text-[11px] text-gray-500 mb-0.5">
            <span>📌</span><span>{{ a.date }}</span><span class="mx-1">•</span><span>{{ a.tag }}</span>
          </div>
          <h4 class="font-semibold text-[14px] mb-0.5">{{ a.title }}</h4>
          <p class="text-[13px] text-gray-700 line-clamp-2">{{ a.body }}</p>
        </article>
      </div>
    </section>

    <!-- Campus Vibes -->
    <section class="mt-6 px-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-[#003F7F] text-[15px]">🤙 Campus Vibes</h3>
        <RouterLink to="/vibes" class="text-[12px] text-[#003F7F]">See all</RouterLink>
      </div>
      <div class="mt-2 space-y-2">
        <article v-for="v in vibes" :key="v.id" class="rounded-xl bg-white p-3.5 shadow">
          <p class="text-[13px]">{{ v.text }}</p>
        </article>
      </div>
    </section>

    <!-- Lost & Found -->
    <section class="mt-6 px-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-[#003F7F] text-[15px]">🧭 Lost & Found</h3>
        <RouterLink to="/lost-found" class="text-[12px] text-[#003F7F]">See all</RouterLink>
      </div>
      <div class="mt-2 space-y-2">
        <article v-for="l in lostFound" :key="l.id" class="rounded-xl bg-white p-3.5 shadow">
          <p class="text-[13px]"><span class="font-semibold">Item:</span> {{ l.item }}</p>
          <p class="text-[13px]"><span class="font-semibold">Found at:</span> {{ l.place }}</p>
        </article>
      </div>
    </section>

    <!-- From the Blog -->
    <section class="mt-6 px-4">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold text-[#003F7F] text-[15px]">📝 From the Blog</h3>
        <RouterLink to="/blog" class="text-[12px] text-[#003F7F]">See all</RouterLink>
      </div>
      <div class="mt-2 space-y-2">
        <article v-for="b in blog" :key="b.id" class="rounded-xl bg-white p-3.5 shadow">
          <h4 class="font-semibold text-[14px]">{{ b.title }}</h4>
          <p class="text-[13px] text-gray-700 line-clamp-2">{{ b.snip }}</p>
        </article>
      </div>
    </section>

    <!-- WhatsApp CTA -->
    <section class="mt-6 px-4">
      <a
        :href="waLink"
        target="_blank"
        rel="noopener"
        class="block rounded-2xl bg-white p-4 shadow text-center active:scale-[0.99] transition"
      >
        <div class="text-[14px] font-semibold text-[#003F7F] mb-0.5">Got Feedback?</div>
        <div class="text-[13px] text-gray-600 mb-2">Help improve JABU MARKET.</div>
        <div class="inline-flex items-center gap-2 rounded-xl bg-[#003F7F] px-4 py-2 text-white text-[13px] font-semibold">
          💬 Chat on WhatsAppp
        </div>
      </a>
    </section>

    <!-- Floating Action Button -->
    <button
      class="fixed bottom-20 right-4 h-12 w-12 rounded-full bg-[#003F7F] text-white shadow-lg grid place-items-center text-2xl active:scale-95"
      @click="onFab"
      aria-label="Create"
    >
      +
    </button>

    <!-- Bottom Tab Bar -->
    <nav class="fixed bottom-0 inset-x-0 bg-white border-t shadow-[0_-4px_8px_rgba(0,0,0,0.04)]">
      <ul class="grid grid-cols-5 text-[11px] text-gray-600">
        <li v-for="t in bottomTabs" :key="t.to">
          <RouterLink
            :to="t.to"
            class="flex flex-col items-center py-2.5"
            :class="t.active ? 'text-[#003F7F] font-semibold' : ''"
          >
            <div class="text-lg">{{ t.icon }}</div>
            <div>{{ t.label }}</div>
          </RouterLink>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()

/* State */
const userName = 'Gratitude' // swap for real user store
const q = ref('')
const searchPlaceholder = 'Buy gadgets…'

const quickCards = [
  { title: 'Market', to: '/market', icon: '🛍️' },
  { title: 'Study',  to: '/study-hub', icon: '📚' },
  { title: 'Blog',   to: '/blog', icon: '📰' }
]

const deals = [
  { id: 1, name: 'Nail File', price: 500, badge: 'NEW', img: 'https://picsum.photos/seed/nail/300/200' },
  { id: 2, name: 'Perfume oil', price: 700, badge: 'HOT', img: 'https://picsum.photos/seed/perfume/300/200' },
  { id: 3, name: 'Mini Satin Scrunchies', price: 300, badge: 'DEAL', img: 'https://picsum.photos/seed/scrunch/300/200' },
  { id: 4, name: 'Claw Clips', price: 1500, badge: 'TREND', img: 'https://picsum.photos/seed/clips/300/200' },
  { id: 5, name: 'Corporate shirt (female)', price: 3500, badge: 'NEW', img: 'https://picsum.photos/seed/shirt/300/200' }
]

const announcements = [
  {
    id: 1,
    tag: 'Quick announcement',
    date: 'Jun 19',
    title: 'GTM 108 theory-based exam questions now live',
    body: 'Find them under Theory Drill. CSC 123 questions also uploaded. Good luck!'
  }
]

const vibes = [
  { id: 1, text: 'This is a Chemistry Practical PDF for anyone who needs it.' },
  { id: 2, text: 'Abeg I wan sabi this guy wey dem dey call Gratitude. this shit is crazy.' }
]

const lostFound = [
  { id: 1, item: 'Black Samsung Galaxy A10', place: 'JABU Library' },
  { id: 2, item: 'Blue Backpack', place: 'School Cafeteria' }
]

const blog = [
  { id: 1, title: 'True Friendship Beyond The Fence.', snip: 'A friend is one who overlooks your broken fence…' },
  { id: 2, title: 'The Beautiful Struggle: Finding Purpose in the Pursuit', snip: 'What a blessing it is to be tried in the pursuit…' }
]

const waLink = 'https://wa.me/2348012345678?text=Hi%20JABU%20MARKET%20team%2C%20I%20have%20feedback.'

const bottomTabs = [
  { to: '/', label: 'Home', icon: '🏠', active: true },
  { to: '/study-hub', label: 'Study', icon: '📚' },
  { to: '/market', label: 'Market', icon: '🛍️' },
  { to: '/vibes', label: 'Vibes', icon: '💬' },
  { to: '/profile', label: 'Profile', icon: '👤' }
]

/* Methods */
function formatPrice(n) {
  return new Intl.NumberFormat('en-NG').format(n)
}
function onFab() {
  router.push('/create') // e.g. create listing/post
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
