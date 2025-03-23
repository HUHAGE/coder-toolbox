<template>
  <div class="sql-parser-tool">
    <!-- 主要内容区域 -->
    <div class="tool-card main-card">
      <div class="action-buttons">
        <el-button @click="loadSample" class="sample-btn" plain>
          <el-icon><DocumentAdd /></el-icon>示例
        </el-button>
      </div>

      <!-- SQL输入区域 -->
      <div class="editor-container">
        <div class="editor-section">
          <div class="editor-header">
            <div class="editor-label">
              INSERT 语句
              <el-tooltip content="输入INSERT语句，解析器将分析字段和值的对应关系">
                <el-icon class="help-icon"><QuestionFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="textarea-wrapper">
            <el-input
              v-model="sqlInput"
              type="textarea"
              :rows="8"
              placeholder="请输入INSERT语句..."
              class="sql-editor"
            />
            <div class="floating-actions" v-if="sqlInput">
              <el-button
                class="float-btn copy-btn"
                circle
                @click="copySql"
                title="复制内容"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
              <el-button
                class="float-btn clear-btn"
                circle
                @click="clearSql"
                title="清空输入"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 解析按钮 -->
      <div class="parse-button-container">
        <el-button 
          type="primary" 
          @click="parseSql" 
          class="parse-btn" 
          size="large"
          :disabled="!sqlInput"
        >
          解析
        </el-button>
      </div>
    </div>

    <!-- 解析结果卡片 -->
    <div class="tool-card result-card" v-if="parseResult.valid">
      <h3 class="card-title">解析结果</h3>
      <div class="result-container">
        <el-table 
          :data="parseResult.mappings" 
          border 
          style="width: 100%"
          :stripe="true"
          highlight-current-row
        >
          <el-table-column prop="index" label="序号" width="80" />
          <el-table-column prop="field" label="字段名" />
          <el-table-column prop="value" label="值" />
          <el-table-column prop="type" label="推测类型" width="120" />
          <el-table-column prop="length" label="长度" width="100" />
        </el-table>

        <!-- SQL分析信息 -->
        <div class="sql-analysis">
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="表名">
              {{ parseResult.tableName }}
            </el-descriptions-item>
            <el-descriptions-item label="字段数">
              {{ parseResult.fieldCount }}
            </el-descriptions-item>
            <el-descriptions-item label="语法检查">
              <el-tag :type="parseResult.syntaxValid ? 'success' : 'danger'">
                {{ parseResult.syntaxValid ? '通过' : '失败' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>

    <!-- 使用说明 -->
    <div class="tool-card disclaimer-card">
      <h3 class="card-title">使用说明</h3>
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="disclaimer-content">
            <p>插入语句太长，不知道哪个字段插入了什么值，用这个工具解析一下，快速获取字段和值的对应关系。</p>
            <p>1. 支持解析标准的 INSERT INTO 语句</p>
            <p>2. 自动识别字段类型和长度</p>
          </div>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  DocumentAdd,
  Delete,
  QuestionFilled,
  Connection,
  CopyDocument
} from '@element-plus/icons-vue'

interface FieldMapping {
  index: number
  field: string
  value: string
  type: string
  length: number
}

interface ParseResult {
  valid: boolean
  tableName: string
  fieldCount: number
  syntaxValid: boolean
  mappings: FieldMapping[]
}

const sqlInput = ref('')
const parseResult = ref<ParseResult>({
  valid: false,
  tableName: '',
  fieldCount: 0,
  syntaxValid: false,
  mappings: []
})

// 示例SQL
const sampleSql = `INSERT INTO employees (
  id,
  first_name,
  last_name,
  email,
  phone_number,
  hire_date,
  salary,
  department_id,
  is_active,
  created_at
) VALUES (
  1001,
  'John',
  'Smith',
  'john.smith@example.com',
  '+1-555-123-4567',
  '2024-01-15',
  75000.50,
  3,
  TRUE,
  CURRENT_TIMESTAMP
);`

// 加载示例
const loadSample = () => {
  sqlInput.value = sampleSql
  ElMessage.success('已加载示例数据')
}

// 清空所有内容
const clearAll = () => {
  sqlInput.value = ''
  parseResult.value.valid = false
  ElMessage.success('已清空所有内容')
}

// 清空SQL输入
const clearSql = () => {
  sqlInput.value = ''
  parseResult.value.valid = false
  ElMessage.success('已清空SQL输入')
}

// 复制SQL内容
const copySql = () => {
  navigator.clipboard.writeText(sqlInput.value)
    .then(() => {
      ElMessage.success('已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

// 推测值的类型和长度
const inferTypeAndLength = (value: string): { type: string; length: number } => {
  if (!value || value.toLowerCase() === 'null') {
    return { type: 'NULL', length: 0 }
  }

  // 移除引号
  const cleanValue = value.replace(/^['"]|['"]$/g, '')

  // 数字类型
  if (/^\d+$/.test(cleanValue)) {
    return { type: 'INTEGER', length: cleanValue.length }
  }
  if (/^\d*\.\d+$/.test(cleanValue)) {
    return { type: 'DECIMAL', length: cleanValue.length }
  }

  // 日期时间类型
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanValue)) {
    return { type: 'DATE', length: 10 }
  }
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/.test(cleanValue)) {
    return { type: 'DATETIME', length: 19 }
  }

  // 布尔类型
  if (/^(true|false)$/i.test(cleanValue)) {
    return { type: 'BOOLEAN', length: 1 }
  }

  // 默认为字符串类型
  return { type: 'VARCHAR', length: cleanValue.length }
}

// 解析SQL语句
const parseSql = () => {
  try {
    const sql = sqlInput.value.trim()
    if (!sql) {
      ElMessage.warning('请输入SQL语句')
      return
    }

    // 验证是否是INSERT语句
    if (!sql.toUpperCase().startsWith('INSERT INTO')) {
      ElMessage.error('只支持解析INSERT语句')
      return
    }

    // 解析表名
    const tableNameMatch = sql.match(/INSERT\s+INTO\s+(\w+)/i)
    if (!tableNameMatch) {
      ElMessage.error('无法解析表名')
      return
    }

    // 解析字段
    const fieldsMatch = sql.match(/\(([\s\S]*?)\)\s*VALUES/i)
    if (!fieldsMatch) {
      ElMessage.error('无法解析字段列表')
      return
    }

    // 解析值
    const valuesMatch = sql.match(/VALUES\s*\(([\s\S]*?)\)/i)
    if (!valuesMatch) {
      ElMessage.error('无法解析值列表')
      return
    }

    const fields = fieldsMatch[1]
      .split(',')
      .map(field => field.trim())
      .filter(field => field.length > 0)

    const values = valuesMatch[1]
      .split(',')
      .map(value => value.trim())
      .filter(value => value.length > 0)

    if (fields.length !== values.length) {
      ElMessage.error('字段数量与值的数量不匹配')
      return
    }

    // 生成映射关系
    const mappings: FieldMapping[] = fields.map((field, index) => {
      const { type, length } = inferTypeAndLength(values[index])
      return {
        index: index + 1,
        field,
        value: values[index],
        type,
        length
      }
    })

    // 更新解析结果
    parseResult.value = {
      valid: true,
      tableName: tableNameMatch[1],
      fieldCount: fields.length,
      syntaxValid: true,
      mappings
    }

    ElMessage.success('解析成功')
  } catch (error) {
    ElMessage.error('SQL解析失败')
    parseResult.value.valid = false
  }
}
</script>

<style scoped>
.sql-parser-tool {
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
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: 1000px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.editor-container {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.25rem;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.help-icon {
  color: #909399;
  cursor: help;
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
  padding: 0.75rem;
  line-height: 1.5;
  resize: none;
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

.parse-button-container {
  display: flex;
  justify-content: center;
  margin: 1.5rem 0;
}

.parse-btn {
  min-width: 120px;
  background-color: #007aff;
  border-color: #007aff;
}

.parse-btn:hover {
  background-color: #0062cc;
  border-color: #0062cc;
}

.result-card {
  background: white;
  margin-top: 0;  /* 移除顶部边距，因为已经使用了 gap */
}

.result-card .card-title {
  color: #2c3e50;  /* 使用默认标题颜色 */
}

.result-container {
  margin-top: 0;  /* 移除之前的边距 */
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

:deep(.el-table__header-wrapper) {
  background-color: #f8f9fa;
}

:deep(.el-table__header) th {
  background-color: #f8f9fa !important;
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 12px 0;
  border: none;
}

:deep(.el-table__row) {
  background-color: white !important;
}

:deep(.el-table__row td) {
  padding: 16px 0;
  border: none;
  color: #2c3e50;
  font-size: 0.95rem;
}

:deep(.el-table__row:hover) td {
  background-color: #f8faff !important;
}

:deep(.el-table--striped .el-table__row--striped) td {
  background-color: #fafafa !important;
}

:deep(.el-table--striped .el-table__row--striped:hover) td {
  background-color: #f8faff !important;
}

:deep(.el-table--enable-row-hover .el-table__row:hover) td {
  background-color: #f8faff !important;
}

:deep(.el-table__inner-wrapper::before) {
  display: none;
}

:deep(.el-table__cell) {
  border-bottom: 1px solid #f0f0f0 !important;
}

.sql-analysis {
  margin-top: 1.5rem;
}

:deep(.el-descriptions) {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

:deep(.el-descriptions__header) {
  margin-bottom: 0;
}

:deep(.el-descriptions__body) {
  background-color: white;
}

:deep(.el-descriptions__label) {
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 12px 16px;
}

:deep(.el-descriptions__content) {
  color: #2c3e50;
  font-size: 0.95rem;
  padding: 12px 16px;
}

:deep(.el-tag) {
  border: none;
  font-weight: 500;
}

:deep(.el-tag--success) {
  background-color: #f0f9eb;
  color: #67c23a;
}

:deep(.el-tag--danger) {
  background-color: #fef0f0;
  color: #f56c6c;
}

.disclaimer-card {
  background: #fdf6ec;
  border-radius: 30px;
}

.card-title {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #7d5a29;
}

:deep(.el-alert) {
  background-color: transparent;
  padding: 0;
  border: none;
}

:deep(.el-alert .el-alert__icon) {
  color: #7d5a29;
}

.disclaimer-content {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #7d5a29;
}

.format-list {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.format-list li {
  margin-bottom: 0.25rem;
}

.sample-btn {
  border-color: #007aff;
  color: #007aff;
}

.sample-btn:hover {
  border-color: #0062cc;
  color: #0062cc;
}

.clear-all-btn {
  border-color: #ff4d4f;
  color: #ff4d4f;
}

.clear-all-btn:hover {
  border-color: #cf1322;
  color: #cf1322;
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
  line-height: 1 !important;
  font-size: 16px !important;
}

.float-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.float-btn.copy-btn {
  background-color: #007aff !important;
  color: white !important;
}

.float-btn.copy-btn:hover {
  background-color: #0056b3 !important;
}

.float-btn.clear-btn {
  background-color: #28a745 !important;
  color: white !important;
}

.float-btn.clear-btn:hover {
  background-color: #218838 !important;
}

.float-btn :deep(.el-icon) {
  margin: 0 !important;
  font-size: 16px !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .floating-actions {
    opacity: 1; /* 在移动端始终显示按钮 */
    top: 0.75rem;
    right: 0.75rem;
  }

  .float-btn {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    max-width: 36px !important;
    min-height: 36px !important;
    max-height: 36px !important;
    flex: 0 0 36px !important;
  }
  
  .float-btn :deep(.el-icon) {
    font-size: 14px !important;
  }
}
</style> 