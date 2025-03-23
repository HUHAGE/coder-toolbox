import { ref, onMounted, watch } from 'vue'

export function useTheme() {
  const isDarkMode = ref(false)
  
  // 初始化主题
  onMounted(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      isDarkMode.value = savedTheme === 'dark'
    } else {
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateTheme()
  })
  
  // 监听主题变化
  watch(isDarkMode, updateTheme)
  
  // 更新主题
  function updateTheme() {
    document.documentElement.classList.toggle('dark', isDarkMode.value)
    localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
  }
  
  // 切换主题
  function toggleTheme() {
    isDarkMode.value = !isDarkMode.value
  }
  
  return {
    isDarkMode,
    toggleTheme
  }
} 