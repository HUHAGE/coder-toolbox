<template>
  <ToolLayout title="Word转HTML">
    <WordToHtmlTool />
  </ToolLayout>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'WordToHtml'
})
import ToolLayout from '@/components/ToolLayout.vue'
import WordToHtmlTool from '@/components/tools/WordToHtmlTool.vue'

// 进入页面时临时修改tool-content的max-width
onMounted(() => {
  const toolContent = document.querySelector('.tool-content') as HTMLElement
  if (toolContent) {
    toolContent.style.maxWidth = '1500px'
  }
})

// 离开页面时恢复原样
onUnmounted(() => {
  const toolContent = document.querySelector('.tool-content') as HTMLElement
  if (toolContent) {
    toolContent.style.maxWidth = ''
  }
})
</script>