<template>
  <ToolLayout title="Cron 表达式">
    <CronTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'CronTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import CronTool from '@/components/tools/CronTool.vue'
</script> 