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

const startGame = (difficulty: 'easy' | 'medium' | 'hard') => {
  if (difficulty === 'easy') {
    gameSettings.value = {
      cols: 6,
      rows: 6,
      availableMoves: 30,
      types: allTypes.slice(0, 4)
    }
  } else if (difficulty === 'medium') {
    gameSettings.value = {
      cols: 7,
      rows: 7,
      availableMoves: 30,
      types: allTypes.slice(0, 6)
    }
  } else if (difficulty === 'hard') {
    gameSettings.value = {
      cols: 8,
      rows: 8,
      availableMoves: 30,
      types: allTypes
    }
  }
}
</script>

<template>
  <div>
    <div v-if="!gameSettings">
      <h2>Wybierz poziom trudności:</h2>
      <button @click="startGame('easy')">Łatwy</button>
      <button @click="startGame('medium')">Średni</button>
      <button @click="startGame('hard')">Trudny</button>
    </div>

    <div v-else>
      <Match3Game
        :cols="gameSettings.cols"
        :rows="gameSettings.rows"
        :types="gameSettings.types"
        :available-moves="gameSettings.availableMoves"
      />
    </div>
  </div>
</template>

<style scoped>
button {
  margin: 8px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}
</style>
