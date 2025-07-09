<template>
  <div v-if="visible" class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
    <div class="bg-white p-6 rounded-xl shadow-xl text-center w-full max-w-sm">
      <h2 class="text-2xl font-bold mb-4">🎉 Congratulations!</h2>
      <p class="mb-2"><strong>{{ name }}</strong></p>
      <p class="mb-4">Score: <strong>{{ score }}</strong></p>
      <button
        @click="$emit('close')"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        Publish Score
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  name: string
  score: number
}>()

defineEmits(['close'])
</script>
