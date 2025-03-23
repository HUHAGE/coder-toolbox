<template>
 
    <div class="aes-tool">
      <!-- 操作栏 -->
      <div class="actions-bar">
        <el-button-group class="action-group">
          <el-button @click="clearContent" class="action-button">
            <el-icon><Delete /></el-icon>清空
          </el-button>
          <el-button @click="showGuide = true" class="action-button">
            <el-icon><QuestionFilled /></el-icon>使用说明
          </el-button>
        </el-button-group>
      </div>

      <!-- 加密选项 -->
      <div class="encryption-options">
        <el-form :model="options" label-position="top" class="options-form">
          <el-row :gutter="20">
            <el-col :span="6">
              <el-form-item label="运算模式">
                <el-select v-model="options.mode" class="option-select">
                  <el-option label="CBC (密码分组链接)" value="CBC" />
                  <el-option label="ECB (电子密码本)" value="ECB" />
                  <el-option label="CFB (密文反馈)" value="CFB" />
                  <el-option label="OFB (输出反馈)" value="OFB" />
                  <el-option label="CTR (计数器)" value="CTR" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="填充模式">
                <el-select v-model="options.padding" class="option-select">
                  <el-option label="PKCS7" value="PKCS7" />
                  <el-option label="ZeroPadding" value="ZeroPadding" />
                  <el-option label="NoPadding" value="NoPadding" />
                  <el-option label="ISO10126" value="ISO10126" />
                  <el-option label="AnsiX923" value="AnsiX923" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="密钥长度">
                <el-select v-model="options.keySize" class="option-select">
                  <el-option label="128 bits" value="128" />
                  <el-option label="192 bits" value="192" />
                  <el-option label="256 bits" value="256" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="输出格式">
                <el-select v-model="options.outputFormat" class="option-select">
                  <el-option label="Base64" value="base64" />
                  <el-option label="Hex" value="hex" />
                  <el-option label="UTF-8" value="utf8" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 密钥和向量输入 -->
      <div class="key-iv-section">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="input-wrapper">
              <div class="input-label">
                <span>密钥 (Key)</span>
                <el-button size="small" @click="generateKey">生成随机密钥</el-button>
              </div>
              <el-input
                v-model="key"
                :type="showKey ? 'text' : 'password'"
                class="key-input"
                :maxlength="parseInt(options.keySize)/8"
              >
                <template #suffix>
                  <el-icon class="input-icon" @click="showKey = !showKey">
                    <View v-if="showKey" />
                    <Hide v-else />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </el-col>
          <el-col :span="12" v-if="options.mode !== 'ECB'">
            <div class="input-wrapper">
              <div class="input-label">
                <span>初始向量 (IV)</span>
                <el-button size="small" @click="generateIV">生成随机IV</el-button>
              </div>
              <el-input
                v-model="iv"
                :type="showIV ? 'text' : 'password'"
                class="iv-input"
                :maxlength="16"
              >
                <template #suffix>
                  <el-icon class="input-icon" @click="showIV = !showIV">
                    <View v-if="showIV" />
                    <Hide v-else />
                  </el-icon>
                </template>
              </el-input>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 编辑器区域 -->
      <div class="editor-container">
        <!-- 加密解密操作按钮 -->
        <div class="operation-buttons">
          <el-button-group>
            <el-button type="primary" @click="encrypt" class="action-button">
              <el-icon><Lock /></el-icon>加密
            </el-button>
            <el-button type="primary" @click="decrypt" class="action-button">
              <el-icon><Unlock /></el-icon>解密
            </el-button>
          </el-button-group>
        </div>

        <el-row :gutter="20">
          <el-col :span="12">
            <div class="editor-wrapper">
              <div class="editor-label">
                <span>输入文本</span>
                <div class="input-stats">
                  <el-tag size="small">{{ inputStats.length }} 字符</el-tag>
                  <el-tag size="small">{{ inputStats.bytes }} 字节</el-tag>
                </div>
              </div>
              <div class="textarea-with-copy">
                <el-input
                  v-model="inputContent"
                  type="textarea"
                  :rows="12"
                  placeholder="请输入要加密/解密的文本..."
                  class="aes-editor"
                />
                <el-button
                  v-if="inputContent"
                  class="copy-button"
                  size="small"
                  @click="copyToClipboard(inputContent, '输入内容已复制')"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="editor-wrapper">
              <div class="editor-label">
                <span>输出结果</span>
                <div class="input-stats">
                  <el-tag size="small">{{ outputStats.length }} 字符</el-tag>
                  <el-tag size="small">{{ outputStats.bytes }} 字节</el-tag>
                </div>
              </div>
              <div class="textarea-with-copy">
                <el-input
                  v-model="outputContent"
                  type="textarea"
                  :rows="12"
                  readonly
                  placeholder="加密/解密结果..."
                  class="aes-editor"
                />
                <el-button
                  v-if="outputContent"
                  class="copy-button"
                  size="small"
                  @click="copyToClipboard(outputContent, '输出内容已复制')"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 历史记录抽屉 -->
      <el-drawer
        v-model="showHistory"
        title="历史记录"
        direction="rtl"
        size="50%"
      >
        <div class="history-content">
          <el-empty v-if="history.length === 0" description="暂无历史记录" />
          <el-timeline v-else>
            <el-timeline-item
              v-for="(item, index) in history"
              :key="index"
              :timestamp="item.timestamp"
              placement="top"
            >
              <el-card>
                <h4>{{ item.type === 'encrypt' ? '加密' : '解密' }}</h4>
                <p class="history-text">输入: {{ item.input }}</p>
                <p class="history-text">输出: {{ item.output }}</p>
                <p class="history-options">
                  模式: {{ item.options.mode }} | 
                  填充: {{ item.options.padding }} | 
                  密钥长度: {{ item.options.keySize }} bits
                </p>
                <div class="history-actions">
                  <el-button size="small" @click="restoreHistory(item)">还原</el-button>
                  <el-button size="small" type="danger" @click="removeHistory(index)">删除</el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-drawer>

      <!-- 使用说明对话框 -->
      <el-dialog
        v-model="showGuide"
        title="AES 加密使用说明"
        width="800px"
        class="guide-dialog"
      >
        <div class="guide-content">
          <section class="guide-section">
            <h3>什么是 AES？</h3>
            <p>AES（Advanced Encryption Standard，又称 Rijndael 加密法）是一种对称加密算法。这个标准用来替代原先的 DES（Data Encryption Standard），具有更高的安全性。</p>
            <p>AES 算法采用固定长度的密钥（128 bits、192 bits 或 256 bits）来加密和解密数据块，加密和解密过程都是基于矩阵运算和字节替换等操作进行的。</p>
          </section>

          <section class="guide-section">
            <h3>运算模式</h3>
            <div class="mode-list">
              <div class="mode-item">
                <h4>CBC（密码块链）</h4>
                <p>最常用的加密模式，每个密文块依赖前一个分组。需要初始化向量（IV），不能并行处理。</p>
              </div>
              <div class="mode-item">
                <h4>ECB（电子密码本）</h4>
                <p>最简单的加密模式，每个块独立加密。可并行计算，但安全性较差。</p>
              </div>
              <div class="mode-item">
                <h4>CFB（密码反馈）</h4>
                <p>将块密码转换为流密码，支持逐位加密。对传输错误敏感。</p>
              </div>
              <div class="mode-item">
                <h4>OFB（输出反馈）</h4>
                <p>使用初始向量生成密钥流，适用于实时加密。不需要填充。</p>
              </div>
              <div class="mode-item">
                <h4>CTR（计数器）</h4>
                <p>使用计数器生成密钥流，支持并行处理，适用于实时加密。</p>
              </div>
            </div>
          </section>

          <section class="guide-section">
            <h3>填充模式</h3>
            <div class="padding-list">
              <div class="padding-item">
                <h4>PKCS7</h4>
                <p>填充字符串由一个字节序列组成，每个字节填充该字节序列的长度。</p>
              </div>
              <div class="padding-item">
                <h4>ZeroPadding</h4>
                <p>使用零字节进行填充。</p>
              </div>
              <div class="padding-item">
                <h4>NoPadding</h4>
                <p>不进行填充，要求输入数据必须是块大小的整数倍。</p>
              </div>
              <div class="padding-item">
                <h4>AnsiX923</h4>
                <p>最后一个字节是填充长度，其余填充字节为零。</p>
              </div>
              <div class="padding-item">
                <h4>ISO10126</h4>
                <p>最后一个字节是填充长度，其余填充字节为随机数。</p>
              </div>
            </div>
          </section>

          <section class="guide-section">
            <h3>使用建议</h3>
            <ul class="tips-list">
              <li>推荐使用 CBC 模式，它提供了良好的安全性。</li>
              <li>密钥长度建议使用 256 bits 以获得最高安全性。</li>
              <li>除 ECB 模式外，其他模式都需要设置初始向量（IV）。</li>
              <li>建议使用 PKCS7 填充，它是最常用的填充方式。</li>
              <li>Base64 输出格式适合在网络传输中使用。</li>
            </ul>
          </section>
        </div>
      </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import CryptoJS from 'crypto-js'
import ToolLayout from '../ToolLayout.vue'
import aesIcon from '@/assets/icons/aes.svg'
import { 
  Lock,
  Unlock,
  Document as CopyDocument,
  Delete,
  View,
  Hide,
  Timer,
  QuestionFilled
} from '@element-plus/icons-vue'

// 状态定义
const inputContent = ref('')
const outputContent = ref('')
const key = ref('')
const iv = ref('')
const showKey = ref(false)
const showIV = ref(false)
const showHistory = ref(false)
const showGuide = ref(false)
const history = ref<any[]>([])

// 加密选项
const options = ref({
  mode: 'CBC',
  padding: 'PKCS7',
  keySize: '128',
  outputFormat: 'base64'
})

// 计算输入输出统计
const inputStats = computed(() => ({
  length: inputContent.value.length,
  bytes: new Blob([inputContent.value]).size
}))

const outputStats = computed(() => ({
  length: outputContent.value.length,
  bytes: new Blob([outputContent.value]).size
}))

// 生成随机密钥
const generateKey = () => {
  const keySize = parseInt(options.value.keySize) / 8
  const randomKey = CryptoJS.lib.WordArray.random(keySize)
  key.value = randomKey.toString()
  ElMessage.success('已生成随机密钥')
}

// 生成随机IV
const generateIV = () => {
  const randomIV = CryptoJS.lib.WordArray.random(16)
  iv.value = randomIV.toString()
  ElMessage.success('已生成随机IV')
}

// 加密方法
const encrypt = () => {
  if (!inputContent.value) {
    ElMessage.warning('请输入要加密的内容')
    return
  }
  if (!key.value) {
    ElMessage.warning('请输入密钥')
    return
  }
  if (options.value.mode !== 'ECB' && !iv.value) {
    ElMessage.warning('请输入初始向量')
    return
  }

  try {
    // 转换密钥和IV为WordArray
    const keyWordArray = CryptoJS.enc.Utf8.parse(key.value)
    const ivWordArray = options.value.mode !== 'ECB' 
      ? CryptoJS.enc.Utf8.parse(iv.value)
      : CryptoJS.lib.WordArray.create()

    // 配置加密选项
    const cfg: any = {
      iv: ivWordArray
    }

    // 设置加密模式
    switch (options.value.mode) {
      case 'CBC':
        cfg.mode = CryptoJS.mode.CBC
        break
      case 'ECB':
        cfg.mode = CryptoJS.mode.ECB
        break
      case 'CFB':
        cfg.mode = CryptoJS.mode.CFB
        break
      case 'OFB':
        cfg.mode = CryptoJS.mode.OFB
        break
      case 'CTR':
        cfg.mode = CryptoJS.mode.CTR
        break
    }

    // 设置填充方式
    switch (options.value.padding) {
      case 'PKCS7':
        cfg.padding = CryptoJS.pad.Pkcs7
        break
      case 'ZeroPadding':
        cfg.padding = CryptoJS.pad.ZeroPadding
        break
      case 'NoPadding':
        cfg.padding = CryptoJS.pad.NoPadding
        break
      case 'AnsiX923':
        cfg.padding = CryptoJS.pad.Ansix923
        break
      case 'ISO10126':
        cfg.padding = CryptoJS.pad.Iso10126
        break
    }

    // 执行加密
    const encrypted = CryptoJS.AES.encrypt(inputContent.value, keyWordArray, cfg)

    // 根据选择的输出格式转换结果
    switch (options.value.outputFormat) {
      case 'base64':
        outputContent.value = encrypted.toString()
        break
      case 'hex':
        outputContent.value = encrypted.ciphertext.toString(CryptoJS.enc.Hex)
        break
      case 'utf8':
        outputContent.value = encrypted.toString(CryptoJS.enc.Utf8)
        break
    }
    
    // 添加到历史记录
    addToHistory('encrypt')
    ElMessage.success('加密成功')
  } catch (error) {
    console.error('加密错误:', error)
    ElMessage.error('加密失败：' + error.message)
  }
}

// 解密方法
const decrypt = () => {
  if (!inputContent.value) {
    ElMessage.warning('请输入要解密的内容')
    return
  }
  if (!key.value) {
    ElMessage.warning('请输入密钥')
    return
  }
  if (options.value.mode !== 'ECB' && !iv.value) {
    ElMessage.warning('请输入初始向量')
    return
  }

  try {
    // 转换密钥和IV为WordArray
    const keyWordArray = CryptoJS.enc.Utf8.parse(key.value)
    const ivWordArray = options.value.mode !== 'ECB'
      ? CryptoJS.enc.Utf8.parse(iv.value)
      : CryptoJS.lib.WordArray.create()

    // 配置解密选项
    const cfg: any = {
      iv: ivWordArray
    }

    // 设置解密模式
    switch (options.value.mode) {
      case 'CBC':
        cfg.mode = CryptoJS.mode.CBC
        break
      case 'ECB':
        cfg.mode = CryptoJS.mode.ECB
        break
      case 'CFB':
        cfg.mode = CryptoJS.mode.CFB
        break
      case 'OFB':
        cfg.mode = CryptoJS.mode.OFB
        break
      case 'CTR':
        cfg.mode = CryptoJS.mode.CTR
        break
    }

    // 设置填充方式
    switch (options.value.padding) {
      case 'PKCS7':
        cfg.padding = CryptoJS.pad.Pkcs7
        break
      case 'ZeroPadding':
        cfg.padding = CryptoJS.pad.ZeroPadding
        break
      case 'NoPadding':
        cfg.padding = CryptoJS.pad.NoPadding
        break
      case 'AnsiX923':
        cfg.padding = CryptoJS.pad.Ansix923
        break
      case 'ISO10126':
        cfg.padding = CryptoJS.pad.Iso10126
        break
    }

    // 根据输入格式处理密文
    let ciphertext
    switch (options.value.outputFormat) {
      case 'base64':
        ciphertext = inputContent.value
        break
      case 'hex':
        ciphertext = CryptoJS.enc.Hex.parse(inputContent.value)
        ciphertext = CryptoJS.lib.CipherParams.create({
          ciphertext: ciphertext
        })
        break
      case 'utf8':
        ciphertext = inputContent.value
        break
    }

    // 执行解密
    const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWordArray, cfg)
    
    // 转换为UTF-8字符串
    outputContent.value = decrypted.toString(CryptoJS.enc.Utf8)
    
    // 添加到历史记录
    addToHistory('decrypt')
    ElMessage.success('解密成功')
  } catch (error) {
    console.error('解密错误:', error)
    ElMessage.error('解密失败：' + error.message)
  }
}

// 复制结果
const copyResult = async () => {
  if (!outputContent.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  try {
    await navigator.clipboard.writeText(outputContent.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 清空内容
const clearContent = () => {
  inputContent.value = ''
  outputContent.value = ''
  ElMessage.success('已清空')
}

// 添加到历史记录
const addToHistory = (type: 'encrypt' | 'decrypt') => {
  history.value.unshift({
    type,
    input: inputContent.value,
    output: outputContent.value,
    options: { ...options.value },
    key: key.value,
    iv: iv.value,
    timestamp: new Date().toLocaleString()
  })
  
  // 限制历史记录数量
  if (history.value.length > 10) {
    history.value.pop()
  }
}

// 还原历史记录
const restoreHistory = (item: any) => {
  inputContent.value = item.input
  outputContent.value = item.output
  options.value = { ...item.options }
  key.value = item.key
  iv.value = item.iv
  ElMessage.success('已还原历史记录')
}

// 删除历史记录
const removeHistory = (index: number) => {
  history.value.splice(index, 1)
  ElMessage.success('已删除历史记录')
}

// 添加复制到剪贴板的方法
const copyToClipboard = async (text: string, message: string = '复制成功') => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(message)
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.aes-tool {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  box-shadow: 0 2px 12px var(--shadow-color);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.actions-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.action-group {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  height: auto;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: -0.2px;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.action-button:active {
  transform: scale(0.97);
}

.encryption-options {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--shadow-color);
}

.options-form {
  width: 100%;
}

.option-select {
  width: 100%;
}

.key-iv-section {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px var(--shadow-color);
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -0.3px;
}

.input-icon {
  cursor: pointer;
  color: var(--text-secondary);
}

.editor-container {
  background: var(--bg-primary);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 1px 3px var(--shadow-color);
}

.editor-wrapper {
  position: relative;
}

.editor-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  letter-spacing: -0.3px;
}

.input-stats {
  display: flex;
  gap: 0.5rem;
}

.aes-editor {
  border-radius: 8px;
  font-family: monospace;
}

.history-content {
  padding: 1rem;
}

.history-text {
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  word-break: break-all;
}

.history-options {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.history-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.guide-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 24px;
  }
}

.guide-content {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 12px;
}

.guide-section {
  margin-bottom: 2rem;

  h3 {
    color: var(--primary-color);
    font-size: 1.25rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color);
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0.5rem 0;
  }
}

.mode-list,
.padding-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.mode-item,
.padding-item {
  background: var(--bg-secondary);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--border-color);

  h4 {
    color: var(--text-primary);
    margin: 0 0 0.5rem;
    font-size: 1rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.5;
  }
}

.tips-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;

  li {
    position: relative;
    padding-left: 1.5rem;
    margin: 0.75rem 0;
    color: var(--text-secondary);
    line-height: 1.5;

    &::before {
      content: "•";
      color: var(--primary-color);
      position: absolute;
      left: 0.5rem;
      font-weight: bold;
    }
  }
}

:root.dark {
  .mode-item,
  .padding-item {
    background: var(--bg-tertiary);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.guide-dialog {
  :deep(.el-dialog) {
    transform: translateY(-20px);
    opacity: 0;
    transition: all 0.3s ease-out;
  }

  :deep(.el-dialog.dialog-fade-enter-active) {
    transform: translateY(0);
    opacity: 1;
  }
}

.mode-item,
.padding-item {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

:deep(.el-form-item__label) {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text-primary);
  letter-spacing: -0.3px;
  margin-bottom: 4px;
}

:deep(.el-select .el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 1px 2px var(--shadow-color);
  transition: all 0.3s ease;
}

:deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 2px 4px var(--shadow-color);
}

:deep(.el-textarea__inner) {
  border-radius: 12px;
  padding: 1rem;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  line-height: 1.6;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
}

:deep(.el-textarea__inner:hover) {
  border-color: var(--primary-color);
}

:deep(.el-textarea__inner:focus) {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(var(--primary-color-rgb), 0.1);
}

:deep(.el-tag) {
  border-radius: 6px;
  padding: 4px 8px;
  font-weight: 500;
  letter-spacing: -0.2px;
}

:root.dark {
  .aes-tool {
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  }

  .encryption-options,
  .key-iv-section,
  .editor-container {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  :deep(.el-textarea__inner) {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }

  :deep(.el-textarea__inner:hover) {
    border-color: var(--primary-color);
  }
}

@media (max-width: 768px) {
  .aes-tool {
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .editor-container {
    padding: 1.5rem;
  }

  .encryption-options,
  .key-iv-section {
    padding: 1rem;
  }
}

.textarea-with-copy {
  position: relative;
  width: 100%;
}

.copy-button {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: all 0.3s ease-in-out;
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  border: none;
  color: white;
  cursor: pointer;
  z-index: 2;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.textarea-with-copy:hover .copy-button {
  opacity: 1;
  transform: scale(1);
}

.copy-button:hover {
  transform: scale(1.1);
  background-color: var(--el-color-primary-light-3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.copy-button:active {
  transform: scale(0.95);
}

.copy-button .el-icon {
  font-size: 16px;
  width: 16px;
  height: 16px;
}

/* 调整输入框右侧内边距，为复制按钮留出空间 */
.el-input__wrapper {
  padding-right: 48px !important;
}

/* 确保复制按钮在密码输入框的查看按钮旁边 */
.el-input--password .copy-button {
  right: 40px;
}

/* 添加加密解密按钮的样式 */
.operation-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.operation-buttons .el-button-group {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.operation-buttons .action-button {
  padding: 8px 24px;
  font-size: 1rem;
  height: auto;
  border: none;
  position: relative;
}

.operation-buttons .action-button:first-child {
  border-right: 2px solid rgba(255, 255, 255, 0.2);
}

.operation-buttons .action-button .el-icon {
  font-size: 1.1rem;
  margin-right: 4px;
}

/* 修改普通按钮样式，添加蓝色边框 */
.action-button:not(.el-button--primary):not(.el-button--success) {
  border: 1px solid var(--el-color-primary);
  color: var(--el-color-primary);
}

.action-button:not(.el-button--primary):not(.el-button--success):hover {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-3);
  color: var(--el-color-primary-light-3);
}
</style> 