<template>
  <ToolLayout title="代码对比">
    <DiffTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DiffTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import DiffTool from '@/components/tools/DiffTool.vue'
</script> 