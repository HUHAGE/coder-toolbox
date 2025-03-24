<template>
  <ToolLayout title="篮球分组">
    <BasketballGroupTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'BasketballGroup'
})
import ToolLayout from '@/components/ToolLayout.vue'
import BasketballGroupTool from '@/components/tools/BasketballGroupTool.vue'
</script> 