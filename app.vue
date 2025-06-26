<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import Match3Game from './components/Match3Game.vue'
import { useScores } from './hooks/useScores'

type Difficulty = 'easy' | 'medium' | 'hard'

const wrapperRef = ref<HTMLElement | null>(null)
const containerSize = ref({ width: 0, height: 0 })

function updateContainerSize() {
  containerSize.value = {
    width: window.innerWidth,
    height: window.innerHeight - 160
  }
}

onMounted(() => {
  updateContainerSize()
  window.addEventListener('resize', updateContainerSize)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateContainerSize)
})

let observer: ResizeObserver | null = null

onMounted(() => {
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
  if (observer && wrapperRef.value) {
    observer.unobserve(wrapperRef.value)
  }
})

const leaderboard = ref<Record<string, { nickname: string; score: number }[]>>({
  easy: Array(1).fill({ nickname: '???', score: 'Loading...' }),
  medium: Array(1).fill({ nickname: '???', score: 'Loading...' }),
  hard: Array(1).fill({ nickname: '???', score: 'Loading...' })
})

const fetchLeaderboard = async () => {
  for (const diff of ['easy', 'medium', 'hard'] as const) {
    leaderboard.value[diff] = await useScores(diff)
  }
}

const allTypes = [
  { icon: '🍓', color: '#f8c1c1' }, // truskawka – jasnoróżowe tło
  { icon: '🍋', color: '#fff6b0' }, // cytryna – pastelowy żółty
  { icon: '🍇', color: '#d3b6e6' }, // winogrona – jasny fiolet
  { icon: '🍊', color: '#ffd1a1' }, // pomarańcza – jasna pomarańcz
  { icon: '🍉', color: '#b9f3cb' }, // arbuz – pastelowa zieleń
  { icon: '🍍', color: '#ffe6a1' }, // ananas – złamany żółty
  { icon: '🥝', color: '#b1e2b3' }  // kiwi – jasna mięta
]

const gameSettings = ref<{
  cols: number
  rows: number
  availableMoves: number
  types: typeof allTypes
  difficulty: Difficulty
} | null>(null)

const playerName = ref('Ryszard')
const backgroundAudio = ref<HTMLAudioElement | null>(null)

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

const startGame = (difficulty: Difficulty) => {
  if (!playerName.value.trim()) return

  const settings: Record<Difficulty, typeof gameSettings.value> = {
    easy: { cols: 6, rows: 6, availableMoves: 15, types: allTypes.slice(0, 4), difficulty },
    medium: { cols: 7, rows: 7, availableMoves: 20, types: allTypes.slice(0, 5), difficulty },
    hard: { cols: 8, rows: 8, availableMoves: 25, types: allTypes, difficulty }
  }

  startMusic()
  gameSettings.value = settings[difficulty]
}

const endGame = () => {
  stopMusic()
  gameSettings.value = null
}
</script>

<template>
  <div ref="wrapperRef" class="wrapper" >
    <div v-if="!gameSettings" class="settings-and-scores">
      <div class="start-screen">
        <h2 class="title">Podaj swoje imię:</h2>
        <input v-model="playerName" type="text" class="name-input" placeholder="Twoje imię" >

        <h2 class="title">Wybierz poziom trudności:</h2>
        <div class="button-group">
          <button :disabled="!playerName.trim()" @click="startGame('easy')">Łatwy</button>
          <button :disabled="!playerName.trim()" @click="startGame('medium')">Średni</button>
          <button :disabled="!playerName.trim()" @click="startGame('hard')">Trudny</button>
        </div>
      </div>

      <div class="scores">
        <h2>🏆 Tablica wyników</h2>
        <div class="leaderboard">
          <div v-for="diff in ['easy', 'medium', 'hard']" :key="diff" class="leaderboard-section">
            <h3>{{ diff.toUpperCase() }}</h3>
            <table>
              <thead><tr><th>#</th><th>Gracz</th><th>Wynik</th></tr></thead>
              <tbody>
                <tr v-for="(entry, index) in leaderboard[diff]" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ entry.nickname }}</td>
                  <td>{{ entry.score }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <Match3Game
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
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  font-size: 1rem;
  overflow-y: auto;
}
</style>

<style scoped>
.wrapper {
  display: flex;
  min-height: 100dvh;
  flex-direction: column;
  padding: 2rem;
  box-sizing: border-box;
}

.start-screen {
  text-align: center;
  max-width: 25rem;
  width: 100%;
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.name-input {
  width: 100%;
  padding: 0.75em 1em;
  font-size: 1em;
  margin-bottom: 2rem;
  border-radius: 0.5em;
  border: 1px solid #ccc;
  box-sizing: border-box;
  text-align: center;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

button {
  padding: 0.75em 1.5em;
  font-size: 1.1em;
  cursor: pointer;
  background-color: #3498db;
  border: none;
  border-radius: 0.5em;
  color: #fff;
  transition: background-color 0.3s;
}
button:hover:enabled {
  background-color: #2980b9;
}
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.settings-and-scores {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 5rem;
}

.scores {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.leaderboard {
  margin-top: 2rem;
  text-align: center;
  display: flex;
  gap: 3rem;
}

.leaderboard-section {
  margin: 1rem 0;
}

table {
  margin: 0 auto;
  border-collapse: collapse;
  width: 100%;
  max-width: 25rem;
}
th, td {
  border: 1px solid #ccc;
  padding: 0.5rem;
}

@media (max-width: 600px) {
  .leaderboard {
    flex-direction: column;
    align-items: center;
    margin: 0;
  }
  .wrapper {
    padding: 2rem 0;
  }
}
</style>
