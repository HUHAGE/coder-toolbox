<template>
  <ToolLayout title="UUID 生成">
    <UuidTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UuidTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import UuidTool from '@/components/tools/UuidTool.vue'
</script> 