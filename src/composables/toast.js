import { reactive } from 'vue'

/**
 * A simple reactive store of toasts.
 * Each toast has { id, message, type }.
 */
const store = reactive({
  toasts: []
})

/**
 * useToast() gives you:
 *  - success(message, options) to push a green toast
 *  - toasts array to render in your layout
 */
export function useToast() {
  function success(message, { duration = 3000 } = {}) {
    const id = Date.now() + Math.random()  // unique
    store.toasts.push({ id, message, type: 'success' })
    setTimeout(() => {
      const idx = store.toasts.findIndex(t => t.id === id)
      if (idx !== -1) store.toasts.splice(idx, 1)
    }, duration)
  }

  return {
    success,
    toasts: store.toasts
  }
}
