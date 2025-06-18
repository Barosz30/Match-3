<script setup lang="ts">
import { ref } from 'vue'
import Match3Game from './components/Match3Game.vue'

const allTypes = [
  { icon: '🍓', color: '#e74c3c' },
  { icon: '🍋', color: '#f1c40f' },
  { icon: '🍇', color: '#8e44ad' },
  { icon: '🍊', color: '#e67e22' },
  { icon: '🍉', color: '#27ae60' },
  { icon: '🍍', color: '#f39c12' },
  { icon: '🥝', color: '#16a085' }
]

const gameSettings = ref<null | {
  cols: number
  rows: number
  availableMoves: number
  types: typeof allTypes
}>(null)

const playerName = ref('Ryszard')

const startGame = (difficulty: 'easy' | 'medium' | 'hard') => {
  if (!playerName.value.trim()) return

  const settings = {
    easy: { cols: 6, rows: 6, availableMoves: 3, types: allTypes.slice(0, 4) },
    medium: { cols: 7, rows: 7, availableMoves: 30, types: allTypes.slice(0, 6) },
    hard: { cols: 8, rows: 8, availableMoves: 30, types: allTypes }
  }

  gameSettings.value = settings[difficulty]
}

const endGame = () => {
  gameSettings.value = null
}

</script>

<template>
  <div class="wrapper">
    <div v-if="!gameSettings" class="start-screen">
      <h2 class="title">Podaj swoje imię:</h2>
      <input
        v-model="playerName"
        type="text"
        class="name-input"
        placeholder="Twoje imię"
      >

      <h2 class="title">Wybierz poziom trudności:</h2>
      <div class="button-group">
        <button :disabled="!playerName.trim()" @click="startGame('easy')">Łatwy</button>
        <button :disabled="!playerName.trim()" @click="startGame('medium')">Średni</button>
        <button :disabled="!playerName.trim()" @click="startGame('hard')">Trudny</button>
      </div>
    </div>

    <div v-else>
      <Match3Game
        :cols="gameSettings.cols"
        :rows="gameSettings.rows"
        :types="gameSettings.types"
        :available-moves="gameSettings.availableMoves"
        :player-name="playerName"
        @end-game="endGame"
      />
    </div>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  font-size: 1rem;
}
</style>

<style scoped>
.wrapper {
  display: flex;
  height: 100dvh;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
}

.start-screen {
  text-align: center;
  max-width: 25rem;
  width: 100%;
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
</style>
