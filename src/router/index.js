import { createRouter, createWebHistory } from 'vue-router'
import { h, defineComponent } from 'vue'
import Home from '../views/Home.vue'
import Library from '../views/Library.vue'
import Ask from '../views/Ask.vue'
import QuickDrill from '../views/QuickDrill.vue' // ✅ real Quick Drill page

// Render-function stub
const Stub = (name) => defineComponent({
  name: `${name}Stub`,
  setup() {
    return () => h('div', { class: 'min-h-dvh bg-[#F7F9FC] text-[#2C3E50] p-6' }, [
      h('h1', { class: 'text-xl font-semibold mb-2' }, `Coming soon: ${name}`),
      h('p', { class: 'text-[14px] text-gray-600' },
        'This is a placeholder so navigation works while we build ' + name + '.')
    ])
  }
})

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/library', name: 'library', component: Library },

  // Real pages
  { path: '/ask', name: 'ask', component: Ask },

  // ✅ Quick Drill
  {
    path: '/drill/quick',
    name: 'quick-drill',
    component: QuickDrill,
    alias: ['/quick-drill', '/qd']
  },

  // 🔁 Legacy support so old links keep working
  {
    path: '/practice/drill',
    redirect: to => ({
      name: 'quick-drill',
      query: {
        pack: to.query.pack ?? 'nursing-200l',
        limit: to.query.limit ?? 5
      }
    })
  },

  // Stubs
  { path: '/reader',        name: 'reader',        component: Stub('Reader') },
  { path: '/practice',      name: 'practice',      component: Stub('Practice') },
  { path: '/results',       name: 'results',       component: Stub('Results') },
  { path: '/downloads',     name: 'downloads',     component: Stub('Offline Manager') },
  { path: '/menu',          name: 'menu',          component: Stub('Menu') },
  { path: '/notifications', name: 'notifications', component: Stub('Notifications') },

  { path: '/:pathMatch(.*)*', name: 'not-found', component: Stub('404') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    return { top: 0 }
  }
})

export default router
