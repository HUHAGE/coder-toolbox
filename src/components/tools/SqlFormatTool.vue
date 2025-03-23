<template>
  <div class="sql-format-tool">
    <!-- 工具栏 -->
    <div class="actions-bar">
      <el-button-group class="action-group">
        <el-button type="primary" @click="formatSql" class="action-button">
          <el-icon><Magic /></el-icon>格式化
        </el-button>
        <el-button @click="compressSql" class="action-button">
          <el-icon><Compress /></el-icon>压缩
        </el-button>
        <el-button @click="loadSample" class="action-button">
          <el-icon><DocumentAdd /></el-icon>示例
        </el-button>
        <el-button @click="copyResult" class="action-button">
          <el-icon><CopyDocument /></el-icon>复制
        </el-button>
        <el-button @click="clearContent" class="action-button">
          <el-icon><Delete /></el-icon>清空
        </el-button>
      </el-button-group>

      <!-- 格式化选项 -->
      <div class="options">
        <el-tooltip content="缩进空格数">
          <el-input-number 
            v-model="options.indentSize" 
            :min="1" 
            :max="8" 
            size="small"
          />
        </el-tooltip>
        <el-select v-model="options.lineBreak" size="small" style="width: 120px">
          <el-option label="标准换行" value="standard" />
          <el-option label="逗号前换行" value="before" />
          <el-option label="逗号后换行" value="after" />
        </el-select>
        <el-checkbox v-model="options.uppercase">大写关键字</el-checkbox>
        <el-checkbox v-model="options.keywordNewline">关键字换行</el-checkbox>
      </div>
    </div>

    <!-- 编辑器容器 -->
    <div class="editor-container">
      <el-row :gutter="20">
        <!-- 左侧编辑器 -->
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-header">
              <span class="editor-label">输入 SQL</span>
              <el-upload
                class="upload-button"
                action=""
                :auto-upload="false"
                :show-file-list="false"
                @change="handleFileUpload"
              >
                <el-button size="small">
                  <el-icon><Upload /></el-icon>导入
                </el-button>
              </el-upload>
            </div>
            <div ref="inputEditorContainer" class="monaco-editor"></div>
          </div>
        </el-col>

        <!-- 右侧结果展示 -->
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-header">
              <span class="editor-label">格式化结果</span>
            </div>
            <div ref="outputEditorContainer" class="monaco-editor"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- SQL 统计信息 -->
    <div class="sql-stats" v-if="sqlStats.valid">
      <el-descriptions :column="4" border size="small">
        <el-descriptions-item label="语句数量">
          {{ sqlStats.statementCount }}
        </el-descriptions-item>
        <el-descriptions-item label="表数量">
          {{ sqlStats.tableCount }}
        </el-descriptions-item>
        <el-descriptions-item label="字段数量">
          {{ sqlStats.columnCount }}
        </el-descriptions-item>
        <el-descriptions-item label="条件数量">
          {{ sqlStats.conditionCount }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Brush as Magic,
  Crop as Compress,
  DocumentAdd,
  Document as CopyDocument,
  Delete,
  Upload
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import { format as sqlFormatter } from 'sql-formatter'

// 编辑器实例
let inputEditor: monaco.editor.IStandaloneCodeEditor | null = null
let outputEditor: monaco.editor.IStandaloneCodeEditor | null = null

// 响应式状态
const inputEditorContainer = ref<HTMLElement>()
const outputEditorContainer = ref<HTMLElement>()

const options = ref({
  indentSize: 4,
  lineBreak: 'standard',
  uppercase: true,
  keywordNewline: true
})

// SQL 统计信息
const sqlStats = ref({
  valid: false,
  statementCount: 0,
  tableCount: 0,
  columnCount: 0,
  conditionCount: 0
})

// 示例 SQL
const sampleSql = `SELECT u.id, u.name, u.email, p.title, p.content 
FROM users u 
LEFT JOIN posts p ON u.id = p.user_id 
WHERE u.status = 'active' 
AND p.created_at >= '2024-01-01' 
ORDER BY p.created_at DESC 
LIMIT 10;`

// 初始化编辑器
onMounted(() => {
  if (inputEditorContainer.value && outputEditorContainer.value) {
    // 创建输入编辑器
    inputEditor = monaco.editor.create(inputEditorContainer.value, {
      value: '',
      language: 'sql',
      theme: 'vs',
      minimap: { enabled: false },
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 4,
      wordWrap: 'on',
      automaticLayout: true,
      folding: true
    })

    // 创建输出编辑器
    outputEditor = monaco.editor.create(outputEditorContainer.value, {
      value: '',
      language: 'sql',
      theme: 'vs',
      minimap: { enabled: false },
      lineNumbers: 'on',
      readOnly: true,
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 4,
      wordWrap: 'on',
      automaticLayout: true,
      folding: true
    })

    // 监听输入变化
    inputEditor.onDidChangeModelContent(() => {
      const sql = inputEditor?.getValue() || ''
      if (sql) {
        formatSql()
      }
    })
  }
})

// 格式化 SQL
const formatSql = () => {
  try {
    const sql = inputEditor?.getValue() || ''
    if (!sql.trim()) {
      return
    }

    const formattedSql = sqlFormatter(sql, {
      language: 'sql',
      indent: ' '.repeat(options.value.indentSize),
      uppercase: options.value.uppercase,
      linesBetweenQueries: 2,
      params: undefined,
      keywordCase: options.value.uppercase ? 'upper' : 'preserve'
    })

    if (outputEditor) {
      outputEditor.setValue(formattedSql)
    }

    updateSqlStats(sql)
    ElMessage.success('格式化成功')
  } catch (error) {
    ElMessage.error('格式化失败')
  }
}

// 压缩 SQL
const compressSql = () => {
  try {
    const sql = inputEditor?.getValue() || ''
    if (!sql.trim()) {
      return
    }

    // 移除多余空白字符
    const compressedSql = sql
      .replace(/\s+/g, ' ')
      .replace(/\s*([,()])\s*/g, '$1')
      .trim()

    if (outputEditor) {
      outputEditor.setValue(compressedSql)
    }

    ElMessage.success('压缩成功')
  } catch (error) {
    ElMessage.error('压缩失败')
  }
}

// 更新 SQL 统计信息
const updateSqlStats = (sql: string) => {
  const stats = {
    valid: true,
    statementCount: 0,
    tableCount: 0,
    columnCount: 0,
    conditionCount: 0
  }

  try {
    // 统计语句数量
    stats.statementCount = sql.split(';').filter(s => s.trim()).length

    // 统计表数量
    const tableMatches = sql.match(/\b(?:FROM|JOIN)\s+(\w+)\b/gi)
    stats.tableCount = tableMatches ? tableMatches.length : 0

    // 统计字段数量
    const selectMatches = sql.match(/SELECT\s+(?:(?!\bFROM\b).)*\bFROM\b/gis)
    if (selectMatches) {
      const columns = selectMatches[0]
        .replace(/SELECT\s+/i, '')
        .replace(/\s+FROM\b.*/i, '')
        .split(',')
      stats.columnCount = columns.length
    }

    // 统计条件数量
    const conditionMatches = sql.match(/\b(?:WHERE|AND|OR)\b/gi)
    stats.conditionCount = conditionMatches ? conditionMatches.length : 0

    sqlStats.value = stats
  } catch (error) {
    sqlStats.value.valid = false
  }
}

// 加载示例
const loadSample = () => {
  if (inputEditor) {
    inputEditor.setValue(sampleSql)
  }
  ElMessage.success('已加载示例数据')
}

// 复制结果
const copyResult = async () => {
  const result = outputEditor?.getValue()
  if (!result) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(result)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 清空内容
const clearContent = () => {
  if (inputEditor) {
    inputEditor.setValue('')
  }
  if (outputEditor) {
    outputEditor.setValue('')
  }
  sqlStats.value.valid = false
  ElMessage.success('已清空')
}

// 处理文件上传
const handleFileUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result
    if (content && inputEditor) {
      inputEditor.setValue(content as string)
    }
  }
  reader.readAsText(file.raw)
}

// 清理编辑器实例
onBeforeUnmount(() => {
  inputEditor?.dispose()
  outputEditor?.dispose()
})
</script>

<style scoped>
.sql-format-tool {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.action-group {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  height: auto;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-button:active {
  transform: scale(0.98);
}

.options {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.editor-container {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
  min-height: 400px;
}

.editor-wrapper {
  position: relative;
  height: 100%;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.editor-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.monaco-editor {
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.sql-stats {
  margin-top: 1rem;
}

/* 暗色模式适配 */
:root.dark .sql-format-tool {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.1);
}

:root.dark .editor-container {
  background: rgba(255, 255, 255, 0.02);
}

/* 添加动画效果 */
.action-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button:hover {
  transform: translateY(-1px);
}

.action-button:active {
  transform: scale(0.98) translateY(0);
}

.monaco-editor {
  transition: border-color 0.2s ease;
}

.monaco-editor:hover {
  border-color: var(--el-color-primary);
}
</style> 