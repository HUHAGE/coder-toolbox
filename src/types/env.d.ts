/// <reference types="vite/client" />

interface Window {
  utools: {
    shellOpenExternal: (url: string) => void;
    // 添加其他 uTools API 类型定义
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.png' {
  const value: string
  export default value
} 