<template>
  <ToolLayout title="二维码生成">
    <QrcodeTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'QrcodeTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import QrcodeTool from '@/components/tools/QrcodeTool.vue'
</script> 