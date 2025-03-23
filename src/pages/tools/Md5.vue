<template>
  <ToolLayout title="MD5 加密">
    <Md5Tool />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'Md5Tool'
})
import ToolLayout from '@/components/ToolLayout.vue'
import Md5Tool from '@/components/tools/Md5Tool.vue'
</script> 