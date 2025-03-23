<template>
  <ToolLayout title="Base64 编解码">
    <Base64Tool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'Base64Tool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import Base64Tool from '@/components/tools/Base64Tool.vue'
</script> 