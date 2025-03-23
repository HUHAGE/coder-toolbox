<template>
  <ToolLayout title="JSON 格式化">
    <JsonFormatter />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'JsonFormatter'
})
import ToolLayout from '@/components/ToolLayout.vue'
import JsonFormatter from '@/components/tools/JsonFormatter.vue'
</script>

<style scoped>
.json-tool {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
}

/* 暗色模式适配 */
:root.dark .json-tool {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.1);
}
</style> 