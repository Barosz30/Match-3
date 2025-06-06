<script setup lang="ts">
import Match3Game from './components/Match3Game.vue';

const types = [
  { icon: '🍓', color: '#e74c3c' },
  { icon: '🍋', color: '#f1c40f' },
  { icon: '🍇', color: '#8e44ad' },
  { icon: '🍊', color: '#e67e22' }
]
const availableMoves = 20

</script>

<template>
  <div>
    <Match3Game :cols="8" :rows="8" :types="types" :available-moves="availableMoves" />
  </div>
</template>
