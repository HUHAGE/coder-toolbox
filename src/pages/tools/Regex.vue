<template>
  <ToolLayout title="正则表达式">
    <RegexTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'RegexTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import RegexTool from '@/components/tools/RegexTool.vue'
</script> 