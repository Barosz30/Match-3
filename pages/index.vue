<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useScores } from '~/hooks/useScores'

type Difficulty = 'easy' | 'medium' | 'hard'

const wrapperRef = ref<HTMLElement | null>(null)
const containerSize = ref({ width: 0, height: 0 })
const leaderboard = ref<Record<string, { nickname: string; score: number }[]>>({
  easy: Array(1).fill({ nickname: '???', score: 'Loading...' }),
  medium: Array(1).fill({ nickname: '???', score: 'Loading...' }),
  hard: Array(1).fill({ nickname: '???', score: 'Loading...' })
})
const playerName = ref('')
const gameSettings = ref<{
  cols: number
  rows: number
  availableMoves: number
  types: typeof allTypes
  difficulty: Difficulty
} | null>(null)
const selectedDifficulty = ref<Difficulty | null>(null)
const backgroundAudio = ref<HTMLAudioElement | null>(null)

const allTypes = [
  { icon: '🍓', color: '#f8c1c1' },
  { icon: '🍋', color: '#fff6b0' },
  { icon: '🍇', color: '#d3b6e6' },
  { icon: '🍊', color: '#ffd1a1' },
  { icon: '🍉', color: '#b9f3cb' },
  { icon: '🍍', color: '#ffe6a1' },
  { icon: '🥝', color: '#b1e2b3' }
]

const difficulties = [
  {
    id: 'easy' as const,
    name: 'Easy',
    icon: '🍎',
    color: 'from-green-400 to-green-600',
    hoverColor: 'hover:from-green-500 hover:to-green-700',
    config: { cols: 6, rows: 6, availableMoves: 15, types: allTypes.slice(0, 4) }
  },
  {
    id: 'medium' as const,
    name: 'Medium',
    icon: '🍊',
    color: 'from-orange-400 to-orange-600',
    hoverColor: 'hover:from-orange-500 hover:to-orange-700',
    config: { cols: 7, rows: 7, availableMoves: 20, types: allTypes.slice(0, 5) }
  },
  {
    id: 'hard' as const,
    name: 'Hard',
    icon: '🍓',
    color: 'from-red-400 to-red-600',
    hoverColor: 'hover:from-red-500 hover:to-red-700',
    config: { cols: 8, rows: 8, availableMoves: 25, types: allTypes }
  }
]

const updateContainerSize = () => {
  containerSize.value = {
    width: window.innerWidth,
    height: window.innerHeight - 160
  }
}
let observer: ResizeObserver | null = null

onMounted(() => {
  updateContainerSize()
  window.addEventListener('resize', updateContainerSize)
  if (wrapperRef.value) {
    observer = new ResizeObserver(entries => {
      const entry = entries[0]
      const { width, height } = entry.contentRect
      containerSize.value = { width, height }
    })
    observer.observe(wrapperRef.value)
  }
  fetchLeaderboard()
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateContainerSize)
  if (observer && wrapperRef.value) observer.unobserve(wrapperRef.value)
})

const fetchLeaderboard = async () => {
  for (const diff of ['easy', 'medium', 'hard'] as const) {
    leaderboard.value[diff] = await useScores(diff)
  }
}

const startMusic = async () => {
  if (backgroundAudio.value) return
  const audio = new Audio('/sounds/background-hard.mp3')
  audio.loop = true
  audio.volume = 0.5
  audio.addEventListener('canplaythrough', () => audio.play())
  backgroundAudio.value = audio
}

const stopMusic = () => {
  backgroundAudio.value?.pause()
  backgroundAudio.value = null
}

const startGame = () => {
  if (!playerName.value.trim() || !selectedDifficulty.value) return
  const selected = difficulties.find(d => d.id === selectedDifficulty.value)
  if (!selected) return
  startMusic()
  gameSettings.value = {
    ...selected.config,
    difficulty: selected.id
  }
}

const endGame = () => {
  stopMusic()
  gameSettings.value = null
}
</script>

<template>
  <div ref="wrapperRef" class="min-h-screen flex justify-center p-4">
    <div v-if="!gameSettings" class="max-w-4xl w-full items-center">
      <div>
        <div class="text-center mb-12">
          <div class="text-8xl mb-4 animate-bounce">🍎<span class="xs:hidden inline">🍊</span>🍌</div>
          <h1 class="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-500 to-green-600 mb-4">
            FruitMatch
          </h1>
          <p class="text-xl text-gray-700 font-medium">
            Match delicious fruits and become the ultimate fruit master!
          </p>
        </div>

        <div class="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 border-4 border-orange-200">
          <div class="mb-8">
            <label class="block text-2xl font-bold text-gray-800 mb-4 text-center">
              🌟 Enter Your Name 🌟
            </label>
            <input
              v-model="playerName"
              type="text"
              placeholder="Your awesome name here..."
              class="w-full px-6 py-4 text-xl border-3 border-orange-300 rounded-2xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-200 transition-all duration-300 text-center font-semibold"
              maxLength="20"
            >
          </div>

          <div class="mb-8">
            <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">
              🎯 Choose Your Challenge 🎯
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button
                v-for="difficulty in difficulties"
                :key="difficulty.id"
                
                class="relative p-6 rounded-2xl border-4 transition-all duration-300 transform hover:scale-105"
                :class="[
                  selectedDifficulty === difficulty.id
                    ? 'border-yellow-400 shadow-2xl scale-105 ring-4 ring-yellow-200'
                    : 'border-gray-200 hover:border-yellow-300 shadow-lg'
                ]"
                @click="selectedDifficulty = difficulty.id"
              >
                <div :class="`absolute inset-0 bg-gradient-to-br ${difficulty.color} ${difficulty.hoverColor} opacity-10 rounded-xl`" />
                <div class="relative z-10 text-center">
                  <div class="text-5xl mb-3">{{ difficulty.icon }}</div>
                  <h3 class="text-xl font-bold text-gray-800 mb-2">{{ difficulty.name }}</h3>
                  <p class="text-gray-600 text-sm">Match fruits and win!</p>
                  <div v-if="selectedDifficulty === difficulty.id" class="mt-3 text-yellow-500 text-xl animate-pulse">⭐</div>
                </div>
              </button>
            </div>
          </div>

          <div class="text-center">
            <button
              
              :disabled="!playerName.trim() || !selectedDifficulty"
              class="px-12 py-4 text-2xl font-bold rounded-2xl transition-all duration-300 transform flex items-center space-x-3 mx-auto"
              :class="[
                playerName.trim() && selectedDifficulty
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl hover:from-orange-600 hover:to-red-600 hover:scale-110 hover:shadow-3xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              ]"
              @click="startGame"
            >
              <span class="text-3xl">🚀</span>
              <span>Start Playing!</span>
            </button>
          </div>
        </div>
      </div>

      
    </div>
    <Match3Game
        v-if="gameSettings"
        :cols="gameSettings.cols"
        :rows="gameSettings.rows"
        :types="gameSettings.types"
        :available-moves="gameSettings.availableMoves"
        :player-name="playerName"
        :difficulty="gameSettings.difficulty"
        :container-size="containerSize"
        @end-game="endGame"
        @fetch-leaderboard="fetchLeaderboard"
      />
  </div>
</template>
