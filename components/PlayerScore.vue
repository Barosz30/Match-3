<template>
  <div class="scoreboard">
    <div>{{ score.name }}</div>
    <div>Punkty: {{ score.total }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  score: {
    total: number
    name: string
  }
}>()
</script>

<style scoped>
.scoreboard {
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 0.625rem;
  font-family: sans-serif;
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
