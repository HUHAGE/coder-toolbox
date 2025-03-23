<template>
  <ToolLayout title="SQL IN 生成">
    <SqlInTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SqlInTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import SqlInTool from '@/components/tools/SqlInTool.vue'
</script> 