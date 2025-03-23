<template>
  <ToolLayout title="Linux 命令手册">
    <LinuxManual />
  </ToolLayout>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LinuxManual'
})
import ToolLayout from '@/components/ToolLayout.vue'
import LinuxManual from '@/components/tools/LinuxManual.vue'
</script> 