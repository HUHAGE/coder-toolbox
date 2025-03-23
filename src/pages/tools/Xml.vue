<template>
  <ToolLayout title="XML 格式化">
    <XmlFormatter />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'XmlFormatter'
})
import ToolLayout from '@/components/ToolLayout.vue'
import XmlFormatter from '@/components/tools/XmlFormatter.vue'
</script> 