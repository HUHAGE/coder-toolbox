<template>
  <ToolLayout title="SQL 截断检测">
    <SqlTruncateChecker />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SqlTruncateChecker'
})
import ToolLayout from '@/components/ToolLayout.vue'
import SqlTruncateChecker from '@/components/tools/SqlTruncateChecker.vue'
</script> 