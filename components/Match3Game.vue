<template>
  <div class="match3-game">
    <PlayerScore :score="{ total: totalScore, name: playerName }" />

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

const emit = defineEmits(['end-game'])

const props = defineProps<{
  rows: number
  cols: number
  types: { icon: string; color: string }[]
  lockedTiles?: number[]
  availableMoves: number
  playerName: string
}>()

const handleExit = () => {
  emit('end-game')
}

const totalScore = ref(0)
const highScore = ref(0)
const movesMade = ref(0)

const remainingMoves = computed(() => props.availableMoves - movesMade.value)

function handleScoreUpdate(score: number) {
  totalScore.value = score
}

function handleMovesUpdate(moves: number) {
  movesMade.value = moves
  if (remainingMoves.value <= 0) {
    // tu możesz dodać logikę końca rundy, restart planszy itp.
    handleExit()
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
  gap: 1rem;
  padding: 1rem;
}

.moves-left {
  font-size: 1rem;
  margin-top: 0.5rem;
}
</style>
