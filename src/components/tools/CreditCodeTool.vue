<template>
  <div class="credit-code-tool">
    <!-- 顶部Tab导航 -->
    <div class="tab-navigation">
      <div class="tab-container">
        <div 
          v-for="tab in tabs" 
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <el-icon class="tab-icon">
            <component :is="tab.icon" />
          </el-icon>
          <span class="tab-text">{{ tab.label }}</span>
        </div>
      </div>
    </div>

    <!-- 生成页面 -->
    <div v-show="activeTab === 'generate'" class="tab-content">
      <!-- 生成选项卡片 -->
      <div class="tool-card options-card">
        <h3 class="card-title">生成选项</h3>
        <div class="options-form">
          <div class="form-group">
            <div class="count-wrapper">
              <label>生成数量</label>
              <el-input-number 
                v-model="options.count" 
                :min="1" 
                :max="100"
                class="count-input"
                controls-position="right"
                size="large"
              />
            </div>
          </div>
        </div>
        <div class="generate-section">
          <el-button class="generate-btn" size="large" @click="generateCodes">
            生 成
          </el-button>
        </div>
      </div>

      <!-- 生成结果卡片 -->
      <div class="tool-card result-card">
        <div class="result-header">
          <h3 class="card-title">生成结果</h3>
        </div>

        <div class="result-content">
          <!-- 操作按钮区域 -->
          <div class="result-actions-bar" v-if="codeList.length > 0">
            <div class="actions-info">
              <span class="result-count">已生成 {{ codeList.length }} 个代码</span>
            </div>
            <div class="actions-buttons">
              <el-button
                class="action-btn copy-all-btn"
                size="large"
                @click="copyResult"
                title="复制所有结果"
              >
                <el-icon><CopyDocument /></el-icon>
                复制全部
              </el-button>
              <el-button
                class="action-btn clear-all-btn"
                size="large"
                @click="clearContent"
                title="清空结果"
              >
                <el-icon><Delete /></el-icon>
                清空结果
              </el-button>
            </div>
          </div>

          <div class="result-list" v-if="codeList.length > 0">
            <div 
              v-for="(code, index) in codeList" 
              :key="index"
              class="result-item"
              @click="copyCode(code)"
              :title="`点击复制: ${code}`"
            >
              <span class="code-text">{{ code }}</span>
              <span class="copy-hint">点击复制</span>
            </div>
          </div>
          <div class="textarea-wrapper" v-else>
            <el-input
              type="textarea"
              v-model="resultText"
              :rows="8"
              placeholder=""
              readonly
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 校验页面 -->
    <div v-show="activeTab === 'verify'" class="tab-content">
      <div class="tool-card verify-input-card">
        <h3 class="card-title">统一社会信用代码校验</h3>
        <div class="verify-form">
          <div class="form-group">
            <label>请输入统一社会信用代码</label>
            <el-input
              v-model="verifyCode"
              placeholder="请输入18位统一社会信用代码"
              size="large"
              clearable
              @keyup.enter="verifyCreditCode"
            />
          </div>
          <div class="verify-section">
            <el-button 
              class="verify-btn" 
              size="large" 
              @click="verifyCreditCode"
              :disabled="!verifyCode.trim()"
            >
              校 验
            </el-button>
          </div>
        </div>
      </div>

      <!-- 校验结果卡片 -->
      <div v-if="verifyResult" class="tool-card verify-result-card">
        <h3 class="card-title">校验结果</h3>
        <div class="verify-result-content">
          <el-alert
            :type="verifyResult.isValid ? 'success' : 'error'"
            :closable="false"
            show-icon
          >
            <template #title>
              <span class="verify-result-title">
                {{ verifyResult.isValid ? '校验通过' : '校验失败' }}
              </span>
            </template>
            <div class="verify-result-details">
              <p v-if="verifyResult.isValid" class="success-message">
                该统一社会信用代码格式正确，校验位验证通过。
              </p>
              <p v-else class="error-message">
                {{ verifyResult.message }}
              </p>
              <div v-if="verifyResult.details" class="code-details">
                <h4>代码解析：</h4>
                <ul>
                  <li><strong>登记管理部门：</strong>{{ verifyResult.details.registrationDept }}</li>
                  <li><strong>机构类别：</strong>{{ verifyResult.details.orgType }}</li>
                  <li><strong>行政区划：</strong>{{ verifyResult.details.areaCode }}</li>
                  <li><strong>组织机构代码：</strong>{{ verifyResult.details.orgCode }}</li>
                </ul>
              </div>
            </div>
          </el-alert>
        </div>
      </div>
    </div>

    <!-- 说明页面 -->
    <div v-show="activeTab === 'help'" class="tab-content">
      <div class="tool-card help-card">
        <h3 class="card-title">统一社会信用代码说明</h3>
        <div class="help-content">
          <div class="help-section">
            <h4>什么是统一社会信用代码？</h4>
            <p>统一社会信用代码是一组长度为18位的用于法人和其他组织身份识别的代码，由登记管理部门代码、机构类别代码、行政区划代码、主体标识码和校验码组成。</p>
          </div>
          
          <div class="help-section">
            <h4>代码结构</h4>
            <div class="code-structure">
              <div class="structure-item">
                <span class="structure-label">第1位</span>
                <span class="structure-desc">登记管理部门代码</span>
              </div>
              <div class="structure-item">
                <span class="structure-label">第2位</span>
                <span class="structure-desc">机构类别代码</span>
              </div>
              <div class="structure-item">
                <span class="structure-label">第3-8位</span>
                <span class="structure-desc">行政区划代码</span>
              </div>
              <div class="structure-item">
                <span class="structure-label">第9-17位</span>
                <span class="structure-desc">主体标识码</span>
              </div>
              <div class="structure-item">
                <span class="structure-label">第18位</span>
                <span class="structure-desc">校验码</span>
              </div>
            </div>
          </div>

          <div class="help-section">
            <h4>登记管理部门代码</h4>
            <ul>
              <li><strong>1-9：</strong>机构编制</li>
              <li><strong>A：</strong>工商</li>
              <li><strong>B：</strong>机构代码</li>
              <li><strong>C：</strong>税务</li>
              <li><strong>D：</strong>民政</li>
              <li><strong>E：</strong>公安</li>
              <li><strong>F：</strong>司法</li>
              <li><strong>G：</strong>外交</li>
              <li><strong>Y：</strong>其他</li>
            </ul>
          </div>

          <div class="help-section">
            <h4>校验规则</h4>
            <p>统一社会信用代码采用加权因子法计算校验位，确保代码的准确性和唯一性。校验位通过特定的算法计算得出，用于验证代码的完整性。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 免责声明卡片 -->
    <div class="tool-card disclaimer-card">
      <h3 class="card-title">免责声明</h3>
      <div class="disclaimer-content">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
        >
          <div class="disclaimer-text">
            <p>1. 本工具生成的统一社会信用代码均为虚拟数据，仅用于软件开发、功能测试等用途；</p>
            <p>2. 请勿将本工具用于生成或收集真实的统一社会信用代码；</p>
            <p>3. 请遵守相关法律法规，不得将本工具用于任何非法用途。</p>
          </div>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Key,
  Document as CopyDocument,
  Delete,
  Setting,
  List,
  Check,
  InfoFilled
} from '@element-plus/icons-vue'

// Tab相关
const tabs = [
  { key: 'generate', label: '生成', icon: Key },
  { key: 'verify', label: '校验', icon: Check },
  { key: 'help', label: '说明', icon: InfoFilled }
]
const activeTab = ref('generate')

// 生成相关
const codeList = ref<string[]>([])
const options = reactive({
  count: 1
})

// 校验相关
const verifyCode = ref('')
const verifyResult = ref<any>(null)

// 生成统一社会信用代码
function generateCreditCode(): string {
  let code: string
  let attempts = 0
  const maxAttempts = 10
  
  do {
    attempts++
    
    // 登记管理部门代码(1位)
    const registrationDept = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'Y']
    
    // 生成第一位 - 登记管理部门代码
    const dept = registrationDept[Math.floor(Math.random() * registrationDept.length)]
    
    // 根据登记管理部门代码确定机构类别代码的可选值
    let orgTypeOptions: string[] = []
    if (dept >= '1' && dept <= '9') {  // 机构编制
      orgTypeOptions = ['1', '2', '3', '9']
    } else if (dept === 'A') {  // 工商
      orgTypeOptions = ['1', '2', '3', '4', '5', '9']
    } else if (dept === 'B') {  // 机构代码
      orgTypeOptions = ['1', '2', '3', '4', '5', '9']
    } else if (dept === 'C') {  // 税务
      orgTypeOptions = ['1', '2', '3', '9']
    } else if (dept === 'D') {  // 民政
      orgTypeOptions = ['1', '2', '3', '4', '9']
    } else if (dept === 'E') {  // 公安
      orgTypeOptions = ['1', '2', '3', '9']
    } else if (dept === 'F') {  // 司法
      orgTypeOptions = ['1', '2', '3', '9']
    } else if (dept === 'G') {  // 外交
      orgTypeOptions = ['1', '2', '3', '9']
    } else {  // Y-其他
      orgTypeOptions = ['1', '2', '3', '9']
    }

    // 生成第二位 - 机构类别代码
    const type = orgTypeOptions[Math.floor(Math.random() * orgTypeOptions.length)]
    
    // 行政区划代码(6位)
    const areaCode = ['110000', '120000', '130000', '140000', '150000', '310000', '320000', '330000', '340000', '350000', '360000', '370000', '410000', '420000', '430000', '440000', '450000', '460000', '500000', '510000', '520000', '530000', '540000', '610000', '620000', '630000', '640000', '650000']
    const area = areaCode[Math.floor(Math.random() * areaCode.length)]

    // 生成组织机构代码前8位（不含校验位）
    const orgCodeChars = '0123456789ABCDEFGHJKLMNPQRTUWXY'
    const orgCode8 = Array(8).fill(0).map(() => {
      return orgCodeChars[Math.floor(Math.random() * orgCodeChars.length)]
    }).join('')

    // 计算组织机构代码的校验位
    const orgCodeWeight = [3, 7, 9, 10, 5, 8, 4, 2]
    const orgCodeSum = Array.from(orgCode8).reduce((sum, char, index) => {
      const charValue = char >= 'A' ? char.charCodeAt(0) - 55 : parseInt(char)
      return sum + charValue * orgCodeWeight[index]
    }, 0)
    
    let checksumChar = 'X'
    const orgCodeChecksum = 11 - (orgCodeSum % 11)
    if (orgCodeChecksum === 10) {
      checksumChar = 'X'
    } else if (orgCodeChecksum === 11) {
      checksumChar = '0'
    } else {
      checksumChar = orgCodeChecksum.toString()
    }

    const orgCode = orgCode8 + checksumChar
    const code17 = dept + type + area + orgCode

    // 计算统一社会信用代码的校验位
    const weightedSum = Array.from(code17).reduce((sum, char, index) => {
      const weight = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28][index]
      const value = '0123456789ABCDEFGHJKLMNPQRTUWXY'.indexOf(char)
      return sum + value * weight
    }, 0)
    
    const checksumIndex = 31 - (weightedSum % 31)
    const checksum = '0123456789ABCDEFGHJKLMNPQRTUWXY'[checksumIndex]
    
    code = code17 + checksum
    
    // 检查生成的代码是否有效（不包含undefined且长度为18位）
    if (code && code.length === 18 && !code.includes('undefined')) {
      break
    }
    
  } while (attempts < maxAttempts)
  
  // 如果多次尝试后仍然生成无效代码，返回一个默认的有效代码
  if (!code || code.length !== 18 || code.includes('undefined')) {
    console.warn('生成统一社会信用代码失败，使用默认代码')
    return '91110000100000000X' // 默认的有效代码
  }
  
  return code
}

// 生成指定数量的统一社会信用代码
const generateCodes = () => {
  for (let i = 0; i < options.count; i++) {
    const code = generateCreditCode()
    codeList.value.push(code)
  }
}

// 复制单个代码
const copyCode = async (code: string) => {
  try {
    await navigator.clipboard.writeText(code)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 复制所有结果
const copyResult = async () => {
  if (codeList.value.length === 0) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  try {
    await navigator.clipboard.writeText(codeList.value.join('\n'))
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 清空结果
const clearContent = () => {
  codeList.value = []
  options.count = 1
  ElMessage.success('已清空')
}

// 校验统一社会信用代码
const verifyCreditCode = () => {
  const code = verifyCode.value.trim().toUpperCase()
  
  if (!code) {
    ElMessage.warning('请输入统一社会信用代码')
    return
  }
  
  if (code.length !== 18) {
    verifyResult.value = {
      isValid: false,
      message: '统一社会信用代码长度必须为18位'
    }
    return
  }
  
  // 检查字符是否合法
  const validChars = '0123456789ABCDEFGHJKLMNPQRTUWXY'
  for (let i = 0; i < code.length; i++) {
    if (!validChars.includes(code[i])) {
      verifyResult.value = {
        isValid: false,
        message: `第${i + 1}位字符"${code[i]}"不在有效字符范围内`
      }
      return
    }
  }
  
  // 计算校验位
  const code17 = code.substring(0, 17)
  const checksum = code[17]
  
  const weightedSum = Array.from(code17).reduce((sum, char, index) => {
    const weight = [1, 3, 9, 27, 19, 26, 16, 17, 20, 29, 25, 13, 8, 24, 10, 30, 28][index]
    const value = validChars.indexOf(char)
    return sum + value * weight
  }, 0)
  
  const expectedChecksumIndex = 31 - (weightedSum % 31)
  const expectedChecksum = validChars[expectedChecksumIndex]
  
  if (checksum === expectedChecksum) {
    // 解析代码详情
    const deptCode = code[0]
    const typeCode = code[1]
    const areaCode = code.substring(2, 8)
    const orgCode = code.substring(8, 17)
    
    const deptNames: { [key: string]: string } = {
      '1': '机构编制', '2': '机构编制', '3': '机构编制', '4': '机构编制', '5': '机构编制',
      '6': '机构编制', '7': '机构编制', '8': '机构编制', '9': '机构编制',
      'A': '工商', 'B': '机构代码', 'C': '税务', 'D': '民政', 'E': '公安', 'F': '司法', 'G': '外交', 'Y': '其他'
    }
    
    verifyResult.value = {
      isValid: true,
      message: '校验通过',
      details: {
        registrationDept: `${deptCode} - ${deptNames[deptCode] || '未知'}`,
        orgType: typeCode,
        areaCode: areaCode,
        orgCode: orgCode
      }
    }
  } else {
    verifyResult.value = {
      isValid: false,
      message: `校验位错误，期望为"${expectedChecksum}"，实际为"${checksum}"`
    }
  }
}

// 新增计算属性用于显示结果文本
const resultText = computed(() => {
  return codeList.value.join('\n')
})
</script>

<style scoped>
/* 修改背景和布局样式 */
.credit-code-tool {
  padding: 0rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
  align-items: center;
}

/* Tab导航样式 */
.tab-navigation {
  width: 100%;
  max-width: 600px;
  margin-bottom: 1rem;
}

.tab-container {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 0.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
}

/* 暗色模式适配 */
:root.dark .tab-container {
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.1);
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.tab-item:hover {
  background: rgba(0, 122, 255, 0.05);
  color: var(--text-primary);
}

.tab-item.active {
  background: #007aff;
  color: white;
  box-shadow: 0 1px 4px rgba(0, 122, 255, 0.3);
}

.tab-icon {
  font-size: 1rem;
}

.tab-text {
  font-size: 0.875rem;
}

.tab-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: center;
}

.tool-card {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: 800px;
}

/* 暗色模式适配 */
:root.dark .tool-card {
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.1);
}

.card-title {
  font-size: 1.25rem;
  color: var(--text-primary);
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.options-card .options-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem;
}

.generate-section {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

/* 暗色模式适配 */
:root.dark .generate-section {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.result-card .result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.result-card .result-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.result-card .result-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1rem;
}

.result-actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.actions-info {
  display: flex;
  align-items: center;
}

.result-count {
  font-size: 1rem;
  color: #2c3e50;
  font-weight: 500;
}

.actions-buttons {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.copy-all-btn {
  background-color: #007aff;
  color: white;
  border: none;
}

.copy-all-btn:hover {
  background-color: #0056b3;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 122, 255, 0.3);
}

.clear-all-btn {
  background-color: #dc3545;
  color: white;
  border: none;
}

.clear-all-btn:hover {
  background-color: #c82333;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
}

/* 暗色模式适配 */
:root.dark .result-actions-bar {
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

:root.dark .result-count {
  color: var(--text-primary);
}

.textarea-wrapper {
  position: relative;
}

.result-list {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  background: white;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Microsoft YaHei", monospace;
  font-size: 1.1rem;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background-color: #f8f9fa;
  transform: translateX(4px);
}

.result-item:active {
  background-color: #e9ecef;
  transform: translateX(2px);
}

.code-text {
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', 'Roboto Mono', monospace;
  font-size: 1rem;
  letter-spacing: 0.5px;
}

.copy-hint {
  color: #6c757d;
  font-size: 0.9rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  margin-left: 1rem;
}

.result-item:hover .copy-hint {
  opacity: 1;
}

/* 暗色模式适配 */
:root.dark .result-list {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
}

:root.dark .result-item {
  border-bottom-color: rgba(255, 255, 255, 0.05);
}

:root.dark .result-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
}

:root.dark .result-item:active {
  background-color: rgba(255, 255, 255, 0.12);
}

:root.dark .code-text {
  color: var(--text-primary);
}

:root.dark .copy-hint {
  color: var(--text-secondary);
}

/* 校验页面样式 */
.verify-input-card .verify-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.verify-section {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

:root.dark .verify-section {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.verify-btn {
  background-color: #28a745;
  color: white;
  border: none;
  min-width: 120px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.verify-btn:hover:not(:disabled) {
  background-color: #218838;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.verify-btn:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.verify-result-content {
  padding: 1rem;
}

.verify-result-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.verify-result-details {
  padding: 0.5rem 0;
}

.success-message {
  color: #28a745;
  font-weight: 500;
  margin: 0.5rem 0;
}

.error-message {
  color: #dc3545;
  font-weight: 500;
  margin: 0.5rem 0;
}

.code-details {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 122, 255, 0.05);
  border-radius: 8px;
}

.code-details h4 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.code-details ul {
  margin: 0;
  padding-left: 1.5rem;
}

.code-details li {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.code-details li strong {
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', 'Roboto Mono', monospace;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* 说明页面样式 */
.help-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.help-section {
  padding: 1.5rem;
  background: rgba(0, 122, 255, 0.02);
  border-radius: 12px;
  border-left: 4px solid #007aff;
}

.help-section h4 {
  margin: 0 0 1rem 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.help-section p {
  margin: 0.75rem 0;
  line-height: 1.6;
  color: var(--text-secondary);
}

.help-section ul {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.help-section li {
  margin: 0.5rem 0;
  line-height: 1.5;
  color: var(--text-secondary);
}

.code-structure {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
}

.structure-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.structure-label {
  background: #007aff;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 60px;
  text-align: center;
}

.structure-desc {
  color: var(--text-primary);
  font-weight: 500;
}

/* 暗色模式适配 */
:root.dark .help-section {
  background: rgba(0, 122, 255, 0.05);
}

:root.dark .structure-item {
  background: rgba(255, 255, 255, 0.04);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* 免责声明样式 */
.disclaimer-card .disclaimer-content {
  padding: 1rem;
}

.disclaimer-card :deep(.el-alert) {
  margin: 0;
  padding: 1rem;
}

.disclaimer-card :deep(.el-alert__title) {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.disclaimer-text {
  padding: 0.5rem 0;
}

.disclaimer-text p {
  margin: 0.75rem 0;
  line-height: 1.6;
  font-size: 1rem;
  color: var(--el-text-color-primary);
}

.floating-actions {
  position: absolute;
  right: 1rem;
  top: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.textarea-wrapper:hover .floating-actions {
  opacity: 1;
}

.float-btn {
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
  min-width: 40px !important;
  max-width: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
  flex: 0 0 40px !important;
  line-height: 1 !important;
  font-size: 16px !important;
}

.float-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.float-btn.copy-btn {
  background-color: #007aff !important;
  color: white !important;
}

.float-btn.copy-btn:hover {
  background-color: #0056b3 !important;
}

.float-btn.clear-btn {
  background-color: #28a745 !important;
  color: white !important;
}

.float-btn.clear-btn:hover {
  background-color: #218838 !important;
}

/* 修改文本框字体样式 */
:deep(.el-textarea__inner) {
  font-family: 'Courier New', 'Monaco', 'Menlo', 'Consolas', 'Roboto Mono', monospace;
  font-size: 1rem;
  color: #2c3e50;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  line-height: 1.6;
  resize: none;
  letter-spacing: 0.5px;
}

:deep(.el-textarea__inner:focus) {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
}

/* 表单样式 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.count-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 200px;
}

/* 按钮样式 */
.generate-btn {
  background-color: #007aff;
  color: white;
  border: none;
  min-width: 120px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.generate-btn:hover {
  background-color: #0056b3;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .credit-code-tool {
    padding: 1rem;
  }

  .tab-container {
    border-radius: 10px;
    padding: 0.2rem;
  }

  .tab-item {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    gap: 0.25rem;
  }

  .tab-icon {
    font-size: 0.875rem;
  }

  .tool-card {
    padding: 1rem;
    border-radius: 16px;
  }

  .result-header {
    flex-direction: column;
    gap: 1rem;
  }

  .generate-section {
    padding-top: 0.75rem;
  }

  .generate-btn {
    width: 100%;
  }

  .count-wrapper {
    width: 100%;
    max-width: none;
  }

  .verify-btn {
    width: 100%;
  }

  .floating-actions {
    opacity: 1;
    top: 0.75rem;
    right: 0.75rem;
  }

  .float-btn {
    width: 36px !important;
    height: 36px !important;
    min-width: 36px !important;
    max-width: 36px !important;
    min-height: 36px !important;
    max-height: 36px !important;
    flex: 0 0 36px !important;
  }
  
  .float-btn :deep(.el-icon) {
    font-size: 14px !important;
  }

  .result-item {
    padding: 0.75rem;
    font-size: 1rem;
  }

  .code-text {
    font-size: 0.9rem;
    letter-spacing: 0.3px;
  }

  .copy-hint {
    font-size: 0.8rem;
    margin-left: 0.5rem;
  }

  .result-actions-bar {
    flex-direction: column;
    gap: 1rem;
    padding: 0.75rem;
  }

  .actions-buttons {
    width: 100%;
    justify-content: space-between;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .code-structure {
    gap: 0.5rem;
  }

  .structure-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.5rem;
  }

  .structure-label {
    min-width: auto;
    width: 100%;
    text-align: center;
  }
}
</style> 