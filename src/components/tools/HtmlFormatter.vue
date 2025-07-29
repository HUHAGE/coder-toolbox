<template>
  <div class="html-formatter">
    <!-- 操作按钮栏 -->
    <div class="actions-bar">
      <el-button-group class="action-group">
        <el-button type="primary" @click="formatHtml" class="action-button">
          <el-icon>
            <Magic />
          </el-icon>格式化
        </el-button>
        <el-button @click="compressHtml" class="action-button">
          <el-icon>
            <Compress />
          </el-icon>压缩
        </el-button>
        <el-button @click="purifyHtml" class="action-button">
          <el-icon>
            <Check />
          </el-icon>净化
        </el-button>
        <el-button @click="clearContent" class="action-button">
          <el-icon>
            <Delete />
          </el-icon>清空
        </el-button>
        <el-button @click="loadSampleHtml" class="action-button">
          <el-icon>
            <DocumentAdd />
          </el-icon>示例
        </el-button>

      </el-button-group>
      <div class="options">
        <el-tooltip content="缩进空格数">
          <el-input-number v-model="indentSize" :min="1" :max="8" size="small" @change="handleIndentChange" />
        </el-tooltip>
        <el-switch v-model="autoFormat" active-text="自动格式化" inactive-text="" />
        <el-switch v-model="showLineNumbers" active-text="显示行号" inactive-text="" />
      </div>
    </div>
    <!-- 编辑器区域 -->
    <div class="editor-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-header">
              <span class="editor-label">输入 HTML</span>
              <el-upload class="upload-button" action="" :auto-upload="false" :show-file-list="false"
                @change="handleFileUpload">
                <el-button size="small">
                  <el-icon>
                    <Upload />
                  </el-icon>导入
                </el-button>
              </el-upload>
            </div>
            <div ref="inputEditorContainer" class="monaco-editor"></div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-header">
              <span class="editor-label">处理结果</span>
              <div class="editor-actions">
                <el-button-group size="small">
                  <el-button @click="expandAll">
                    <el-icon>
                      <ArrowDown />
                    </el-icon>展开
                  </el-button>
                  <el-button @click="foldAll">
                    <el-icon>
                      <ArrowUp />
                    </el-icon>折叠
                  </el-button>
                  <el-button @click="copyResult">
                    <el-icon>
                      <CopyDocument />
                    </el-icon>复制
                  </el-button>
                </el-button-group>
              </div>
            </div>
            <div ref="outputEditorContainer" class="monaco-editor"></div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Brush as Magic,
  Crop as Compress,
  Check,
  DocumentAdd,
  Document as CopyDocument,
  Delete,
  ArrowDown,
  ArrowUp,
  Upload
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import { html as beautifyHtml } from 'js-beautify'

// 编辑器实例
let inputEditor: any = null
let outputEditor: any = null

const inputEditorContainer = ref<HTMLElement | null>(null)
const outputEditorContainer = ref<HTMLElement | null>(null)
const indentSize = ref(2)
const autoFormat = ref(true)
const showLineNumbers = ref(true)


const sampleHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>示例页面</title>
  <style>body{background:#f8f8f8;}</style>
</head>
<body>
  <h1>Hello, 世界！</h1>
  <p>这是一段<b>HTML</b>示例。</p>
</body>
</html>`

const initMonaco = () => {
  try {
    if (inputEditorContainer.value && outputEditorContainer.value) {
      // 创建输入编辑器
      inputEditor = monaco.editor.create(inputEditorContainer.value, {
        value: '',
        language: 'html',
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

      // 创建输出编辑器
      outputEditor = monaco.editor.create(outputEditorContainer.value, {
        value: '',
        language: 'html',
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
          formatHtml()
        }
      })
    }
  } catch (error) {
    console.error('Monaco editor initialization failed:', error)
  }
}

const formatHtml = () => {
  try {
    if (!inputEditor) return
    const input = inputEditor.getValue()
    if (!input.trim()) return
    // 使用 ES6 import 引入的 js-beautify
    const formatted = beautifyHtml(input, { indent_size: indentSize.value })
    if (outputEditor) {
      outputEditor.setValue(formatted)
    }
    ElMessage.success('格式化成功')
  } catch (error: any) {
    ElMessage.error(`格式化失败: ${error.message}`)
  }
}

const compressHtml = () => {
  try {
    if (!inputEditor) return
    const input = inputEditor.getValue()
    if (!input.trim()) return
    // 简单去除多余空白
    const compressed = input.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim()
    if (outputEditor) {
      outputEditor.setValue(compressed)
    }
    ElMessage.success('压缩成功')
  } catch (error: any) {
    ElMessage.error(`压缩失败: ${error.message}`)
  }
}

const purifyHtml = () => {
  try {
    if (!inputEditor) return
    const input = inputEditor.getValue()
    if (!input.trim()) return
    // 只保留 body 内内容，去除 script/style 等危险标签
    const doc = new DOMParser().parseFromString(input, 'text/html')
    // 移除 script/style
    doc.querySelectorAll('script,style').forEach(el => el.remove())
    // 只保留 body
    const purified = doc.body.innerHTML
    if (outputEditor) {
      outputEditor.setValue(purified)
    }
    ElMessage.success('净化成功')
  } catch (error: any) {
    ElMessage.error(`净化失败: ${error.message}`)
  }
}

const expandAll = () => {
  if (outputEditor) {
    try {
      outputEditor.getAction('editor.unfoldAll').run()
    } catch (error) {
      console.warn('Expand all failed:', error)
    }
  }
}
const foldAll = () => {
  if (outputEditor) {
    try {
      outputEditor.getAction('editor.foldAll').run()
    } catch (error) {
      console.warn('Fold all failed:', error)
    }
  }
}
const copyResult = async () => {
  try {
    if (outputEditor) {
      const content = outputEditor.getValue()
      if (content) {
        await navigator.clipboard.writeText(content)
        ElMessage.success('复制成功')
      } else {
        ElMessage.warning('没有内容可复制')
      }
    }
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
const clearContent = () => {
  if (inputEditor) {
    inputEditor.setValue('')
  }
  if (outputEditor) {
    outputEditor.setValue('')
  }
  ElMessage.success('已清空')
}
const loadSampleHtml = () => {
  if (inputEditor) {
    inputEditor.setValue(sampleHtml)
    formatHtml()
    ElMessage.success('已加载示例HTML')
  }
}
const handleFileUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      if (inputEditor) {
        inputEditor.setValue(content)
        formatHtml()
        ElMessage.success('文件导入成功')
      }
    } catch (error: any) {
      ElMessage.error('文件导入失败')
    }
  }
  reader.readAsText(file.raw)
}
const handleIndentChange = () => {
  if (inputEditor && outputEditor) {
    inputEditor.updateOptions({ tabSize: indentSize.value })
    outputEditor.updateOptions({ tabSize: indentSize.value })
    formatHtml()
  }
}

watch(showLineNumbers, (newValue) => {
  if (inputEditor && outputEditor) {
    inputEditor.updateOptions({ lineNumbers: newValue ? 'on' : 'off' })
    outputEditor.updateOptions({ lineNumbers: newValue ? 'on' : 'off' })
  }
})


onMounted(() => {
  nextTick(() => {
    initMonaco()
  })
})
onUnmounted(() => {
  try {
    if (inputEditor) {
      inputEditor.dispose()
      inputEditor = null
    }
    if (outputEditor) {
      outputEditor.dispose()
      outputEditor = null
    }
  } catch (error) {
    console.warn('Editor disposal failed:', error)
  }
})
</script>

<style scoped>
.html-formatter {
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



@media (max-width: 768px) {
  .html-formatter {
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