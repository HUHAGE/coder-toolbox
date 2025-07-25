<template>
  <div class="url-tool">
    <div class="actions-bar">
      <el-button-group class="action-group">
        <el-button type="primary" @click="encode" class="action-button">
          <el-icon><Upload /></el-icon>编码
        </el-button>
        <el-button type="primary" @click="decode" class="action-button">
          <el-icon><Download /></el-icon>解码
        </el-button>
        <el-button @click="copyResult" class="action-button">
          <el-icon><CopyDocument /></el-icon>复制
        </el-button>
        <el-button @click="clearContent" class="action-button">
          <el-icon><Delete /></el-icon>清空
        </el-button>
        <el-button @click="loadExample" class="action-button">
          <el-icon><Document /></el-icon>示例
        </el-button>
      </el-button-group>
    </div>

    <div class="editor-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-label">输入 URL</div>
            <el-input
              v-model="inputContent"
              type="textarea"
              :rows="20"
              placeholder="请输入要编码/解码的 URL..."
              class="url-editor"
            />
          </div>
        </el-col>
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-label">转换结果</div>
            <el-input
              v-model="outputContent"
              type="textarea"
              :rows="20"
              readonly
              placeholder="转换结果..."
              class="url-editor"
            />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Upload,
  Download,
  Document,
  Document as CopyDocument,
  Delete 
} from '@element-plus/icons-vue'

const inputContent = ref('')
const outputContent = ref('')

const encode = () => {
  try {
    outputContent.value = encodeURIComponent(inputContent.value)
    ElMessage.success('编码成功')
  } catch (error) {
    ElMessage.error('编码失败')
  }
}

const decode = () => {
  try {
    outputContent.value = decodeURIComponent(inputContent.value)
    ElMessage.success('解码成功')
  } catch (error) {
    ElMessage.error('解码失败')
  }
}

const copyResult = async () => {
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

const loadExample = () => {
  inputContent.value = 'https%3A%2F%2Fexample.com%2Fpath%3Fname%3D%E5%BC%A0%E4%B8%89%26age%3D25%26title%3DWeb%20Developer'
  outputContent.value = ''
  ElMessage.success('已加载示例')
}
</script>

<style scoped>
.url-tool {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
}

.actions-bar {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: flex-start;
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

.url-editor {
  border-radius: 8px;
}
</style> 