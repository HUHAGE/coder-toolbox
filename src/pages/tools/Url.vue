<template>
  <ToolLayout title="URL 编解码">
    <UrlTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'UrlTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import UrlTool from '@/components/tools/UrlTool.vue'
</script> 