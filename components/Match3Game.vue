<template>
  <div class="match3-game">
    <PlayerScore :score="{ total: totalScore, round: roundNumber, high: highScore }" />

    <Match3Board
      :rows="rows"
      :cols="cols"
      :types="types"
      :locked-tiles="lockedTiles"
      @update:score="handleScoreUpdate"
      @update:moves="handleMovesUpdate"
    />

    <div class="moves-left">
      Ruchy: {{ remainingMoves }} / {{ availableMoves }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Match3Board from './Match3Board.vue'
import PlayerScore from './PlayerScore.vue'

const props = defineProps<{
  rows: number
  cols: number
  types: { icon: string; color: string }[]
  lockedTiles?: number[]
  availableMoves: number
}>()

const totalScore = ref(0)
const highScore = ref(0)
const roundNumber = ref(1)
const movesMade = ref(0)

const remainingMoves = computed(() => props.availableMoves - movesMade.value)

function handleScoreUpdate(score: number) {
  totalScore.value = score
}

function handleMovesUpdate(moves: number) {
  movesMade.value = moves
  if (remainingMoves.value <= 0) {
    // tu możesz dodać logikę końca rundy, restart planszy itp.
  }
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
  gap: 16px;
  padding: 16px;
}
.moves-left {
  font-size: 16px;
  margin-top: 8px;
}
</style>
