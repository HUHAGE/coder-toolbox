<template>
  <!-- 精简上传区域 -->
  <div class="upload-section">
        <!-- 上传区域 - 只在没有文件时显示 -->
        <el-upload
          v-if="!selectedFile"
          class="upload-area"
          :auto-upload="false"
          :show-file-list="false"
          :limit="1"
          accept=".doc,.docx"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
          drag
        >
          <template #trigger>
            <div class="upload-trigger">
              <div class="upload-icon-wrapper">
                <el-icon class="upload-icon"><Upload /></el-icon>
              </div>
              <div class="upload-text-content">
                <h3 class="upload-title">拖拽Word文档到此处</h3>
                <p class="upload-subtitle">或点击上传文件</p>
                <p class="upload-hint">支持 .doc 和 .docx 格式</p>
              </div>
            </div>
          </template>
        </el-upload>

        <!-- 文件信息和操作按钮 - 只在有文件时显示 -->
        <div v-if="selectedFile" class="file-info">
          <div class="file-details">
            <div class="file-icon-wrapper">
              <el-icon class="file-icon"><Document /></el-icon>
            </div>
            <div class="file-info-content">
              <span class="file-name">{{ selectedFile.name }}</span>
              <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
            </div>
          </div>
          <div class="file-actions">
            <el-button
              type="primary"
              size="large"
              :loading="converting"
              @click="convertToHtml"
              class="convert-btn"
            >
              <el-icon v-if="!converting"><Document /></el-icon>
              {{ converting ? '转换中...' : '开始转换' }}
            </el-button>
            <el-button
              type="info"
              size="large"
              @click="clearFile"
              class="clear-btn"
            >
              <el-icon><Delete /></el-icon>
              清除文件
            </el-button>
          </div>
        </div>
      </div>

      <!-- 隐藏的专业预览容器 - 始终存在 -->
      <div id="docx-render-container" class="docx-container" style="position: absolute; left: -9999px; top: -9999px; width: 100%; height: 100%;"></div>
      
      <!-- 左右对比展示区域 -->
      <div v-if="selectedFile" class="comparison-section">
        <!-- 左侧：Word原文 -->
        <div class="original-section">
          <div class="section-header">
            <div class="header-content">
              <h3 class="section-title">
                <el-icon class="title-icon"><Document /></el-icon>
                Word原文
              </h3>
              <p class="section-subtitle">原始文档预览</p>
            </div>
            <div class="header-actions">
              <el-select v-model="previewMode" size="default" class="preview-select">
                <el-option label="本地预览" value="local" />
                <el-option label="专业预览" value="professional" />
                <el-option label="Office预览" value="office" />
              </el-select>
              <!-- 专业预览缩放控制 -->
              <div v-if="previewMode === 'professional'" class="zoom-controls">
                <el-button
                  size="default"
                  @click="zoomOut"
                  :disabled="zoomLevel <= 0.5"
                  class="zoom-btn"
                >
                  <el-icon><ZoomOut /></el-icon>
                </el-button>
                <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
                <el-button
                  size="default"
                  @click="zoomIn"
                  :disabled="zoomLevel >= 2"
                  class="zoom-btn"
                >
                  <el-icon><ZoomIn /></el-icon>
                </el-button>
                <el-button
                  size="default"
                  @click="resetZoom"
                  class="zoom-btn reset-btn"
                >
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
          <div class="content-container">
            <div v-if="!originalFileUrl" class="loading-placeholder">
              <div class="loading-spinner">
                <el-icon class="loading-icon"><Loading /></el-icon>
              </div>
              <span class="loading-text">正在加载文档...</span>
            </div>
            <div v-else class="original-content">
              <div class="original-frame">
                <!-- 本地预览模式 -->
                <div v-if="previewMode === 'local'" class="file-preview">
                  <div class="preview-content">
                    <div class="preview-text" v-html="originalHtml"></div>
                  </div>
                </div>
                
                <!-- 专业预览模式 -->
                <div v-else-if="previewMode === 'professional'" class="professional-preview">
                  <div class="preview-content">
                    <div v-if="professionalLoading" class="loading-placeholder">
                      <div class="loading-spinner">
                        <el-icon class="loading-icon"><Loading /></el-icon>
                      </div>
                      <span class="loading-text">正在渲染Word文档...</span>
                    </div>
                    <div v-else class="docx-display-container" v-html="professionalContent"></div>
                  </div>
                </div>
                
                <!-- Office预览模式 -->
                <div v-else class="office-preview">
                  <div class="preview-content">
                    <div class="office-frame">
                      <div class="office-placeholder">
                        <div class="office-icon-wrapper">
                          <el-icon class="office-icon"><Document /></el-icon>
                        </div>
                        <h4 class="office-title">Office Online预览</h4>
                        <p class="office-description">需要将文件上传到可公开访问的URL</p>
                        <p class="office-hint">当前使用本地预览模式</p>
                        <el-button type="primary" size="large" @click="previewMode = 'local'" class="switch-btn">
                          切换到本地预览
                        </el-button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：转换结果 -->
        <div class="converted-section">
          <div class="section-header">
            <div class="header-content">
              <h3 class="section-title">
                <el-icon class="title-icon"><Document /></el-icon>
                HTML转换结果
              </h3>
              <p class="section-subtitle">转换后的HTML代码</p>
            </div>
            <div class="header-actions">
              <el-button
                v-if="convertedHtml"
                type="success"
                size="large"
                @click="copyHtml"
                class="action-btn"
              >
                <el-icon><CopyDocument /></el-icon>
                复制HTML
              </el-button>
              <el-button
                v-if="convertedHtml"
                type="info"
                size="large"
                @click="downloadHtml"
                class="action-btn"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
            </div>
          </div>
          <div class="content-container">
            <div v-if="!convertedHtml" class="placeholder">
              <div class="placeholder-icon-wrapper">
                <el-icon class="placeholder-icon"><Document /></el-icon>
              </div>
              <h4 class="placeholder-title">等待转换</h4>
              <p class="placeholder-text">点击转换按钮开始转换Word文档为HTML</p>
            </div>
            <div class="preview-content">
              <div class="preview-frame" v-html="convertedHtml"></div>
            </div>
          </div>
        </div>
      </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Document, Download, Delete, Loading, ZoomIn, ZoomOut, Refresh } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'
import mammoth from 'mammoth'
import { renderAsync } from 'docx-preview'

interface DocumentElement {
  type: string;
  style?: {
    font?: string;
    size?: number;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    color?: string;
    highlight?: string;
    spacing?: {
      before?: number;
      after?: number;
      line?: number;
    };
    lineHeight?: number;
    indent?: number;
    alignment?: 'left' | 'center' | 'right' | 'justify';
    verticalAlignment?: 'top' | 'middle' | 'bottom';
    shading?: {
      fill?: string;
      color?: string;
    };
    borders?: {
      top?: { color?: string; style?: string; width?: number };
      bottom?: { color?: string; style?: string; width?: number };
      left?: { color?: string; style?: string; width?: number };
      right?: { color?: string; style?: string; width?: number };
    };
    margin?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
    width?: string | number;
    height?: string | number;
    background?: {
      color?: string;
      image?: string;
    };
  };
  styleId?: string;
  children?: DocumentElement[];
  value?: string;
}

const selectedFile = ref<File | null>(null)
const converting = ref(false)
const convertedHtml = ref('')
const originalText = ref('')
const originalHtml = ref('')
const originalFileUrl = ref('')

const previewMode = ref('local')
const professionalLoading = ref(false)
const professionalContent = ref('')
const zoomLevel = ref(0.95)

// 处理文件选择
const handleFileChange = async (file: UploadFile) => {
  if (!file.raw) {
    ElMessage.error('文件读取失败，请重新选择文件')
    return false
  }
  
  // 检查文件类型
  if (file.raw.type !== 'application/msword' && 
      file.raw.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    ElMessage.error('请上传Word文档（.doc或.docx格式）')
    return false
  }
  
  // 检查文件大小（限制为50MB）
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.raw.size > maxSize) {
    ElMessage.error('文件大小不能超过50MB')
    return false
  }
  
  selectedFile.value = file.raw
  
  // 创建文件URL用于iframe显示
  originalFileUrl.value = URL.createObjectURL(file.raw)
  
  // 提取原文内容
  try {
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error('文件读取失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取错误'))
      reader.readAsArrayBuffer(file.raw!)
    })
    
    // 提取纯文本
    const textResult = await mammoth.extractRawText({ arrayBuffer })
    originalText.value = textResult.value
    
    // 提取HTML格式的原文（保留格式）
    const htmlResult = await mammoth.convertToHtml({ arrayBuffer })
    
    // 添加基础样式
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
        
        /* 段落样式 */
        p { margin: 1em 0; }
        
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
    originalHtml.value = baseStyles + htmlResult.value
    
    ElMessage.success('文件选择成功，可以开始转换')
  } catch (error) {
    ElMessage.error('文件读取失败，请重新选择')
    selectedFile.value = null
    originalFileUrl.value = ''
    return false
  }
}

// 处理超出文件数限制
const handleExceed = () => {
  ElMessage.warning('只能上传一个文件')
}

// 监听预览模式变化
watch(previewMode, async (newMode) => {
  if (newMode === 'professional' && selectedFile.value) {
    professionalLoading.value = true
    
    try {
      // 等待DOM更新，确保容器已经渲染
      await nextTick()
      
      // 等待一段时间确保容器完全渲染
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // 尝试多次查找容器
      let container = document.getElementById('docx-render-container')
      let retryCount = 0
      const maxRetries = 20
      
      while (!container && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 100))
        container = document.getElementById('docx-render-container')
        retryCount++
        console.log(`尝试查找容器，第${retryCount}次`)
      }
      
      if (!container) {
        console.error('容器查找失败，所有重试都失败了')
        throw new Error('容器未找到，请刷新页面重试')
      }
      console.log('找到容器元素:', container)
      
      // 清空容器
      container.innerHTML = ''
      
      // 使用FileReader读取文件
      const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (reader.result instanceof ArrayBuffer) {
            resolve(reader.result)
          } else {
            reject(new Error('文件读取失败'))
          }
        }
        reader.onerror = () => reject(new Error('文件读取错误'))
        reader.readAsArrayBuffer(selectedFile.value!)
      })
      
      // 渲染文档
      console.log('开始渲染Word文档，文件大小:', arrayBuffer.byteLength)
      console.log('容器元素:', container)
      
      // 尝试使用docx-preview渲染
      try {
        console.log('尝试使用docx-preview渲染...')
        await renderAsync(arrayBuffer, container, undefined, {
          className: 'docx-renderer'
        })
        
        console.log('docx-preview渲染完成，容器内容:', container.innerHTML.substring(0, 200))
      } catch (renderError) {
        console.warn('docx-preview渲染失败，使用mammoth备用渲染:', renderError)
        
        // 使用mammoth作为备用方案
        const htmlResult = await mammoth.convertToHtml({ arrayBuffer })
        container.innerHTML = `
          <div class="docx-renderer">
            <style>
              body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; }
              table { border-collapse: collapse; width: 100%; margin: 1em 0; }
              td, th { border: 1px solid #ddd; padding: 8px; vertical-align: top; }
              h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em; font-weight: bold; line-height: 1.2; }
              h1 { font-size: 2em; }
              h2 { font-size: 1.5em; }
              h3 { font-size: 1.17em; }
              p { margin: 1em 0; }
              ul, ol { margin: 1em 0; padding-left: 2em; }
              li { margin: 0.5em 0; }
              img { max-width: 100%; height: auto; margin: 1em 0; }
              blockquote { margin: 1em 0; padding: 1em; border-left: 4px solid #ddd; background: #f9f9f9; }
            </style>
            ${htmlResult.value}
          </div>
        `
        console.log('mammoth备用渲染完成')
      }
      
      // 将渲染后的内容存储到响应式变量
      professionalContent.value = container.innerHTML
      
      console.log('Word文档渲染成功')
    } catch (error) {
      console.error('渲染Word文档失败:', error)
      ElMessage.error('专业预览渲染失败，回退到本地预览')
      
      // 回退到本地预览
      previewMode.value = 'local'
    } finally {
      professionalLoading.value = false
    }
  }
})



// 清除文件
const clearFile = () => {
  if (originalFileUrl.value) {
    URL.revokeObjectURL(originalFileUrl.value)
  }
  selectedFile.value = null
  convertedHtml.value = ''
  originalText.value = ''
  originalHtml.value = ''
  originalFileUrl.value = ''
  previewMode.value = 'local'
  professionalLoading.value = false
  professionalContent.value = ''
  
  // 清空专业预览容器
  const container = document.getElementById('docx-render-container')
  if (container) {
    container.innerHTML = ''
  }
  
  ElMessage.info('文件已清除')
}

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}



// 转换为HTML
const convertToHtml = async () => {
  if (!selectedFile.value) return

  converting.value = true
  try {
    // 重新读取文件进行转换（使用增强的转换选项）
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          resolve(reader.result)
        } else {
          reject(new Error('文件读取失败'))
        }
      }
      reader.onerror = () => reject(new Error('文件读取错误'))
      reader.readAsArrayBuffer(selectedFile.value!)
    })
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
        "ol[style-name='有序列表'] => ol.ordered-list:fresh",
        // 对齐方式映射
        "p[style-name='居中'] => p.text-center:fresh",
        "p[style-name='居右'] => p.text-right:fresh",
        "p[style-name='两端对齐'] => p.text-justify:fresh"
      ],
      transformDocument: (element: DocumentElement) => {
        // 处理表格样式
        if (element.type === 'table') {
          element.styleId = 'table'
          return element
        }

        // 处理表格单元格样式
        if (element.type === 'tableCell') {
          const style = element.style || {}
          let inlineStyle = ''
          
          // 背景色
          if (style.shading && style.shading.fill) {
            inlineStyle += `background-color: ${style.shading.fill};`
          }
          
          // 边框样式
          if (style.borders) {
            const borders = style.borders
            if (borders.top) inlineStyle += `border-top: 1px solid ${borders.top.color || '#000'};`
            if (borders.bottom) inlineStyle += `border-bottom: 1px solid ${borders.bottom.color || '#000'};`
            if (borders.left) inlineStyle += `border-left: 1px solid ${borders.left.color || '#000'};`
            if (borders.right) inlineStyle += `border-right: 1px solid ${borders.right.color || '#000'};`
          }

          // 对齐方式
          if (style.alignment) {
            inlineStyle += `text-align: ${style.alignment};`
          }

          if (inlineStyle) {
            element.styleId = inlineStyle
          }
          return element
        }

        // 处理段落和标题样式
        if (element.type === 'paragraph') {
          const style = element.style || {}
          let inlineStyle = ''

          // 背景色
          if (style.shading && style.shading.fill) {
            inlineStyle += `background-color: ${style.shading.fill};`
          }

          // 文字颜色
          if (style.color) {
            inlineStyle += `color: ${style.color};`
          }

          // 对齐方式
          if (style.alignment) {
            inlineStyle += `text-align: ${style.alignment};`
          }

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

        /* 对齐方式样式 */
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .text-justify { text-align: justify; }
      </style>
    `
    convertedHtml.value = baseStyles + result.value
    
    if (result.messages.length > 0) {
      console.warn('转换警告：', result.messages)
    }
    
    ElMessage.success('转换成功')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    console.error('转换错误详情：', error)
    
    // 提供更具体的错误提示
    if (errorMessage.includes('permission') || errorMessage.includes('could not be read')) {
      ElMessage.error('文件读取失败，请确保：\n1. 文件没有被其他程序打开\n2. 文件没有损坏\n3. 重新选择文件')
    } else if (errorMessage.includes('mammoth')) {
      ElMessage.error('文档格式不支持或文件损坏，请检查文件格式')
    } else {
      ElMessage.error('转换失败：' + errorMessage)
    }
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

// 缩放控制方法
const zoomIn = () => {
  if (zoomLevel.value < 2) {
    zoomLevel.value = Math.min(2, zoomLevel.value + 0.1)
  }
}

const zoomOut = () => {
  if (zoomLevel.value > 0.5) {
    zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1)
  }
}

const resetZoom = () => {
  zoomLevel.value = 0.95
}
</script>

<style scoped>




.upload-section {
  margin-bottom: 16px;
  padding: 0 20px;
}

.upload-area {
  width: 100%;
  background: white;
  border: 2px dashed var(--el-border-color);
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 0;
}

.upload-area:hover {
  border-color: var(--el-color-primary);
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.upload-area:hover::before {
  opacity: 0.05;
}

.upload-trigger {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.upload-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--el-color-primary-light-9) 0%, var(--el-color-primary-light-8) 100%);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.upload-icon-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, var(--el-color-primary-light-7) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

.upload-area:hover .upload-icon-wrapper {
  transform: scale(1.05);
  box-shadow: 0 12px 35px rgba(64, 158, 255, 0.3);
}

.upload-area:hover .upload-icon-wrapper::before {
  opacity: 1;
}

.upload-icon {
  font-size: 24px;
  color: var(--el-color-primary);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.upload-area:hover .upload-icon {
  color: var(--el-color-primary-dark-2);
  transform: scale(1.1);
}

.upload-text-content {
  text-align: left;
  flex: 1;
  min-width: 0;
  max-width: calc(100% - 64px);
  overflow: hidden;
}

.upload-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-hint {
  font-size: 11px;
  color: var(--el-text-color-secondary);
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
}

.file-details {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.file-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: var(--el-color-primary-light-9);
  border-radius: 50%;
}

.file-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.file-info-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.file-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 16px;
  margin-bottom: 4px;
}

.file-size {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.file-actions {
  display: flex;
  gap: 10px;
}

.convert-btn,
.clear-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.convert-btn::before,
.clear-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.convert-btn:hover::before,
.clear-btn:hover::before {
  left: 100%;
}

.convert-btn {
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary-dark-2) 100%);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.convert-btn:hover {
  background: linear-gradient(135deg, var(--el-color-primary-dark-2) 0%, var(--el-color-primary-dark-3) 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
}

.convert-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.clear-btn {
  background: linear-gradient(135deg, var(--el-color-danger-light-9) 0%, var(--el-color-danger-light-8) 100%);
  color: var(--el-color-danger);
  border: 1px solid var(--el-color-danger-light-7);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.2);
}

.clear-btn:hover {
  background: linear-gradient(135deg, var(--el-color-danger-light-8) 0%, var(--el-color-danger-light-7) 100%);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(245, 108, 108, 0.3);
}

.clear-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.2);
}

.comparison-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 0;
  padding: 0 16px 16px;
}

.original-section,
.converted-section {
  background: #ffffff;
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.original-section:hover,
.converted-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #ffffff;
  border-bottom: 1px solid var(--el-border-color-light);
  backdrop-filter: blur(10px);
}

.header-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  font-size: 20px;
  color: var(--el-text-color-secondary);
}

.section-subtitle {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-top: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.preview-select {
  flex: 1;
  max-width: 200px;
  min-width: 160px;
}

.preview-select .el-select {
  width: 100%;
}

.preview-select .el-select .el-input__inner {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 8px 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 32px;
}

.preview-select .el-select .el-input__inner:hover {
  background: var(--el-bg-color-page);
  border-color: var(--el-border-color-light);
}

.preview-select .el-select .el-input__inner:focus {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-7);
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
}

.zoom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.zoom-btn:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.zoom-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.zoom-level {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  min-width: 35px;
  text-align: center;
}

.reset-btn {
  background: var(--el-color-info-light-9);
  color: var(--el-color-info);
  border: 1px solid var(--el-color-info-light-7);
}

.reset-btn:hover {
  background: var(--el-color-info-light-8);
  color: var(--el-color-info-dark-2);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 120px;
  white-space: nowrap;
}

.action-btn .el-icon {
  font-size: 16px;
}

.action-btn:hover {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.action-btn:active {
  transform: scale(0.98);
}

.content-container {
  height: calc(100vh - 200px);
  min-height: 500px;
  overflow: hidden;
  background: #ffffff;
  position: relative;
}

.loading-placeholder,
.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-secondary);
  gap: 16px;
  padding: 40px 20px;
  background: #ffffff;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--el-color-primary-light-9);
  border-radius: 50%;
}

.loading-icon {
  font-size: 24px;
  animation: rotate 1s linear infinite;
  color: var(--el-color-primary);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.upload-area,
.file-info,
.original-section,
.converted-section {
  animation: fadeInUp 0.8s ease-out;
}

.loading-spinner {
  animation: pulse 2s ease-in-out infinite;
}

.loading-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
}

.original-content {
  height: 100%;
  overflow: auto;
  padding: 12px;
}

.original-frame {
  background: #ffffff;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  min-height: 100%;
  overflow: hidden;
}

.file-preview {
  height: 100%;
}



.preview-content {
  height: 100%;
  overflow: auto;
  padding: 12px;
}

.preview-text {
  background: #ffffff;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
  min-height: 100%;
}

.office-preview {
  height: 100%;
}

.office-frame {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.office-placeholder {
  text-align: center;
  color: var(--el-text-color-secondary);
  padding: 40px 20px;
}

.office-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: var(--el-color-primary-light-9);
  border-radius: 50%;
  margin-bottom: 10px;
}

.office-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.office-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.office-description {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 12px;
}

.office-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.switch-btn {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.switch-btn:hover {
  background: var(--el-color-primary-light-8);
  border-color: var(--el-color-primary-light-6);
}

.switch-btn:active {
  transform: scale(0.98);
}

.preview-note {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-color-primary-light-9);
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.placeholder-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: var(--el-color-primary-light-9);
  border-radius: 50%;
  margin-bottom: 16px;
}

.placeholder-icon {
  font-size: 32px;
  color: var(--el-color-primary);
}

.placeholder-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.placeholder-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  text-align: center;
  line-height: 1.5;
}

.professional-preview {
  height: 100%;
}

.docx-display-container {
  height: 100%;
  overflow: auto;
  background: transparent;
  margin: 0;
  transform: scale(v-bind(zoomLevel));
  transform-origin: top left;
  width: calc(100% / v-bind(zoomLevel));
  height: calc(100% / v-bind(zoomLevel));
}

.docx-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #ffffff;
  min-height: 500px;
}



.docx-renderer {
  background: #ffffff;
  padding: 24px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  min-height: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  font-family: 'Times New Roman', serif;
  line-height: 1.5;
}

/* 确保docx-preview生成的元素正确显示 */
.docx-renderer :deep(.docx) {
  background: #ffffff;
  padding: 24px;
  margin: 0;
  font-family: 'Times New Roman', serif;
  line-height: 1.5;
}

.docx-renderer :deep(.docx .page) {
  background: #ffffff;
  margin: 12px 0;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.preview-content {
  height: 100%;
  overflow: auto;
  padding: 12px;
}

.preview-frame {
  background: #ffffff;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  min-height: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin: 0;
}



/* 暗色模式适配 */
:root.dark .preview-frame,
:root.dark .original-frame {
  background: #ffffff;
}

:root.dark .upload-area:hover {
  background: white;
  border-color: var(--el-color-primary);
}

:root.dark .file-info {
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:root.dark .original-section,
:root.dark .converted-section {
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:root.dark .section-header {
  background: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* 响应式设计 */
@media (max-width: 1600px) {
  .comparison-section {
    gap: 12px;
    padding: 0 12px 12px;
    margin-top: 4px;
  }
  
  .section-header {
    padding: 10px 16px;
  }
  
  .header-actions {
    gap: 10px;
  }
}

@media (max-width: 1400px) {
  .comparison-section {
    gap: 10px;
    padding: 0 10px 10px;
    margin-top: 4px;
  }
  
  .section-header {
    padding: 8px 12px;
  }
  
  .header-actions {
    gap: 8px;
  }
}

@media (max-width: 1200px) {
  .comparison-section {
    gap: 8px;
    padding: 0 8px 8px;
    margin-top: 4px;
  }
  
  .section-header {
    padding: 8px 12px;
  }
  
  .header-actions {
    gap: 6px;
  }
  
  .content-container {
    height: calc(100vh - 180px);
    min-height: 450px;
  }
}

@media (max-width: 768px) {
  .word-to-html-tool {
    padding: 12px;
    border-radius: 12px;
  }
  

  
  .comparison-section {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 8px;
    padding: 0 16px 16px;
  }
  
  .file-info {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
    padding: 20px;
  }
  
  .file-actions {
    width: 100%;
  }
  
  .header-actions {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .preview-select {
    max-width: none;
    width: 100%;
  }
  
  .section-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .header-content {
    width: 100%;
  }
  
  .content-container {
    height: 550px;
  }
  
  .upload-area {
    padding: 8px 8px;
  }
  
  .upload-trigger {
    gap: 8px;
  }
  
  .upload-text-content {
    max-width: calc(100% - 56px);
  }
  
  .upload-icon-wrapper {
    width: 40px;
    height: 40px;
  }
  
  .upload-icon {
    font-size: 20px;
  }
  
  .upload-text-content {
    max-width: calc(100% - 60px);
  }
  
  .upload-title {
    font-size: 16px;
  }
  
  .upload-subtitle {
    font-size: 13px;
  }
  
  .upload-hint {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .word-to-html-tool {
    padding: 8px;
    border-radius: 10px;
  }
  

  
  .comparison-section {
    padding: 0 12px 12px;
    margin-top: 6px;
  }
  
  .section-header {
    padding: 8px 16px;
  }
  
  .content-container {
    height: 500px;
  }
  
  .upload-area {
    padding: 12px 12px;
  }
  
  .upload-trigger {
    gap: 10px;
  }
  
  .file-info {
    padding: 16px;
  }
}
</style>