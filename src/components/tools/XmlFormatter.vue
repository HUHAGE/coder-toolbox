<template>
  <div class="xml-formatter">
    <div class="actions-bar">
      <el-button-group class="action-group">
        <el-button type="primary" @click="formatXml" class="action-button">
          <el-icon><Magic /></el-icon>格式化
        </el-button>
        <el-button @click="compressXml" class="action-button">
          <el-icon><Compress /></el-icon>压缩
        </el-button>
        <el-button @click="validateXml" class="action-button">
          <el-icon><Check /></el-icon>验证
        </el-button>
        <el-button @click="loadSampleXml" class="action-button">
          <el-icon><DocumentAdd /></el-icon>示例
        </el-button>
        <el-button @click="copyResult" class="action-button">
          <el-icon><CopyDocument /></el-icon>复制
        </el-button>
        <el-button @click="clearContent" class="action-button">
          <el-icon><Delete /></el-icon>清空
        </el-button>
      </el-button-group>

      <el-button-group class="action-group">
        <el-button @click="transformToJson" class="action-button">
          <el-icon><Connection /></el-icon>转JSON
        </el-button>
        <el-button @click="transformToYaml" class="action-button">
          <el-icon><Connection /></el-icon>转YAML
        </el-button>
        <el-button @click="downloadXml" class="action-button">
          <el-icon><Download /></el-icon>下载
        </el-button>
      </el-button-group>

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

    <div class="editor-container">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-header">
              <span class="editor-label">输入 XML</span>
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

    <div class="xml-stats" v-if="xmlStats.valid">
      <el-descriptions :column="4" border size="small">
        <el-descriptions-item label="节点总数">
          {{ xmlStats.nodeCount }}
        </el-descriptions-item>
        <el-descriptions-item label="元素节点">
          {{ xmlStats.elementCount }}
        </el-descriptions-item>
        <el-descriptions-item label="属性数量">
          {{ xmlStats.attributeCount }}
        </el-descriptions-item>
        <el-descriptions-item label="文本节点">
          {{ xmlStats.textCount }}
        </el-descriptions-item>
        <el-descriptions-item label="注释节点">
          {{ xmlStats.commentCount }}
        </el-descriptions-item>
        <el-descriptions-item label="CDATA节点">
          {{ xmlStats.cdataCount }}
        </el-descriptions-item>
        <el-descriptions-item label="最大深度">
          {{ xmlStats.maxDepth }}
        </el-descriptions-item>
        <el-descriptions-item label="文件大小">
          {{ xmlStats.fileSize }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="xpath-finder" v-if="xmlStats.valid">
      <div class="path-input">
        <el-input
          v-model="xpathQuery"
          placeholder="输入 XPath 表达式 (例如: //book[@category='fiction']/title)"
          clearable
          @input="handleXPathQuery"
        >
          <template #prepend>XPath</template>
        </el-input>
      </div>
      <div class="path-result" v-if="pathQueryResult">
        <pre>{{ pathQueryResult }}</pre>
      </div>
    </div>

    <div class="validation-result" v-if="validationResult">
      <el-alert
        :title="validationResult.valid ? 'XML验证通过' : 'XML验证失败'"
        :type="validationResult.valid ? 'success' : 'error'"
        :description="validationResult.message"
        show-icon
        :closable="false"
      />
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
import { XMLParser, XMLBuilder } from 'fast-xml-parser'
import { evaluate } from 'xpath'
import { DOMParser, XMLSerializer } from '@xmldom/xmldom'
import YAML from 'yaml'

const inputContent = ref('')
const outputContent = ref('')

// 编辑器实例
let inputEditor: any = null
let outputEditor: any = null

// 响应式状态
const inputEditorContainer = ref<HTMLElement | null>(null)
const outputEditorContainer = ref<HTMLElement | null>(null)
const indentSize = ref(2)
const autoFormat = ref(true)
const showLineNumbers = ref(true)
const xpathQuery = ref('')
const pathQueryResult = ref('')

// XML 统计信息
const xmlStats = ref({
  valid: false,
  nodeCount: 0,
  elementCount: 0,
  attributeCount: 0,
  textCount: 0,
  commentCount: 0,
  cdataCount: 0,
  maxDepth: 0,
  fileSize: '0 B'
})

// 验证结果
const validationResult = ref<{
  valid: boolean
  message: string
} | null>(null)

// 示例XML数据 - 未格式化版本
const sampleXml = `<?xml version="1.0" encoding="UTF-8"?><bookstore><book category="fiction"><title lang="en">The Lord of the Rings</title><author>J.R.R. Tolkien</author><year>1954</year><price>29.99</price><description><![CDATA[An epic high-fantasy novel that follows the quest to destroy the One Ring.]]></description></book><book category="children"><title lang="en">Harry Potter</title><author>J.K. Rowling</author><year>1997</year><price>24.99</price><description><![CDATA[The story of a young wizard and his adventures at Hogwarts School.]]></description><reviews><review rating="5">Excellent book for children!</review><review rating="4">My kids love it!</review></reviews></book><!-- This is a sample XML file for demonstration --></bookstore>`

// 初始化 Monaco 编辑器
const initMonaco = () => {
  // 配置 XML 语言支持
  monaco.languages.register({ id: 'xml' })
  monaco.languages.setMonarchTokensProvider('xml', {
    defaultToken: '',
    tokenPostfix: '.xml',
    
    // 修改括号配置
    brackets: [
      { open: '<', close: '>', token: 'delimiter.bracket' }
    ],

    // 添加引号配置
    autoClosingPairs: [
      { open: '"', close: '"' },
      { open: "'", close: "'" },
      { open: '<', close: '>' }
    ],

    // 关键字
    keywords: ['xml', 'version', 'encoding', 'standalone'],

    // 标记规则
    tokenizer: {
      root: [
        [/[^<&]+/, ''],
        { include: '@whitespace' },
        [/<!DOCTYPE/, 'metatag', '@doctype'],
        [/<!--/, 'comment', '@comment'],
        [/(<)(\w+)/, ['delimiter.bracket', { token: 'tag', next: '@tag' }]],
        [/(<\/)(\w+)/, ['delimiter.bracket', { token: 'tag', next: '@tag' }]],
        [/&\w+;/, 'string.escape']
      ],

      whitespace: [
        [/[ \t\r\n]+/, ''],
      ],

      doctype: [
        [/[^>]+/, 'metatag.content'],
        [/>/, 'metatag', '@pop'],
      ],

      comment: [
        [/[^-]+/, 'comment.content'],
        [/-->/, 'comment', '@pop'],
        [/[-]+/, 'comment.content']
      ],

      tag: [
        [/[ \t\r\n]+/, ''],
        [/(type|id|class|value)(\s*=\s*)("[^"]*"|'[^']*')/, ['attribute.name', 'delimiter', 'attribute.value']],
        [/\w+/, 'attribute.name'],
        [/=/, 'delimiter'],
        [/"[^"]*"|'[^']*'/, 'attribute.value'],
        [/\/>/, 'delimiter.bracket', '@pop'],
        [/>/, { token: 'delimiter.bracket', next: '@pop' }]
      ],
    }
  })

  // 创建编辑器实例
  if (inputEditorContainer.value && outputEditorContainer.value) {
    // 输入编辑器
    inputEditor = monaco.editor.create(inputEditorContainer.value, {
      value: '',
      language: 'xml',
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
      language: 'xml',
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
        formatXml()
      }
      updateXmlStats()
    })
  }
}

const formatXml = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) {
      validationResult.value = null
      return
    }

    // 使用 fast-xml-parser 进行格式化
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      cdataTagName: "__cdata",
      format: true,
      indentBy: ' '.repeat(indentSize.value),
      suppressEmptyNode: true,
      preserveOrder: true
    })

    const builder = new XMLBuilder({
      format: true,
      indentBy: ' '.repeat(indentSize.value),
      ignoreAttributes: false,
      suppressEmptyNode: true,
      preserveOrder: true,
      processEntities: false
    })

    // 先解析成对象，再重新构建
    const parsed = parser.parse(input)
    const formatted = builder.build(parsed)
    
    outputEditor.setValue(formatted)
    validateXml()
    updateXmlStats()
  } catch (error: any) {
    // 如果 fast-xml-parser 失败，尝试使用备用方案
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(input, 'text/xml')
      
      // 检查解析错误
      const parseError = xmlDoc.getElementsByTagName('parsererror')
      if (parseError.length > 0) {
        const errorText = parseError[0].textContent || ''
        let errorMessage = '解析错误: '
        
        // 分析常见错误类型并提供更友好的提示
        if (errorText.includes('Opening and ending tag mismatch')) {
          errorMessage += '标签未正确闭合。请检查是否有未配对的开始/结束标签。'
        } else if (errorText.includes('Extra content at the end')) {
          errorMessage += '文档末尾存在多余内容。XML文档应该只有一个根元素。'
        } else if (errorText.includes('Invalid character')) {
          errorMessage += '包含非法字符。请检查是否有特殊字符需要转义。'
        } else if (errorText.includes('Premature end')) {
          errorMessage += '文档意外结束。请检查是否有未完成的标签结构。'
        } else if (errorText.includes('Root element is missing')) {
          errorMessage += '缺少根元素。XML文档必须有一个根元素。'
        } else {
          // 如果是其他错误，显示原始错误信息
          errorMessage += errorText
        }

        // 更新验证结果
        validationResult.value = {
          valid: false,
          message: errorMessage
        }
        
        throw new Error(errorMessage)
      }

      // 使用自定义格式化函数
      const formatted = formatXmlString(xmlDoc)
      outputEditor.setValue(formatted)
      validateXml()
      updateXmlStats()
    } catch (backupError: any) {
      // 显示更友好的错误提示
      let errorMessage = backupError.message
      
      // 如果错误信息中没有具体说明，添加通用提示
      if (!errorMessage.includes('解析错误')) {
        errorMessage = `XML格式错误: ${errorMessage}\n请检查:\n1. XML语法是否正确\n2. 标签是否配对\n3. 特殊字符是否已转义\n4. 是否包含非法字符`
      }

      // 更新验证结果
      validationResult.value = {
        valid: false,
        message: errorMessage
      }
      
      ElMessage.error({
        message: errorMessage,
        duration: 5000,
        showClose: true
      })
    }
  }
}

// 自定义 XML 格式化函数
const formatXmlString = (xmlDoc: Document, level = 0): string => {
  const serializer = new XMLSerializer()
  const indent = ' '.repeat(indentSize.value)
  
  // 将 Document 转换为字符串
  let xmlString = serializer.serializeToString(xmlDoc)
  
  // 基本格式化
  xmlString = xmlString
    // 在开始标签后添加换行
    .replace(/>\s*</g, '>\n<')
    // 处理自闭合标签
    .replace(/\/>/g, '/>\n')
    // 移除多余空白
    .replace(/\s+$/gm, '')

  // 添加缩进
  const lines = xmlString.split('\n')
  let depth = 0
  const formattedLines = lines.map(line => {
    if (line.match(/<\//)) { // 结束标签
      depth--
    }
    const formatted = depth > 0 ? indent.repeat(depth) + line : line
    if (line.match(/<[^/].*[^/]>/) && !line.match(/\/>/)) { // 开始标签
      depth++
    }
    return formatted
  })

  return formattedLines.join('\n')
}

const compressXml = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) return

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(input, 'text/xml')
    const serializer = new XMLSerializer()
    const compressed = serializer.serializeToString(xmlDoc)
      .replace(/>\s+</g, '><')
      .replace(/\s+/g, ' ')
      .trim()
    
    outputEditor.setValue(compressed)
    ElMessage.success('压缩成功')
  } catch (error: any) {
    ElMessage.error(`压缩失败: ${error.message}`)
  }
}

const copyResult = async () => {
  try {
    const content = outputEditor.getValue()
    await navigator.clipboard.writeText(content)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearContent = () => {
  if (inputEditor && outputEditor) {
    inputEditor.setValue('')
    outputEditor.setValue('')
    xmlStats.value.valid = false
    validationResult.value = null
    ElMessage.success('已清空')
  }
}

const handleInput = () => {
  try {
    formatXml()
  } catch (error) {
    // 输入过程中的解析错误不提示
  }
}

const handleFileUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      inputEditor.setValue(content)
      formatXml()
      ElMessage.success('文件导入成功')
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
    // 重新格式化当前内容
    formatXml()
  }
}

const handleXPathQuery = () => {
  try {
    if (!xpathQuery.value.trim()) {
      pathQueryResult.value = ''
      return
    }

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(inputEditor.getValue(), 'text/xml')
    const nodes = evaluate(
      xpathQuery.value,
      xmlDoc,
      null,
      7, // ORDERED_NODE_SNAPSHOT_TYPE
      null
    )

    const results = []
    for (let i = 0; i < nodes.snapshotLength; i++) {
      const node = nodes.snapshotItem(i)
      if (node) {
        results.push(node.textContent)
      }
    }

    pathQueryResult.value = JSON.stringify(results, null, 2)
  } catch (error: any) {
    pathQueryResult.value = `查询错误: ${error.message}`
  }
}

const transformToJson = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) return

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      cdataTagName: "__cdata",
      parseAttributeValue: true,
      parseTagValue: true
    })
    
    const json = parser.parse(input)
    outputEditor.setValue(JSON.stringify(json, null, indentSize.value))
    ElMessage.success('转换为JSON成功')
  } catch (error: any) {
    ElMessage.error(`转换失败: ${error.message}`)
  }
}

const transformToYaml = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) return

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_",
      textNodeName: "#text",
      cdataTagName: "__cdata",
      parseAttributeValue: true,
      parseTagValue: true
    })
    
    const json = parser.parse(input)
    const yaml = YAML.stringify(json, { indent: indentSize.value })
    outputEditor.setValue(yaml)
    ElMessage.success('转换为YAML成功')
  } catch (error: any) {
    ElMessage.error(`转换失败: ${error.message}`)
  }
}

const downloadXml = () => {
  try {
    const content = outputEditor.getValue()
    if (!content) {
      ElMessage.warning('没有可下载的内容')
      return
    }
    
    const blob = new Blob([content], { type: 'application/xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'formatted.xml'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    ElMessage.success('下载成功')
  } catch (error: any) {
    ElMessage.error('下载失败')
  }
}

const expandAll = () => {
  outputEditor.getAction('editor.unfoldAll').run()
}

const collapseAll = () => {
  outputEditor.getAction('editor.foldAll').run()
}

const loadSampleXml = () => {
  try {
    inputEditor.setValue(sampleXml)
    formatXml()
    ElMessage.success('已加载示例XML')
  } catch (error: any) {
    ElMessage.error('加载示例失败')
  }
}

const updateXmlStats = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) {
      xmlStats.value.valid = false
      return
    }

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(input, 'text/xml')
    
    const stats = {
      valid: true,
      nodeCount: 0,
      elementCount: 0,
      attributeCount: 0,
      textCount: 0,
      commentCount: 0,
      cdataCount: 0,
      maxDepth: 0,
      fileSize: '0 B'
    }

    // 计算节点统计
    const countNodes = (node: Node, depth = 0) => {
      stats.nodeCount++
      stats.maxDepth = Math.max(stats.maxDepth, depth)

      if (node.nodeType === 1) { // 元素节点
        stats.elementCount++
        if ((node as Element).attributes) {
          stats.attributeCount += (node as Element).attributes.length
        }
      } else if (node.nodeType === 3) { // 文本节点
        stats.textCount++
      } else if (node.nodeType === 4) { // CDATA节点
        stats.cdataCount++
      } else if (node.nodeType === 8) { // 注释节点
        stats.commentCount++
      }

      // 递归处理子节点
      node.childNodes.forEach(child => countNodes(child, depth + 1))
    }

    countNodes(xmlDoc.documentElement)
    
    // 计算文件大小
    const bytes = new Blob([input]).size
    stats.fileSize = formatFileSize(bytes)
    
    xmlStats.value = stats
  } catch {
    xmlStats.value.valid = false
  }
}

const validateXml = () => {
  try {
    const input = inputEditor.getValue()
    if (!input.trim()) {
      validationResult.value = null
      return
    }

    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(input, 'text/xml')
    
    // 检查解析错误
    const parseError = xmlDoc.getElementsByTagName('parsererror')
    if (parseError.length > 0) {
      validationResult.value = {
        valid: false,
        message: parseError[0].textContent || '解析错误'
      }
      return
    }

    // 如果有 Schema/DTD，进行验证
    // TODO: 实现 Schema/DTD 验证

    validationResult.value = {
      valid: true,
      message: 'XML 格式正确'
    }
  } catch (error: any) {
    validationResult.value = {
      valid: false,
      message: error.message
    }
  }
}

// 文件大小格式化
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

// 生命周期钩子
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

// 监听主题变化
watch(() => document.documentElement.classList.contains('dark'), (isDark) => {
  const theme = isDark ? 'vs-dark' : 'vs'
  inputEditor?.setTheme(theme)
  outputEditor?.setTheme(theme)
})

// 添加行号显示的监听器
watch(showLineNumbers, (newValue) => {
  if (inputEditor && outputEditor) {
    inputEditor.updateOptions({ lineNumbers: newValue ? 'on' : 'off' })
    outputEditor.updateOptions({ lineNumbers: newValue ? 'on' : 'off' })
  }
})
</script>

<style scoped>
.xml-formatter {
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

.xml-stats {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
}

.xpath-finder {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.path-input {
  margin-bottom: 0.75rem;
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

.validation-result {
  margin-top: 1rem;
}

/* 暗色模式适配 */
:root.dark .xml-formatter {
  background: rgba(255, 255, 255, 0.04);
}

:root.dark .editor-container,
:root.dark .xml-stats,
:root.dark .xpath-finder {
  background: rgba(255, 255, 255, 0.03);
}

:root.dark .path-result {
  background: rgba(255, 255, 255, 0.02);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .xml-formatter {
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