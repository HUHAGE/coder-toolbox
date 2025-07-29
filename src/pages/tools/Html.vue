<template>
  <ToolLayout title="HTML 格式化">
    <HtmlFormatter />
  </ToolLayout>
</template>
<script setup lang="ts">
defineOptions({
  name: 'HtmlFormatter'
})
import ToolLayout from '@/components/ToolLayout.vue'
import HtmlFormatter from '@/components/tools/HtmlFormatter.vue'
</script> 