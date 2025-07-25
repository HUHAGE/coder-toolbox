import { ref } from 'vue'

// 创建一个响应式的状态来存储动画是否启用
const isAnimationEnabled = ref(true)

// 导出状态和切换函数
export const useAnimationStore = () => {
  const toggleAnimation = () => {
    isAnimationEnabled.value = !isAnimationEnabled.value
  }

  return {
    isAnimationEnabled,
    toggleAnimation
  }
} 