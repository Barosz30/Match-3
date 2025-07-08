<template>
  <div class="start-screen">
    <h2 class="title">Podaj swoje imię:</h2>
    <input v-model="name" type="text" class="name-input" placeholder="Twoje imię" />

    <h2 class="title">Wybierz poziom trudności:</h2>
    <div class="button-group">
      <button :disabled="!name.trim()" @click="() => emitStart('easy')">Łatwy</button>
      <button :disabled="!name.trim()" @click="() => emitStart('medium')">Średni</button>
      <button :disabled="!name.trim()" @click="() => emitStart('hard')">Trudny</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

type Difficulty = 'easy' | 'medium' | 'hard'

const emit = defineEmits<{
  (e: 'start', name: string, difficulty: Difficulty): void
}>()

const name = ref(localStorage.getItem('playerName') || '')

watch(name, (newVal) => {
  localStorage.setItem('playerName', newVal.trim())
})

const emitStart = (difficulty: Difficulty) => {
  emit('start', name.value.trim(), difficulty)
}
</script>

<style scoped>
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
</style>
