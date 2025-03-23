<template>
  <ToolLayout title="身份证号生成">
    <IdcardToolNew />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'IdcardToolNew'
})
import ToolLayout from '@/components/ToolLayout.vue'
import IdcardToolNew from '@/components/tools/IdcardToolNew.vue'
</script> 