<template>
  <div 
    class="minimized-tools" 
    :class="{ 'has-stats': hasStats, 'in-tool-layout': inToolLayout }"
    v-if="minimizedTools.length"
  >
    <div 
      class="minimized-tools-content" 
      ref="toolsContentRef"
      @wheel.prevent="handleWheel"
    >
      <button class="clear-all-button" @click="clearAllMinimizedTools">
        <el-icon><Delete /></el-icon>
      </button>
      <div 
        v-for="tool in minimizedTools" 
        :key="tool.path"
        class="minimized-tool"
        @click="openMinimizedTool(tool)"
      >
        <el-icon v-if="tool.icon" class="tool-icon">
          <component :is="tool.icon" />
        </el-icon>
        <img v-else-if="tool.iconUrl" :src="tool.iconUrl" class="tool-icon-img" :alt="tool.title">
        <span class="tool-title">{{ tool.title }}</span>
        <el-icon 
          class="close-icon"
          @click.stop="() => closeMinimizedTool(tool)"
        >
          <Close />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Delete, Close } from '@element-plus/icons-vue'
import { MinimizeTools } from '@/stores/minimizeTools'
import type { MinimizedTool } from '@/stores/minimizeTools'

// 添加组件名称
defineOptions({
  name: 'MinimizedToolsBar'
})

const props = defineProps<{
  hasStats?: boolean
  inToolLayout?: boolean
}>()

const router = useRouter()
const minimizeTools = inject('minimizeTools') as MinimizeTools
const toolsContentRef = ref<HTMLElement | null>(null)

// 获取当前路由信息
const currentRoute = computed(() => router.currentRoute.value)

const minimizedTools = computed(() => {
  return minimizeTools.tools
})

// 检查当前工具是否已经在最小化列表中
const isCurrentToolMinimized = computed(() => {
  return minimizedTools.value.some(tool => tool.path === currentRoute.value.path)
})

// 最小化当前工具
const minimizeCurrentTool = () => {
  const route = currentRoute.value
  const tool = {
    title: route.meta.title as string || route.name as string,
    icon: route.meta.icon as string,
    iconUrl: route.meta.iconUrl as string,
    path: route.path,
    timestamp: new Date().getTime(),
    component: route.matched[0].components?.default.name || route.name as string
  }
  minimizeTools.minimize(tool)
}

const openMinimizedTool = (tool: MinimizedTool) => {
  // 如果当前工具页面不在最小化列表中，先将其添加到列表
  if (currentRoute.value.path !== '/' && !isCurrentToolMinimized.value) {
    minimizeCurrentTool()
  }
  
  // 然后再跳转到目标工具页面
  router.push(tool.path)
}

const closeMinimizedTool = (tool: MinimizedTool) => {
  minimizeTools.remove(tool.path)
}

const clearAllMinimizedTools = () => {
  ElMessageBox.confirm(
    '<div class="clear-dialog-content">' +
    '<div class="clear-dialog-icon">' +
    '</div>' +
    '<div class="clear-dialog-message">' +
    '<h3>清空工具标签</h3><br>' +
    '<p>是否清空所有最小化的工具标签？请注意，对应工具的数据也会同步清空。</p>' +
    '</div>' +
    '</div>',
    {
      title: '',
      dangerouslyUseHTMLString: true,
      showClose: true,
      customClass: 'clear-confirm-dialog',
      confirmButtonText: '清空',
      cancelButtonText: '保留',
      confirmButtonClass: 'confirm-button',
      cancelButtonClass: 'cancel-button',
      closeOnClickModal: true,
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          setTimeout(() => {
            minimizeTools.clear()
            instance.confirmButtonLoading = false
            ElMessage({
              type: 'success',
              message: '已清空全部工具标签',
              customClass: 'clear-success-message'
            })
            done()
          }, 300)
        } else {
          done()
        }
      }
    }
  ).catch(() => {})
}

const handleWheel = (e: WheelEvent) => {
  if (toolsContentRef.value) {
    toolsContentRef.value.scrollLeft += e.deltaY
  }
}
</script>

<style scoped>
.minimized-tools {
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 8px 16px;
  z-index: 100;
  padding-top: 10px;
  padding-bottom: 10px;
}

.minimized-tools:not(.has-stats) {
  bottom: 0;
}

.minimized-tools.in-tool-layout {
  bottom: 0;
}

.minimized-tools-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  align-items: center;
  position: relative;
  touch-action: none;
}

.minimized-tools-content::-webkit-scrollbar {
  display: none;
}

.minimized-tool {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 120px;
  max-width: 200px;
  border: 1px solid transparent;
  position: relative;
  top: 2px;
}

.tool-icon,
.tool-icon-img {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.tool-icon-img {
  object-fit: contain;
}

.tool-title {
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.close-icon {
  width: 16px;
  height: 16px;
  color: var(--text-secondary);
  opacity: 0;
  transition: all 0.2s ease;
  margin-left: auto;
  cursor: pointer;
}

.minimized-tool:hover .close-icon {
  opacity: 1;
}

.close-icon:hover {
  color: var(--el-color-danger);
  transform: scale(1.1);
}

.minimized-tool:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.1);
}

.minimized-tool:hover .tool-icon,
.minimized-tool:hover .tool-icon-img,
.minimized-tool:hover .tool-title {
  color: var(--el-color-primary);
}

.clear-all-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--el-color-primary-light-9);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
  position: sticky;
  left: 0;
  z-index: 1;
}

.clear-all-button:hover {
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .minimized-tools {
    bottom: 90px;
  }
  
  .minimized-tools:not(.has-stats) {
    bottom: 0;
  }
}

@media (max-width: 480px) {
  .minimized-tools {
    bottom: 110px;
  }
}

/* 暗色模式适配 */
:root.dark .minimized-tool {
  background: rgba(255, 255, 255, 0.05);
}

:root.dark .minimized-tool:hover {
  background: rgba(var(--el-color-primary-rgb), 0.15);
  border-color: rgba(var(--el-color-primary-rgb), 0.3);
}

:root.dark .close-icon:hover {
  color: var(--el-color-danger);
}

/* 添加暗色模式下清空按钮的样式 */
:root.dark .clear-all-button {
  background: rgba(255, 255, 255, 0.05);
  color: var(--el-color-info);
}

:root.dark .clear-all-button:hover {
  background: rgba(var(--el-color-primary-rgb), 0.15);
  color: var(--el-color-primary);
}
</style> 