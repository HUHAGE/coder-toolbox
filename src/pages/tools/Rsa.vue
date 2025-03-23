<template>
  <ToolLayout title="RSA 加解密">
    <RsaTool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'RsaTool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import RsaTool from '@/components/tools/RsaTool.vue'
</script> 