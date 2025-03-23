<template>
  <div class="credit-code-tool">
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
    </div>

    <!-- 生成结果卡片 -->
    <div class="tool-card result-card">
      <div class="result-header">
        <h3 class="card-title">生成结果</h3>
        <div class="result-actions">
          <el-button class="generate-btn" size="large" @click="generateCodes">
            生 成
          </el-button>
        </div>
      </div>

      <div class="result-content">
        <div class="textarea-wrapper">
          <el-input
            type="textarea"
            v-model="resultText"
            :rows="8"
            placeholder=""
            readonly
          />
          <!-- 悬浮操作按钮 -->
          <div class="floating-actions" v-if="resultText">
            <el-button
              class="float-btn copy-btn"
              circle
              @click="copyResult"
              title="复制结果"
            >
              <el-icon><CopyDocument /></el-icon>
            </el-button>
            <el-button
              class="float-btn clear-btn"
              circle
              @click="clearContent"
              title="清空结果"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 免责声明卡片 -->
    <div class="tool-card verify-card">
      <h3 class="card-title">免责声明</h3>
      <div class="verify-content">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
        >
          <template #title>
            重要提示
          </template>
          <div class="disclaimer-content">
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
  List
} from '@element-plus/icons-vue'

const codeList = ref<string[]>([])
const options = reactive({
  count: 1
})

// 生成统一社会信用代码
function generateCreditCode(): string {
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
  
  const checksum = '0123456789ABCDEFGHJKLMNPQRTUWXY'[31 - (weightedSum % 31)]

  return code17 + checksum
}

// 生成指定数量的统一社会信用代码
const generateCodes = () => {
  codeList.value = []
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
  margin: 0 0 1.5rem 0;
}

.options-card .options-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.result-card {
  .result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .result-actions {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .result-content {
    background: var(--bg-secondary);
    border-radius: 12px;
    padding: 1rem;
  }
}

.textarea-wrapper {
  position: relative;
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
  font-family: "Microsoft YaHei", monospace;
  font-size: 1.1rem;
  color: #2c3e50;
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  line-height: 1.6;
  resize: none;
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

/* 免责声明样式 */
.verify-card {
  .verify-content {
    padding: 1rem;
  }

  :deep(.el-alert) {
    margin: 0;
    padding: 1rem;
    
    .el-alert__title {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .disclaimer-content {
      padding: 0.5rem 0;
      
      p {
        margin: 0.75rem 0;
        line-height: 1.6;
        font-size: 1rem;
        color: var(--el-text-color-primary);
      }
    }
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .credit-code-tool {
    padding: 1rem;
  }

  .tool-card {
    padding: 1rem;
    border-radius: 16px;
  }

  .result-header {
    flex-direction: column;
    gap: 1rem;
  }

  .result-actions {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }

  .count-wrapper {
    width: 100%;
    max-width: none;
  }

  .generate-btn {
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
}
</style> 