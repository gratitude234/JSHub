<template>
  <div class="min-h-screen bg-[#F7F9FC] text-[#2C3E50] pb-20">
    <!-- Header -->
    <header class="bg-[#003f7f] text-white py-5 text-center text-xl font-bold shadow-md">
      🚀 Join Our JABU Team!
    </header>

    <!-- Main Section -->
    <section class="px-5 py-6 space-y-6">
      <!-- Pitch -->
      <div class="card border-l-[#28a745]">
        <h2 class="text-xl font-bold mb-2">Building the Future at JABU!</h2>
        <p class="text-sm">
          JABU Market isn’t just a marketplace — it’s your all-in-one student hub with quizzes, tools, blogs, and vibes.
          Join a team shaping something special for campus!
        </p>
      </div>

      <!-- Benefits -->
      <div class="card border-l-[#7f4000]">
        <h3 class="text-lg font-semibold mb-3">✨ Benefits You'll Love:</h3>
        <ul class="space-y-2 text-sm">
          <li>🎯 <strong>Professional Experience:</strong> Real roles for your CV & LinkedIn.</li>
          <li>💰 <strong>Profit Sharing:</strong> Earn from your contributions.</li>
          <li>📜 <strong>Certifications:</strong> Gain verified certificates and recs.</li>
          <li>🚀 <strong>VIP Access:</strong> Get early access to features.</li>
          <li>🌟 <strong>Leadership:</strong> Lead and grow your squad.</li>
        </ul>
      </div>

      <!-- Team Structure -->
      <div class="card border-l-blue-400">
        <h3 class="text-lg font-semibold mb-3">🧩 How the Team Works</h3>
        <p class="text-sm mb-3">
          We work in squads. Each group is led by a Campus Lead, collaborating with key roles across the board.
        </p>
        <ul class="text-sm space-y-1">
          <li>👑 <strong>Campus Lead</strong></li>
          <li class="ml-4">↳ 💬 Community Manager</li>
          <li class="ml-8">↳ 📸 Content Creators</li>
          <li class="ml-8">↳ 📚 Study Reps</li>
          <li class="ml-4">↳ 📢 Campus Marketer</li>
          <li class="ml-4">↳ 🧠 Student Advisor</li>
        </ul>
      </div>

      <!-- Culture -->
      <div class="card border-l-green-300">
        <h3 class="text-lg font-semibold mb-3">💡 What We Value</h3>
        <ul class="text-sm space-y-1 list-disc list-inside">
          <li>Creativity & Fun</li>
          <li>Leadership at all levels</li>
          <li>Helping students help students</li>
        </ul>
      </div>

      <!-- Roles -->
      <div class="card border-l-[#003f7f]">
        <h3 class="text-lg font-semibold mb-3">🔍 Available Roles:</h3>
        <div class="grid grid-cols-1 gap-3 text-sm">
          <div v-for="role in roles" :key="role.title" class="bg-[#F7F9FC] rounded-md p-3 border border-gray-200 hover:shadow-md transition">
            <strong>{{ role.icon }} {{ role.title }}</strong>
            <p class="mt-1 text-sm text-[#2C3E50]">{{ role.description }}</p>
          </div>
        </div>
      </div>

      <!-- Testimonial -->
      <div class="card border-l-yellow-400 italic text-sm">
        🗣️ “I joined as a Study Rep and helped over 300 students. It’s so fulfilling!” — Amanda, 100L Nursing
      </div>

      <!-- FAQs -->
      <div class="card border-l-gray-400">
        <h3 class="text-lg font-semibold mb-3">❓ FAQs</h3>
        <ul class="text-sm space-y-2">
          <li><strong>Can I apply for more than one role?</strong><br />Absolutely. Apply for what excites you!</li>
          <li><strong>Is it paid?</strong><br />Some roles offer bonuses or profit-sharing.</li>
          <li><strong>Training?</strong><br />Yep — guidance, templates, and support included.</li>
        </ul>
      </div>

      <!-- CTA -->
      <div class="rounded-xl shadow-xl bg-white p-6 text-center space-y-4 border-l-4 border-[#003f7f]">
        <h4 class="text-lg font-bold text-[#003f7f]">🎉 Ready to Build Something Meaningful?</h4>
        <p class="text-sm text-[#2C3E50]">Choose how you want to apply:</p>

        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <a
            href="https://wa.me/2348148191204"
            target="_blank"
            class="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-full font-medium transition"
          >
            💬 Chat on WhatsApp
          </a>

          <button
            @click="router.push('/apply')"
            class="bg-[#003f7f] hover:bg-[#002a5c] text-white px-6 py-2 rounded-full font-semibold transition"
          >
            ✍️ Fill Application Form
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

const roles = [
  {
    icon: "📸",
    title: "Content Creator",
    description: "Write blogs, make memes, share stories — be the campus voice.",
  },
  {
    icon: "📢",
    title: "Campus Marketer",
    description: "Spread the word and boost our visibility across campus.",
  },
  {
    icon: "💬",
    title: "Community Manager",
    description: "Keep Campus Vibes alive and conversations fun.",
  },
  {
    icon: "📚",
    title: "Study Rep",
    description: "Upload, organize, and champion academic content.",
  },
  {
    icon: "🧠",
    title: "Student Advisor",
    description: "Give insights and help shape decisions for the platform.",
  },
];
</script>

<style scoped>
.card {
  @apply bg-white rounded-xl p-5 shadow-md border-l-4;
}
</style>
