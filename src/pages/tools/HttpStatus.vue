<template>
  <ToolLayout title="HTTP 状态码">
    <HttpStatus />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'HttpStatus'
})
import ToolLayout from '@/components/ToolLayout.vue'
import HttpStatus from '@/components/tools/HttpStatusTool.vue'
</script> 