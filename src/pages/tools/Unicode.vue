<template>
  <ToolLayout title="Unicode 编解码">
    <UnicodeTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UnicodeTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import UnicodeTool from '@/components/tools/UnicodeTool.vue'
</script> 