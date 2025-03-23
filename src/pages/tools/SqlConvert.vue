<template>
  <ToolLayout title="SQL 语法转换">
    <SqlConvertTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SqlConvertTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import SqlConvertTool from '@/components/tools/SqlConvertTool.vue'
</script> 