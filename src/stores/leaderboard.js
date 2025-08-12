import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    xp: 0,
    level: 1,
    currentStreak: 0,
    badges: []
  }),
  actions: {
    setUser(data) {
      this.user = data
      this.xp = data?.xp ?? 0
      this.level = data?.level ?? 1
      this.currentStreak = data?.currentStreak ?? 0
      this.badges = data?.badges ?? []
    },
    updateXP(newXP) {
      this.xp = newXP
    },
    updateLevel(newLevel) {
      this.level = newLevel
    },
    updateStreak(streak) {
      this.currentStreak = streak
    },
    setBadges(badges) {
      this.badges = badges
    },
    logout() {
      this.user = null
      this.xp = 0
      this.level = 1
      this.currentStreak = 0
      this.badges = []
    }
  },
  persist: true
})
