<template>
  <div class="word-to-html-tool">
    <div class="main-content">
      <!-- 上传区域 -->
      <div class="upload-section">
        <el-upload
          class="upload-area"
          :auto-upload="false"
          :show-file-list="true"
          :limit="1"
          accept=".doc,.docx"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
        >
          <template #trigger>
            <div class="upload-trigger">
              <el-icon class="upload-icon"><Upload /></el-icon>
              <div class="upload-text">
                <h3>点击或拖拽上传Word文档</h3>
                <p>支持 .doc, .docx 格式</p>
              </div>
            </div>
          </template>
        </el-upload>

        <!-- 转换按钮 -->
        <div class="convert-actions">
          <el-button
            type="primary"
            size="large"
            :disabled="!selectedFile"
            :loading="converting"
            @click="convertToHtml"
          >
            <el-icon><Document /></el-icon>
            转换为HTML
          </el-button>
          <el-button
            v-if="convertedHtml"
            type="success"
            size="large"
            @click="copyHtml"
          >
            <el-icon><CopyDocument /></el-icon>
            复制HTML代码
          </el-button>
          <el-button
            v-if="convertedHtml"
            type="info"
            size="large"
            @click="downloadHtml"
          >
            <el-icon><Download /></el-icon>
            下载HTML文件
          </el-button>
        </div>
      </div>

      <!-- 转换结果展示 -->
      <div v-if="convertedHtml" class="result-section">
        <div class="result-header">
          <h3>转换结果预览</h3>
          <div class="view-mode-switch">
            <el-radio-group v-model="viewMode" size="small">
              <el-radio-button label="preview">预览</el-radio-button>
              <el-radio-button label="code">代码</el-radio-button>
            </el-radio-group>
          </div>
        </div>

        <!-- 预览模式 -->
        <div v-if="viewMode === 'preview'" class="preview-container">
          <div class="preview-frame" v-html="convertedHtml"></div>
        </div>

        <!-- 代码模式 -->
        <div v-else class="code-container">
          <el-input
            type="textarea"
            v-model="convertedHtml"
            :rows="20"
            readonly
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Document, CopyDocument, Download } from '@element-plus/icons-vue'
import mammoth from 'mammoth'

const selectedFile = ref<File | null>(null)
const converting = ref(false)
const convertedHtml = ref('')
const viewMode = ref('preview')

// 处理文件选择
const handleFileChange = (file: File) => {
  if (file.raw.type !== 'application/msword' && 
      file.raw.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    ElMessage.error('请上传Word文档（.doc或.docx格式）')
    return false
  }
  selectedFile.value = file.raw
}

// 处理超出文件数限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

// 转换为HTML
const convertToHtml = async () => {
  if (!selectedFile.value) return

  converting.value = true
  try {
    const arrayBuffer = await selectedFile.value.arrayBuffer()
    const options = {
      arrayBuffer,
      styleMap: [
        // 标题样式映射
        "p[style-name='标题 1'] => h1.heading1:fresh",
        "p[style-name='标题 2'] => h2.heading2:fresh",
        "p[style-name='标题 3'] => h3.heading3:fresh",
        "p[style-name='标题 4'] => h4.heading4:fresh",
        "p[style-name='标题 5'] => h5.heading5:fresh",
        "p[style-name='标题 6'] => h6.heading6:fresh",
        // 常用段落样式映射
        "p[style-name='正文'] => p.body-text:fresh",
        "p[style-name='引用'] => blockquote.quote:fresh",
        "p[style-name='列表段落'] => p.list-paragraph:fresh",
        // 列表样式映射
        "ul[style-name='无序列表'] => ul.unordered-list:fresh",
        "ol[style-name='有序列表'] => ol.ordered-list:fresh"
      ],
      transformDocument: (element) => {
        // 处理表格样式
        if (element.type === 'table') {
          element.styleId = 'table'
          return element
        }

        // 处理文本样式
        if (element.type === 'run') {
          const style = element.style || {}
          let inlineStyle = ''
          
          // 字体样式
          if (style.font) {
            inlineStyle += `font-family: "${style.font}";`
          }
          
          // 字体大小
          if (style.size) {
            inlineStyle += `font-size: ${style.size}pt;`
          }
          
          // 字体加粗
          if (style.bold) {
            inlineStyle += 'font-weight: bold;'
          }
          
          // 字体倾斜
          if (style.italic) {
            inlineStyle += 'font-style: italic;'
          }
          
          // 下划线
          if (style.underline) {
            inlineStyle += 'text-decoration: underline;'
          }
          
          // 删除线
          if (style.strike) {
            inlineStyle += 'text-decoration: line-through;'
          }
          
          // 字体颜色
          if (style.color) {
            inlineStyle += `color: ${style.color};`
          }
          
          // 背景色
          if (style.highlight) {
            inlineStyle += `background-color: ${style.highlight};`
          }

          // 字间距
          if (style.spacing) {
            inlineStyle += `letter-spacing: ${style.spacing}px;`
          }

          // 对齐方式
          if (style.align) {
            inlineStyle += `text-align: ${style.align};`
          }
          
          if (inlineStyle) {
            element.styleId = inlineStyle
          }
          return element
        }

        // 处理段落样式
        if (element.type === 'paragraph') {
          const style = element.style || {}
          let inlineStyle = ''

          // 行高
          if (style.lineHeight) {
            inlineStyle += `line-height: ${style.lineHeight};`
          }

          // 段落间距
          if (style.spacing) {
            inlineStyle += `margin-top: ${style.spacing.before}pt; margin-bottom: ${style.spacing.after}pt;`
          }

          // 首行缩进
          if (style.indent) {
            inlineStyle += `text-indent: ${style.indent}em;`
          }

          if (inlineStyle) {
            element.styleId = inlineStyle
          }
          return element
        }

        return element
      },
      includeDefaultStyleMap: true,
      preserveStyles: true,
      ignoreEmptyParagraphs: false,
      convertImage: mammoth.images.imgElement((image) => {
        return image.read("base64").then((imageData) => {
          return {
            src: `data:${image.contentType};base64,${imageData}`
          }
        })
      })
    }

    const result = await mammoth.convertToHtml(options)
    
    // 添加增强的基础样式
    const baseStyles = `
      <style>
        /* 基础样式重置 */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        /* 文档基础样式 */
        body {
          font-family: "Microsoft YaHei", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
        }
        
        /* 表格样式 */
        table {
          border-collapse: collapse;
          width: 100%;
          margin: 1em 0;
        }
        
        td, th {
          border: 1px solid #ddd;
          padding: 8px;
          vertical-align: top;
        }
        
        /* 标题样式 */
        h1, h2, h3, h4, h5, h6 {
          margin: 1em 0 0.5em;
          font-weight: bold;
          line-height: 1.2;
        }
        
        .heading1 { font-size: 2em; }
        .heading2 { font-size: 1.5em; }
        .heading3 { font-size: 1.17em; }
        .heading4 { font-size: 1em; }
        .heading5 { font-size: 0.83em; }
        .heading6 { font-size: 0.67em; }
        
        /* 段落样式 */
        p { margin: 1em 0; }
        .body-text { text-align: justify; }
        .quote { 
          margin: 1em 0;
          padding: 1em;
          border-left: 4px solid #ddd;
          background: #f9f9f9;
        }
        
        /* 列表样式 */
        ul, ol { margin: 1em 0; padding-left: 2em; }
        li { margin: 0.5em 0; }
        
        /* 图片样式 */
        img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
      </style>
    `
    convertedHtml.value = baseStyles + result.value
    
    if (result.messages.length > 0) {
      console.warn('转换警告：', result.messages)
    }
    
    ElMessage.success('转换成功')
  } catch (error) {
    ElMessage.error('转换失败：' + error.message)
  } finally {
    converting.value = false
  }
}

// 复制HTML代码
const copyHtml = async () => {
  try {
    await navigator.clipboard.writeText(convertedHtml.value)
    ElMessage.success('HTML代码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 下载HTML文件
const downloadHtml = () => {
  const blob = new Blob([convertedHtml.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${selectedFile.value?.name.replace(/\.[^/.]+$/, '')}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.word-to-html-tool {
  padding: 20px;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
}

.upload-section {
  margin-bottom: 30px;
}

.upload-area {
  width: 100%;
  background: var(--el-bg-color);
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  transition: all 0.3s;
}

.upload-area:hover {
  border-color: var(--el-color-primary);
  background: var(--el-bg-color-page);
}

.upload-trigger {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.upload-icon {
  font-size: 48px;
  color: var(--el-text-color-secondary);
}

.upload-text h3 {
  margin: 0;
  font-size: 1.2em;
  color: var(--el-text-color-primary);
}

.upload-text p {
  margin: 8px 0 0;
  color: var(--el-text-color-secondary);
}

.convert-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.result-section {
  margin-top: 30px;
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-header h3 {
  margin: 0;
  font-size: 1.2em;
  color: var(--el-text-color-primary);
}

.preview-container {
  background: white;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 20px;
  min-height: 400px;
  overflow: auto;
}

.code-container {
  margin-top: 10px;
}

/* 暗色模式适配 */
:root.dark .preview-container {
  background: var(--el-bg-color-overlay);
}
</style>