<template>
  <div class="sql-params-tool">
    <!-- 主要内容区域 -->
    <div class="tool-card main-card">
      <!-- 选项区域移到顶部 -->
      <div class="options">
        <div class="action-buttons">
          <el-button @click="loadSample" class="sample-btn">
            <el-icon><DocumentAdd /></el-icon>示例
          </el-button>
          <el-button @click="clearAll" class="clear-all-btn" type="danger">
            <el-icon><Delete /></el-icon>清空全部
          </el-button>
        </div>
        <div class="checkboxes">
          <el-checkbox v-model="options.singleQuotes">单引号</el-checkbox>
          <el-checkbox v-model="options.autoQuote">自动引号</el-checkbox>
          <el-checkbox v-model="options.autoFormat">自动格式化</el-checkbox>
          <el-tooltip content="支持 ? 和 :name 形式的参数">
            <el-checkbox v-model="options.namedParams">命名参数</el-checkbox>
          </el-tooltip>
        </div>
      </div>

      <!-- 编辑器区域 -->
      <div class="editor-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="editor-wrapper">
              <div class="editor-label">SQL语句</div>
              <div class="textarea-wrapper">
                <el-input
                  v-model="sqlInput"
                  type="textarea"
                  :rows="6"
                  placeholder="输入包含参数的SQL语句..."
                  class="sql-editor"
                />
                <div class="floating-actions" v-if="sqlInput">
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

              <div class="editor-label">
                参数值
                <el-tooltip content="支持多行输入，每行一个参数；或使用逗号，或使用@@@分隔每个参数值；或使用{key=value, key2=value2}格式">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="textarea-wrapper">
                <el-input
                  v-model="paramsInput"
                  type="textarea"
                  :rows="6"
                  :class="['sql-editor', getParamsInputClass]"
                  placeholder=""
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
                  参数数量: {{ params.length }} / {{ countPlaceholders(sqlInput, options.namedParams) }}
                </div>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="editor-wrapper">
              <div class="editor-label">填充结果</div>
              <div class="textarea-wrapper">
                <el-input
                  v-model="outputSql"
                  type="textarea"
                  :rows="14"
                  readonly
                  class="sql-editor result-editor"
                  resize="none"
                />
                <div class="floating-actions" v-if="outputSql">
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

      <!-- 生成按钮 -->
      <div class="generate-button-container">
        <el-button type="primary" @click="fillParams" class="generate-btn" size="large">
          填充参数
        </el-button>
      </div>
    </div>

    <!-- 底部提示 -->
    <div class="tool-card disclaimer-card">
      <h3 class="card-title">使用说明</h3>
      <el-alert
        type="info"
        :closable="false"
        show-icon
      >
        <template #default>
          <div class="disclaimer-content">
            <p>1. 支持 ? 占位符和 :name 形式的命名参数</p>
            <p>2. 自动识别数字类型，无需手动添加引号</p>
            <p>3. 自动处理 NULL 值和特殊字符</p>
            <p>4. 支持 LIKE 语句的通配符 (% 和 _)，无需手动转义</p>
            <p>5. 支持以下参数输入格式：</p>
            <ul class="format-list">
              <li>每行一个参数</li>
              <li>使用逗号分隔的参数</li>
              <li>使用 @@@ 分隔的参数</li>
              <li>对象格式：{key=value, key2=value2}（将按值的顺序填充）</li>
            </ul>
          </div>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Brush as Magic,
  Document as CopyDocument,
  Delete,
  DocumentAdd,
  QuestionFilled
} from '@element-plus/icons-vue'
import { format as sqlFormatter } from 'sql-formatter'

interface ParamItem {
  name: string
  value: string
}

const sqlInput = ref('')
const paramsInput = ref('')
const outputSql = ref('')
const params = ref<ParamItem[]>([])

const options = ref({
  singleQuotes: true,
  autoQuote: true,
  autoFormat: true,
  namedParams: false
})

// 示例数据
const sampleData = {
  sql: `SELECT * FROM users 
WHERE id = ? 
AND name = ? 
AND created_at > ?
AND status IN ?
AND email LIKE ?
AND description LIKE ?`,
  params: `1001
John Doe
2024-01-01
active,pending
%@gmail.com
%test%`
}

const loadSample = () => {
  sqlInput.value = sampleData.sql
  paramsInput.value = sampleData.params
  ElMessage.success('已加载示例数据')
}

const parseParams = () => {
  if (!paramsInput.value) return []
  
  // 首先检查是否是 {key=value, key2=value2} 格式
  if (paramsInput.value.trim().startsWith('{') && paramsInput.value.trim().endsWith('}')) {
    const content = paramsInput.value.trim().slice(1, -1)
    // 修改正则表达式以匹配可能为空的值
    const pairs = content.match(/(\w+)\s*=\s*([^,}]*?)(?:,|$)/g) || []
    
    return pairs.map((pair, index) => {
      // 处理 key= 的情况，确保能正确分割
      const [key, ...valueParts] = pair.split('=').map(s => s.trim())
      // 如果没有值部分，则使用空字符串
      const value = valueParts.join('=') || ''
      // 移除末尾可能的逗号
      const cleanValue = value.replace(/,\s*$/, '')
      return {
        name: `:p${index + 1}`,
        value: cleanValue
      }
    })
  }
  
  // 原有的解析逻辑
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

const isNumeric = (value: string) => {
  return !isNaN(Number(value)) && value.trim() !== ''
}

const formatValue = (value: string) => {
  if (!options.value.autoQuote) return value
  
  // 处理特殊值
  if (!value) return "''" // 处理空值的情况
  if (value.toLowerCase() === 'null') return 'NULL'
  if (value.toLowerCase() === 'true') return 'TRUE'
  if (value.toLowerCase() === 'false') return 'FALSE'
  
  // 处理 IN 子句的多个值
  if (value.includes(',')) {
    const values = value.split(',').map(v => {
      const trimmed = v.trim()
      return isNumeric(trimmed) ? trimmed : formatSingleValue(trimmed)
    })
    return `(${values.join(', ')})`
  }
  
  return formatSingleValue(value)
}

const formatSingleValue = (value: string) => {
  // 数字类型不加引号
  if (isNumeric(value)) return value
  
  // 字符串类型添加引号
  const quote = options.value.singleQuotes ? "'" : '"'
  return `${quote}${value.replace(new RegExp(quote, 'g'), quote + quote)}${quote}`
}

// 添加一个函数来计算SQL中的占位符数量
const countPlaceholders = (sql: string, isNamed: boolean): number => {
  if (isNamed) {
    // 计算命名参数的数量 :param
    const matches = sql.match(/:([\w]+)/g)
    return matches ? matches.length : 0
  } else {
    // 计算问号占位符的数量
    const matches = sql.match(/\?/g)
    return matches ? matches.length : 0
  }
}

const fillParams = () => {
  try {
    if (!sqlInput.value.trim()) {
      ElMessage.warning('请输入SQL语句')
      return
    }

    // 解析参数并进行数量校验
    params.value = parseParams()
    const placeholderCount = countPlaceholders(sqlInput.value, options.value.namedParams)
    
    // 检查参数数量是否匹配
    if (params.value.length !== placeholderCount) {
      ElMessage.warning(`参数数量不匹配：SQL语句需要 ${placeholderCount} 个参数，但提供了 ${params.value.length} 个参数`)
      return
    }

    let result = sqlInput.value
    
    if (options.value.namedParams) {
      // 处理命名参数
      const namedParams = new Map<string, string>()
      const namedParamRegex = /:([\w]+)/g
      let match
      let hasUnmatchedParams = false
      
      while ((match = namedParamRegex.exec(result)) !== null) {
        const paramName = match[1]
        const param = params.value.find(p => p.name === `:${paramName}`)
        if (param) {
          namedParams.set(paramName, formatValue(param.value))
        } else {
          hasUnmatchedParams = true
          ElMessage.warning(`未找到参数 :${paramName} 的值`)
        }
      }

      if (hasUnmatchedParams) return

      namedParams.forEach((value, name) => {
        result = result.replace(new RegExp(`:${name}\\b`, 'g'), value)
      })
    } else {
      // 处理问号占位符
      try {
        let paramIndex = 0
        result = result.replace(/\?/g, () => {
          if (paramIndex >= params.value.length) {
            throw new Error('参数不足')
          }
          return formatValue(params.value[paramIndex++].value)
        })
      } catch (error) {
        ElMessage.warning('SQL参数填充失败：参数数量不足或格式不正确')
        return
      }
    }

    // 格式化SQL
    try {
      if (options.value.autoFormat) {
        result = sqlFormatter(result, {
          language: 'sql',
          uppercase: true
        })
      }
    } catch (error) {
      ElMessage.warning('SQL格式化失败，但参数已填充完成')
    }

    // 更新输出
    outputSql.value = result
    
  } catch (error) {
    // 友好的错误提示
    let errorMessage = '参数填充失败'
    if (error instanceof Error) {
      if (error.message.includes('Invalid')) {
        errorMessage = 'SQL语句格式不正确，请检查语法'
      } else if (error.message.includes('undefined')) {
        errorMessage = '参数值格式不正确，请检查参数'
      } else {
        errorMessage = `参数填充失败: ${error.message}`
      }
    }
    ElMessage.warning(errorMessage)
  }
}

// 修改参数输入框的样式，添加错误状态
const getParamsInputClass = computed(() => {
  const placeholderCount = countPlaceholders(sqlInput.value, options.value.namedParams)
  const currentParamsCount = parseParams().length
  
  if (sqlInput.value && currentParamsCount > 0 && currentParamsCount !== placeholderCount) {
    return 'error'
  }
  return ''
})

const formatSql = () => {
  try {
    if (!outputSql.value) {
      outputSql.value = sqlFormatter(sqlInput.value, {
        language: 'sql',
        uppercase: true
      })
    } else {
      outputSql.value = sqlFormatter(outputSql.value, {
        language: 'sql',
        uppercase: true
      })
    }
    ElMessage.success('SQL格式化成功')
  } catch (error) {
    ElMessage.error('SQL格式化失败')
  }
}

const copyResult = async () => {
  if (!outputSql.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  
  try {
    await navigator.clipboard.writeText(outputSql.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearContent = () => {
  sqlInput.value = ''
  paramsInput.value = ''
  outputSql.value = ''
  params.value = []
  ElMessage.success('已清空')
}

const clearParamsInput = () => {
  paramsInput.value = ''
  params.value = []
  ElMessage.success('已清空参数')
}

const clearAll = () => {
  sqlInput.value = ''
  paramsInput.value = ''
  outputSql.value = ''
  params.value = []
  ElMessage.success('已清空所有内容')
}

// 自动填充
watch([sqlInput, paramsInput, options], () => {
  if (sqlInput.value && paramsInput.value) {
    fillParams()
  }
}, { deep: true })
</script>

<style scoped>
.sql-params-tool {
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
  padding: 1.25rem;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  z-index: 10;
}

.textarea-wrapper:hover .floating-actions {
  opacity: 1;
}

.float-btn {
  width: 36px !important;
  height: 36px !important;
  min-width: 36px !important;
  max-width: 36px !important;
  min-height: 36px !important;
  max-height: 36px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
}

.float-btn.clear-btn {
  background-color: #28a745 !important;
  color: white !important;
}

.float-btn.copy-btn {
  background-color: #409eff !important;
  color: white !important;
  border: none !important;
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
  min-width: 120px;
  padding: 12px 32px;
  font-size: 1rem;
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
  display: flex;
  align-items: center;
  gap: 4px;
}

.sample-btn:hover {
  color: #0056b3;
  border-color: #0056b3;
  background-color: rgba(0, 122, 255, 0.05);
}

.monaco-editor {
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.disclaimer-card :deep(.el-alert--info) {
  background-color: rgba(255, 197, 23, 0.1);
  border: 1px solid rgba(255, 197, 23, 0.2);
  border-radius: 16px;
  color: #7b4f12;
}

.disclaimer-card :deep(.el-alert__content) {
  padding: 0.75rem 0;
}

.disclaimer-content p {
  margin: 0.5rem 0;
  line-height: 1.5;
  font-size: 0.95rem;
  color: var(--el-text-color-primary);
}

/* 错误状态样式 */
.sql-editor.error :deep(.el-textarea__inner) {
  border-color: var(--el-color-danger);
}

.params-count {
  position: absolute;
  right: 1rem;
  bottom: -1.5rem;
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
}

.params-count.is-error {
  color: var(--el-color-danger);
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
  .sql-params-tool {
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
    flex-wrap: wrap;
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

  .monaco-editor {
    height: 250px;
  }

  .generate-btn {
    width: 100%;
    max-width: 200px;
    padding: 12px 24px;
  }
}

/* 修改 action-buttons 样式 */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.clear-all-btn {
  min-width: 80px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: white !important;
  border: 1px solid var(--el-color-danger) !important;
  color: var(--el-color-danger) !important;
}

.clear-all-btn:hover {
  color: white !important;
  background-color: var(--el-color-danger) !important;
}

/* 修改编辑器输出包装器样式 */
.editor-output-wrapper {
  position: relative;
  height: 260px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
}

.editor-output-wrapper .monaco-editor {
  height: 100%;
  /* 确保编辑器不会覆盖按钮 */
  z-index: 1;
}

.editor-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  /* 提高按钮层级，确保在编辑器之上 */
  z-index: 200;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 4px;
  border-radius: 4px;
}

.editor-output-wrapper:hover .editor-actions {
  opacity: 1;
}

/* 优化浮动按钮样式 */
.float-btn.copy-btn:hover {
  background-color: #66b1ff !important;
}

/* 暗色模式适配 */
:root.dark .editor-actions {
  background-color: rgba(0, 0, 0, 0.7);
}

:root.dark .float-btn.copy-btn {
  background-color: #409eff !important;
}

:root.dark .float-btn.copy-btn:hover {
  background-color: #66b1ff !important;
}

/* 修改结果编辑器特殊样式 */
.result-editor :deep(.el-textarea__inner) {
  font-family: Consolas, Monaco, monospace;
  background-color: #f8f9fa;
  color: #1a1a1a;
  padding: 1rem;
  line-height: 1.6;
  font-size: 0.95rem;
  min-height: 320px !important;
}

:root.dark .result-editor :deep(.el-textarea__inner) {
  background-color: #1a1a1a;
  color: #e0e0e0;
  border-color: #4c4c4c;
}

.format-list {
  margin: 0.5rem 0 0 1.5rem;
  padding: 0;
}

.format-list li {
  margin: 0.25rem 0;
  color: var(--el-text-color-primary);
  font-size: 0.9rem;
}
</style> 