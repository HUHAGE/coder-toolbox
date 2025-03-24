<template>
  <div class="app">
    <router-view v-slot="{ Component }">
      <keep-alive :include="keepAliveComponents">
        <component :is="Component" />
      </keep-alive>
    </router-view>
    <SpeedInsights />
  </div>
</template>

<script setup lang="ts">
import { keepAliveComponents } from '@/stores/keepAliveStore'
import { inject } from '@vercel/analytics'

// 初始化 analytics
inject()
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style> 