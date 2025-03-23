<template>
  <ToolLayout title="SQL 插入语句解析器">
    <SqlParserTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SqlParserTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import SqlParserTool from '@/components/tools/SqlParserTool.vue'
</script> 