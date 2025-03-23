<template>
  <div class="sql-truncate-checker">
    <!-- 主要内容区域 -->
    <div class="tool-card main-card">
      <div class="action-buttons">
        <el-button @click="loadSample" class="sample-btn" plain>
          <el-icon><DocumentAdd /></el-icon>示例
        </el-button>
        <el-button @click="clearAll" class="clear-all-btn" plain>
          <el-icon><Delete /></el-icon>清空全部
        </el-button>
      </div>

      <!-- 编辑器区域 -->
      <div class="editor-container">
        <div class="editors-column">
          <!-- 建表语句部分 -->
          <div class="editor-section">
            <div class="editor-header">
              <div class="editor-label">
                建表语句
                <el-tooltip content="输入CREATE TABLE语句，用于解析字段长度限制">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </div>
            <div class="textarea-wrapper">
              <el-input
                v-model="createTableSql"
                type="textarea"
                :rows="6"
                placeholder="请输入CREATE TABLE语句..."
                class="sql-editor"
              />
              <div class="floating-actions" v-if="createTableSql">
                <el-button
                  class="float-btn clear-btn"
                  circle
                  @click="clearCreateTable"
                  title="清空输入"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- SQL语句部分 -->
          <div class="editor-section">
            <div class="editor-header">
              <div class="mode-selector">
                <div class="slider-container">
                  <div 
                    class="slider-option" 
                    :class="{ active: options.inputMode === 'full' }"
                    @click="options.inputMode = 'full'"
                  >
                    完整SQL
                  </div>
                  <div 
                    class="slider-option" 
                    :class="{ active: options.inputMode === 'separate' }"
                    @click="options.inputMode = 'separate'"
                  >
                    参数分离
                  </div>
                  <div 
                    class="slider-background"
                    :class="options.inputMode"
                  ></div>
                </div>
              </div>
              <div class="editor-label">
                SQL语句
                <el-tooltip content="输入需要检查的SQL语句">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </div>
            <div class="textarea-wrapper">
              <el-input
                v-model="sqlInput"
                type="textarea"
                :rows="6"
                placeholder="输入需要检查的SQL语句..."
                class="sql-editor"
              />
              <div class="floating-actions" v-if="sqlInput">
                <el-button
                  class="float-btn clear-btn"
                  circle
                  @click="clearSqlInput"
                  title="清空输入"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>

          <!-- 参数输入框（仅在参数分离模式下显示） -->
          <div class="editor-section" v-if="options.inputMode === 'separate'">
            <div class="editor-header">
              <div class="editor-label">
                参数值
                <el-tooltip content="支持多行输入，每行一个参数；或使用逗号，或使用@@@分隔每个参数值；或使用{key=value, key2=value2}格式">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
            </div>
            <div class="textarea-wrapper">
              <el-input
                v-model="paramsInput"
                type="textarea"
                :rows="6"
                :class="['sql-editor', getParamsInputClass]"
                placeholder="输入参数值..."
              />
              <div class="floating-actions" v-if="paramsInput">
                <el-button
                  class="float-btn clear-btn"
                  circle
                  @click="clearParamsInput"
                  title="清空输入"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <div 
                v-if="sqlInput && params.length > 0" 
                class="params-count" 
                :class="{ 'is-error': getParamsInputClass === 'error' }"
              >
                参数数量: {{ params.length }} / {{ countPlaceholders(sqlInput) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 检测按钮 -->
      <div class="generate-button-container">
        <el-button 
          type="primary" 
          @click="checkTruncation" 
          class="check-btn" 
          size="large"
          :disabled="!canCheck"
        >
          开始检测
        </el-button>
      </div>

      <!-- 检测结果区域 -->
      <div class="result-section" v-if="hasChecked || tableInfo.valid">
        <div class="result-container">
          <!-- 表结构信息 -->
          <div class="table-info" v-if="tableInfo.valid">
            <h4>表结构信息</h4>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="表名">
                {{ tableInfo.tableName }}
              </el-descriptions-item>
              <el-descriptions-item label="字段数">
                {{ tableInfo.columnCount }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 检测结果列表 -->
          <div class="check-results" v-if="checkResults.length > 0">
            <h4 class="risk-title">截断风险字段</h4>
            <el-table :data="checkResults" style="width: 100%">
              <el-table-column prop="field" label="字段名" width="120" />
              <el-table-column prop="type" label="字段类型" width="120" />
              <el-table-column prop="maxLength" label="最大长度" width="100" />
              <el-table-column prop="actualLength" label="实际长度" width="100" />
              <el-table-column prop="value" label="值" show-overflow-tooltip />
            </el-table>
          </div>

          <!-- 无异常提示 -->
          <div v-if="hasChecked && checkResults.length === 0" class="no-issues">
            <el-icon class="success-icon"><CircleCheckFilled /></el-icon>
            <span>未发现字段截断风险</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="tool-card disclaimer-card">
      <h3 class="card-title">使用说明</h3>
      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="disclaimer-alert"
      >
        <template #default>
          <div class="disclaimer-content">
            <p>1. 支持检测 INSERT 和 UPDATE 语句中的字段截断风险</p>
            <p>2. 支持 ? 占位符和 :name 形式的命名参数</p>
            <p>3. 自动解析建表语句中的字段长度限制</p>
            <p>4. 支持以下参数输入格式：</p>
            <ul class="format-list">
              <li>每行一个参数</li>
              <li>使用逗号分隔的参数</li>
              <li>使用 @@@ 分隔的参数</li>
              <li>对象格式：{key=value, key2=value2}</li>
            </ul>
          </div>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  DocumentAdd,
  Delete,
  QuestionFilled,
  CircleCheckFilled
} from '@element-plus/icons-vue'

interface ColumnInfo {
  name: string
  type: string
  length: number
}

interface TableInfo {
  valid: boolean
  tableName: string
  columns: Map<string, ColumnInfo>
  columnCount: number
}

interface CheckResult {
  field: string
  type: string
  maxLength: number
  actualLength: number
  value: string
}

interface ParamItem {
  name: string
  value: string
}

// 响应式状态
const createTableSql = ref('')
const sqlInput = ref('')
const paramsInput = ref('')
const params = ref<ParamItem[]>([])
const checkResults = ref<CheckResult[]>([])
const hasChecked = ref(false)
const tableInfo = ref<TableInfo>({
  valid: false,
  tableName: '',
  columns: new Map(),
  columnCount: 0
})

const options = ref({
  inputMode: 'full' as 'full' | 'separate'
})

// 示例数据
const sampleData = {
  createTable: `CREATE TABLE users (
  id INT PRIMARY KEY,
  username VARCHAR(20) NOT NULL,
  email VARCHAR(50) NOT NULL,
  password VARCHAR(32) NOT NULL,
  nickname VARCHAR(10),
  mobile CHAR(11),
  address VARCHAR(100),
  remark TEXT
);`,
  fullSql: `INSERT INTO users (username, email, password, nickname, mobile, address) 
VALUES ('administrator', 'john.doe@verylongemaildomain.com', 'password123456', 
        'JohnDoeWithVeryLongNickname', '12345678901', 
        '123 Very Long Street Name, Very Long City Name, Very Long State Name, 12345');`,
  separateSql: `INSERT INTO users (username, email, password, nickname, mobile, address) 
VALUES (?, ?, ?, ?, ?, ?);`,
  params: `administrator
john.doe@verylongemaildomain.com
password123456
JohnDoeWithVeryLongNickname
12345678901
123 Very Long Street Name, Very Long City Name, Very Long State Name, 12345`
}

// 计算属性
const canCheck = computed(() => {
  return createTableSql.value.trim() && sqlInput.value.trim() && 
    (options.value.inputMode === 'full' || 
     (options.value.inputMode === 'separate' && paramsInput.value.trim()))
})

const getParamsInputClass = computed(() => {
  if (!sqlInput.value || !paramsInput.value) return ''
  
  const placeholderCount = countPlaceholders(sqlInput.value)
  const currentParamsCount = parseParams().length
  
  if (currentParamsCount > 0 && currentParamsCount !== placeholderCount) {
    return 'error'
  }
  return ''
})

// 方法
const loadSample = () => {
  createTableSql.value = sampleData.createTable
  sqlInput.value = options.value.inputMode === 'full' 
    ? sampleData.fullSql 
    : sampleData.separateSql
  if (options.value.inputMode === 'separate') {
    paramsInput.value = sampleData.params
  }
  ElMessage.success('已加载示例数据')
}

const parseCreateTable = () => {
  const sql = createTableSql.value.trim()
  if (!sql) return false

  try {
    // 解析表名
    const tableNameMatch = sql.match(/CREATE\s+TABLE\s+(\w+)\s*\(/i)
    if (!tableNameMatch) {
      ElMessage.error('无法解析表名')
      return false
    }

    const tableName = tableNameMatch[1]
    const columns = new Map<string, ColumnInfo>()

    // 解析字段定义
    const columnDefs = sql
      .substring(sql.indexOf('(') + 1, sql.lastIndexOf(')'))
      .split(',')
      .map(def => def.trim())
      .filter(def => def && !def.startsWith('PRIMARY KEY') && !def.startsWith('FOREIGN KEY'))

    for (const def of columnDefs) {
      const parts = def.split(/\s+/)
      const name = parts[0]
      const typeWithLength = parts[1].toUpperCase()

      let type = typeWithLength
      let length = 0

      // 解析类型中的长度信息
      const lengthMatch = typeWithLength.match(/(\w+)\((\d+)\)/)
      if (lengthMatch) {
        type = lengthMatch[1]
        length = parseInt(lengthMatch[2])
      } else if (type === 'TEXT') {
        length = 65535 // MySQL TEXT类型默认长度
      }

      columns.set(name, { name, type, length })
    }

    tableInfo.value = {
      valid: true,
      tableName,
      columns,
      columnCount: columns.size
    }

    return true
  } catch (error) {
    ElMessage.error('建表语句解析失败')
    return false
  }
}

const parseParams = () => {
  if (!paramsInput.value) return []
  
  // 首先检查是否是 {key=value, key2=value2} 格式
  if (paramsInput.value.trim().startsWith('{') && paramsInput.value.trim().endsWith('}')) {
    const content = paramsInput.value.trim().slice(1, -1)
    const pairs = content.match(/(\w+)\s*=\s*([^,}]*?)(?:,|$)/g) || []
    
    return pairs.map((pair, index) => {
      const [key, ...valueParts] = pair.split('=').map(s => s.trim())
      const value = valueParts.join('=') || ''
      const cleanValue = value.replace(/,\s*$/, '')
      return {
        name: `:p${index + 1}`,
        value: cleanValue
      }
    })
  }
  
  // 处理其他格式
  let paramsList = paramsInput.value.includes('@@@') 
    ? paramsInput.value.split('@@@')
    : paramsInput.value.split(/\r?\n/)
  
  if (paramsList.length === 1 && paramsList[0].includes(',')) {
    paramsList = paramsList[0].split(',')
  }
  
  return paramsList
    .map((param, index) => {
      const value = param.trim()
      if (!value) return null
      
      return {
        name: `:p${index + 1}`,
        value
      }
    })
    .filter((param): param is ParamItem => param !== null)
}

const countPlaceholders = (sql: string): number => {
  const matches = sql.match(/[?:]\w*/g)
  return matches ? matches.length : 0
}

const checkTruncation = async () => {
  try {
    // 重置检测结果
    checkResults.value = []
    hasChecked.value = true
    
    // 解析建表语句
    if (!parseCreateTable()) return
    
    // 获取SQL语句中的值
    let values: string[]
    if (options.value.inputMode === 'separate') {
      params.value = parseParams()
      values = params.value.map(p => p.value)
    } else {
      // 从完整SQL中提取值，需要处理引号包裹的情况
      const valueMatches = sqlInput.value.match(/VALUES\s*\(([\s\S]*?)\)/i)
      if (valueMatches) {
        // 使用更精确的正则表达式来匹配值
        const valueStr = valueMatches[1].replace(/\s+/g, ' ').trim()
        const valueRegex = /'((?:[^']|'')*)'|"((?:[^"]|"")*)"|\b([\w.-]+)\b/g
        values = []
        let match
        while ((match = valueRegex.exec(valueStr)) !== null) {
          let value = match[1] || match[2] || match[3]
          // 处理转义的引号
          if (match[1]) {
            value = value.replace(/''/g, "'")
          } else if (match[2]) {
            value = value.replace(/""/g, '"')
          }
          values.push(value)
        }
      } else {
        values = []
      }
    }
    
    // 解析SQL语句中的字段
    const fields: string[] = []
    if (sqlInput.value.toUpperCase().startsWith('INSERT')) {
      // 更精确地匹配INSERT语句中的字段列表
      const match = sqlInput.value.match(/INSERT\s+INTO\s+\w+\s*\((.*?)\)/i)
      if (match) {
        // 确保字段名去掉可能的反引号或其他包裹符号
        fields.push(...match[1].split(',').map(f => {
          f = f.trim()
          return f.replace(/[`'"]/g, '') // 去掉可能的反引号、单引号或双引号
        }))
      }
    } else if (sqlInput.value.toUpperCase().startsWith('UPDATE')) {
      const setClause = sqlInput.value.match(/SET\s+(.*?)(?:WHERE|$)/i)
      if (setClause) {
        fields.push(...setClause[1].split(',').map(f => {
          const fieldName = f.split('=')[0].trim()
          return fieldName.replace(/[`'"]/g, '') // 去掉可能的包裹符号
        }))
      }
    }

    console.log('Fields:', fields)
    console.log('Values:', values)
    
    // 检查每个字段的值是否超长
    fields.forEach((field, index) => {
      const columnInfo = tableInfo.value.columns.get(field)
      console.log('Checking field:', field, 'columnInfo:', columnInfo)
      if (!columnInfo || !columnInfo.length) return
      
      const value = values[index]
      console.log('Value for field:', field, 'is:', value, 'length:', value?.length)
      if (!value) return
      
      const actualLength = value.length
      if (actualLength > columnInfo.length) {
        checkResults.value.push({
          field,
          type: columnInfo.type,
          maxLength: columnInfo.length,
          actualLength,
          value
        })
      }
    })

    console.log('Check results:', checkResults.value)
  } catch (error) {
    console.error('检测过程中发生错误:', error)
  }
}

// 清空方法
const clearCreateTable = () => {
  createTableSql.value = ''
  tableInfo.value.valid = false
  ElMessage.success('已清空建表语句')
}

const clearSqlInput = () => {
  sqlInput.value = ''
  ElMessage.success('已清空SQL语句')
}

const clearParamsInput = () => {
  paramsInput.value = ''
  params.value = []
  ElMessage.success('已清空参数')
}

const clearAll = () => {
  createTableSql.value = ''
  sqlInput.value = ''
  paramsInput.value = ''
  params.value = []
  checkResults.value = []
  hasChecked.value = false
  tableInfo.value.valid = false
  ElMessage.success('已清空所有内容')
}
</script>

<style scoped>
.sql-truncate-checker {
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

.editor-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
  display: flex;
  gap: 0.5rem;
}

.input-mode-group {
  width: 100%;
  display: flex;
  justify-content: center;
}

.clear-all-btn {
  border-color: var(--el-color-danger) !important;
  color: var(--el-color-danger) !important;
  background-color: white !important;
}

.clear-all-btn:hover {
  color: white !important;
  background-color: var(--el-color-danger) !important;
}

.float-btn.clear-btn {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
  color: white !important;
}

.float-btn.clear-btn:hover {
  background-color: #218838 !important;
  border-color: #218838 !important;
}

.check-btn {
  background-color: #007aff !important;
  border-color: #007aff !important;
  min-width: 120px;
}

.check-btn:hover {
  background-color: #0056b3 !important;
  border-color: #0056b3 !important;
}

.check-btn:disabled {
  background-color: #b3d7ff !important;
  border-color: #b3d7ff !important;
}

:deep(.el-radio-group) {
  border-radius: 8px;
  background: var(--bg-secondary);
  padding: 4px;
}

:deep(.el-radio-button__inner) {
  border-radius: 6px !important;
  padding: 8px 16px;
}

.editor-container {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.25rem;
}

.editors-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex: 1;
}

.editor-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.editor-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mode-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.textarea-wrapper {
  position: relative;
}

.sql-editor {
  width: 100%;
}

.sql-editor.error :deep(.el-textarea__inner) {
  border-color: #f56c6c;
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

:deep(.el-textarea__inner:focus) {
  border-color: #007aff !important;
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
  z-index: 10;
}

.textarea-wrapper:hover .floating-actions {
  opacity: 1;
}

.result-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.result-container {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  margin-top: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-info {
  margin-bottom: 1rem;
}

.table-info h4,
.check-results h4 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.no-issues {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #67c23a;
  font-size: 1.1rem;
  padding: 2rem;
}

.success-icon {
  font-size: 1.5rem;
}

.params-count {
  position: absolute;
  right: 1rem;
  bottom: 0.5rem;
  font-size: 0.8rem;
  color: #909399;
}

.params-count.is-error {
  color: #f56c6c;
}

.generate-button-container {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.disclaimer-card {
  border-radius: 24px;
  background: #fdf6ec;
  margin-top: 0rem;
}

.disclaimer-alert {
  background: transparent !important;
  border: none !important;
}

.card-title {
  color: #7d5f2a;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.disclaimer-content {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #7d5f2a;
}

.format-list {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.format-list li {
  margin-bottom: 0.25rem;
  color: #7d5f2a;
}

:deep(.el-alert) {
  padding: 0;
}

:deep(.el-alert__icon) {
  color: #7d5f2a;
  font-size: 1.25rem;
  padding: 0.5rem;
}

.sample-btn {
  border-color: #007aff !important;
  color: #007aff !important;
  background-color: white !important;
}

.sample-btn:hover {
  color: white !important;
  background-color: #007aff !important;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #007aff !important;
  border-color: #007aff !important;
  box-shadow: -1px 0 0 0 #007aff !important;
}

.risk-title {
  color: #f56c6c !important;
  font-weight: 600;
}

:deep(.el-table) {
  border: 1px solid #fde2e2;
  border-radius: 8px;
}

:deep(.el-table__header) {
  background-color: #fef0f0;
}

:deep(.el-table__header th) {
  background-color: #fef0f0;
  color: #f56c6c;
  font-weight: 600;
}

:deep(.el-table__row) {
  color: #f56c6c;
}

:deep(.el-table__row td) {
  background-color: #fff8f8;
}

.slider-container {
  position: relative;
  display: flex;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 4px;
  width: fit-content;
  margin: 0 auto;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.slider-option {
  position: relative;
  padding: 8px 24px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  z-index: 1;
  transition: all 0.3s ease;
  user-select: none;
  white-space: nowrap;
}

.slider-option.active {
  color: #ffffff;
}

.slider-background {
  position: absolute;
  top: 4px;
  height: calc(100% - 8px);
  width: calc(50% - 4px);
  background: #007aff;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.25);
}

.slider-background.full {
  left: 4px;
}

.slider-background.separate {
  left: calc(50% + 0px);
}

/* 移除不再需要的样式 */
.switch-wrapper,
:deep(.el-switch),
:deep(.el-switch__core),
.mode-label {
  display: none;
}
</style> 