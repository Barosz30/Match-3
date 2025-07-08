<template>
  <div class="min-h-screen bg-gradient-to-br from-orange-200 via-yellow-100 to-green-200">
    <!-- Navigation -->
    <nav class="bg-white/90 backdrop-blur-md shadow-lg border-b-4 border-orange-300">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-2">
            <div class="text-3xl">🍎</div>
            <h1 class="text-2xl font-bold text-orange-600">FruitMatch</h1>
          </div>

          <div class="flex space-x-1">
            <NuxtLink
              to="/"
              class="px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
              :class="route.path === '/' ? 'bg-orange-500 text-white shadow-lg scale-105' : 'text-orange-600 hover:bg-orange-100'"
            >
              <Home class="w-5 h-5" />
              <span>Home</span>
            </NuxtLink>

            <NuxtLink
              to="/leaderboard"
              class="px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2"
              :class="route.path === '/leaderboard' ? 'bg-orange-500 text-white shadow-lg scale-105' : 'text-orange-600 hover:bg-orange-100'"
            >
              <Trophy class="w-5 h-5" />
              <span>Leaderboard</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Page content -->
    <main class="relative z-10">
      <slot />
    </main>

    <!-- Floating Fruit Decorations -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div class="absolute top-20 left-10 text-4xl animate-bounce opacity-20">🍊</div>
      <div class="absolute top-40 right-20 text-3xl animate-pulse opacity-20">🍎</div>
      <div class="absolute bottom-32 left-1/4 text-5xl animate-bounce opacity-20" style="animation-delay: 1s;">🍌</div>
      <div class="absolute bottom-20 right-10 text-4xl animate-pulse opacity-20" style="animation-delay: 2s;">🍇</div>
      <div class="absolute top-1/2 left-5 text-3xl animate-bounce opacity-20" style="animation-delay: 0.5s;">🍓</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Home, Trophy } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
const route = useRoute()
</script>
