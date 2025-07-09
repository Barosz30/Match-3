<template>
  <div class="match3-game">
    <Match3Board
      :rows="rows"
      :cols="cols"
      :types="types"
      :locked-tiles="lockedTiles"
      :container-size="containerSize"
      @update:score="handleScoreUpdate"
      @update:moves="handleMovesUpdate"
      @board-stable="handleBoardStable"
    />
    <PlayerScore :score="{ total: totalScore, name: playerName, remainingMoves: remainingMoves, availableMoves: availableMoves }" />
    <GameOverDialog
      :visible="showGameOverDialog"
      :name="props.playerName"
      :score="gameOverScore"
      @close="handleGameOverClose"
    />

    
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Match3Board from './Match3Board.vue'
import PlayerScore from './PlayerScore.vue'
import { submitScore } from '~/hooks/submitScore'
import GameOverDialog from './GameOverDialog.vue'

const showGameOverDialog = ref(false)
const gameOverScore = ref(0)

const emit = defineEmits(['end-game', 'fetch-leaderboard'])

const props = defineProps<{
  rows: number
  cols: number
  types: { icon: string; color: string }[]
  lockedTiles?: number[]
  availableMoves: number
  playerName: string
  difficulty: 'easy' | 'medium' | 'hard'
  containerSize: { width: number; height: number }
}>()

const totalScore = ref(0)
const highScore = ref(0)
const movesMade = ref(0)

const remainingMoves = computed(() => props.availableMoves - movesMade.value)

function handleScoreUpdate(score: number) {
  totalScore.value = score
}

function handleGameOver(finalScore: number) {
  gameOverScore.value = finalScore
  showGameOverDialog.value = true
}

function handleMovesUpdate(moves: number) {
  movesMade.value = moves
}

function handleBoardStable() {
  if (remainingMoves.value <= 0) {
    handleGameOver(totalScore.value)
  }
}

function handleGameOverClose() {
  submitScore(props.playerName, gameOverScore.value, props.difficulty)
    .then(() => {
      console.log('Wynik zapisany!')
      emit('fetch-leaderboard')
    })
    .finally(() => {
      emit('end-game')
      showGameOverDialog.value = false
    })
}

watch(totalScore, (val) => {
  if (val > highScore.value) {
    highScore.value = val
  }
})
</script>

<style scoped>
.match3-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  max-width: 100vw;
  box-sizing: border-box;
}

.moves-left {
  font-size: 1rem;
  margin-top: 0.5rem;
}

@media (max-width: 600px) {
  .match3-game {
    padding: 1rem 0;
  }
}
</style>
