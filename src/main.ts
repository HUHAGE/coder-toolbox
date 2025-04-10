import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/index.css'
import '@/styles/dark-mode.css'
import './styles/element-plus-dark.css'
import { minimizeTools } from './stores/minimizeTools'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { inject } from '@vercel/analytics'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.provide('minimizeTools', minimizeTools)

// Add SpeedInsights component
app.component('SpeedInsights', SpeedInsights)

app.mount('#app')

// 初始化 analytics
inject()