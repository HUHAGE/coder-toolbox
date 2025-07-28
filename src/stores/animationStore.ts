import { ref } from 'vue'

// 从 localStorage 获取动画状态，默认为 false（关闭）
const savedAnimationState = localStorage.getItem('animationEnabled')
const isAnimationEnabled = ref(savedAnimationState ? savedAnimationState === 'true' : false)

// 导出状态和切换函数
export const useAnimationStore = () => {
  const toggleAnimation = () => {
    isAnimationEnabled.value = !isAnimationEnabled.value
    // 保存状态到 localStorage
    localStorage.setItem('animationEnabled', isAnimationEnabled.value.toString())
  }

  return {
    isAnimationEnabled,
    toggleAnimation
  }
} 