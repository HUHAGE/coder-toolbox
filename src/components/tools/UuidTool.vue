<template>
  <div class="uuid-tool">
    <div class="actions-bar">
      <el-button-group class="action-group">
        <el-button type="primary" @click="generateUuid" class="action-button">
          <el-icon><Key /></el-icon>生成UUID
        </el-button>
        <el-button @click="copyResult" class="action-button">
          <el-icon><CopyDocument /></el-icon>复制
        </el-button>
        <el-button @click="clearContent" class="action-button">
          <el-icon><Delete /></el-icon>清空
        </el-button>
      </el-button-group>

      <div class="options">
        <div class="count-option">
          <span class="option-label">数量:</span>
          <el-input-number 
            v-model="generateCount" 
            :min="1" 
            :max="100"
            size="small"
            controls-position="right"
          />
        </div>
        <el-checkbox v-model="uppercase">大写</el-checkbox>
        <el-checkbox v-model="noDash">无连字符</el-checkbox>
      </div>
    </div>

    <div class="editor-container">
      <div class="uuid-list">
        <div v-for="(uuid, index) in uuidList" 
          :key="index" 
          class="uuid-item"
          @click="copyUuid(uuid)"
        >
          <span class="uuid-text">{{ uuid }}</span>
          <el-icon class="copy-icon"><CopyDocument /></el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Key,
  Document as CopyDocument,
  Delete 
} from '@element-plus/icons-vue'

const uuidList = ref<string[]>([])
const uppercase = ref(false)
const noDash = ref(false)
const generateCount = ref(1)

function generateUuid() {
  const generateSingleUuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }
  
  const newUuids = Array(generateCount.value).fill(null).map(() => {
    let uuid = generateSingleUuid()
    if (uppercase.value) {
      uuid = uuid.toUpperCase()
    }
    if (noDash.value) {
      uuid = uuid.replace(/-/g, '')
    }
    return uuid
  })
  
  uuidList.value = [...newUuids, ...uuidList.value].slice(0, 100)
  
  ElMessage.success(`成功生成 ${generateCount.value} 个UUID`)
}

const copyUuid = async (uuid: string) => {
  try {
    await navigator.clipboard.writeText(uuid)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const copyResult = async () => {
  if (uuidList.value.length === 0) {
    ElMessage.warning('没有可复制的UUID')
    return
  }
  try {
    await navigator.clipboard.writeText(uuidList.value.join('\n'))
    ElMessage.success('已复制全部UUID')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearContent = () => {
  uuidList.value = []
  ElMessage.success('已清空')
}
</script>

<style scoped>
.uuid-tool {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
}

.actions-bar {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-group {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  height: auto;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button:active {
  transform: scale(0.98);
}

.options {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.count-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

:deep(.el-input-number) {
  width: 100px;
}

.editor-container {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
  min-height: 400px;
}

.uuid-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.uuid-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.uuid-item:hover {
  background: var(--bg-tertiary);
  transform: translateX(4px);
}

.uuid-text {
  font-family: "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--text-primary);
}

.copy-icon {
  color: var(--text-secondary);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.uuid-item:hover .copy-icon {
  opacity: 1;
}
</style> 