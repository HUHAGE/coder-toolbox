<template>
  <ToolLayout title="AES 加解密">
    <AesTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AesTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import AesTool from '@/components/tools/AesTool.vue'
</script> 