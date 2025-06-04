<script setup lang="ts">
import Match3Board from './components/Match3Board.vue';

const types = [
  { icon: '🍓', color: '#e74c3c' },
  { icon: '🍋', color: '#f1c40f' },
  { icon: '🍇', color: '#8e44ad' },
  { icon: '🍊', color: '#e67e22' }
]

</script>

<template>
  <div>
    <Match3Board :cols="8" :rows="8" :types="types" />
  </div>
</template>
