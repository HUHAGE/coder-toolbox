<template>
  <ToolLayout title="配置文件编辑器">
    <ConfigEditor />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ConfigEditor'
})
import ToolLayout from '@/components/ToolLayout.vue'
import ConfigEditor from '@/components/tools/ConfigEditor.vue'
</script> 