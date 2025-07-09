<template>
  <div class="relative z-10 min-h-screen p-4 pt-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-12 animate-fade-in">
        <div class="text-6xl mb-4">🏆</div>
        <h1 class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 via-orange-500 to-red-600 mb-4">
          Hall of Fame
        </h1>
        <p class="text-xl text-gray-700 font-medium">
          The greatest fruit matchers of all time!
        </p>
      </div>

      <!-- Leaderboards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div
          v-for="difficulty in difficulties"
          :key="difficulty"
          :class="[
            'bg-gradient-to-br rounded-3xl border-4 shadow-2xl overflow-hidden animate-scale-in',
            difficultyConfig[difficulty].bgColor,
            difficultyConfig[difficulty].borderColor
          ]"
        >
          <!-- Section header -->
          <div class="p-6 text-center border-b-2 border-white/50">
            <div class="text-5xl mb-2">{{ difficultyConfig[difficulty].icon }}</div>
            <h2 class="text-2xl font-bold mb-1" :class="difficultyConfig[difficulty].titleColor">
              {{ difficultyConfig[difficulty].title }}
            </h2>
            <p class="text-gray-600 font-medium">{{ difficultyConfig[difficulty].subtitle }}</p>
          </div>

          <!-- Scores -->
          <div class="p-4 space-y-2">
            <div
              v-for="(player, index) in leaderboard[difficulty]"
              :key="index"
              :class="[
                'flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg',
                getRankBg(index + 1)
              ]"
            >
              <!-- Icon & Rank -->
              <div class="flex items-center gap-2 flex-shrink-0">
                <Icon :name="getRankIcon(index + 1)" class="w-5 h-5 flex-shrink-0" />
                <div class="text-xl">
                  {{ difficultyConfig[difficulty].icon }}
                </div>
              </div>

              <!-- Name -->
              <div class="flex-1 min-w-0">
                <div class="font-bold text-gray-800 text-sm sm:text-base truncate" :title="player.nickname">
                  {{ player.nickname }}
                </div>
                <div class="text-xs text-gray-600">Rank #{{ index + 1 }}</div>
              </div>

              <!-- Score -->
              <div class="text-right flex-shrink-0 min-w-[80px]">
                <div class="font-bold text-sm sm:text-lg text-gray-800">
                  {{ player.score.toLocaleString() }}
                </div>
                <div class="text-xs text-gray-600">points</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer CTA -->
      <div class="mt-12 text-center">
        <div class="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-lg inline-block">
          <div class="text-4xl mb-4">🌟</div>
          <h3 class="text-2xl font-bold text-gray-800 mb-2">Ready to Join the Champions?</h3>
          <p class="text-gray-600 mb-4">Start playing now and see your name on the leaderboard!</p>
          <NuxtLink
            to="/"
            class="inline-flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105"
          >
            <span>Play Now</span>
            <div class="text-xl">🚀</div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useScores } from '~/hooks/useScores'

type Difficulty = 'easy' | 'medium' | 'hard'
const difficulties: Difficulty[] = ['easy', 'medium', 'hard']

const leaderboard = ref<Record<Difficulty, { nickname: string; score: number }[]>>({
  easy: [],
  medium: [],
  hard: []
})

onMounted(async () => {
  for (const diff of difficulties) {
    leaderboard.value[diff] = await useScores(diff)
  }
})

const difficultyConfig = {
  easy: {
    title: 'Easy Mode',
    subtitle: 'Fresh Beginnings',
    bgColor: 'from-green-100 to-green-200',
    borderColor: 'border-green-300',
    titleColor: 'text-green-700',
    icon: '🍎'
  },
  medium: {
    title: 'Medium Mode',
    subtitle: 'Citrus Challenge',
    bgColor: 'from-orange-100 to-orange-200',
    borderColor: 'border-orange-300',
    titleColor: 'text-orange-700',
    icon: '🍊'
  },
  hard: {
    title: 'Hard Mode',
    subtitle: 'Berry Intense',
    bgColor: 'from-red-100 to-red-200',
    borderColor: 'border-red-300',
    titleColor: 'text-red-700',
    icon: '🍓'
  }
} as const

function getRankIcon(rank: number) {
  if (rank === 1) return 'lucide:trophy'
  if (rank === 2) return 'lucide:medal'
  if (rank === 3) return 'lucide:award'
  return 'lucide:star'
}

function getRankBg(rank: number) {
  switch (rank) {
    case 1:
      return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300'
    case 2:
      return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
    case 3:
      return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300'
    default:
      return 'bg-white border-gray-200'
  }
}
</script>
