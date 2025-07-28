import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/index.css'
import '@/styles/dark-mode.css'
import './styles/element-plus-dark.css'
import './styles/message.scss' // 导入自定义消息样式
import { minimizeTools } from './stores/minimizeTools'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { inject } from '@vercel/analytics'
import { ElMessage } from 'element-plus'

const app = createApp(App)

// 配置全局消息默认选项
const messageConfig = {
  duration: 3000,
  showClose: true,
  customClass: 'custom-message',
  appendTo: document.body
}

// 重写 ElMessage 方法
const originalMessage = ElMessage
const types = ['success', 'warning', 'info', 'error'] as const

types.forEach(type => {
  const original = originalMessage[type]
  ElMessage[type] = (options: any) => {
    if (typeof options === 'string') {
      options = {
        message: options
      }
    }
    return original({
      ...messageConfig,
      ...options
    })
  }
})

ElMessage.closeAll = originalMessage.closeAll

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.provide('minimizeTools', minimizeTools)

// 初始化 analytics
inject()

app.mount('#app')