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
                转换结果
              </h3>
              <p class="section-subtitle">转换后的HTML代码</p>
            </div>
            <div class="header-actions">
              <el-button
                v-if="convertedHtml"
                type="success"
                size="small"
                @click="copyHtml"
                class="action-btn"
              >
                <el-icon><CopyDocument /></el-icon>
                复制
              </el-button>
              <el-button
                v-if="convertedHtml"
                type="info"
                size="small"
                @click="downloadHtml"
                class="action-btn"
              >
                <el-icon><Download /></el-icon>
                下载
              </el-button>
              <el-switch
                v-if="convertedHtml"
                v-model="separateStyles"
                class="style-switch"
                active-text="分离样式"
                @change="applySeparateStyles"
              />
              <el-button
                v-if="convertedHtml"
                class="action-btn"
                type="primary"
                size="small"
                @click="showHtmlPreview = !showHtmlPreview"
              >
                <el-icon><Document /></el-icon>
                {{ showHtmlPreview ? '显示代码' : '预览效果' }}
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
              <div v-if="!showHtmlPreview" class="preview-frame code-mode">
                <pre style="white-space: pre-wrap; word-break: break-all; background: #f8f8f8; color: #222; padding: 12px; border-radius: 6px; font-size: 14px; line-height: 1.6; overflow-x: auto;">
                  <code>{{ convertedHtml }}</code>
                </pre>
              </div>
              <div v-else class="preview-frame render-mode" :style="previewMode === 'professional' ? `transform: scale(${zoomLevel}); transform-origin: top left; width: calc(100% / ${zoomLevel}); height: calc(100% / ${zoomLevel});` : ''">
                <div v-html="convertedHtml"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, Document, Download, Delete, Loading, ZoomIn, ZoomOut, Refresh, CopyDocument } from '@element-plus/icons-vue'
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

const previewMode = ref('professional')
const professionalLoading = ref(false)
const professionalContent = ref('')
const zoomLevel = ref(0.85)
const showHtmlPreview = ref(false)
const separateStyles = ref(false)

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
    
    // 使用增强的颜色处理函数处理原文HTML
    let processedOriginalHtml = processColorStyles(htmlResult.value)
    
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
        
        /* 确保颜色信息被正确显示 */
        /* 移除可能阻止颜色显示的规则 */
        
        /* 高亮颜色支持 */
        span[data-original-highlight] {
          background-color: inherit !important;
        }
      </style>
    `
    originalHtml.value = baseStyles + processedOriginalHtml
    
    ElMessage.success('文件选择成功，可以开始转换')
    // 上传后自动切换到专业预览并触发渲染
    if (previewMode.value === 'professional') {
      previewMode.value = 'local';
      await nextTick();
    }
    previewMode.value = 'professional';
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
  
  // 如果已经有转换结果，根据预览模式重新转换
  if (convertedHtml.value && selectedFile.value) {
    // 延迟一点时间，避免与专业预览渲染冲突
    setTimeout(() => {
      convertToHtml()
    }, 500)
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
    // 读取文件为 arrayBuffer
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

    // 根据当前预览模式选择转换方式
    if (previewMode.value === 'professional') {
      // 专业预览模式：使用 docx-preview 渲染
      try {
        const container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.left = '-9999px'
        container.style.top = '-9999px'
        document.body.appendChild(container)
        await renderAsync(arrayBuffer, container, undefined, {
          className: 'docx-renderer',
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          ignoreLastRenderedPageBreak: false,
          experimental: true
        })
        const docxHtml = container.innerHTML
        document.body.removeChild(container)
        
        // 专业预览样式
        const docxStyle = `
          <style>
            .docx-renderer {
              background: #ffffff;
              padding: 24px;
              border: 1px solid #e4e7ed;
              border-radius: 8px;
              min-height: 100%;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
              font-family: 'Times New Roman', serif;
              line-height: 1.5;
            }
            .docx-renderer .docx {
              background: #ffffff;
              padding: 24px;
              margin: 0;
              font-family: 'Times New Roman', serif;
              line-height: 1.5;
            }
            .docx-renderer .docx .page {
              background: #ffffff;
              margin: 12px 0;
              padding: 24px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              border-radius: 8px;
            }
          </style>
        `
        convertedHtml.value = docxStyle + docxHtml
        ElMessage.success('转换成功（专业预览样式）')
        return
      } catch (error) {
        console.warn('docx-preview渲染失败，回退到本地预览样式:', error)
        // 如果专业预览失败，回退到本地预览样式
        previewMode.value = 'local'
      }
    }

    // 本地预览模式：使用 mammoth 转换
    const mammothOptions = {
      arrayBuffer,
      styleMap: [
        "p[style-name='标题 1'] => h1.heading1:fresh",
        "p[style-name='标题 2'] => h2.heading2:fresh",
        "p[style-name='标题 3'] => h3.heading3:fresh",
        "p[style-name='标题 4'] => h4.heading4:fresh",
        "p[style-name='标题 5'] => h5.heading5:fresh",
        "p[style-name='标题 6'] => h6.heading6:fresh",
        "p[style-name='正文'] => p.body-text:fresh",
        "p[style-name='引用'] => blockquote.quote:fresh",
        "p[style-name='列表段落'] => p.list-paragraph:fresh",
        "ul[style-name='无序列表'] => ul.unordered-list:fresh",
        "ol[style-name='有序列表'] => ol.ordered-list:fresh",
        "p[style-name='居中'] => p.text-center:fresh",
        "p[style-name='居右'] => p.text-right:fresh",
        "p[style-name='两端对齐'] => p.text-justify:fresh",
        "p[style-name='左对齐'] => p.text-left:fresh",
        "r[color] => span[style='color: {color};']",
        "r[bold='true'] => strong",
        "r[italic='true'] => em",
        "r[underline='true'] => u",
        "r[strike='true'] => s",
        "r[highlight] => span[style='background-color: {highlight};']",
        "r[bold='true'][italic='true'] => strong em",
        "r[bold='true'][underline='true'] => strong u",
        "r[italic='true'][underline='true'] => em u",
        "p[align='center'] => p.text-center:fresh",
        "p[align='right'] => p.text-right:fresh",
        "p[align='justify'] => p.text-justify:fresh",
        "p[align='left'] => p.text-left:fresh"
      ],
      includeDefaultStyleMap: true,
      preserveStyles: true,
      ignoreEmptyParagraphs: false,
      preserveWhitespace: true,
      convertImage: mammoth.images.imgElement((image) => {
        return image.read("base64").then((imageData) => {
          return {
            src: `data:${image.contentType};base64,${imageData}`
          }
        })
      })
    }
    const mammothResult = await mammoth.convertToHtml(mammothOptions)
    
    // 本地预览样式增强处理
    let processedHtml = enhanceStyleProcessing(mammothResult.value, '')
    const baseStyles = `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: "Microsoft YaHei", Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
        }
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
        h1, h2, h3, h4, h5, h6 {
          margin: 1em 0 0.5em;
          font-weight: bold;
          line-height: 1.2;
        }
        h1 { font-size: 2em; }
        h2 { font-size: 1.5em; }
        h3 { font-size: 1.17em; }
        p { margin: 1em 0; }
        ul, ol { margin: 1em 0; padding-left: 2em; }
        li { margin: 0.5em 0; }
        img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
        }
        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }
        .text-justify { text-align: justify !important; }
        .text-left { text-align: left !important; }
        strong { font-weight: bold; }
        em { font-style: italic; }
        u { text-decoration: underline; }
        s { text-decoration: line-through; }
      </style>
    `
    convertedHtml.value = baseStyles + processedHtml
    ElMessage.success('转换成功（本地预览样式）')
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    console.error('转换错误详情：', error)
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

// 增强的样式处理函数
const enhanceStyleProcessing = (mammothHtml: string, professionalHtml: string = ''): string => {
  let processedHtml = mammothHtml
  
  // 1. 处理颜色信息 - 多重保障
  processedHtml = processColorStyles(processedHtml)
  
  // 2. 处理对齐方式 - 从多个来源获取
  processedHtml = processAlignmentStyles(processedHtml, professionalHtml)
  
  // 3. 处理段落缩进
  processedHtml = processIndentationStyles(processedHtml, professionalHtml)
  
  // 4. 处理字体样式
  processedHtml = processFontStyles(processedHtml, professionalHtml)
  
  // 5. 处理行间距
  processedHtml = processLineHeightStyles(processedHtml, professionalHtml)
  
  // 6. 处理背景色和高亮
  processedHtml = processBackgroundStyles(processedHtml, professionalHtml)
  
  // 7. 处理边框和表格样式
  processedHtml = processBorderStyles(processedHtml, professionalHtml)
  
  // 8. 从专业渲染结果中提取更精确的样式信息
  if (professionalHtml) {
    processedHtml = extractStylesFromProfessional(processedHtml, professionalHtml)
  }
  
  // 9. 最终样式清理和优化
  processedHtml = finalizeStyles(processedHtml)
  
  return processedHtml
}

// 从专业渲染结果中提取精确样式信息
const extractStylesFromProfessional = (mammothHtml: string, professionalHtml: string): string => {
  let processedHtml = mammothHtml
  
  // 创建临时DOM元素来解析专业渲染的HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = professionalHtml
  
  // 智能样式提取和匹配
  const extractedStyles = extractStylesFromDOM(tempDiv)
  
  // 应用提取的样式到mammoth结果
  processedHtml = applyExtractedStyles(processedHtml, extractedStyles)
  
  return processedHtml
}

// 从DOM中提取样式信息
const extractStylesFromDOM = (element: Element): any => {
  const styles: any = {
    paragraphs: [],
    textElements: [],
    tables: [],
    lists: []
  }
  
  // 提取段落样式
  const paragraphs = element.querySelectorAll('p')
  paragraphs.forEach((p, index) => {
    const style = p.getAttribute('style')
    const textContent = p.textContent?.trim()
    const className = p.className
    
    if (style || className) {
      styles.paragraphs.push({
        index,
        style: style || '',
        className: className || '',
        textContent: textContent || '',
        element: p
      })
    }
  })
  
  // 提取文本元素样式
  const textElements = element.querySelectorAll('span, strong, em, u, s, b, i')
  textElements.forEach((el, index) => {
    const style = el.getAttribute('style')
    const textContent = el.textContent?.trim()
    const tagName = el.tagName.toLowerCase()
    
    if (style) {
      styles.textElements.push({
        index,
        style,
        tagName,
        textContent: textContent || '',
        element: el
      })
    }
  })
  
  // 提取表格样式
  const tables = element.querySelectorAll('table')
  tables.forEach((table, index) => {
    const style = table.getAttribute('style')
    if (style) {
      styles.tables.push({
        index,
        style,
        element: table
      })
    }
  })
  
  // 提取列表样式
  const lists = element.querySelectorAll('ul, ol')
  lists.forEach((list, index) => {
    const style = list.getAttribute('style')
    if (style) {
      styles.lists.push({
        index,
        style,
        tagName: list.tagName.toLowerCase(),
        element: list
      })
    }
  })
  
  return styles
}

// 应用提取的样式到mammoth结果
const applyExtractedStyles = (mammothHtml: string, extractedStyles: any): string => {
  let processedHtml = mammothHtml
  
  // 应用段落样式
  extractedStyles.paragraphs.forEach((pStyle: any) => {
    // 使用文本内容匹配来找到对应的段落
    const paragraphRegex = new RegExp(`<p[^>]*>.*?${escapeRegExp(pStyle.textContent)}.*?</p>`, 'gi')
    const matches = processedHtml.match(paragraphRegex)
    
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        const styleMatch = match.match(/style="([^"]*)"/)
        if (styleMatch) {
          // 合并样式
          const existingStyle = styleMatch[1]
          const newStyle = mergeStyles(existingStyle, pStyle.style)
          const newMatch = match.replace(/style="[^"]*"/, `style="${newStyle}"`)
          processedHtml = processedHtml.replace(match, newMatch)
        } else {
          // 添加新样式
          const newMatch = match.replace('<p', `<p style="${pStyle.style}"`)
          processedHtml = processedHtml.replace(match, newMatch)
        }
      })
    }
  })
  
  // 应用文本元素样式
  extractedStyles.textElements.forEach((textStyle: any) => {
    // 使用文本内容匹配来找到对应的文本元素
    const textRegex = new RegExp(`<${textStyle.tagName}[^>]*>.*?${escapeRegExp(textStyle.textContent)}.*?</${textStyle.tagName}>`, 'gi')
    const matches = processedHtml.match(textRegex)
    
    if (matches && matches.length > 0) {
      matches.forEach(match => {
        const styleMatch = match.match(/style="([^"]*)"/)
        if (styleMatch) {
          // 合并样式
          const existingStyle = styleMatch[1]
          const newStyle = mergeStyles(existingStyle, textStyle.style)
          const newMatch = match.replace(/style="[^"]*"/, `style="${newStyle}"`)
          processedHtml = processedHtml.replace(match, newMatch)
        } else {
          // 添加新样式
          const newMatch = match.replace(`<${textStyle.tagName}`, `<${textStyle.tagName} style="${textStyle.style}"`)
          processedHtml = processedHtml.replace(match, newMatch)
        }
      })
    }
  })
  
  return processedHtml
}

// 合并样式字符串
const mergeStyles = (existingStyle: string, newStyle: string): string => {
  const existingProps = new Map()
  const newProps = new Map()
  
  // 解析现有样式
  existingStyle.split(';').forEach(prop => {
    const [key, value] = prop.split(':').map(s => s.trim())
    if (key && value) {
      existingProps.set(key, value)
    }
  })
  
  // 解析新样式
  newStyle.split(';').forEach(prop => {
    const [key, value] = prop.split(':').map(s => s.trim())
    if (key && value) {
      newProps.set(key, value)
    }
  })
  
  // 合并样式，新样式优先
  newProps.forEach((value, key) => {
    existingProps.set(key, value)
  })
  
  // 重新构建样式字符串
  return Array.from(existingProps.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

// 转义正则表达式特殊字符
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 最终样式清理和优化
const finalizeStyles = (html: string): string => {
  let processedHtml = html
  
  // 1. 清理重复的样式属性
  processedHtml = processedHtml.replace(
    /style="([^"]*);\s*([^"]*);\s*\1[^"]*"/gi,
    (match, style1, style2) => {
      // 移除重复的样式部分
      const uniqueStyles = style1 + '; ' + style2
      return match.replace(/style="[^"]*"/, `style="${uniqueStyles}"`)
    }
  )
  
  // 2. 清理空的style属性
  processedHtml = processedHtml.replace(/style="\s*"/gi, '')
  
  // 3. 清理多余的分号
  processedHtml = processedHtml.replace(/;\s*;+/g, ';')
  processedHtml = processedHtml.replace(/;\s*"/g, '"')
  
  // 4. 优化颜色值格式
  processedHtml = processedHtml.replace(
    /color:\s*#([0-9A-Fa-f]{3})/gi,
    (match, color) => {
      // 将3位十六进制颜色扩展为6位
      const expanded = color.split('').map((c: string) => c + c).join('')
      return match.replace(color, expanded)
    }
  )
  
  // 5. 标准化字体大小单位
  processedHtml = processedHtml.replace(
    /font-size:\s*(\d+)px/gi,
    (match, size) => {
      // 将px转换为pt（1pt ≈ 1.33px）
      const ptSize = Math.round(parseInt(size) / 1.33)
      return match.replace(`${size}px`, `${ptSize}pt`)
    }
  )
  
  // 6. 确保段落对齐样式正确应用
  processedHtml = processedHtml.replace(
    /<p[^>]*class="([^"]*text-center[^"]*)"[^>]*>/gi,
    (match) => {
      if (!match.includes('text-align: center')) {
        return match.replace('<p', '<p style="text-align: center;"')
      }
      return match
    }
  )
  
  processedHtml = processedHtml.replace(
    /<p[^>]*class="([^"]*text-right[^"]*)"[^>]*>/gi,
    (match) => {
      if (!match.includes('text-align: right')) {
        return match.replace('<p', '<p style="text-align: right;"')
      }
      return match
    }
  )
  
  processedHtml = processedHtml.replace(
    /<p[^>]*class="([^"]*text-justify[^"]*)"[^>]*>/gi,
    (match) => {
      if (!match.includes('text-align: justify')) {
        return match.replace('<p', '<p style="text-align: justify;"')
      }
      return match
    }
  )
  
  // 7. 确保表格样式完整
  processedHtml = processedHtml.replace(
    /<table[^>]*>/gi,
    (match) => {
      if (!match.includes('border-collapse')) {
        return match.replace('<table', '<table style="border-collapse: collapse; width: 100%;"')
      }
      return match
    }
  )
  
  // 8. 确保图片样式正确
  processedHtml = processedHtml.replace(
    /<img[^>]*>/gi,
    (match) => {
      if (!match.includes('max-width')) {
        return match.replace('<img', '<img style="max-width: 100%; height: auto;"')
      }
      return match
    }
  )
  
  return processedHtml
}

// 处理对齐方式样式
const processAlignmentStyles = (html: string, professionalHtml: string = ''): string => {
  let processedHtml = html
  
  // 从mammoth结果中提取对齐信息
  processedHtml = processedHtml.replace(
    /<p[^>]*align="([^"]+)"[^>]*>/gi,
    (match, align) => {
      const alignmentMap: { [key: string]: string } = {
        'center': 'center',
        'right': 'right',
        'justify': 'justify',
        'left': 'left'
      }
      const alignment = alignmentMap[align] || 'left'
      return match.replace(/align="[^"]*"/, `style="text-align: ${alignment};"`)
    }
  )
  
  // 从专业渲染结果中提取对齐信息（如果可用）
  if (professionalHtml) {
    const alignmentMatches = professionalHtml.match(/text-align:\s*([^;]+)/gi)
    if (alignmentMatches) {
      alignmentMatches.forEach(match => {
        const alignment = match.replace('text-align:', '').trim()
        // 将专业渲染的对齐信息应用到mammoth结果
        processedHtml = processedHtml.replace(
          /<p[^>]*>/gi,
          (pMatch) => {
            if (!pMatch.includes('text-align')) {
              return pMatch.replace('<p', `<p style="text-align: ${alignment};"`)
            }
            return pMatch
          }
        )
      })
    }
  }
  
  return processedHtml
}

// 处理段落缩进样式
const processIndentationStyles = (html: string, professionalHtml: string = ''): string => {
  let processedHtml = html
  
  // 处理首行缩进
  processedHtml = processedHtml.replace(
    /<p[^>]*style="[^"]*text-indent:\s*([^;]+)[^"]*"[^>]*>/gi,
    (match, indent) => {
      const indentValue = indent.trim()
      return match.replace(/text-indent:\s*[^;]+/, `text-indent: ${indentValue}`)
    }
  )
  
  // 从专业渲染结果中提取缩进信息
  if (professionalHtml) {
    const indentMatches = professionalHtml.match(/text-indent:\s*([^;]+)/gi)
    if (indentMatches) {
      indentMatches.forEach(match => {
        const indent = match.replace('text-indent:', '').trim()
        processedHtml = processedHtml.replace(
          /<p[^>]*>/gi,
          (pMatch) => {
            if (!pMatch.includes('text-indent')) {
              const styleMatch = pMatch.match(/style="([^"]*)"/)
              if (styleMatch) {
                const existingStyle = styleMatch[1]
                const newStyle = existingStyle + `; text-indent: ${indent};`
                return pMatch.replace(/style="[^"]*"/, `style="${newStyle}"`)
              } else {
                return pMatch.replace('<p', `<p style="text-indent: ${indent};"`)
              }
            }
            return pMatch
          }
        )
      })
    }
  }
  
  return processedHtml
}

// 处理字体样式
const processFontStyles = (html: string, professionalHtml: string = ''): string => {
  let processedHtml = html
  
  // 处理字体族
  processedHtml = processedHtml.replace(
    /<span[^>]*style="[^"]*font-family:\s*([^;]+)[^"]*"[^>]*>/gi,
    (match, fontFamily) => {
      const font = fontFamily.trim().replace(/['"]/g, '')
      return match.replace(/font-family:\s*[^;]+/, `font-family: "${font}", serif`)
    }
  )
  
  // 处理字体大小
  processedHtml = processedHtml.replace(
    /<span[^>]*style="[^"]*font-size:\s*([^;]+)[^"]*"[^>]*>/gi,
    (match, fontSize) => {
      const size = fontSize.trim()
      return match.replace(/font-size:\s*[^;]+/, `font-size: ${size}`)
    }
  )
  
  return processedHtml
}

// 处理行间距样式
const processLineHeightStyles = (html: string, professionalHtml: string = ''): string => {
  let processedHtml = html
  
  // 处理行高
  processedHtml = processedHtml.replace(
    /<p[^>]*style="[^"]*line-height:\s*([^;]+)[^"]*"[^>]*>/gi,
    (match, lineHeight) => {
      const height = lineHeight.trim()
      return match.replace(/line-height:\s*[^;]+/, `line-height: ${height}`)
    }
  )
  
  return processedHtml
}

// 处理背景色和高亮样式
const processBackgroundStyles = (html: string, professionalHtml: string = ''): string => {
  let processedHtml = html
  
  // 处理背景色
  processedHtml = processedHtml.replace(
    /<span[^>]*style="[^"]*background-color:\s*([^;]+)[^"]*"[^>]*>/gi,
    (match, bgColor) => {
      const color = bgColor.trim()
      return match.replace(/background-color:\s*[^;]+/, `background-color: ${color}`)
    }
  )
  
  return processedHtml
}

// 处理边框和表格样式
const processBorderStyles = (html: string, professionalHtml: string = ''): string => {
  let processedHtml = html
  
  // 处理表格边框
  processedHtml = processedHtml.replace(
    /<table[^>]*>/gi,
    (match) => {
      if (!match.includes('border')) {
        return match.replace('<table', '<table border="1" style="border-collapse: collapse; width: 100%;"')
      }
      return match
    }
  )
  
  // 处理单元格边框
  processedHtml = processedHtml.replace(
    /<(td|th)[^>]*>/gi,
    (match, tag) => {
      if (!match.includes('border')) {
        return match.replace(`<${tag}`, `<${tag} style="border: 1px solid #ddd; padding: 8px;"`)
      }
      return match
    }
  )
  
  return processedHtml
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

// 增强的颜色处理函数
const processColorStyles = (html: string): string => {
  let processedHtml = html
  
  // 1. 处理mammoth生成的带有color属性的span标签
  processedHtml = processedHtml.replace(
    /<span[^>]*color="([^"]+)"[^>]*>/gi,
    (match, color) => {
      // 移除color属性，添加到style中
      const cleanMatch = match.replace(/color="[^"]*"/, '')
      const styleMatch = cleanMatch.match(/style="([^"]*)"/)
      
      if (styleMatch) {
        // 如果已有style属性，添加color
        const existingStyle = styleMatch[1]
        const newStyle = existingStyle + `; color: ${color};`
        return cleanMatch.replace(/style="[^"]*"/, `style="${newStyle}" data-original-color="${color}"`)
      } else {
        // 如果没有style属性，创建新的
        return cleanMatch.replace(/<span/, `<span style="color: ${color};" data-original-color="${color}"`)
      }
    }
  )
  
  // 2. 处理Word文档中的十六进制颜色值（不带#前缀）
  processedHtml = processedHtml.replace(
    /<span[^>]*color="([0-9A-Fa-f]{6})"[^>]*>/gi,
    (match, color) => {
      const cleanMatch = match.replace(/color="[^"]*"/, '')
      const styleMatch = cleanMatch.match(/style="([^"]*)"/)
      
      if (styleMatch) {
        const existingStyle = styleMatch[1]
        const newStyle = existingStyle + `; color: #${color};`
        return cleanMatch.replace(/style="[^"]*"/, `style="${newStyle}" data-original-color="#${color}"`)
      } else {
        return cleanMatch.replace(/<span/, `<span style="color: #${color};" data-original-color="#${color}"`)
      }
    }
  )
  
  // 3. 处理Word文档中的主题颜色
  processedHtml = processedHtml.replace(
    /<span[^>]*theme-color="([^"]+)"[^>]*>/gi,
    (match, themeColor) => {
      const colorMap: { [key: string]: string } = {
        'accent1': '#4472C4',
        'accent2': '#70AD47',
        'accent3': '#FFC000',
        'accent4': '#ED7D31',
        'accent5': '#9E480E',
        'accent6': '#997300',
        'dark1': '#000000',
        'dark2': '#44546A',
        'light1': '#FFFFFF',
        'light2': '#E7E6E6'
      }
      const color = colorMap[themeColor] || '#000000'
      const cleanMatch = match.replace(/theme-color="[^"]*"/, '')
      const styleMatch = cleanMatch.match(/style="([^"]*)"/)
      
      if (styleMatch) {
        const existingStyle = styleMatch[1]
        const newStyle = existingStyle + `; color: ${color};`
        return cleanMatch.replace(/style="[^"]*"/, `style="${newStyle}" data-original-color="${color}"`)
      } else {
        return cleanMatch.replace(/<span/, `<span style="color: ${color};" data-original-color="${color}"`)
      }
    }
  )
  
  // 4. 处理Word文档中的高亮颜色
  processedHtml = processedHtml.replace(
    /<span[^>]*highlight="([^"]+)"[^>]*>/gi,
    (match, highlight) => {
      const highlightMap: { [key: string]: string } = {
        'yellow': '#FFFF00',
        'green': '#00FF00',
        'cyan': '#00FFFF',
        'magenta': '#FF00FF',
        'blue': '#0000FF',
        'red': '#FF0000',
        'darkBlue': '#000080',
        'darkCyan': '#008080',
        'darkGreen': '#008000',
        'darkMagenta': '#800080',
        'darkRed': '#800000',
        'darkYellow': '#808000',
        'darkGray': '#808080',
        'lightGray': '#C0C0C0',
        'black': '#000000',
        'white': '#FFFFFF'
      }
      const color = highlightMap[highlight] || '#FFFF00'
      const cleanMatch = match.replace(/highlight="[^"]*"/, '')
      const styleMatch = cleanMatch.match(/style="([^"]*)"/)
      
      if (styleMatch) {
        const existingStyle = styleMatch[1]
        const newStyle = existingStyle + `; background-color: ${color};`
        return cleanMatch.replace(/style="[^"]*"/, `style="${newStyle}" data-original-highlight="${color}"`)
      } else {
        return cleanMatch.replace(/<span/, `<span style="background-color: ${color};" data-original-highlight="${color}"`)
      }
    }
  )
  
  // 5. 处理Word文档中的自动颜色
  processedHtml = processedHtml.replace(
    /<span[^>]*color="auto"[^>]*>/gi,
    (match) => {
      const cleanMatch = match.replace(/color="auto"/, '')
      return cleanMatch.replace(/<span/, `<span data-original-color="auto"`)
    }
  )
  
  // 6. 处理Word文档中的RGB颜色值
  processedHtml = processedHtml.replace(
    /<span[^>]*color="rgb\(([^)]+)\)"[^>]*>/gi,
    (match, rgb) => {
      const cleanMatch = match.replace(/color="rgb\([^)]*\)"/, '')
      const styleMatch = cleanMatch.match(/style="([^"]*)"/)
      
      if (styleMatch) {
        const existingStyle = styleMatch[1]
        const newStyle = existingStyle + `; color: rgb(${rgb});`
        return cleanMatch.replace(/style="[^"]*"/, `style="${newStyle}" data-original-color="rgb(${rgb})"`)
      } else {
        return cleanMatch.replace(/<span/, `<span style="color: rgb(${rgb});" data-original-color="rgb(${rgb})"`)
      }
    }
  )
  
  // 7. 处理Word文档中的RGBA颜色值
  processedHtml = processedHtml.replace(
    /<span[^>]*color="rgba\(([^)]+)\)"[^>]*>/gi,
    (match, rgba) => {
      const cleanMatch = match.replace(/color="rgba\([^)]*\)"/, '')
      const styleMatch = cleanMatch.match(/style="([^"]*)"/)
      
      if (styleMatch) {
        const existingStyle = styleMatch[1]
        const newStyle = existingStyle + `; color: rgba(${rgba});`
        return cleanMatch.replace(/style="[^"]*"/, `style="${newStyle}" data-original-color="rgba(${rgba})"`)
      } else {
        return cleanMatch.replace(/<span/, `<span style="color: rgba(${rgba});" data-original-color="rgba(${rgba})"`)
      }
    }
  )
  
  // 8. 处理Word文档中的HSL颜色值
  processedHtml = processedHtml.replace(
    /<span[^>]*color="hsl\(([^)]+)\)"[^>]*>/gi,
    (match, hsl) => {
      const cleanMatch = match.replace(/color="hsl\([^)]*\)"/, '')
      const styleMatch = cleanMatch.match(/style="([^"]*)"/)
      
      if (styleMatch) {
        const existingStyle = styleMatch[1]
        const newStyle = existingStyle + `; color: hsl(${hsl});`
        return cleanMatch.replace(/style="[^"]*"/, `style="${newStyle}" data-original-color="hsl(${hsl})"`)
      } else {
        return cleanMatch.replace(/<span/, `<span style="color: hsl(${hsl});" data-original-color="hsl(${hsl})"`)
      }
    }
  )
  
  // 9. 处理Word文档中的HSLA颜色值
  processedHtml = processedHtml.replace(
    /<span[^>]*color="hsla\(([^)]+)\)"[^>]*>/gi,
    (match, hsla) => {
      const cleanMatch = match.replace(/color="hsla\([^)]*\)"/, '')
      const styleMatch = cleanMatch.match(/style="([^"]*)"/)
      
      if (styleMatch) {
        const existingStyle = styleMatch[1]
        const newStyle = existingStyle + `; color: hsla(${hsla});`
        return cleanMatch.replace(/style="[^"]*"/, `style="${newStyle}" data-original-color="hsla(${hsla})"`)
      } else {
        return cleanMatch.replace(/<span/, `<span style="color: hsla(${hsla});" data-original-color="hsla(${hsla})"`)
      }
    }
  )
  
  // 10. 处理Word文档中的颜色名称
  const colorNameMap: { [key: string]: string } = {
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'purple': '#800080',
    'orange': '#FFA500',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'gray': '#808080',
    'grey': '#808080',
    'black': '#000000',
    'white': '#FFFFFF',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'lime': '#00FF00',
    'navy': '#000080',
    'olive': '#808000',
    'teal': '#008080',
    'silver': '#C0C0C0',
    'maroon': '#800000'
  }
  
  processedHtml = processedHtml.replace(
    /<span[^>]*color="([a-zA-Z]+)"[^>]*>/gi,
    (match, colorName) => {
      const color = colorNameMap[colorName.toLowerCase()] || colorName
      const cleanMatch = match.replace(/color="[^"]*"/, '')
      const styleMatch = cleanMatch.match(/style="([^"]*)"/)
      
      if (styleMatch) {
        const existingStyle = styleMatch[1]
        const newStyle = existingStyle + `; color: ${color};`
        return cleanMatch.replace(/style="[^"]*"/, `style="${newStyle}" data-original-color="${color}"`)
      } else {
        return cleanMatch.replace(/<span/, `<span style="color: ${color};" data-original-color="${color}"`)
      }
    }
  )
  
  return processedHtml
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

// 分离样式函数
const applySeparateStyles = () => {
  if (!convertedHtml.value) return
  
  if (separateStyles.value) {
    // 分离样式
    const parser = new DOMParser()
    const doc = parser.parseFromString(convertedHtml.value, 'text/html')
    
    // 收集所有内联样式
    const styleMap = new Map()
    let classCounter = 0
    
    // 处理所有带有style属性的元素
    doc.querySelectorAll('[style]').forEach(element => {
      const style = element.getAttribute('style')
      if (!style) return
      
      // 为每个唯一的样式创建一个类名
      let className = ''
      if (styleMap.has(style)) {
        className = styleMap.get(style)
      } else {
        className = `extracted-style-${classCounter++}`
        styleMap.set(style, className)
      }
      
      // 添加类名并移除内联样式
      element.classList.add(className)
      element.removeAttribute('style')
    })
    
    // 创建样式内容
    let styleContent = ''
    for (const [style, className] of styleMap.entries()) {
      styleContent += `.${className} { ${style} }\n`
    }
    
    // 查找现有的style标签
    const existingStyle = doc.querySelector('style')
    if (existingStyle) {
      // 将新样式添加到现有样式中
      existingStyle.innerHTML += '\n' + styleContent
    } else {
      // 创建新的style标签
      const styleElement = doc.createElement('style')
      styleElement.textContent = styleContent
      
      // 在文档头部添加新的style标签
      const head = doc.querySelector('head') || doc.createElement('head')
      head.appendChild(styleElement)
      if (!doc.querySelector('head')) {
        doc.documentElement.prepend(head)
      }
    }
    
    // 更新转换后的HTML
    convertedHtml.value = doc.documentElement.outerHTML
  } else {
    // 如果关闭分离样式，重新转换文档
    if (selectedFile.value) {
      convertToHtml()
    }
  }
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
  /* 新增：宽度限制，与下方展示区一致 */
  max-width: 800px;
  min-width: 360px;
  margin-left: auto;
  margin-right: auto;
}

.file-details {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: flex-start;
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
  flex: 1;
  min-width: 0;
}

.file-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  font-size: 16px;
  margin-bottom: 4px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.file-size {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.file-actions {
  display: flex;
  gap: 10px;
  flex-shrink: 0;
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
  /* 新增：宽度限制 */
  max-width: 800px;
  min-width: 360px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
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
  gap: 8px;
  flex-wrap: nowrap;
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
  padding: 0 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 80px;
  white-space: nowrap;
  height: 32px;
  box-sizing: border-box;
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
  padding: 0 !important;
  margin: 0 !important;
  display: flex;
  flex-direction: column;
}

.preview-frame.code-mode,
.preview-frame.render-mode {
  flex: 1 1 0;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.preview-frame.render-mode > div {
  flex: 1 1 0;
  width: 100%;
  height: 100%;
  min-height: 0;
  min-width: 0;
  box-sizing: border-box;
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
  
  .file-details {
    width: 100%;
    justify-content: flex-start;
  }
  
  .file-info-content {
    flex: 1;
    min-width: 0;
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
  
  .file-details {
    gap: 8px;
  }
  
  .file-icon-wrapper {
    width: 36px;
    height: 36px;
  }
  
  .file-icon {
    font-size: 20px;
  }
  
  .file-name {
    font-size: 14px;
  }
  
  .file-size {
    font-size: 12px;
  }
}

/* 专业预览区域顶部无圆角、无阴影、无灰色块 */
.professional-preview,
.professional-preview .preview-content,
.professional-preview .docx-display-container {
  padding-top: 0 !important;
  margin-top: 0 !important;
  background: #fff !important;
}

.professional-preview .preview-content {
  padding: 0 !important;
}

.professional-preview .docx-display-container {
  background: #fff !important;
}

.professional-preview .docx-renderer {
  padding-top: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  margin-top: 0 !important;
}

/* HTML转换结果窗口在专业预览模式下样式与左侧一致 */
.professional-preview ~ .converted-section .preview-frame {
  padding-top: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  margin-top: 0 !important;
  background: #fff !important;
}

/* 分离样式开关样式 */
.style-switch {
  margin: 0 8px;
}

.style-switch .el-switch__label {
  font-size: 12px;
}

.dark .style-switch .el-switch__label {
  color: #e0e0e0;
}
</style>