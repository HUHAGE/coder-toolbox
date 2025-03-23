<template>
  <div class="rsa-tool">
    <!-- 顶部操作栏 -->
    <div class="tool-section actions-section">
      <div class="actions-bar">
        <el-button-group class="action-group">
          <el-button @click="clearContent" class="action-button">
            <el-icon><Delete /></el-icon>清空
          </el-button>
          <el-button @click="showGuide = true" class="action-button">
            <el-icon><QuestionFilled /></el-icon>使用说明
          </el-button>
        </el-button-group>

        <el-button-group class="action-group">
          <el-button type="success" @click="generateKeyPair" class="action-button">
            <el-icon><Key /></el-icon>生成密钥对
          </el-button>
          <el-button @click="showKeyManager = true" class="action-button">
            <el-icon><Files /></el-icon>密钥管理
          </el-button>
        </el-button-group>
      </div>

      <!-- 加密选项 -->
      <div class="encryption-options">
        <el-form :model="options" label-position="top" class="options-form">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="密钥长度">
                <el-select v-model="options.keySize" class="option-select">
                  <el-option label="512 bits" value="512" />
                  <el-option label="1024 bits" value="1024" />
                  <el-option label="2048 bits" value="2048" />
                  <el-option label="4096 bits" value="4096" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="填充方式">
                <el-select v-model="options.padding" class="option-select">
                  <el-option label="PKCS1Padding" value="PKCS1Padding" />
                  <el-option label="OAEPWithSHA-1" value="OAEPWithSHA-1" />
                  <el-option label="OAEPWithSHA-256" value="OAEPWithSHA-256" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="输出格式">
                <el-select v-model="options.outputFormat" class="option-select">
                  <el-option label="Base64" value="base64" />
                  <el-option label="Hex" value="hex" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </div>

    <!-- 中间密钥区域 -->
    <div class="tool-section keys-section">
      <el-tabs v-model="activeKeyTab" class="key-tabs">
        <el-tab-pane label="文本输入" name="text">
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="key-card">
                <div class="key-card-header">
                  <span class="key-title">公钥</span>
                  <el-button size="small" @click="importPublicKey">导入公钥</el-button>
                </div>
                <div class="key-card-body">
                  <div class="textarea-with-copy">
                    <el-input
                      v-model="publicKey"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入PEM格式的公钥..."
                      class="key-input"
                    />
                    <el-button
                      v-if="publicKey"
                      class="key-copy-button"
                      size="small"
                      @click="copyToClipboard(publicKey, '公钥已复制')"
                    >
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="key-card">
                <div class="key-card-header">
                  <span class="key-title">私钥</span>
                  <div class="key-actions">
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click="parsePrivateKey"
                      :disabled="!privateKey"
                    >
                      <el-icon><Key /></el-icon>
                      解析公钥
                    </el-button>
                    <el-button size="small" @click="importPrivateKey">导入私钥</el-button>
                  </div>
                </div>
                <div class="key-card-body">
                  <div class="textarea-with-copy">
                    <el-input
                      v-model="privateKey"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入PEM格式的私钥..."
                      class="key-input"
                      :type="showPrivateKey ? 'textarea' : 'password'"
                    >
                      <template #suffix>
                        <el-icon class="input-icon" @click="showPrivateKey = !showPrivateKey">
                          <View v-if="showPrivateKey" />
                          <Hide v-else />
                        </el-icon>
                      </template>
                    </el-input>
                    <el-button
                      v-if="privateKey"
                      class="key-copy-button"
                      size="small"
                      @click="copyToClipboard(privateKey, '私钥已复制')"
                    >
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-tab-pane>
        <el-tab-pane label="文件导入" name="file">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-upload
                class="key-upload"
                drag
                action=""
                :auto-upload="false"
                :show-file-list="false"
                @change="handlePublicKeyFileUpload"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  拖拽公钥文件到此处或 <em>点击上传</em>
                </div>
              </el-upload>
            </el-col>
            <el-col :span="12">
              <el-upload
                class="key-upload"
                drag
                action=""
                :auto-upload="false"
                :show-file-list="false"
                @change="handlePrivateKeyFileUpload"
              >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                  拖拽私钥文件到此处或 <em>点击上传</em>
                </div>
              </el-upload>
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 底部加密解密区域 -->
    <div class="tool-section editor-section">
      <div class="editor-header">
        <el-button-group class="encryption-actions">
          <el-button type="primary" @click="encrypt" class="action-button">
            <el-icon><Lock /></el-icon>加密
          </el-button>
          <el-button type="primary" @click="decrypt" class="action-button">
            <el-icon><Unlock /></el-icon>解密
          </el-button>
        </el-button-group>
      </div>

      <div class="editor-content">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="editor-wrapper">
              <div class="editor-label">
                <span>输入文本</span>
                <div class="editor-actions">
                  <div class="input-stats">
                    <el-tag size="small">{{ inputStats.length }} 字符</el-tag>
                    <el-tag size="small">{{ inputStats.bytes }} 字节</el-tag>
                  </div>
                </div>
              </div>
              <div class="editor-container">
                <div ref="inputEditorContainer" class="monaco-editor"></div>
                <el-button
                  v-if="inputContent"
                  class="key-copy-button"
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
              <div class="editor-container">
                <div ref="outputEditorContainer" class="monaco-editor"></div>
                <el-button
                  v-if="outputContent"
                  class="key-copy-button"
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
    </div>

    <!-- 密钥管理器对话框 -->
    <el-dialog
      v-model="showKeyManager"
      title="密钥管理"
      width="70%"
      class="key-manager-dialog"
    >
      <div class="key-manager">
        <el-tabs v-model="activeManagerTab">
          <el-tab-pane label="密钥对列表" name="list">
            <div class="key-list">
              <el-table :data="keyPairs" style="width: 100%">
                <el-table-column prop="name" label="名称" width="180" />
                <el-table-column prop="keySize" label="密钥长度" width="120" />
                <el-table-column prop="createTime" label="创建时间" width="180" />
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button size="small" @click="useKeyPair(scope.row)">使用</el-button>
                    <el-button size="small" @click="exportKeyPair(scope.row)">导出</el-button>
                    <el-button
                      size="small"
                      type="danger"
                      @click="deleteKeyPair(scope.row)"
                    >删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane label="新建密钥对" name="create">
            <el-form :model="newKeyPair" label-width="120px">
              <el-form-item label="密钥对名称">
                <el-input v-model="newKeyPair.name" />
              </el-form-item>
              <el-form-item label="密钥长度">
                <el-select v-model="newKeyPair.keySize">
                  <el-option label="512 bits" value="512" />
                  <el-option label="1024 bits" value="1024" />
                  <el-option label="2048 bits" value="2048" />
                  <el-option label="4096 bits" value="4096" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="createKeyPair">生成密钥对</el-button>
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>

    <!-- 使用说明对话框 -->
    <el-dialog
      v-model="showGuide"
      title="RSA 加密使用说明"
      width="800px"
      class="guide-dialog"
    >
      <div class="guide-content">
        <section class="guide-section">
          <h3>什么是 RSA？</h3>
          <p>RSA是一种非对称加密算法，由Ron Rivest、Adi Shamir和Leonard Adleman在1977年一起提出。它是第一个既能用于数据加密也能用于数字签名的算法。</p>
          <p>RSA算法基于一个数论事实：两个大素数相乘很容易，但对其乘积进行因式分解却极其困难。</p>
        </section>

        <section class="guide-section">
          <h3>密钥说明</h3>
          <ul class="key-explanation">
            <li>
              <h4>公钥</h4>
              <p>用于加密数据，可以公开分享。任何人都可以使用公钥加密信息，但只有持有对应私钥的人才能解密。</p>
            </li>
            <li>
              <h4>私钥</h4>
              <p>用于解密数据，必须严格保密。只有持有私钥的人才能解密使用对应公钥加密的信息。</p>
            </li>
          </ul>
        </section>

        <section class="guide-section">
          <h3>填充方式说明</h3>
          <div class="padding-list">
            <div class="padding-item">
              <h4>PKCS1Padding</h4>
              <p>最常用的填充方式，提供良好的安全性。</p>
            </div>
            <div class="padding-item">
              <h4>OAEPWithSHA-1</h4>
              <p>提供更强的安全性，使用SHA-1作为哈希函数。</p>
            </div>
            <div class="padding-item">
              <h4>OAEPWithSHA-256</h4>
              <p>使用SHA-256作为哈希函数，提供最强的安全性。</p>
            </div>
          </div>
        </section>

        <section class="guide-section">
          <h3>使用建议</h3>
          <ul class="tips-list">
            <li>建议使用2048位或更长的密钥长度以确保安全性。</li>
            <li>私钥必须安全保管，一旦泄露将导致安全隐患。</li>
            <li>由于RSA算法的特性，单次加密的数据量不能超过密钥长度。</li>
            <li>建议使用OAEPWithSHA-256填充方式以获得最佳安全性。</li>
          </ul>
        </section>

        <section class="guide-section">
          <h3>注意事项</h3>
          <ul class="tips-list">
            <li>由于RSA算法的限制，单次加密的数据块大小不能超过密钥长度减去填充长度。</li>
            <li>建议使用相同的密钥对进行加密和解密操作，避免使用不匹配的密钥。</li>
            <li>如果遇到解密失败，请确保使用的是正确的私钥，且加密数据未被修改。</li>
          </ul>
        </section>

        <section class="guide-section">
          <h3>长文本加密说明</h3>
          <p>由于RSA算法的特性，单次加密的数据长度受密钥长度限制。本工具采用自动分块加密方式处理长文本：</p>
          <ul class="tips-list">
            <li>对于超出单次加密长度限制的文本，将自动进行分块加密</li>
            <li>使用PKCS1Padding时，最大明文长度 = 密钥长度(字节) - 11</li>
            <li>使用OAEP填充时，由于需要更多填充空间，可加密的明文长度会更短</li>
            <li>建议使用2048位或更长的密钥长度以获得更好的安全性</li>
          </ul>
        </section>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import { saveAs } from 'file-saver'
import * as monaco from 'monaco-editor'
import {
  Lock,
  Unlock,
  Key,
  Files,
  Document as CopyDocument,
  Delete,
  View,
  Hide,
  QuestionFilled,
  UploadFilled,
  Operation
} from '@element-plus/icons-vue'
import forge from 'node-forge'

// 状态定义
const inputContent = ref('')
const outputContent = ref('')
const publicKey = ref('')
const privateKey = ref('')
const showPrivateKey = ref(false)
const showKeyManager = ref(false)
const showGuide = ref(false)
const activeKeyTab = ref('text')
const activeManagerTab = ref('list')
const autoFormatJson = ref(true)

// 加密选项
const options = ref({
  keySize: '1024',
  padding: 'PKCS1Padding',
  outputFormat: 'base64'
})

// 密钥管理
const keyPairs = ref<any[]>([])
const newKeyPair = ref({
  name: '',
  keySize: '2048'
})

// 添加编辑器相关的状态
const outputEditorContainer = ref<HTMLElement | null>(null)
let outputEditor: monaco.editor.IStandaloneCodeEditor | null = null
const inputEditorContainer = ref<HTMLElement | null>(null)
let inputEditor: monaco.editor.IStandaloneCodeEditor | null = null

// 计算属性
const inputStats = computed(() => ({
  length: inputContent.value.length,
  bytes: new Blob([inputContent.value]).size
}))

const outputStats = computed(() => ({
  length: outputContent.value.length,
  bytes: new Blob([outputContent.value]).size
}))

// 在 script 部分添加分块加密方法
const getMaxMessageLength = (keySize: number, paddingScheme: string) => {
  // 密钥长度(bytes) = 密钥位数 / 8
  const keyBytes = Math.floor(parseInt(keySize) / 8)
  
  // 根据不同的padding方案计算最大明文长度
  switch (paddingScheme) {
    case 'PKCS1Padding':
      // PKCS#1 v1.5 需要预留11字节的开销
      return keyBytes - 11
    case 'OAEPWithSHA-1':
      // OAEP with SHA-1 需要预留42字节 (2*hLen + 2)
      return keyBytes - 42
    case 'OAEPWithSHA-256':
      // OAEP with SHA-256 需要预留66字节 (2*hLen + 2)
      return keyBytes - 66
    default:
      return keyBytes - 11 // 默认使用PKCS#1 v1.5的限制
  }
}

// 修改辅助函数来处理二进制数据和Base64转换
const binaryToBase64 = (binary: any) => {
  // 如果输入已经是 ByteStringBuffer，直接使用它
  if (binary.bytes) {
    return forge.util.encode64(binary.bytes())
  }
  // 如果是字符串，转换为 ByteStringBuffer
  if (typeof binary === 'string') {
    return forge.util.encode64(binary)
  }
  // 如果是其他类型，尝试转换为字符串
  return forge.util.encode64(binary.toString())
}

const base64ToBinary = (base64: string) => {
  return forge.util.decode64(base64)
}

// 修改加密方法
const encrypt = () => {
  if (!inputContent.value) {
    ElMessage.warning('请输入要加密的内容')
    return
  }
  if (!publicKey.value) {
    ElMessage.warning('请输入公钥')
    return
  }

  try {
    // 检查并格式化公钥
    let formattedPublicKey = publicKey.value.trim()
    if (!formattedPublicKey.includes('-----BEGIN PUBLIC KEY-----')) {
      formattedPublicKey = `-----BEGIN PUBLIC KEY-----\n${formattedPublicKey}\n-----END PUBLIC KEY-----`
    }

    // 确保公钥格式正确
    if (!formattedPublicKey.includes('\n')) {
      formattedPublicKey = formattedPublicKey.replace(
        /(-----BEGIN.*?-----)(.*?)(-----END.*?-----)/g,
        '$1\n$2\n$3'
      )
    }

    const publicKeyObj = forge.pki.publicKeyFromPem(formattedPublicKey)
    
    // 计算单次可加密的最大长度
    const maxLength = getMaxMessageLength(parseInt(options.value.keySize), options.value.padding)
    const blockSize = Math.floor(parseInt(options.value.keySize) / 8)
    
    // 将输入内容转换为二进制数据
    const data = forge.util.encodeUtf8(inputContent.value)
    const length = data.length
    
    // 如果数据长度超过最大长度，需要分块加密
    if (length > maxLength) {
      let encryptedBlocks = []
      
      // 分块加密
      for (let i = 0; i < length; i += maxLength) {
        const chunk = data.slice(i, Math.min(i + maxLength, length))
        let encrypted
        if (options.value.padding === 'PKCS1Padding') {
          encrypted = publicKeyObj.encrypt(chunk, 'RSAES-PKCS1-V1_5')
        } else {
          encrypted = publicKeyObj.encrypt(chunk, 'RSA-OAEP', {
            md: forge.md.sha256.create(),
            mgf1: {
              md: forge.md.sha1.create()
            }
          })
        }
        encryptedBlocks.push(encrypted)
      }
      
      // 将所有加密块连接成一个字符串
      const concatenatedBlocks = encryptedBlocks.join('')
      outputContent.value = forge.util.encode64(concatenatedBlocks)
    } else {
      // 直接加密
      let encrypted
      if (options.value.padding === 'PKCS1Padding') {
        encrypted = publicKeyObj.encrypt(data, 'RSAES-PKCS1-V1_5')
      } else {
        encrypted = publicKeyObj.encrypt(data, 'RSA-OAEP', {
          md: forge.md.sha256.create(),
          mgf1: {
            md: forge.md.sha1.create()
          }
        })
      }
      outputContent.value = forge.util.encode64(encrypted)
    }

    ElMessage.success('加密成功')
  } catch (error) {
    console.error('加密错误:', error)
    ElMessage.error('加密失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 修改解密方法
const decrypt = () => {
  if (!inputContent.value) {
    ElMessage.warning('请输入要解密的内容')
    return
  }
  if (!privateKey.value) {
    ElMessage.warning('请输入私钥')
    return
  }

  try {
    // 检查并格式化私钥
    let formattedPrivateKey = privateKey.value.trim()
    if (!formattedPrivateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      formattedPrivateKey = `-----BEGIN RSA PRIVATE KEY-----\n${formattedPrivateKey}\n-----END RSA PRIVATE KEY-----`
    }

    // 确保私钥格式正确
    if (!formattedPrivateKey.includes('\n')) {
      formattedPrivateKey = formattedPrivateKey.replace(
        /(-----BEGIN.*?-----)(.*?)(-----END.*?-----)/g,
        '$1\n$2\n$3'
      )
    }

    const privateKeyObj = forge.pki.privateKeyFromPem(formattedPrivateKey)
    
    // 解码Base64获取二进制数据
    const encryptedData = forge.util.decode64(inputContent.value)
    const blockSize = Math.floor(parseInt(options.value.keySize) / 8)
    
    // 分块解密
    let decryptedText = ''
    for (let i = 0; i < encryptedData.length; i += blockSize) {
      const encryptedBlock = encryptedData.slice(i, i + blockSize)
      let decrypted
      if (options.value.padding === 'PKCS1Padding') {
        decrypted = privateKeyObj.decrypt(encryptedBlock, 'RSAES-PKCS1-V1_5')
      } else {
        decrypted = privateKeyObj.decrypt(encryptedBlock, 'RSA-OAEP', {
          md: forge.md.sha256.create(),
          mgf1: {
            md: forge.md.sha1.create()
          }
        })
      }
      decryptedText += decrypted
    }
    
    outputContent.value = forge.util.decodeUtf8(decryptedText)
    ElMessage.success('解密成功')
  } catch (error) {
    console.error('解密错误:', error)
    ElMessage.error('解密失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 生成密钥对
const generateKeyPair = () => {
  try {
    ElMessage.info('正在生成密钥对，请稍候...')
    
    // 使用 Web Worker 生成密钥对以避免阻塞主线程
    const keySize = parseInt(options.value.keySize)
    const rsa = forge.pki.rsa
    const keypair = rsa.generateKeyPair({ bits: keySize, workers: -1 })
    
    const generatedPublicKey = forge.pki.publicKeyToPem(keypair.publicKey)
    const generatedPrivateKey = forge.pki.privateKeyToPem(keypair.privateKey)
    
    keyPairs.value.unshift({
      name: newKeyPair.value.name || `RSA-${keySize}-${new Date().getTime()}`,
      keySize: keySize,
      publicKey: generatedPublicKey,
      privateKey: generatedPrivateKey,
      createTime: new Date().toLocaleString()
    })
    
    // 自动使用新生成的密钥对
    publicKey.value = generatedPublicKey
    privateKey.value = generatedPrivateKey
    
    // 重置表单
    newKeyPair.value.name = ''
    activeManagerTab.value = 'list'
    
    ElMessage.success('密钥对生成成功')
  } catch (error) {
    console.error('生成密钥对错误:', error)
    ElMessage.error('生成密钥对失败：' + (error instanceof Error ? error.message : '未知错误'))
  }
}

// 添加一个辅助方法来验证密钥格式
const isValidPemFormat = (pem: string, type: 'public' | 'private'): boolean => {
  const publicKeyPattern = /^-----BEGIN PUBLIC KEY-----\n[\s\S]*\n-----END PUBLIC KEY-----$/
  const privateKeyPattern = /^-----BEGIN (?:RSA )?PRIVATE KEY-----\n[\s\S]*\n-----END (?:RSA )?PRIVATE KEY-----$/
  const pemContent = pem.trim()
  
  if (type === 'public') {
    return publicKeyPattern.test(pemContent)
  } else {
    return privateKeyPattern.test(pemContent)
  }
}

// 导入公钥
const importPublicKey = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pem,.key'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const content = reader.result as string
        try {
          // 验证公钥格式
          if (!isValidPemFormat(content, 'public')) {
            throw new Error('无效的公钥格式')
          }
          publicKey.value = content.trim()
          ElMessage.success('公钥导入成功')
        } catch (error) {
          ElMessage.error('公钥格式不正确')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// 导入私钥
const importPrivateKey = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.pem,.key'
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        let content = reader.result as string
        try {
          // 确保私钥格式正确
          if (!content.includes('\n')) {
            content = content.replace(
              /(-----BEGIN.*?-----)(.*?)(-----END.*?-----)/g,
              '$1\n$2\n$3'
            )
          }
          privateKey.value = content.trim()
          ElMessage.success('私钥导入成功')
        } catch (error) {
          ElMessage.error('私钥格式不正确')
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

// 使用密钥对
const useKeyPair = (keyPair: any) => {
  publicKey.value = keyPair.publicKey
  privateKey.value = keyPair.privateKey
  showKeyManager.value = false
  ElMessage.success('已加载密钥对')
}

// 导出密钥对
const exportKeyPair = (keyPair: any) => {
  // 导出公钥
  const publicKeyBlob = new Blob([keyPair.publicKey], { type: 'text/plain' })
  saveAs(publicKeyBlob, `${keyPair.name}-public.pem`)
  
  // 导出私钥
  const privateKeyBlob = new Blob([keyPair.privateKey], { type: 'text/plain' })
  saveAs(privateKeyBlob, `${keyPair.name}-private.pem`)
  
  ElMessage.success('密钥对导出成功')
}

// 删除密钥对
const deleteKeyPair = (keyPair: any) => {
  const index = keyPairs.value.findIndex(kp => kp.name === keyPair.name)
  if (index !== -1) {
    keyPairs.value.splice(index, 1)
    ElMessage.success('密钥对已删除')
  }
}

// 创建新密钥对
const createKeyPair = () => {
  if (!newKeyPair.value.name) {
    ElMessage.warning('请输入密钥对名称')
    return
  }

  try {
    const encrypt = new JSEncrypt({ default_key_size: newKeyPair.value.keySize })
    const publicKey = encrypt.getPublicKey()
    const privateKey = encrypt.getPrivateKey()
    
    if (publicKey && privateKey) {
      keyPairs.value.unshift({
        name: newKeyPair.value.name,
        keySize: newKeyPair.value.keySize,
        publicKey,
        privateKey,
        createTime: new Date().toLocaleString()
      })
      
      newKeyPair.value.name = ''
      activeManagerTab.value = 'list'
      ElMessage.success('密钥对创建成功')
    } else {
      ElMessage.error('密钥对创建失败')
    }
  } catch (error) {
    console.error('创建密钥对错误:', error)
    ElMessage.error('创建密钥对失败：' + error.message)
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

// 修改 clearContent 方法
const clearContent = () => {
  // 清空输入输出内容
  inputContent.value = ''
  outputContent.value = ''
  // 清空公钥私钥
  publicKey.value = ''
  privateKey.value = ''
  // 更新编辑器内容
  if (inputEditor) {
    inputEditor.setValue('')
  }
  if (outputEditor) {
    outputEditor.setValue('')
  }
  ElMessage.success('已清空所有内容')
}

// 处理密钥文件上传
const handlePublicKeyFileUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = () => {
    publicKey.value = reader.result as string
    ElMessage.success('公钥导入成功')
  }
  reader.readAsText(file.raw)
}

const handlePrivateKeyFileUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = () => {
    privateKey.value = reader.result as string
    ElMessage.success('私钥导入成功')
  }
  reader.readAsText(file.raw)
}

// 在 script 部分添加复制方法
const copyToClipboard = async (text: string, message: string = '复制成功') => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(message)
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 在 script 部分添加解析私钥的方法
const parsePrivateKey = () => {
  if (!privateKey.value) {
    ElMessage.warning('请先输入私钥')
    return
  }

  try {
    // 格式化私钥
    let formattedPrivateKey = privateKey.value.trim()
    if (!formattedPrivateKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      formattedPrivateKey = `-----BEGIN RSA PRIVATE KEY-----\n${formattedPrivateKey}\n-----END RSA PRIVATE KEY-----`
    }

    // 确保私钥格式正确
    if (!formattedPrivateKey.includes('\n')) {
      formattedPrivateKey = formattedPrivateKey.replace(
        /(-----BEGIN.*?-----)(.*?)(-----END.*?-----)/g,
        '$1\n$2\n$3'
      )
    }

    // 从私钥中提取公钥
    const privateKeyObj = forge.pki.privateKeyFromPem(formattedPrivateKey)
    const publicKeyObj = forge.pki.setRsaPublicKey(privateKeyObj.n, privateKeyObj.e)
    const publicKeyPem = forge.pki.publicKeyToPem(publicKeyObj)

    // 设置公钥
    publicKey.value = publicKeyPem
    ElMessage.success('已从私钥中解析出公钥')
  } catch (error) {
    console.error('解析私钥错误:', error)
    ElMessage.error('解析私钥失败：私钥格式不正确')
  }
}

// 初始化Monaco编辑器
const initMonacoEditor = () => {
  if (inputEditorContainer.value && !inputEditor) {
    inputEditor = monaco.editor.create(inputEditorContainer.value, {
      value: inputContent.value,
      language: 'text',
      theme: 'vs',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      automaticLayout: true,
      fontSize: 14,
      tabSize: 2,
      wordWrap: 'on',
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      },
      fontFamily: '"Microsoft YaHei", monospace',
    })

    // 监听编辑器内容变化
    inputEditor.onDidChangeModelContent(() => {
      inputContent.value = inputEditor?.getValue() || ''
    })
  }

  if (outputEditorContainer.value && !outputEditor) {
    outputEditor = monaco.editor.create(outputEditorContainer.value, {
      value: '',
      language: 'json',
      theme: 'vs',
      readOnly: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      automaticLayout: true,
      fontSize: 14,
      tabSize: 2,
      wordWrap: 'on',
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      },
      fontFamily: '"Microsoft YaHei", monospace',
    })
  }
}

// 更新编辑器内容的方法
const updateEditorContent = (content: string) => {
  if (outputEditor) {
    let formattedContent = content
    if (autoFormatJson.value) {
      try {
        const trimmed = content.trim()
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
            (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
          formattedContent = formatJsonString(content)
          outputEditor.updateOptions({ language: 'json' })
        } else {
          outputEditor.updateOptions({ language: 'text' })
        }
      } catch (e) {
        outputEditor.updateOptions({ language: 'text' })
      }
    } else {
      outputEditor.updateOptions({ language: 'text' })
    }
    outputEditor.setValue(formattedContent)
  }
}

// 监听输出内容变化
watch(outputContent, (newValue) => {
  updateEditorContent(newValue)
})

// 监听主题变化
const updateEditorTheme = () => {
  const isDark = document.documentElement.classList.contains('dark')
  if (outputEditor) {
    outputEditor.updateOptions({
      theme: isDark ? 'vs-dark' : 'vs'
    })
  }
}

// 组件挂载时初始化编辑器
onMounted(() => {
  initMonacoEditor()
  // 监听主题变化
  const observer = new MutationObserver(updateEditorTheme)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

// 组件卸载时清理编辑器
onBeforeUnmount(() => {
  if (inputEditor) {
    inputEditor.dispose()
    inputEditor = null
  }
  if (outputEditor) {
    outputEditor.dispose()
    outputEditor = null
  }
})

// 添加输入内容变化监听
watch(inputContent, (newValue) => {
  if (inputEditor && inputEditor.getValue() !== newValue) {
    inputEditor.setValue(newValue)
  }
})
</script>

<style scoped>
/* 整体容器样式 */
.rsa-tool {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.2rem;
  background: var(--el-bg-color);
  border-radius: 16px;
}

/* 区域通用样式 */
.tool-section {
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  padding: 1.2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 顶部操作区样式 */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

/* 中间密钥区域样式 */
.keys-section {
  flex: 0 0 auto;
}

.key-card {
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
  overflow: hidden;
  height: 100%;
  transition: all 0.3s;
}

.key-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.key-card-header {
  padding: 0.8rem 1rem;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color-overlay);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.key-title {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.key-card-body {
  padding: 1rem;
}

/* 修改密钥输入框样式 */
.key-input :deep(.el-textarea__inner) {
  font-family: "Microsoft YaHei", monospace;
  height: 120px !important;
  font-size: 0.9rem;
  line-height: 1.4;
  border: 1px solid var(--el-border-color-lighter);
  background: #ffffff;
  transition: all 0.3s;
  border-radius: 4px;
}

.key-input :deep(.el-textarea__inner):hover {
  border-color: var(--el-color-primary-light-5);
}

.key-input :deep(.el-textarea__inner):focus {
  background: #ffffff;
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

/* 暗色模式下的背景色调整 */
:root.dark .key-input :deep(.el-textarea__inner) {
  background: var(--el-bg-color);
}

:root.dark .key-input :deep(.el-textarea__inner):focus {
  background: var(--el-bg-color);
}

/* 底部编辑器区域样式 */
.editor-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 500px;
}

.editor-header {
  padding: 0.5rem 0;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.editor-content {
  flex: 1;
  padding: 0;
  position: relative;
}

.editor-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.editor-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--el-fill-color-light);
  border-radius: 8px 8px 0 0;
  margin-bottom: 1px;
}

.editor-container {
  position: relative;
  flex: 1;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 0 0 8px 8px;
  overflow: hidden;
  min-height: 450px;
  transition: all 0.3s;
}

.editor-container:hover {
  border-color: var(--el-color-primary-light-5);
}

.editor-container:focus-within {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px var(--el-color-primary-light-8);
}

/* 确保 Monaco 编辑器内容区域样式正确 */
.monaco-editor {
  width: 100%;
  height: 100%;
  min-height: 400px;
  border-radius: 0 0 8px 8px;
}

.monaco-editor :deep(.monaco-editor-background) {
  border-radius: 0 0 8px 8px;
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.input-stats {
  display: flex;
  gap: 0.5rem;
}

.copy-button {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-color-primary) !important;
  border: none;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.textarea-with-copy:hover .copy-button,
.editor-container:hover .copy-button {
  opacity: 1;
}

.copy-button:hover {
  transform: translateY(-50%) scale(1.1);
  background-color: var(--el-color-primary-light-3) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.copy-button:active {
  transform: translateY(-50%) scale(0.95);
}

.copy-button .el-icon {
  font-size: 16px;
  width: 16px;
  height: 16px;
  margin: 0;
  color: white;
}

.el-input__wrapper {
  padding-right: 48px !important;
}

.el-input--password .copy-button {
  right: 40px;
}

.key-card .copy-button {
  top: 12px;
  right: 12px;
}

.editor-container .copy-button {
  top: 12px;
  right: 12px;
  transform: none;
}

.copy-button.is-disabled {
  background-color: var(--el-button-disabled-bg-color) !important;
  cursor: not-allowed;
}

:root.dark .copy-button {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.el-button-group .el-button + .el-button {
  margin-left: 0;
}

.el-button + .el-button:not(.el-button-group .el-button) {
  margin-left: 8px;
}

/* 修改加密解密按钮样式 */
.encryption-actions {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.encryption-actions .action-button {
  padding: 8px 24px; /* 增加内边距使按钮变大 */
  font-size: 1.1rem; /* 增大字体 */
  font-weight: 500;
  height: auto; /* 允许按钮高度自适应 */
}

.encryption-actions .action-button .el-icon {
  font-size: 1.2rem; /* 增大图标尺寸 */
  margin-right: 8px; /* 增加图标和文字的间距 */
}

/* 调整按钮容器的位置和样式 */
.editor-header {
  display: flex;
  justify-content: center;
  margin-top: -0.5rem; /* 向上移动按钮组 */
  margin-bottom: 0.5rem; /* 减小底部间距 */
  padding: 0.5rem 0;
}

/* 优化按钮的悬停效果 */
.encryption-actions .action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.encryption-actions .action-button:active {
  transform: translateY(1px);
}

/* 修改普通按钮样式，添加蓝色边框 */
.el-button:not(.el-button--primary):not(.el-button--success):not(.el-button--danger) {
  border: 1px solid var(--el-color-primary);
  color: var(--el-color-primary);
}

.el-button:not(.el-button--primary):not(.el-button--success):not(.el-button--danger):hover {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-3);
  color: var(--el-color-primary-light-3);
}

/* 修改密钥卡片中的按钮样式 */
.key-card-header .el-button {
  background: transparent;
}

/* 修改加密解密按钮组中非主要按钮的样式 */
.encryption-actions .el-button:not(.el-button--primary) {
  background: transparent;
}

/* 修改操作栏按钮样式 */
.actions-bar .el-button:not(.el-button--primary):not(.el-button--success) {
  background: transparent;
}

/* 确保所有按钮在hover时有过渡效果 */
.el-button {
  transition: all 0.3s ease;
}

/* 调整按钮组中按钮的间距 */
.el-button + .el-button {
  margin-left: 8px;
}

/* 优化按钮内图标和文字的对齐 */
.el-button .el-icon {
  vertical-align: middle;
  margin-right: 4px;
}

/* 确保所有按钮在禁用状态下的样式一致 */
.el-button.is-disabled {
  border-color: var(--el-button-disabled-border-color);
  color: var(--el-button-disabled-text-color);
  background-color: var(--el-button-disabled-bg-color);
}

/* 添加私钥卡片头部按钮样式 */
.key-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.key-actions .el-button--primary {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: white;
}

.key-actions .el-button--primary:hover {
  background-color: var(--el-color-primary-light-3);
  border-color: var(--el-color-primary-light-3);
}

.key-actions .el-button--primary:active {
  background-color: var(--el-color-primary-dark-2);
  border-color: var(--el-color-primary-dark-2);
}

.key-actions .el-button--primary.is-disabled {
  background-color: var(--el-button-disabled-bg-color);
  border-color: var(--el-button-disabled-border-color);
  color: var(--el-button-disabled-text-color);
}

/* 修改文本框复制按钮样式 */
.textarea-with-copy {
  position: relative;
}

.key-copy-button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-color-primary) !important;
  border: none;
  color: white;
  cursor: pointer;
}

.textarea-with-copy:hover .key-copy-button {
  opacity: 1;
}

.key-copy-button:hover {
  transform: scale(1.1);
  background-color: var(--el-color-primary-light-3) !important;
}

.key-copy-button:active {
  transform: scale(0.95);
}

.key-copy-button .el-icon {
  font-size: 14px;
  width: 14px;
  height: 14px;
  margin: 0;
  color: white;
}

/* 调整文本框内边距，为复制按钮留出空间 */
.key-input :deep(.el-textarea__inner) {
  padding-right: 40px;
}

/* 移除之前的复制按钮样式 */
.key-card .copy-button {
  display: none;
}

/* 调整显示/隐藏图标的位置 */
.input-icon {
  position: absolute;
  top: 8px;
  right: 40px; /* 为复制按钮留出空间 */
  cursor: pointer;
  z-index: 2;
}

/* 确保复制按钮在密码模式下也能正常显示 */
.key-input.el-input--password :deep(.el-input__inner) {
  padding-right: 70px; /* 为两个图标留出空间 */
}

/* 调整复制按钮在密码输入框中的位置 */
.el-input--password + .key-copy-button {
  right: 8px;
}

/* 移除旧的复制按钮相关样式 */
.copy-button,
.textarea-with-copy:hover .copy-button,
.editor-container:hover .copy-button,
.copy-button:hover,
.copy-button:active,
.copy-button .el-icon,
.el-input--password .copy-button,
.key-card .copy-button,
.editor-container .copy-button,
.copy-button.is-disabled {
  display: none;
}

/* 编辑器容器中的复制按钮样式 */
.editor-container .key-copy-button {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  transition: all 0.3s ease;
}

/* 编辑器容器悬停时显示复制按钮 */
.editor-container:hover .key-copy-button {
  opacity: 1;
}

/* 编辑器容器中复制按钮的悬停效果 */
.editor-container .key-copy-button:hover {
  transform: scale(1.1);
  background-color: var(--el-color-primary-light-3) !important;
}

.editor-container .key-copy-button:active {
  transform: scale(0.95);
}
</style> 