<template>
  <ToolLayout title="SQL 格式化">
    <SqlFormatTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SqlFormatTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import SqlFormatTool from '@/components/tools/SqlFormatTool.vue'
</script> 