<template>
  <div class="scoreboard">
    <div>Punkty: {{ score.total }}</div>
    <div>Runda: {{ score.round }}</div>
    <div>Rekord: {{ score.high }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  score: {
    total: number
    round: number
    high: number
  }
}>()
</script>

<style scoped>
.scoreboard {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 12px 20px;
  border-radius: 10px;
  font-family: sans-serif;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
