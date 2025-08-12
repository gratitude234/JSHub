<template>
  <div class="min-h-screen bg-[#F7F9FC] pb-28 text-[#2C3E50] relative">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-4 text-center font-bold text-xl shadow-md space-y-1">
      <div>📢 Did You Know?</div>
      <p class="text-xs font-normal text-gray-200">Boost your mind with amazing facts!</p>
    </header>

    <!-- Surprise-Me button -->
    <div class="p-4 flex justify-center">
      <button
        @click="showRandomFact"
        class="bg-[#003f7f] text-white py-2 px-6 rounded-full shadow hover:bg-[#002f5f] transition"
      >
        🎲 Surprise Me!
      </button>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="p-4 space-y-4 animate-pulse">
      <div v-for="n in 4" :key="n" class="h-20 bg-white rounded-xl shadow" />
    </div>

    <!-- Facts -->
    <div v-else class="p-4 space-y-6">
      <div
        v-for="(fact, index) in facts"
        :key="fact.id"
        class="bg-white rounded-xl shadow p-5 flex flex-col space-y-3 hover:scale-[1.02] transition-all duration-300 ease-in-out"
      >
        <h2 class="text-lg font-bold text-[#003f7f] flex items-center gap-2">
          📚 Fun Fact #{{ index + 1 }}
        </h2>

        <p class="text-sm leading-relaxed">
          {{ fact.text }}
        </p>

        <!-- Controls -->
        <div class="flex items-center justify-between text-sm">
          <button
            @click="toggleLike(index)"
            :disabled="likeProcessing"
            class="flex items-center gap-1 transition duration-300"
            :class="[
              likedFacts.includes(fact.id) ? 'text-red-600 scale-110' : 'text-gray-400',
              animatingIndex === index ? 'animate-bounce' : ''
            ]"
          >
            ❤️ {{ fact.likes }}
          </button>

          <button @click="shareFact(fact.text)" class="text-green-600 underline hover:opacity-80">
            🔗 Share
          </button>
        </div>
      </div>
    </div>

    <!-- Surprise modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 w-11/12 max-w-md space-y-4 animate-zoomIn">
        <h2 class="text-lg font-bold text-[#003f7f]">🎉 Surprise Fact!</h2>
        <p class="text-sm">{{ randomFact }}</p>
        <button
          @click="closeModal"
          class="mt-4 w-full bg-[#003f7f] text-white py-2 rounded-full shadow hover:bg-[#002f5f] transition"
        >
          Close
        </button>
      </div>
    </div>

    <!-- tiny audio element -->
    <audio ref="likeAudio" src="https://assets.mixkit.co/sfx/download/mixkit-select-click-1109.mp3" preload="auto" />
  </div>
</template>

<script>
export default {
  name: 'DidYouKnow',
  data() {
    return {
      apiBaseUrl: 'https://jabumarket.com.ng/api',
      facts: [],
      likedFacts: JSON.parse(localStorage.getItem('likedFacts') || '[]'),
      loading: true,
      likeProcessing: false,
      animatingIndex: null,          // for little heart bounce
      showModal: false,
      randomFact: ''
    };
  },
  async mounted() {
    await this.fetchFacts();
  },
  methods: {
    /* ---------- get facts ---------- */
    async fetchFacts() {
      this.loading = true;
      try {
        const res = await fetch(`${this.apiBaseUrl}/get_facts.php`);
        this.facts = await res.json();
      } catch (e) {
        console.error('Fetch facts failed', e);
      } finally {
        this.loading = false;
      }
    },

    /* ---------- like / unlike ---------- */
    async toggleLike(index) {
      if (this.likeProcessing) return;
      this.likeProcessing = true;

      const fact = this.facts[index];
      const liked = this.likedFacts.includes(fact.id);
      const endpoint = liked ? 'unlike_fact.php' : 'like_fact.php';

      try {
        const res = await fetch(`${this.apiBaseUrl}/${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: fact.id })
        });
        const result = await res.json();

        if (result.success) {
          /* play tiny click sound & vibration */
          this.$refs.likeAudio.currentTime = 0;
          this.$refs.likeAudio.play();
          if (navigator.vibrate) navigator.vibrate(60);

          /* bounce animation */
          this.animatingIndex = index;
          setTimeout(() => (this.animatingIndex = null), 400);

          /* update counts + localStorage */
          if (liked) {
            this.facts[index].likes = Math.max(fact.likes - 1, 0);
            this.likedFacts = this.likedFacts.filter(id => id !== fact.id);
          } else {
            this.facts[index].likes = fact.likes + 1;
            this.likedFacts.push(fact.id);
          }
          localStorage.setItem('likedFacts', JSON.stringify(this.likedFacts));
        }
      } catch (e) {
        console.error('Toggle like failed', e);
      } finally {
        this.likeProcessing = false;
      }
    },

    /* ---------- share ---------- */
    shareFact(text) {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} 📚 #DidYouKnow`)}`;
      window.open(url, '_blank');
    },

    /* ---------- surprise modal ---------- */
    showRandomFact() {
      if (!this.facts.length) return;
      const i = Math.floor(Math.random() * this.facts.length);
      this.randomFact = this.facts[i].text;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    }
  }
};
</script>

<style scoped>
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');

/* quick zoom for modal */
@keyframes zoomIn {
  from { transform: scale(0.8); opacity: 0; }
  to   { transform: scale(1);   opacity: 1; }
}
.animate-zoomIn { animation: zoomIn 0.25s ease; }

/* slide animation removed because leaderboard removed */

/* Tailwind’s animate-bounce lasts 1s; shorten */
.animate-bounce { animation: bounce 0.4s; }
</style>
