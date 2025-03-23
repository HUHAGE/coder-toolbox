import { reactive } from 'vue'

export interface MinimizedTool {
  title: string
  icon?: string
  iconUrl?: string
  path: string
  timestamp: number
  component: string
}

export class MinimizeTools {
  tools = reactive<MinimizedTool[]>([])

  constructor() {
    // 从 localStorage 恢复状态
    const savedTools = localStorage.getItem('minimizedTools')
    if (savedTools) {
      this.tools.push(...JSON.parse(savedTools))
    }
  }

  minimize(tool: MinimizedTool) {
    // 避免重复添加
    const existingToolIndex = this.tools.findIndex(t => t.path === tool.path)
    if (existingToolIndex === -1) {
      this.tools.push(tool)
    } else {
      // 如果工具已存在，更新它的时间戳
      this.tools[existingToolIndex] = {
        ...tool,
        timestamp: new Date().getTime()
      }
    }
    // 保存到 localStorage
    this.saveToStorage()
  }

  remove(path: string) {
    const index = this.tools.findIndex(t => t.path === path)
    if (index > -1) {
      this.tools.splice(index, 1)
      this.saveToStorage()
    }
  }

  private saveToStorage() {
    localStorage.setItem('minimizedTools', JSON.stringify(this.tools))
  }

  get sortedTools() {
    return [...this.tools].sort((a, b) => b.timestamp - a.timestamp)
  }

  clear() {
    this.tools.length = 0
    localStorage.removeItem('minimizedTools')
  }
}

export const minimizeTools = new MinimizeTools() 