<template>
  <ToolLayout title="统一社会信用代码">
    <CreditCodeTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'CreditCodeTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import CreditCodeTool from '@/components/tools/CreditCodeTool.vue'
</script> 