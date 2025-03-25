<template>
  <div class="tool-layout">
    <!-- 顶部导航栏 -->
    <div class="tool-header">
      <div class="header-content">
        <div class="header-center">
          <el-tooltip content="返回首页" placement="bottom">
            <button class="back-button" @click="goBack">
              <el-icon class="back-icon"><ArrowLeft /></el-icon>
            </button>
          </el-tooltip>
          
          <el-tooltip content="最小化到工具栏" placement="bottom">
            <button class="minimize-button" @click="handleMinimize">
              <el-icon class="minimize-icon"><Minus /></el-icon>
            </button>
          </el-tooltip>
          
          <div class="tool-info">
            <el-icon class="tool-icon" v-if="icon">
              <component :is="icon" />
            </el-icon>
            <img v-else-if="iconUrl" :src="iconUrl" class="tool-icon-img" :alt="title">
            <h1 class="tool-title">{{ title }}</h1>
          </div>
        </div>

        <div class="header-right">
          <el-tooltip content="查看文档" placement="bottom" v-if="docs">
            <el-button class="action-btn" @click="showDocs">
              <el-icon><Document /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="分享" placement="bottom">
            <el-button class="action-btn" @click="showShareMenu">
              <el-icon><Share /></el-icon>
            </el-button>
          </el-tooltip>

          <el-tooltip content="反馈问题" placement="bottom">
            <el-button class="action-btn" @click="showFeedback">
              <el-icon><Warning /></el-icon>
            </el-button>
          </el-tooltip>

          <div class="divider"></div>

          <el-tooltip content="切换主题" placement="bottom">
            <button class="theme-toggle" @click="toggleTheme" :class="{ 'is-dark': isDarkMode }">
              <div class="toggle-icon">
                <el-icon>
                  <Moon v-if="!isDarkMode" />
                  <Sunny v-else />
                </el-icon>
              </div>
            </button>
          </el-tooltip>
        </div>
      </div>
    </div>
    
    <!-- 工具内容区域 -->
    <div class="tool-content">
      <slot></slot>
    </div>

    <!-- 文档抽屉 -->
    <el-drawer
      v-model="showDocsDrawer"
      title="使用文档"
      direction="rtl"
      size="400px"
    >
      <div class="docs-content" v-html="docs"></div>
    </el-drawer>

    <!-- 分享菜单 -->
    <el-dialog
      v-model="showShareDialog"
      title="分享工具"
      width="360px"
      align-center
    >
      <div class="share-options">
        <div class="share-item" @click="shareToWeixin">
          <el-icon><ChatDotRound /></el-icon>
          <span>微信</span>
        </div>
        <div class="share-item" @click="shareToWeibo">
          <el-icon><Platform /></el-icon>
          <span>微博</span>
        </div>
        <div class="share-item" @click="copyLink">
          <el-icon><Link /></el-icon>
          <span>复制链接</span>
        </div>
      </div>
    </el-dialog>

    <!-- 在底部添加最小化工具栏 -->
    <MinimizedToolsBar :in-tool-layout="true" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { 
  ArrowLeft,
  Document,
  Share,
  Warning,
  Link,
  Platform,
  ChatDotRound,
  Minus,
  Sunny,
  Moon
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { MinimizeTools } from '@/stores/minimizeTools'
import MinimizedToolsBar from './MinimizedToolsBar.vue'
import { track } from '@vercel/analytics'

const props = defineProps<{
  title: string
  icon?: string
  iconUrl?: string
  docs?: string
}>()

const router = useRouter()
const showDocsDrawer = ref(false)
const showShareDialog = ref(false)
const minimizeTools = inject('minimizeTools') as MinimizeTools

// 添加暗黑模式状态
const isDarkMode = ref(false)

const goBack = () => {
  router.push('/')
}

const showDocs = () => {
  showDocsDrawer.value = true
}

const showShareMenu = () => {
  showShareDialog.value = true
}

const shareToWeixin = () => {
  ElMessage.success('已复制分享链接')
  showShareDialog.value = false
}

const shareToWeibo = () => {
  window.open(`http://service.weibo.com/share/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(props.title)}`, '_blank')
  showShareDialog.value = false
}

const copyLink = () => {
  navigator.clipboard.writeText(window.location.href)
  ElMessage.success('链接已复制')
  showShareDialog.value = false
  
  track('tool_action', {
    tool: props.title,
    action: 'copy_result'
  })
}

const showFeedback = () => {
  const url = 'https://gitee.com/huhage/programmers-assistant-utools/issues'
  
  // 判断是否在 uTools 环境中
  if (window.utools) {
    window.utools.shellOpenExternal(url)
  } else {
    window.open(url, '_blank')
  }
}

const handleMinimize = () => {
  minimizeTools?.minimize({
    title: props.title,
    icon: props.icon,
    iconUrl: props.iconUrl,
    path: window.location.hash.slice(1),
    timestamp: new Date().getTime(),
    component: router.currentRoute.value.matched[0].components?.default.name || 
              router.currentRoute.value.name as string
  })
  router.push('/')
}

// 添加 onMounted 钩子,在组件挂载时滚动到顶部
onMounted(() => {
  window.scrollTo({
    top: 0,
    behavior: 'instant' // 使用 instant 而不是 smooth 以避免看到滚动动画
  })

  // 优先使用存储的主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    // 否则使用系统主题
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDarkMode.value)
})

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}
</script>

<style scoped>
.tool-layout {
  min-height: 100vh;
  background: var(--bg-gradient);
  display: flex;
  flex-direction: column;
}

.tool-header {
  height: 64px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.header-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-center {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  margin: 0;
  padding-left: 88px;
  
  @media (max-width: 768px) {
    padding-left: 80px;
    justify-content: center;
  }
}

.back-button {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: #007aff;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    left: 4px;
    width: 32px;
    height: 32px;
    z-index: 10;
  }
}

.back-button:hover {
  background: #0056b3;
  transform: scale(1.05);
}

.back-button:active {
  transform: scale(0.95);
}

.back-icon {
  font-size: 1.2em;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.back-button:hover .back-icon {
  transform: translateX(-2px);
}

.minimize-button {
  position: absolute;
  left: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: #28a745;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    left: 40px;
    width: 32px;
    height: 32px;
    z-index: 10;
  }
}

.minimize-button:hover {
  background: #218838;
  transform: scale(1.05);
}

.minimize-button:active {
  transform: scale(0.95);
}

.minimize-icon {
  font-size: 1.2em;
}

.tool-info {
  margin-left: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    max-width: calc(100% - 80px);
    overflow: hidden;
  }
}

.tool-icon,
.tool-icon-img {
  width: 24px;
  height: 24px;
  color: var(--primary-color);
}

.tool-icon-img {
  border-radius: 4px;
}

.tool-title {
  font-size: 1.55rem;
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 0;
  
  @media (max-width: 768px) {
    margin-right: 0;
    gap: 4px;
    flex-shrink: 0;
  }
}

.divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 6px;
  border: none;
  border-radius: 6px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--bg-overlay);
  color: var(--primary-color);
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0);
}

.theme-toggle {
  width: 32px;
  height: 32px;
  padding: 6px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 122, 255, 0.9);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.2);
}

.theme-toggle:hover {
  background: rgba(0, 122, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.theme-toggle:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.2);
}

.toggle-icon {
  font-size: 16px;
  transition: all 0.3s ease;
  color: white;
}

.theme-toggle.is-dark {
  background: rgba(0, 122, 255, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.theme-toggle.is-dark:hover {
  background: rgba(0, 122, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.theme-toggle.is-dark .toggle-icon {
  color: white;
}

.tool-content {
  flex: 1;
  padding: 2rem 1.5rem;
  padding-top: calc(64px + 2rem);
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 64px);
  align-self: flex-start;
}

.share-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px;
}

.share-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-item:hover {
  background: var(--bg-tertiary);
}

.share-item .el-icon {
  font-size: 24px;
  color: var(--primary-color);
}

.share-item span {
  font-size: 12px;
  color: var(--text-secondary);
}

.docs-content {
  padding: 16px;
  line-height: 1.6;
}

/* 暗色模式适配 */
:root.dark .tool-header {
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

:root.dark .back-button {
  background: var(--primary-color);
}

:root.dark .back-button:hover {
  background: var(--primary-hover);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tool-header {
    height: 56px;
    padding: 0;
  }

  .header-content {
    padding: 0 8px;
    justify-content: space-between;
  }
  
  .header-center {
    flex: 1;
  }
  
  .header-right {
    flex: 0 0 auto;
  }
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .theme-toggle:not(.is-dark) {
    background: rgba(0, 122, 255, 0.8);
  }

  .theme-toggle:not(.is-dark):hover {
    background: rgba(0, 122, 255, 0.9);
  }
}
</style> 