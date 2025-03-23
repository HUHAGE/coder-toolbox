import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles/index.css'
import '@/styles/dark-mode.css'
import { minimizeTools } from './stores/minimizeTools'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.provide('minimizeTools', minimizeTools)

app.mount('#app')