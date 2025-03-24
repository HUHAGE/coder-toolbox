<template>
  <div class="json-formatter">
    <!-- 工具栏 -->
    <div class="actions-bar">
      <el-button-group class="action-group">
        <el-button type="primary" @click="formatJson" class="action-button">
          <el-icon><Magic /></el-icon>格式化
        </el-button>
        <el-button @click="compressJson" class="action-button">
          <el-icon><Compress /></el-icon>压缩
        </el-button>
        <el-button @click="validateJson" class="action-button">
          <el-icon><Check /></el-icon>验证
        </el-button>
        <el-button @click="loadSampleJson" class="action-button">
          <el-icon><DocumentAdd /></el-icon>示例
        </el-button>
        <el-button @click="copyResult" class="action-button">
          <el-icon><CopyDocument /></el-icon>复制
        </el-button>
        <el-button @click="clearContent" class="action-button">
          <el-icon><Delete /></el-icon>清空
        </el-button>
      </el-button-group>

      <!-- 高级功能按钮组 -->
      <el-button-group class="action-group">
        <el-button @click="transformToXml" class="action-button">
          <el-icon><Connection /></el-icon>转XML
        </el-button>
        <el-button @click="transformToYaml" class="action-button">
          <el-icon><Connection /></el-icon>转YAML
        </el-button>
        <el-button @click="downloadJson" class="action-button">
          <el-icon><Download /></el-icon>下载
        </el-button>
      </el-button-group>

      <!-- 设置选项 -->
      <div class="options">
        <el-tooltip content="缩进空格数">
          <el-input-number 
            v-model="indentSize" 
            :min="1" 
            :max="8" 
            size="small" 
            @change="handleIndentChange"
          />
        </el-tooltip>
        <el-switch
          v-model="autoFormat"
          active-text="自动格式化"
          inactive-text=""
        />
        <el-switch
          v-model="showLineNumbers"
          active-text="显示行号"
          inactive-text=""
        />
      </div>
    </div>

    <!-- 编辑器容器 -->
    <div class="editor-container">
      <el-row :gutter="20">
        <!-- 左侧编辑器 -->
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-header">
              <span class="editor-label">输入 JSON</span>
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
              <div class="editor-actions">
                <el-button-group size="small">
                  <el-button @click="expandAll">
                    <el-icon><ArrowDown /></el-icon>展开
                  </el-button>
                  <el-button @click="collapseAll">
                    <el-icon><ArrowUp /></el-icon>折叠
                  </el-button>
                </el-button-group>
              </div>
            </div>
            <div ref="outputEditorContainer" class="monaco-editor"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- JSON 统计信息 -->
    <div class="json-stats" v-if="jsonStats.valid">
      <el-descriptions :column="4" border size="small">
        <el-descriptions-item label="对象数量">
          {{ jsonStats.objectCount }}
        </el-descriptions-item>
        <el-descriptions-item label="数组数量">
          {{ jsonStats.arrayCount }}
        </el-descriptions-item>
        <el-descriptions-item label="字符串数量">
          {{ jsonStats.stringCount }}
        </el-descriptions-item>
        <el-descriptions-item label="数字数量">
          {{ jsonStats.numberCount }}
        </el-descriptions-item>
        <el-descriptions-item label="布尔值数量">
          {{ jsonStats.booleanCount }}
        </el-descriptions-item>
        <el-descriptions-item label="null数量">
          {{ jsonStats.nullCount }}
        </el-descriptions-item>
        <el-descriptions-item label="最大深度">
          {{ jsonStats.maxDepth }}
        </el-descriptions-item>
        <el-descriptions-item label="总字节数">
          {{ jsonStats.totalBytes }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- JSON 路径查询器 -->
    <div class="json-path-finder" v-if="jsonStats.valid">
      <div class="path-input">
        <el-input
          v-model="jsonPath"
          placeholder="输入 JSONPath 表达式 (例如: $.store.book[0].title)"
          clearable
          @input="handleJsonPathQuery"
        >
          <template #prepend>JSONPath</template>
        </el-input>
      </div>
      <div class="path-result" v-if="pathQueryResult">
        <pre>{{ pathQueryResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Brush as Magic,
  Crop as Compress,
  Check,
  DocumentAdd,
  Document as CopyDocument,
  Delete,
  Connection,
  Download,
  Upload,
  ArrowDown,
  ArrowUp
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import YAML from 'yaml'
import { XMLBuilder } from 'fast-xml-parser'
import JSONPath from 'jsonpath'
import { track } from '@vercel/analytics'

defineOptions({
  name: 'JsonFormatter'
})

// 编辑器实例
let inputEditor: any = null
let outputEditor: any = null

// 响应式状态
const inputEditorContainer = ref<HTMLElement | null>(null)
const outputEditorContainer = ref<HTMLElement | null>(null)
const indentSize = ref(2)
const autoFormat = ref(true)
const showLineNumbers = ref(true)
const jsonPath = ref('')
const pathQueryResult = ref('')

// JSON 统计信息
const jsonStats = ref({
  valid: false,
  objectCount: 0,
  arrayCount: 0,
  stringCount: 0,
  numberCount: 0,
  booleanCount: 0,
  nullCount: 0,
  maxDepth: 0,
  totalBytes: 0
})

// 示例JSON数据
const sampleJson = '{"name":"DevToolBox","version":"1.0.0","description":"一款优雅、强大的开发者工具集成插件","author":{"name":"HUHA","email":"example@email.com"},"features":[{"id":1,"name":"JSON格式化","description":"JSON数据格式化、验证、压缩","tags":["格式化","JSON"]},{"id":2,"name":"时间戳转换","description":"时间戳与日期格式互转","tags":["转换","时间"]}],"settings":{"theme":"auto","language":"zh-CN","autoSave":true,"fontSize":14},"statistics":{"users":1000,"downloads":5000,"rating":4.9,"lastUpdate":"2024-02-17T12:00:00Z"}}'

// Monaco 编辑器配置
const initMonaco = () => {
  // 设置 Monaco 环境
  self.MonacoEnvironment = {
    getWorker(_, label) {
      if (label === 'json') {
        return new jsonWorker()
      }
      return new editorWorker()
    }
  }

  // 创建编辑器实例
  if (inputEditorContainer.value && outputEditorContainer.value) {
    // 输入编辑器
    inputEditor = monaco.editor.create(inputEditorContainer.value, {
      value: '',
      language: 'json',
      theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
      minimap: { enabled: false },
      lineNumbers: showLineNumbers.value ? 'on' : 'off',
      renderLineHighlight: 'all',
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: indentSize.value,
      wordWrap: 'on',
      automaticLayout: true,
      suggestOnTriggerCharacters: true,
      formatOnPaste: true,
      formatOnType: autoFormat.value
    })

    // 输出编辑器
    outputEditor = monaco.editor.create(outputEditorContainer.value, {
      value: '',
      language: 'json',
      theme: document.documentElement.classList.contains('dark') ? 'vs-dark' : 'vs',
      minimap: { enabled: false },
      lineNumbers: showLineNumbers.value ? 'on' : 'off',
      readOnly: true,
      renderLineHighlight: 'all',
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: indentSize.value,
      wordWrap: 'on',
      automaticLayout: true,
      folding: true,
      foldingStrategy: 'indentation'
    })

    // 监听输入变化
    inputEditor.onDidChangeModelContent(() => {
      if (autoFormat.value) {
        formatJson()
      }
      updateJsonStats()
    })
  }
}

// 格式化 JSON
const formatJson = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) return

    const parsed = JSON.parse(input)
    const formatted = JSON.stringify(parsed, null, indentSize.value)
    outputEditor.setValue(formatted)
    
    // 更新统计信息
    updateJsonStats()

    // 添加统计
    track('json_formatter_action', {
      action: 'format',
      status: 'success',
      inputLength: input.length
    })
  } catch (error: any) {
    ElMessage.error(`格式化失败: ${error.message}`)

    // 统计错误
    track('json_formatter_action', {
      action: 'format',
      status: 'error',
      errorMessage: error.message
    })
  }
}

// 压缩 JSON
const compressJson = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) return

    const parsed = JSON.parse(input)
    const compressed = JSON.stringify(parsed)
    outputEditor.setValue(compressed)
    ElMessage.success('压缩成功')

    track('json_formatter_action', {
      action: 'compress',
      status: 'success',
      inputLength: input.length
    })
  } catch (error: any) {
    ElMessage.error(`压缩失败: ${error.message}`)
  }
}

// 验证 JSON
const validateJson = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) {
      ElMessage.warning('请输入JSON内容')
      return
    }

    JSON.parse(input)
    ElMessage.success('JSON格式有效')
  } catch (error: any) {
    ElMessage.error(`JSON格式无效: ${error.message}`)
  }
}

// 转换为 XML
const transformToXml = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) return

    const parsed = JSON.parse(input)
    const builder = new XMLBuilder({
      format: true,
      indentBy: ' '.repeat(indentSize.value)
    })
    const xml = builder.build(parsed)
    outputEditor.setValue(xml)
    ElMessage.success('转换为XML成功')
  } catch (error: any) {
    ElMessage.error(`转换失败: ${error.message}`)
  }
}

// 转换为 YAML
const transformToYaml = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) return

    const parsed = JSON.parse(input)
    const yaml = YAML.stringify(parsed, { indent: indentSize.value })
    outputEditor.setValue(yaml)
    ElMessage.success('转换为YAML成功')
  } catch (error: any) {
    ElMessage.error(`转换失败: ${error.message}`)
  }
}

// 更新 JSON 统计信息
const updateJsonStats = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) {
      jsonStats.value.valid = false
      return
    }

    const parsed = JSON.parse(input)
    const stats = {
      valid: true,
      objectCount: 0,
      arrayCount: 0,
      stringCount: 0,
      numberCount: 0,
      booleanCount: 0,
      nullCount: 0,
      maxDepth: 0,
      totalBytes: new Blob([input]).size
    }

    const countTypes = (obj: any, depth = 0) => {
      stats.maxDepth = Math.max(stats.maxDepth, depth)

      if (Array.isArray(obj)) {
        stats.arrayCount++
        obj.forEach(item => countTypes(item, depth + 1))
      } else if (typeof obj === 'object' && obj !== null) {
        stats.objectCount++
        Object.values(obj).forEach(value => countTypes(value, depth + 1))
      } else if (typeof obj === 'string') {
        stats.stringCount++
      } else if (typeof obj === 'number') {
        stats.numberCount++
      } else if (typeof obj === 'boolean') {
        stats.booleanCount++
      } else if (obj === null) {
        stats.nullCount++
      }
    }

    countTypes(parsed)
    jsonStats.value = stats
  } catch {
    jsonStats.value.valid = false
  }
}

// 处理 JSONPath 查询
const handleJsonPathQuery = () => {
  try {
    if (!jsonPath.value.trim()) {
      pathQueryResult.value = ''
      return
    }

    const input = inputEditor.getValue()
    const parsed = JSON.parse(input)
    const result = JSONPath.query(parsed, jsonPath.value)
    pathQueryResult.value = JSON.stringify(result, null, 2)
  } catch (error: any) {
    pathQueryResult.value = `查询错误: ${error.message}`
  }
}

// 展开/折叠功能
const expandAll = () => {
  outputEditor.getAction('editor.unfoldAll').run()
}

const collapseAll = () => {
  outputEditor.getAction('editor.foldAll').run()
}

// 加载示例JSON
const loadSampleJson = () => {
  try {
    inputEditor.setValue(sampleJson)
    formatJson()
    ElMessage.success('已加载示例JSON')
  } catch (error: any) {
    ElMessage.error('加载示例失败')
  }
}

// 文件上传处理
const handleFileUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      inputEditor.setValue(content)
      formatJson()
      ElMessage.success('文件导入成功')
    } catch (error: any) {
      ElMessage.error('文件导入失败')
    }
  }
  reader.readAsText(file.raw)
}

// 下载JSON
const downloadJson = () => {
  try {
    const content = outputEditor.getValue()
    if (!content) {
      ElMessage.warning('没有可下载的内容')
      return
    }
    
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'formatted.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('下载成功')
  } catch (error: any) {
    ElMessage.error('下载失败')
  }
}

// 复制结果
const copyResult = async () => {
  try {
    const content = outputEditor.getValue()
    await navigator.clipboard.writeText(content)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 清空内容
const clearContent = () => {
  inputEditor.setValue('')
  outputEditor.setValue('')
  jsonStats.value.valid = false
  pathQueryResult.value = ''
  ElMessage.success('已清空')
}

// 处理缩进变化
const handleIndentChange = () => {
  if (inputEditor && outputEditor) {
    inputEditor.updateOptions({ tabSize: indentSize.value })
    outputEditor.updateOptions({ tabSize: indentSize.value })
    formatJson()
  }
}

// 监听行号显示设置变化
watch(showLineNumbers, (newValue) => {
  if (inputEditor && outputEditor) {
    inputEditor.updateOptions({ lineNumbers: newValue ? 'on' : 'off' })
    outputEditor.updateOptions({ lineNumbers: newValue ? 'on' : 'off' })
  }
})

onMounted(() => {
  initMonaco()
})

onUnmounted(() => {
  if (inputEditor) {
    inputEditor.dispose()
  }
  if (outputEditor) {
    outputEditor.dispose()
  }
})
</script>

<style scoped>
.json-formatter {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.actions-bar {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
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

.options {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-left: auto;
}

.editor-container {
  background: var(--bg-primary);
  padding: 1.5rem;
  border-radius: 12px;
}

.editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 600px;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.editor-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.monaco-editor {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
}

.json-stats {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
}

.json-path-finder {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.path-result {
  background: var(--bg-secondary);
  padding: 1rem;
  border-radius: 8px;
  overflow: auto;
  max-height: 200px;
}

.path-result pre {
  margin: 0;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
}

/* 暗色模式适配 */
:root.dark .json-formatter {
  background: rgba(255, 255, 255, 0.04);
}

:root.dark .editor-container,
:root.dark .json-stats,
:root.dark .json-path-finder {
  background: rgba(255, 255, 255, 0.03);
}

:root.dark .path-result {
  background: rgba(255, 255, 255, 0.02);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .json-formatter {
    padding: 1rem;
  }

  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .options {
    margin-left: 0;
    justify-content: center;
  }

  .editor-wrapper {
    height: 400px;
  }

  .el-col {
    width: 100% !important;
    margin-bottom: 1rem;
  }
}
</style> 