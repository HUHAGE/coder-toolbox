<template>
  <div class="qrcode-tool">
    <!-- 主要内容区域 -->
    <el-row :gutter="24">
      <!-- 左侧编辑区域 -->
      <el-col :span="14">
        <div class="edit-section">
          <!-- 内容输入 -->
          <div class="input-card">
            <h3 class="section-title">
              <el-icon><Edit /></el-icon>
              内容编辑
            </h3>
            <div class="content-input">
              <el-tabs v-model="activeTab" class="input-tabs">
                <el-tab-pane label="文本" name="text">
                  <el-input
                    v-model="content.text"
                    type="textarea"
                    :rows="4"
                    placeholder="输入文本内容..."
                    @input="handleInput"
                  />
                </el-tab-pane>
                <el-tab-pane label="链接" name="url">
                  <el-input
                    v-model="content.url"
                    placeholder="输入网址..."
                    @input="handleInput"
                  >
                    <template #prepend>
                      <el-select v-model="content.protocol" class="protocol-select">
                        <el-option label="https://" value="https://" />
                        <el-option label="http://" value="http://" />
                      </el-select>
                    </template>
                  </el-input>
                </el-tab-pane>
                <el-tab-pane label="名片" name="vcard">
                  <div class="vcard-form">
                    <el-form :model="content.vcard" label-position="top">
                      <el-form-item label="姓名">
                        <el-input v-model="content.vcard.name" @input="handleInput" />
                      </el-form-item>
                      <el-form-item label="电话">
                        <el-input v-model="content.vcard.phone" @input="handleInput" />
                      </el-form-item>
                      <el-form-item label="邮箱">
                        <el-input v-model="content.vcard.email" @input="handleInput" />
                      </el-form-item>
                      <el-form-item label="公司">
                        <el-input v-model="content.vcard.company" @input="handleInput" />
                      </el-form-item>
                    </el-form>
                  </div>
                </el-tab-pane>
                <el-tab-pane label="WiFi" name="wifi">
                  <div class="wifi-form">
                    <el-form :model="content.wifi" label-position="top">
                      <el-form-item label="网络名称(SSID)">
                        <el-input v-model="content.wifi.ssid" @input="handleInput" />
                      </el-form-item>
                      <el-form-item label="密码">
                        <el-input v-model="content.wifi.password" @input="handleInput" />
                      </el-form-item>
                      <el-form-item label="加密类型">
                        <el-select v-model="content.wifi.encryption" @change="handleInput">
                          <el-option label="WPA/WPA2" value="WPA" />
                          <el-option label="WEP" value="WEP" />
                          <el-option label="无加密" value="nopass" />
                        </el-select>
                      </el-form-item>
                    </el-form>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>

          <!-- 样式设置 -->
          <div class="style-card">
            <h3 class="section-title">
              <el-icon><Brush /></el-icon>
              样式设置
            </h3>
            <div class="style-options">
              <!-- 基础设置 -->
              <div class="option-group basic-settings">
                <div class="option-row">
                  <div class="option-item flex-1">
                    <span class="option-label">尺寸大小</span>
                    <el-slider
                      v-model="style.size"
                      :min="100"
                      :max="400"
                      :step="10"
                      :format-tooltip="value => `${value}px`"
                      @input="handleInput"
                    />
                  </div>
                  <div class="option-item flex-1">
                    <span class="option-label">容错级别</span>
                    <div class="error-level-group">
                      <div 
                        v-for="level in ['L', 'M', 'Q', 'H']" 
                        :key="level"
                        class="error-level-item"
                        :class="{ active: style.errorLevel === level }"
                        @click="style.errorLevel = level"
                      >
                        <span class="level-label">{{ level }}</span>
                        <span class="level-desc">{{ getErrorLevelDesc(level) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 颜色设置 -->
              <div class="color-group">
                <div class="option-row">
                  <div class="option-item flex-1">
                    <span class="option-label">前景色</span>
                    <el-color-picker
                      v-model="style.foreground"
                      :predefine="colorPresets"
                      @change="handleInput"
                    />
                  </div>
                  <div class="option-item flex-1">
                    <span class="option-label">背景色</span>
                    <el-color-picker
                      v-model="style.background"
                      :predefine="colorPresets"
                      @change="handleInput"
                    />
                  </div>
                </div>
              </div>

              <!-- Logo设置 -->
              <div class="logo-group">
                <div class="option-item">
                  <span class="option-label">Logo图片</span>
                  <el-upload
                    class="logo-upload"
                    accept="image/*"
                    :show-file-list="false"
                    :before-upload="handleLogoUpload"
                  >
                    <el-button size="small" type="primary">
                      <el-icon><Upload /></el-icon>
                      上传Logo
                    </el-button>
                  </el-upload>
                </div>
                <div class="option-item" v-if="style.logo">
                  <span class="option-label">Logo大小</span>
                  <el-slider
                    v-model="style.logoSize"
                    :min="10"
                    :max="30"
                    :step="1"
                    :format-tooltip="value => `${value}%`"
                    @input="handleInput"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧预览区域 -->
      <el-col :span="10">
        <div class="preview-section">
          <div class="preview-card">
            <h3 class="section-title">
              <el-icon><View /></el-icon>
              预览
            </h3>
            <div class="preview-content" :style="previewStyle">
              <QRCodeVue3
                :key="qrcodeKey"
                v-bind="qrcodeOptions"
                ref="qrcodeRef"
              />
              <img
                v-if="style.logo"
                :src="style.logo"
                class="qrcode-logo"
                :style="logoStyle"
              />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="actions-card">
            <div class="action-buttons">
              <div class="download-options">
                <el-radio-group v-model="downloadFormat" size="small">
                  <el-radio-button label="png">PNG</el-radio-button>
                  <el-radio-button label="jpg">JPG</el-radio-button>
                  <el-radio-button label="svg">SVG</el-radio-button>
                </el-radio-group>
              </div>
              <el-button-group>
                <el-button type="primary" @click="downloadQRCode">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
                <el-button @click="copyQRCode">
                  <el-icon><CopyDocument /></el-icon>
                  复制
                </el-button>
              </el-button-group>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import QRCodeVue3 from 'qrcode-vue3'
import {
  Edit,
  Brush,
  View,
  Upload,
  Download,
  Document as CopyDocument
} from '@element-plus/icons-vue'

// 状态定义
const activeTab = ref('text')
const qrcodeRef = ref()
const downloadFormat = ref('png')

// 添加一个默认内容
onMounted(() => {
  content.value.text = 'https://example.com'
})

// 内容状态
const content = ref({
  text: '',
  url: '',
  protocol: 'https://',
  vcard: {
    name: '',
    phone: '',
    email: '',
    company: ''
  },
  wifi: {
    ssid: '',
    password: '',
    encryption: 'WPA'
  }
})

// 样式状态
const style = ref({
  size: 200,
  errorLevel: 'M',
  foreground: '#000000',
  background: '#FFFFFF',
  logo: '',
  logoSize: 20
})

// 预设颜色
const colorPresets = [
  '#000000',
  '#FFFFFF',
  '#409EFF',
  '#67C23A',
  '#E6A23C',
  '#F56C6C',
  '#909399'
]

// 计算属性
const qrcodeContent = computed(() => {
  let result = ''
  switch (activeTab.value) {
    case 'url':
      // URL编码处理
      const url = content.value.protocol + content.value.url
      result = /[^\x00-\x7F]/.test(url) ? encodeURI(url) : url
      break
    case 'vcard':
      result = generateVCardContent()
      break
    case 'wifi':
      result = generateWiFiContent()
      break
    default:
      // 文本内容处理，直接使用原始文本
      // 二维码库会自动处理UTF-8编码
      result = content.value.text || ' '
  }
  return result
})

const qrcodeOptions = computed(() => ({
  value: qrcodeContent.value || ' ',
  width: style.value.size,
  height: style.value.size,
  level: style.value.errorLevel,
  color: style.value.foreground,
  backgroundColor: style.value.background,
  renderAs: 'canvas'
}))

const previewStyle = computed(() => ({
  background: style.value.background,
  padding: '2rem',
  borderRadius: '12px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative'
}))

const logoStyle = computed(() => {
  const size = Math.min(style.value.size * (style.value.logoSize / 100), style.value.size * 0.3)
  return {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: `${size}px`,
    height: `${size}px`,
    maxWidth: '30%',
    maxHeight: '30%',
    objectFit: 'contain',
    borderRadius: '50%',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    padding: '2px',
    background: 'white',
    zIndex: 10
  }
})

// 添加一个用于强制更新的key
const qrcodeKey = ref(0)

// 方法定义
const handleInput = () => {
  qrcodeKey.value++ // 强制重新渲染
}

const handleLogoUpload = async (file: File) => {
  try {
    // 检查文件大小
    if (file.size > 1024 * 1024) {
      ElMessage.warning('Logo图片不能大于1MB')
      return false
    }

    // 自动提升容错级别
    if (style.value.errorLevel !== 'H') {
      style.value.errorLevel = 'H'
      ElMessage.info('已自动提升容错级别以支持Logo显示')
    }

    // 创建图片对象
    const img = new Image()
    const reader = new FileReader()

    reader.onload = () => {
      img.src = reader.result as string
      img.onload = () => {
        // 创建canvas进行图片预处理
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // 计算合适的尺寸
        const size = Math.min(img.width, img.height)
        canvas.width = size
        canvas.height = size

        // 绘制圆形裁剪区域
        ctx.beginPath()
        ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2)
        ctx.closePath()
        ctx.clip()

        // 绘制白色背景
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, size, size)

        // 绘制图片
        const scale = size / Math.max(img.width, img.height)
        const x = (size - img.width * scale) / 2
        const y = (size - img.height * scale) / 2
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale)

        // 添加白色边框
        ctx.strokeStyle = 'white'
        ctx.lineWidth = size * 0.05 // 边框宽度为图片尺寸的5%
        ctx.stroke()

        // 更新logo
        style.value.logo = canvas.toDataURL('image/png')
      }
    }
    reader.readAsDataURL(file)
  } catch (error) {
    ElMessage.error('Logo处理失败')
  }
  return false
}

const generateVCardContent = () => {
  const { name, phone, email, company } = content.value.vcard
  // 对中文内容进行编码
  const encodeName = encodeURIComponent(name)
  const encodeCompany = encodeURIComponent(company)

  return `BEGIN:VCARD
VERSION:3.0
FN;CHARSET=UTF-8:${encodeName}
TEL:${phone}
EMAIL:${email}
ORG;CHARSET=UTF-8:${encodeCompany}
END:VCARD`
}

const generateWiFiContent = () => {
  const { ssid, password, encryption } = content.value.wifi
  // 对 SSID 和密码进行编码
  const encodedSsid = encodeURIComponent(ssid)
  const encodedPassword = encodeURIComponent(password)
  
  return `WIFI:T:${encryption};S:${encodedSsid};P:${encodedPassword};;`
}

const downloadQRCode = () => {
  // 获取实际的 canvas 元素
  const qrcodeElement = qrcodeRef.value?.$el
  if (!qrcodeElement) return

  // 尝试多种方式获取 canvas
  let canvas: HTMLCanvasElement | null = null
  
  // 方法1：直接查找
  canvas = qrcodeElement.querySelector('canvas')
  
  // 方法2：如果 qrcodeElement 本身就是 canvas
  if (!canvas && qrcodeElement instanceof HTMLCanvasElement) {
    canvas = qrcodeElement
  }
  
  // 方法3：在子元素中查找
  if (!canvas) {
    const canvasElements = qrcodeElement.getElementsByTagName('canvas')
    if (canvasElements.length > 0) {
      canvas = canvasElements[0]
    }
  }

  // 方法4：查找特定类名（如果 QRCodeVue3 有特定类名的话）
  if (!canvas) {
    canvas = qrcodeElement.querySelector('.qrcode-canvas')
  }

  // 如果还是找不到 canvas，输出更多调试信息
  if (!canvas) {
    console.error('QR Code element structure:', qrcodeElement.innerHTML)
    ElMessage.error('无法获取二维码图像')
    return
  }

  // 确保 canvas 已经渲染完成
  nextTick(() => {
    const link = document.createElement('a')
    link.download = `qrcode.${downloadFormat.value}`
    
    if (downloadFormat.value === 'svg') {
      // 处理SVG下载
      const svgData = generateSVG(canvas!)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      link.href = URL.createObjectURL(blob)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      ElMessage.success('下载成功')
    } else {
      // 处理 PNG/JPG 下载
      const format = downloadFormat.value === 'jpg' ? 'image/jpeg' : 'image/png'
      
      // 创建临时画布以处理带Logo的情况
      const tempCanvas = document.createElement('canvas')
      const ctx = tempCanvas.getContext('2d')
      if (!ctx) return

      // 设置画布尺寸
      tempCanvas.width = canvas!.width || style.value.size
      tempCanvas.height = canvas!.height || style.value.size

      // 确保二维码图像已经绘制完成
      if (canvas!.width > 0 && canvas!.height > 0) {
        // 绘制二维码
        ctx.drawImage(canvas!, 0, 0)

        // 如果有Logo，绘制Logo
        if (style.value.logo) {
          const logoImg = new Image()
          logoImg.crossOrigin = 'anonymous'
          
          // 先将 logo 绘制到临时 canvas 上
          const tempImg = new Image()
          tempImg.crossOrigin = 'anonymous'
          tempImg.src = style.value.logo
          
          tempImg.onload = () => {
            const logoSize = Math.min(tempCanvas.width * (style.value.logoSize / 100), tempCanvas.width * 0.3)
            const logoX = (tempCanvas.width - logoSize) / 2
            const logoY = (tempCanvas.height - logoSize) / 2

            // 绘制Logo
            ctx.save()
            ctx.beginPath()
            ctx.arc(logoX + logoSize/2, logoY + logoSize/2, logoSize/2, 0, Math.PI * 2)
            ctx.closePath()
            ctx.clip()
            ctx.drawImage(tempImg, logoX, logoY, logoSize, logoSize)
            ctx.restore()

            // 获取数据URL并触发下载
            try {
              link.href = tempCanvas.toDataURL(format, 1.0)
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
              ElMessage.success('下载成功')
            } catch (error) {
              console.error('Download error:', error)
              ElMessage.error('下载失败')
            }
          }
          
          tempImg.onerror = () => {
            console.error('Logo load error')
            ElMessage.error('Logo 图片加载失败')
          }
          
          return // Logo 加载是异步的，这里直接返回
        }

        // 如果没有 Logo，直接下载
        try {
          link.href = tempCanvas.toDataURL(format, 1.0)
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          ElMessage.success('下载成功')
        } catch (error) {
          console.error('Download error:', error)
          ElMessage.error('下载失败')
        }
      } else {
        console.error('Canvas dimensions:', canvas!.width, canvas!.height)
        ElMessage.error('二维码尚未渲染完成')
      }
    }
  })
}

const copyQRCode = async () => {
  const canvas = qrcodeRef.value?.$el
  if (!canvas) {
    ElMessage.error('获取二维码失败')
    return
  }

  try {
    // 首先尝试使用新的 Clipboard API
    if (navigator.clipboard && window.ClipboardItem) {
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                [blob.type]: blob
              })
            ])
            ElMessage.success('已复制到剪贴板')
          } catch (error) {
            // 如果新API失败，回退到传统方法
            fallbackCopy(canvas)
          }
        }
      })
    } else {
      // 对于不支持新API的浏览器，直接使用传统方法
      fallbackCopy(canvas)
    }
  } catch (error) {
    ElMessage.error('复制失败，请手动右键复制')
  }
}

const fallbackCopy = (canvas: HTMLCanvasElement) => {
  try {
    // 创建临时图片元素
    const img = document.createElement('img')
    img.src = canvas.toDataURL('image/png')
    
    // 创建临时容器
    const div = document.createElement('div')
    div.contentEditable = 'true'
    div.style.position = 'fixed'
    div.style.opacity = '0'
    div.appendChild(img)
    
    // 添加到文档
    document.body.appendChild(div)
    
    // 选择内容
    const range = document.createRange()
    range.selectNode(div)
    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
    
    // 执行复制
    document.execCommand('copy')
    
    // 清理
    document.body.removeChild(div)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败，请手动右键复制')
  }
}

const generateSVG = (canvas: HTMLCanvasElement) => {
  if (!canvas) return ''

  // 创建SVG元素
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', style.value.size.toString())
  svg.setAttribute('height', style.value.size.toString())
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  
  // 添加背景
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('width', '100%')
  rect.setAttribute('height', '100%')
  rect.setAttribute('fill', style.value.background)
  svg.appendChild(rect)

  // 添加二维码图像
  const image = document.createElementNS('http://www.w3.org/2000/svg', 'image')
  image.setAttribute('width', '100%')
  image.setAttribute('height', '100%')
  image.setAttribute('href', canvas.toDataURL())
  svg.appendChild(image)
  
  // 如果有Logo，添加Logo
  if (style.value.logo) {
    const logo = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    const logoSize = style.value.size * (style.value.logoSize / 100)
    const logoX = (style.value.size - logoSize) / 2
    const logoY = (style.value.size - logoSize) / 2
    
    // 添加圆形剪切路径
    const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath')
    clipPath.setAttribute('id', 'logo-clip')
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
    circle.setAttribute('cx', (logoX + logoSize/2).toString())
    circle.setAttribute('cy', (logoY + logoSize/2).toString())
    circle.setAttribute('r', (logoSize/2).toString())
    clipPath.appendChild(circle)
    svg.appendChild(clipPath)
    
    // 设置Logo
    logo.setAttribute('x', logoX.toString())
    logo.setAttribute('y', logoY.toString())
    logo.setAttribute('width', logoSize.toString())
    logo.setAttribute('height', logoSize.toString())
    logo.setAttribute('href', style.value.logo)
    logo.setAttribute('clip-path', 'url(#logo-clip)')
    svg.appendChild(logo)
  }
  
  return new XMLSerializer().serializeToString(svg)
}

// 添加 Logo 大小限制
watch(() => style.value.logoSize, (newSize) => {
  if (newSize > 30) {
    style.value.logoSize = 30
    ElMessage.warning('Logo大小不能超过30%以确保二维码可识别')
  }
})

// 添加容错级别变化监听
watch(() => style.value.errorLevel, (newLevel, oldLevel) => {
  if (style.value.logo && newLevel !== 'H') {
    ElMessage.warning('使用Logo时建议将容错级别设置为"高"')
  }
})

// 添加容错级别描述函数
const getErrorLevelDesc = (level: string) => {
  const descriptions: Record<string, string> = {
    'L': '低(7%)',
    'M': '中(15%)',
    'Q': '较高(25%)',
    'H': '高(30%)'
  }
  return descriptions[level] || ''
}

// 添加对样式变化的监听
watch(
  [
    () => style.value.size,
    () => style.value.errorLevel,
    () => style.value.foreground,
    () => style.value.background,
    () => style.value.logo,
    () => style.value.logoSize,
    () => qrcodeContent.value
  ],
  () => {
    handleInput()
  },
  { deep: true }
)
</script>

<style scoped>
.qrcode-tool {
  padding: 1.5rem;
  height: 100%;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem;
}

.edit-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-card,
.style-card,
.preview-card,
.actions-card {
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
}

.content-input {
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.style-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.option-group,
.color-group,
.logo-group {
  display: grid;
  gap: 1rem;
}

.option-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: 100%;
}

.preview-content {
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  background: v-bind('style.background');
  transition: background-color 0.3s ease;
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
}

.actions-card {
  margin-top: 1rem;
  padding: 1.5rem;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.download-options {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.download-options :deep(.el-radio-group) {
  display: flex;
  gap: 0.5rem;
}

.download-options :deep(.el-radio-button) {
  --el-radio-button-checked-bg-color: var(--primary-color);
  --el-radio-button-checked-text-color: white;
}

.el-button-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  width: 100%;
}

/* 确保按钮组内的按钮样式正确 */
.el-button-group .el-button {
  flex: 1;
  min-width: 80px;
}

/* 移除之前可能存在的 mt-3 类 */
.mt-3 {
  margin-top: 0;
}

/* 添加响应式布局支持 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 1rem;
  }

  .download-options {
    margin-bottom: 1rem;
  }

  .el-button-group {
    flex-direction: column;
  }

  .el-button-group .el-button {
    width: 100%;
  }
}

.protocol-select {
  width: 100px;
}

/* 暗色模式适配 */
:root.dark .qrcode-tool {
  background: rgba(255, 255, 255, 0.05);
}

:root.dark .preview-content {
  box-shadow: var(--shadow-md);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .qrcode-tool {
    padding: 1rem;
  }

  .el-row {
    flex-direction: column;
  }

  .el-col {
    width: 100% !important;
  }

  .preview-section {
    margin-top: 1.5rem;
  }

  .error-level-group {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 修改 Logo 样式 */
.qrcode-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

/* 添加 Logo 上传按钮样式 */
.logo-upload {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.logo-upload .el-upload {
  width: 100%;
}

.logo-upload .el-button {
  width: 100%;
  justify-content: center;
}

.option-row {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.flex-1 {
  flex: 1;
}

.error-level-group {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.25rem;
  width: 100%;
}

.error-level-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.35rem;
  border-radius: 6px;
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
}

.error-level-item:hover {
  background: var(--bg-hover);
  border-color: var(--primary-color);
}

.error-level-item.active {
  background: var(--primary-color-light);
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.level-label {
  font-weight: 500;
  font-size: 0.9rem;
}

.level-desc {
  font-size: 0.7rem;
  opacity: 0.8;
}

.color-group .option-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.color-group .el-color-picker {
  margin-left: auto;
}

/* 移除原有的容错级别按钮组样式 */
:deep(.error-level-group .el-radio-group) {  /* 只针对容错级别的radio-group */
  display: none;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .option-row {
    flex-direction: column;
    gap: 1rem;
  }
  
  .error-level-group {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style> 