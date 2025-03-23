<template>
  <div class="md5-tool">
    <div class="actions-bar">
      <el-button-group class="action-group">
        <el-button type="primary" @click="encrypt" class="action-button">
          <el-icon><Lock /></el-icon>加密
        </el-button>
        <el-button @click="copyResult" class="action-button">
          <el-icon><CopyDocument /></el-icon>复制
        </el-button>
        <el-button @click="clearContent" class="action-button">
          <el-icon><Delete /></el-icon>清空
        </el-button>
      </el-button-group>

      <div class="options">
        <el-checkbox v-model="uppercase">大写</el-checkbox>
      </div>
    </div>

    <div class="editor-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-label">输入文本</div>
            <el-input
              v-model="inputContent"
              type="textarea"
              :rows="10"
              placeholder="请输入要加密的文本..."
              class="md5-editor"
              @input="handleInput"
            />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-label">MD5 结果</div>
            <el-input
              v-model="outputContent"
              type="textarea"
              :rows="10"
              readonly
              placeholder="MD5 加密结果..."
              class="md5-editor"
            />
          </div>
        </el-col>
      </el-row>

      <div class="result-details" v-if="outputContent">
        <div class="detail-item">
          <span class="detail-label">16位 MD5:</span>
          <span class="detail-value">{{ md5_16 }}</span>
          <el-button 
            class="copy-btn" 
            size="small" 
            @click="copySpecific(md5_16)"
          >复制</el-button>
        </div>
        <div class="detail-item">
          <span class="detail-label">32位 MD5:</span>
          <span class="detail-value">{{ md5_32 }}</span>
          <el-button 
            class="copy-btn" 
            size="small" 
            @click="copySpecific(md5_32)"
          >复制</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Lock,
  Document as CopyDocument,
  Delete 
} from '@element-plus/icons-vue'
import md5 from 'crypto-js/md5'

const inputContent = ref('')
const outputContent = ref('')
const uppercase = ref(false)

// 计算32位MD5
const md5_32 = computed(() => {
  if (!outputContent.value) return ''
  return uppercase.value ? outputContent.value : outputContent.value.toLowerCase()
})

// 计算16位MD5
const md5_16 = computed(() => {
  if (!outputContent.value) return ''
  const md5_32_str = uppercase.value ? outputContent.value : outputContent.value.toLowerCase()
  return md5_32_str.substring(8, 24)
})

const encrypt = () => {
  if (!inputContent.value) {
    ElMessage.warning('请输入要加密的内容')
    return
  }
  try {
    const result = md5(inputContent.value).toString()
    outputContent.value = uppercase.value ? result.toUpperCase() : result
    ElMessage.success('加密成功')
  } catch (error) {
    ElMessage.error('加密失败')
  }
}

const copyResult = async () => {
  if (!outputContent.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  try {
    await navigator.clipboard.writeText(outputContent.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const copySpecific = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearContent = () => {
  inputContent.value = ''
  outputContent.value = ''
  ElMessage.success('已清空')
}

const handleInput = () => {
  if (inputContent.value) {
    encrypt()
  } else {
    outputContent.value = ''
  }
}
</script>

<style scoped>
.md5-tool {
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
}

.editor-container {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
}

.editor-wrapper {
  position: relative;
}

.editor-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.75rem;
}

.md5-editor {
  border-radius: 8px;
  font-family: "Microsoft YaHei", sans-serif;
}

.result-details {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 0.9rem;
}

.detail-item {
  display: flex;
  align-items: center;
  margin: 0.75rem 0;
  padding: 0.75rem;
  background: var(--bg-primary);
  border-radius: 6px;
}

.detail-label {
  color: var(--text-secondary);
  font-weight: 500;
  width: 100px;
}

.detail-value {
  flex: 1;
  color: var(--text-primary);
  font-family: "Microsoft YaHei", sans-serif;
  margin: 0 1rem;
  word-break: break-all;
}

.copy-btn {
  flex-shrink: 0;
}

:deep(.el-textarea__inner) {
  font-family: "Microsoft YaHei", sans-serif;
}

/* 暗黑模式适配 */
:root.dark .md5-tool {
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.1);
}

:root.dark .editor-container {
  background: rgba(255, 255, 255, 0.03);
}

:root.dark .detail-item {
  background: rgba(255, 255, 255, 0.05);
}

:root.dark .result-details {
  background: rgba(255, 255, 255, 0.03);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .md5-tool {
    padding: 1rem;
  }

  .actions-bar {
    flex-direction: column;
    gap: 1rem;
  }

  .options {
    width: 100%;
    justify-content: center;
  }

  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .detail-label {
    width: auto;
  }

  .detail-value {
    margin: 0;
  }

  .copy-btn {
    width: 100%;
  }
}

.code-number, pre, code {
  font-family: "Microsoft YaHei", sans-serif;
}
</style> 