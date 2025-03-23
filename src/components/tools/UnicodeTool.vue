<template>
  <div class="unicode-tool">
    <div class="actions-bar">
      <el-button-group class="action-group">
        <el-button type="primary" @click="encode" class="action-button">
          <el-icon><Upload /></el-icon>中文转Unicode
        </el-button>
        <el-button type="primary" @click="decode" class="action-button">
          <el-icon><Download /></el-icon>Unicode转中文
        </el-button>
        <el-button @click="copyResult" class="action-button">
          <el-icon><CopyDocument /></el-icon>复制
        </el-button>
        <el-button @click="clearContent" class="action-button">
          <el-icon><Delete /></el-icon>清空
        </el-button>
      </el-button-group>

      <div class="options">
        <el-checkbox v-model="useUPlus">使用 U+ 前缀</el-checkbox>
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
              placeholder="请输入要转换的文本..."
              class="unicode-editor"
            />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-label">转换结果</div>
            <el-input
              v-model="outputContent"
              type="textarea"
              :rows="10"
              readonly
              placeholder="转换结果..."
              class="unicode-editor"
            />
          </div>
        </el-col>
      </el-row>

      <div class="result-details" v-if="outputContent">
        <div class="detail-item">
          <span class="detail-label">字符数:</span>
          <span class="detail-value">{{ charCount }}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">字节数:</span>
          <span class="detail-value">{{ byteCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Upload,
  Download,
  Document as CopyDocument,
  Delete 
} from '@element-plus/icons-vue'

const inputContent = ref('')
const outputContent = ref('')
const useUPlus = ref(false)

// 计算字符数
const charCount = computed(() => {
  return outputContent.value.length
})

// 计算字节数
const byteCount = computed(() => {
  const str = outputContent.value
  let bytes = 0
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    if (charCode <= 0x007f) {
      bytes += 1
    } else if (charCode <= 0x07ff) {
      bytes += 2
    } else if (charCode <= 0xffff) {
      bytes += 3
    } else {
      bytes += 4
    }
  }
  return bytes
})

// Unicode 编码
const encode = () => {
  if (!inputContent.value) {
    ElMessage.warning('请输入要编码的内容')
    return
  }
  try {
    const result = Array.from(inputContent.value)
      .map(char => {
        const hex = char.charCodeAt(0).toString(16).padStart(4, '0')
        return useUPlus.value ? `U+${hex}` : `\\u${hex}`
      })
      .join('')
    outputContent.value = result
    ElMessage.success('编码成功')
  } catch (error) {
    ElMessage.error('编码失败')
  }
}

// Unicode 解码
const decode = () => {
  if (!inputContent.value) {
    ElMessage.warning('请输入要解码的内容')
    return
  }
  try {
    const text = inputContent.value
      .replace(/[Uu]\+/g, '\\u')
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
        String.fromCharCode(parseInt(hex, 16))
      )
    outputContent.value = text
    ElMessage.success('解码成功')
  } catch (error) {
    ElMessage.error('解码失败')
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

const clearContent = () => {
  inputContent.value = ''
  outputContent.value = ''
  ElMessage.success('已清空')
}
</script>

<style scoped>
.unicode-tool {
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

.unicode-editor {
  border-radius: 8px;
  font-family: monospace;
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
  font-family: monospace;
}

:deep(.el-textarea__inner) {
  font-family: "Microsoft YaHei", monospace;
}

/* 暗黑模式适配 */
:root.dark .unicode-tool {
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
  .unicode-tool {
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
}
</style> 