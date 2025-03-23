<template>
  <ToolLayout title="时间戳转换">
    <TimestampTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'TimestampTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import TimestampTool from '@/components/tools/TimestampTool.vue'
</script> 