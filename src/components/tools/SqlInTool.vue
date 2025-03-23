<template>
  <div class="sql-in-tool">
    <!-- 主要内容区域 -->
    <div class="tool-card main-card">
      <!-- 选项区域移到顶部 -->
      <div class="options">
        <el-button @click="loadSample" class="sample-btn">
          示例
        </el-button>
        <div class="checkboxes">
          <el-checkbox v-model="options.uppercase">大写</el-checkbox>
          <el-checkbox v-model="options.singleQuotes">单引号</el-checkbox>
        </div>
      </div>

      <!-- 编辑器区域 -->
      <div class="editor-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="editor-wrapper">
              <div class="editor-label">输入文本 (每行一个值)</div>
              <div class="textarea-wrapper">
                <el-input
                  v-model="inputContent"
                  type="textarea"
                  :rows="12"
                  placeholder="请输入要转换的值，每行一个..."
                  class="sql-editor"
                />
                <div class="floating-actions" v-if="inputContent">
                  <el-button
                    class="float-btn clear-btn"
                    circle
                    @click="clearContent"
                    title="清空输入"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="editor-wrapper">
              <div class="editor-label">SQL IN 语句</div>
              <div class="textarea-wrapper">
                <el-input
                  v-model="outputContent"
                  type="textarea"
                  :rows="12"
                  readonly
                  placeholder="生成的 SQL IN 语句..."
                  class="sql-editor"
                />
                <div class="floating-actions" v-if="outputContent">
                  <el-button
                    class="float-btn copy-btn"
                    circle
                    @click="copyResult"
                    title="复制结果"
                  >
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 生成按钮移到这里 -->
      <div class="generate-button-container">
        <el-button type="primary" @click="generateSql" class="generate-btn" size="large">
          生成
        </el-button>
      </div>
    </div>

    <!-- 底部免责声明 -->
    <div class="tool-card disclaimer-card">
      <h3 class="card-title">免责声明</h3>
      <el-alert
        type="warning"
        :closable="false"
        show-icon
      >
        <template #title>重要提示</template>
        <div class="disclaimer-content">
          <p>1. 本工具仅用于开发调试，请勿用于生产环境；</p>
          <p>2. 使用本工具生成的SQL语句时请注意SQL注入风险；</p>
          <p>3. 建议在使用生成的SQL语句时采用参数化查询来防止SQL注入。</p>
        </div>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Brush as Magic,
  Document as CopyDocument,
  Delete,
  DocumentAdd
} from '@element-plus/icons-vue'

const inputContent = ref('')
const outputContent = ref('')
const options = ref({
  uppercase: false,
  singleQuotes: true
})

const sampleData = `1001
1002
1003
1004
1005`

const loadSample = () => {
  inputContent.value = sampleData
  ElMessage.success('已加载示例数据')
}

const generateSql = () => {
  if (!inputContent.value.trim()) {
    outputContent.value = ''
    return
  }

  try {
    // 分割每行并过滤空行
    const values = inputContent.value
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)

    if (values.length === 0) {
      outputContent.value = ''
      return
    }

    // 处理每个值
    const quote = options.value.singleQuotes ? "'" : '"'
    const formattedValues = values.map((value: string) => `${quote}${value}${quote}`)
    
    // 生成 IN 语句
    let sql = options.value.uppercase ? 'IN (' : 'in ('
    sql += formattedValues.join(', ')
    sql += ')'

    outputContent.value = sql
  } catch (error) {
    ElMessage.error('生成失败')
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

watch(
  [inputContent, () => options.value.uppercase, () => options.value.singleQuotes],
  () => {
    generateSql()
  }
)
</script>

<style scoped>
.sql-in-tool {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
  align-items: center;
}

.tool-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: 1000px;
}

.options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.checkboxes {
  display: flex;
  gap: 1.5rem;
}

.editor-container {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
}

.editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.editor-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.textarea-wrapper {
  position: relative;
}

.sql-editor {
  width: 100%;
}

:deep(.el-textarea__inner) {
  font-family: "Microsoft YaHei", monospace;
  font-size: 1rem;
  color: #2c3e50;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  line-height: 1.6;
  resize: none;
}

:deep(.el-textarea__inner:focus) {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
}

.floating-actions {
  position: absolute;
  right: 1rem;
  top: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.textarea-wrapper:hover .floating-actions {
  opacity: 1;
}

.float-btn {
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
  min-width: 40px !important;
  max-width: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
  flex: 0 0 40px !important;
}

.float-btn.copy-btn {
  background-color: #007aff !important;
  color: white !important;
}

.float-btn.clear-btn {
  background-color: #28a745 !important;
  color: white !important;
}

.float-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.generate-button-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.generate-btn {
  min-width: 160px;
  padding: 16px 48px;
  font-size: 1.1rem;
  font-weight: 500;
  background-color: #007aff;
  color: white;
}

.sample-btn {
  min-width: 80px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  border: 1px solid #007aff;
  color: #007aff;
  background-color: transparent;
}

.sample-btn:hover {
  color: #0056b3;
  border-color: #0056b3;
  background-color: rgba(0, 122, 255, 0.05);
}

.disclaimer-card :deep(.el-alert) {
  margin: 0;
  padding: 1rem;
  border-radius: 12px;
}
<template>

.disclaimer-card :deep(.el-alert.el-alert--warning) {
  background-color: rgba(255, 197, 23, 0.1);
  border: 1px solid rgba(255, 197, 23, 0.2);
}

.disclaimer-content {
  padding: 0.5rem 0;
}

.disclaimer-content p {
  margin: 0.75rem 0;
  line-height: 1.6;
  font-size: 1rem;
  color: var(--el-text-color-primary);
}

/* 暗色模式适配 */
:root.dark .tool-card {
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.1);
}

:root.dark .editor-container {
  background: rgba(255, 255, 255, 0.02);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sql-in-tool {
    padding: 1rem;
  }

  .tool-card {
    padding: 1rem;
    border-radius: 16px;
  }

  .options {
    flex-direction: column;
    gap: 1rem;
  }

  .checkboxes {
    justify-content: center;
  }

  .generate-button-container {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .generate-btn,
  .sample-btn {
    width: 100%;
    max-width: 200px;
  }

  .editor-container {
    padding: 1rem;
  }

  .el-row {
    margin: 0 !important;
  }

  .el-col {
    padding: 0 !important;
    margin-bottom: 1rem;
  }

  .el-col:last-child {
    margin-bottom: 0;
  }

  .floating-actions {
    opacity: 1;
  }

  .float-btn {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    max-width: 36px !important;
    min-height: 36px !important;
    max-height: 36px !important;
  }
}
</style> 