<template>
  <ToolLayout title="身份证号生成">
    <IdcardTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'IdcardTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import IdcardTool from '@/components/tools/IdcardTool.vue'
</script> 