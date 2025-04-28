<template>
    <div class="game-wrapper">
      <iframe :src="htmlPath" frameborder="0" width="100%" height="100%"></iframe>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  
  const htmlPath = ref('')
  
  onMounted(() => {
    htmlPath.value = '/travel/yunnan2025/yunnan2025.html'
  })
  </script>
  
  <style scoped>
  .game-wrapper {
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  </style>