<template>
  <ToolLayout title="SQL 参数填充">
    <SqlParamsTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SqlParamsTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import SqlParamsTool from '@/components/tools/SqlParamsTool.vue'
</script> 