<template>
  <ToolLayout title="Word转HTML">
    <WordToHtmlTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'WordToHtml'
})
import ToolLayout from '@/components/ToolLayout.vue'
import WordToHtmlTool from '@/components/tools/WordToHtmlTool.vue'
</script>