<template>
  <div class="base64-tool">
    <!-- 主操作区 -->
    <div class="main-content">
      <!-- 功能选项卡 -->
      <el-tabs v-model="activeTab" class="function-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="文本编解码" name="text">
          <div class="tab-content">
            <div class="mode-selector">
              <el-radio-group v-model="mode" size="large" @change="handleModeChange">
                <el-radio-button label="encode">编码</el-radio-button>
                <el-radio-button label="decode">解码</el-radio-button>
              </el-radio-group>
            </div>
            
            <!-- 操作栏移到这里 -->
            <div class="actions-bar">
              <el-button-group class="action-group">
                <el-button type="primary" @click="handleConvert" class="action-button">
                  <el-icon><Edit /></el-icon>
                  {{ mode === 'encode' ? '编码' : '解码' }}
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

              <div class="options">
                <el-checkbox v-model="options.urlSafe">URL安全模式</el-checkbox>
                <el-checkbox v-model="options.autoWrap">自动换行</el-checkbox>
                <el-tooltip content="每行字符数" placement="top">
                  <el-input-number 
                    v-model="options.wrapLength" 
                    :min="64" 
                    :max="256" 
                    :step="8"
                    size="small"
                    :disabled="!options.autoWrap"
                  />
                </el-tooltip>
              </div>
            </div>

            <!-- 编辑器区域 -->
            <div class="editor-container">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="editor-wrapper">
                    <div class="editor-label">
                      <span>输入内容</span>
                      <div class="input-stats">
                        <el-tag size="small">{{ inputStats.length }} 字符</el-tag>
                        <el-tag size="small">{{ inputStats.bytes }} 字节</el-tag>
                      </div>
                    </div>
                    <el-input
                      v-model="inputContent"
                      type="textarea"
                      :rows="16"
                      :placeholder="getInputPlaceholder"
                      class="base64-editor"
                      @input="handleInput"
                    />
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="editor-wrapper">
                    <div class="editor-label">
                      <span>转换结果</span>
                      <div class="output-stats">
                        <el-tag size="small">{{ outputStats.length }} 字符</el-tag>
                        <el-tag size="small">{{ outputStats.bytes }} 字节</el-tag>
                      </div>
                    </div>
                    <el-input
                      v-model="outputContent"
                      type="textarea"
                      :rows="16"
                      readonly
                      :placeholder="getOutputPlaceholder"
                      class="base64-editor"
                    />
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="图片转换" name="image">
          <div class="tab-content">
            <div class="image-tools">
              <el-upload
                class="image-uploader"
                :show-file-list="false"
                accept="image/*"
                :before-upload="handleImageUpload"
              >
                <div class="upload-area" v-if="!imageUrl">
                  <el-icon class="upload-icon"><Plus /></el-icon>
                  <span>点击或拖拽图片</span>
                </div>
                <img v-else :src="imageUrl" class="preview-image" />
              </el-upload>
              
              <!-- 添加图片转换结果区域 -->
              <div class="image-result" v-if="imageUrl">
                <div class="result-header">
                  <h4>Base64 编码结果</h4>
                  <div class="result-actions">
                    <el-button type="primary" @click="copyImageResult">
                      <el-icon><CopyDocument /></el-icon>复制
                    </el-button>
                    <el-button @click="clearImage">
                      <el-icon><Delete /></el-icon>清除
                    </el-button>
                  </div>
                </div>
                <el-input
                  v-model="imageBase64"
                  type="textarea"
                  :rows="8"
                  readonly
                  class="base64-editor"
                />
                <div class="result-stats">
                  <el-tag size="small">{{ imageStats.length }} 字符</el-tag>
                  <el-tag size="small">{{ imageStats.bytes }} 字节</el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="文件转换" name="file">
          <div class="tab-content">
            <div class="file-tools">
              <el-upload
                class="file-uploader"
                :show-file-list="false"
                :before-upload="handleFileUpload"
              >
                <div class="upload-area">
                  <el-icon class="upload-icon"><Upload /></el-icon>
                  <span>点击或拖拽文件</span>
                </div>
              </el-upload>

              <!-- 添加文件转换结果区域 -->
              <div class="file-result" v-if="fileInfo.name">
                <div class="result-header">
                  <h4>文件信息</h4>
                  <div class="file-info">
                    <span>{{ fileInfo.name }}</span>
                    <el-tag size="small">{{ fileInfo.size }}</el-tag>
                    <el-tag size="small" type="success">{{ fileInfo.type }}</el-tag>
                  </div>
                </div>
                <div class="result-header">
                  <h4>Base64 编码结果</h4>
                  <div class="result-actions">
                    <el-button type="primary" @click="copyFileResult">
                      <el-icon><CopyDocument /></el-icon>复制
                    </el-button>
                    <el-button @click="clearFile">
                      <el-icon><Delete /></el-icon>清除
                    </el-button>
                  </div>
                </div>
                <el-input
                  v-model="fileBase64"
                  type="textarea"
                  :rows="8"
                  readonly
                  class="base64-editor"
                />
                <div class="result-stats">
                  <el-tag size="small">{{ fileStats.length }} 字符</el-tag>
                  <el-tag size="small">{{ fileStats.bytes }} 字节</el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="使用帮助" name="help">
          <div class="help-tab-content">
            <el-card class="help-section" shadow="never">
              <template #header>
                <div class="help-header">
                  <el-icon><InfoFilled /></el-icon>
                  <span>Base64 编解码工具使用指南</span>
                </div>
              </template>
              
              <div class="help-content">
                <h3>功能介绍</h3>
                <p>Base64是一种基于64个可打印字符来表示二进制数据的编码方式，本工具提供以下功能：</p>
                <ul>
                  <li>文本编解码：支持Unicode字符编码，自动处理中文等多字节字符</li>
                  <li>图片转换：支持将图片转换为Base64格式，方便在网页中使用</li>
                  <li>文件转换：支持任意文件的Base64编码，适用于文件传输场景</li>
                  <li>URL安全模式：将标准Base64中的'+'和'/'替换为'-'和'_'，适用于URL传输</li>
                </ul>

                <h3>常见使用场景</h3>
                <el-collapse>
                  <el-collapse-item title="1. 网页图片嵌入" name="1">
                    <div class="usage-example">
                      <p>将图片转换为Base64后可直接嵌入HTML中，无需额外的图片请求：</p>
                      <pre>&lt;img src="data:image/png;base64,iVBORw0KGgoAAAANSU..." /&gt;</pre>
                    </div>
                  </el-collapse-item>
                  
                  <el-collapse-item title="2. API数据传输" name="2">
                    <div class="usage-example">
                      <p>用于传输二进制数据或包含特殊字符的文本：</p>
                      <pre>{
  "file": "base64EncodedContent...",
  "encoding": "base64"
}</pre>
                    </div>
                  </el-collapse-item>
                  
                  <el-collapse-item title="3. URL参数传递" name="3">
                    <div class="usage-example">
                      <p>使用URL安全模式传递复杂参数：</p>
                      <pre>https://api.example.com/data?payload=SGVsbG8sIFdvcmxkIQ</pre>
                    </div>
                  </el-collapse-item>
                </el-collapse>

                <h3>使用技巧</h3>
                <div class="tips-section">
                  <div class="tip-item">
                    <el-icon><Reading /></el-icon>
                    <div class="tip-content">
                      <h4>自动换行</h4>
                      <p>对于长字符串，建议开启自动换行功能，默认每76个字符换行，符合邮件等场景的规范。</p>
                    </div>
                  </div>
                  
                  <div class="tip-item">
                    <el-icon><Warning /></el-icon>
                    <div class="tip-content">
                      <h4>解码注意事项</h4>
                      <p>解码时会自动移除输入中的换行和空格，无需手动处理。如遇解码错误，请检查输入是否为有效的Base64字符串。</p>
                    </div>
                  </div>
                  
                  <div class="tip-item">
                    <el-icon><Monitor /></el-icon>
                    <div class="tip-content">
                      <h4>图片大小建议</h4>
                      <p>建议仅将小型图片（建议小于50KB）转换为Base64，过大的Base64字符串可能影响性能。</p>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Edit,
  Document as CopyDocument,
  Delete,
  DocumentAdd,
  Upload,
  Plus,
  InfoFilled,
  Connection,
  Warning,
  Setting
} from '@element-plus/icons-vue'

// 状态定义
const activeTab = ref('text')
const mode = ref('encode')
const inputContent = ref('')
const outputContent = ref('')
const imageUrl = ref('')
const imageBase64 = ref('')
const fileBase64 = ref('')
const fileInfo = ref({
  name: '',
  size: '',
  type: ''
})
const options = ref({
  urlSafe: false,
  autoWrap: false,
  wrapLength: 76
})

// 示例数据
const samples = {
  text: 'Hello, World! 你好，世界！',
  image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgA...',
  file: 'Base64 encoded file content...'
}

// 计算属性
const inputStats = computed(() => ({
  length: inputContent.value.length,
  bytes: new Blob([inputContent.value]).size
}))

const outputStats = computed(() => ({
  length: outputContent.value.length,
  bytes: new Blob([outputContent.value]).size
}))

const imageStats = computed(() => ({
  length: imageBase64.value.length,
  bytes: new Blob([imageBase64.value]).size
}))

const fileStats = computed(() => ({
  length: fileBase64.value.length,
  bytes: new Blob([fileBase64.value]).size
}))

const getInputPlaceholder = computed(() => {
  switch (activeTab.value) {
    case 'text':
      return mode.value === 'encode' ? '请输入要编码的文本...' : '请输入要解码的Base64字符串...'
    case 'image':
      return '请选择要转换的图片...'
    case 'file':
      return '请选择要转换的文件...'
    default:
      return ''
  }
})

const getOutputPlaceholder = computed(() => {
  return mode.value === 'encode' ? 'Base64编码结果...' : '解码结果...'
})

// 方法定义
const handleConvert = () => {
  if (!inputContent.value) {
    return
  }

  try {
    if (mode.value === 'encode') {
      let result = btoa(unescape(encodeURIComponent(inputContent.value)))
      if (options.value.urlSafe) {
        result = result.replace(/\+/g, '-').replace(/\//g, '_')
      }
      if (options.value.autoWrap) {
        result = result.replace(new RegExp(`.{${options.value.wrapLength}}`, 'g'), '$&\n')
      }
      outputContent.value = result
    } else {
      let input = inputContent.value
      if (options.value.urlSafe) {
        input = input.replace(/-/g, '+').replace(/_/g, '/')
      }
      outputContent.value = decodeURIComponent(escape(atob(input)))
    }
  } catch (error) {
    ElMessage.error('解码失败，请检查输入是否为有效的Base64字符串')
  }
}

const handleImageUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target?.result as string
    imageBase64.value = (e.target?.result as string).split(',')[1]
  }
  reader.readAsDataURL(file)
  return false
}

const handleFileUpload = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    fileBase64.value = result.split(',')[1] || result
    fileInfo.value = {
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type || '未知类型'
    }
  }
  reader.readAsDataURL(file)
  return false
}

const copyImageResult = async () => {
  if (!imageBase64.value) return
  try {
    await navigator.clipboard.writeText(imageBase64.value)
    ElMessage.success('已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const copyFileResult = async () => {
  if (!fileBase64.value) return
  try {
    await navigator.clipboard.writeText(fileBase64.value)
    ElMessage.success('已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const loadSample = () => {
  inputContent.value = samples[activeTab.value as keyof typeof samples]
}

const copyResult = async () => {
  if (!outputContent.value) {
    return
  }
  try {
    await navigator.clipboard.writeText(outputContent.value)
    ElMessage.success('已复制')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearContent = () => {
  inputContent.value = ''
  outputContent.value = ''
  imageUrl.value = ''
  imageBase64.value = ''
  fileBase64.value = ''
  fileInfo.value = {
    name: '',
    size: '',
    type: ''
  }
}

const clearImage = () => {
  imageUrl.value = ''
  imageBase64.value = ''
}

const clearFile = () => {
  fileBase64.value = ''
  fileInfo.value = {
    name: '',
    size: '',
    type: ''
  }
}

const handleTabChange = () => {
  clearContent()
}

const handleModeChange = () => {
  clearContent()
}

const handleInput = () => {
  if (mode.value === 'decode') {
    // 自动移除换行符和空格
    inputContent.value = inputContent.value.replace(/[\r\n\s]/g, '')
  }
}

// 文件大小格式化工具函数
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 监听器
watch([() => options.value.autoWrap, () => options.value.wrapLength], () => {
  if (outputContent.value) {
    handleConvert()
  }
})
</script>

<style scoped>
.base64-tool {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.function-tabs {
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 1rem;
}

.tab-content {
  padding: 1rem 0;
}

.mode-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
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
  padding: 1.25rem;
  border-radius: 8px;
}

.editor-wrapper {
  position: relative;
}

.editor-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.input-stats,
.output-stats {
  display: flex;
  gap: 0.5rem;
}

.base64-editor {
  font-family: "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  border-radius: 6px;
}

.base64-editor :deep(.el-textarea__inner) {
  font-family: "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 0.875rem;
  line-height: 1.5;
}

.help-tab-content {
  padding: 1rem;
}

.help-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.help-content {
  color: var(--el-text-color-regular);
}

.help-content h3 {
  margin: 1.5rem 0 1rem;
  font-size: 1.1rem;
  color: var(--el-text-color-primary);
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 0.5rem;
}

.help-content h3:first-child {
  margin-top: 0;
}

.help-content ul {
  padding-left: 1.5rem;
  margin: 1rem 0;
}

.help-content li {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.usage-example {
  background: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 1rem;
  margin: 0.5rem 0;
}

.usage-example pre {
  background: var(--el-bg-color);
  padding: 0.75rem;
  border-radius: 4px;
  margin: 0.5rem 0;
  overflow-x: auto;
  font-family: monospace;
}

.tips-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.tip-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  transition: all 0.3s ease;
}

.tip-item:hover {
  transform: translateX(4px);
  background: var(--el-fill-color);
}

.tip-item .el-icon {
  font-size: 1.5rem;
  color: var(--el-color-primary);
  flex-shrink: 0;
}

.tip-content h4 {
  margin: 0 0 0.5rem;
  color: var(--el-text-color-primary);
}

.tip-content p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

/* 暗色模式适配 */
:root.dark .usage-example pre {
  background: var(--el-bg-color-overlay);
}

:root.dark .tip-item {
  background: var(--el-bg-color-overlay);
}

:root.dark .tip-item:hover {
  background: var(--el-bg-color);
}

.image-tools,
.file-tools {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-area {
  width: 300px;
  height: 200px;
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: var(--el-color-primary);
  background: var(--bg-secondary);
}

.upload-icon {
  font-size: 2rem;
  color: var(--text-secondary);
}

.preview-image {
  width: 300px;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
}

.image-result,
.file-result {
  width: 100%;
  margin-top: 1.5rem;
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.result-header h4 {
  margin: 0;
  font-size: 1rem;
  color: var(--el-text-color-primary);
}

.result-actions {
  display: flex;
  gap: 0.5rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--el-text-color-regular);
}

.result-stats {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* 暗色模式适配 */
:root.dark .image-result,
:root.dark .file-result {
  background: var(--el-bg-color-overlay);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style> 