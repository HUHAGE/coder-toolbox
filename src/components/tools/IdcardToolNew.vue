<template>
  <div class="idcard-tool">
    <!-- 生成选项卡片 -->
    <div class="tool-card options-card">
      <h3 class="card-title">生成选项</h3>
      <div class="options-form">
        <!-- 地区选择 -->
        <div class="form-group">
          <div class="region-group">
            <div class="region-item">
              <label>省份</label>
              <el-select 
                v-model="selectedProvince" 
                placeholder="选择省份"
                class="region-select"
                @change="handleProvinceChange"
              >
                <el-option 
                  v-for="item in provinces" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="region-item">
              <label>城市</label>
              <el-select 
                v-model="selectedCity" 
                placeholder="选择城市"
                class="region-select"
                :disabled="!selectedProvince"
                @change="handleCityChange"
              >
                <el-option 
                  v-for="item in cities" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value"
                />
              </el-select>
            </div>
            <div class="region-item">
              <label>区县</label>
              <el-select 
                v-model="selectedDistrict" 
                placeholder="选择区县"
                class="region-select"
                :disabled="!selectedCity"
              >
                <el-option 
                  v-for="item in districts" 
                  :key="item.value" 
                  :label="item.label" 
                  :value="item.value"
                />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 修改出生日期和性别的布局 -->
        <div class="form-group">
          <div class="birth-gender-group">
            <div class="birth-item">
              <label>出生日期</label>
              <el-date-picker
                v-model="birthday"
                type="date"
                placeholder="选择出生日期"
                format="YYYY-MM-DD"
                :disabled-date="disabledDate"
                class="date-picker"
              />
            </div>
            <div class="gender-item">
              <label>性别</label>
              <el-radio-group v-model="gender" class="gender-radio">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 生成结果卡片 -->
    <div class="tool-card result-card">
      <div class="result-header">
        <h3 class="card-title">生成结果</h3>
        <div class="result-actions">
          <div class="count-wrapper">
            <span class="count-label">生成数量</span>
            <el-input-number 
              v-model="generateCount" 
              :min="1" 
              :max="100"
              class="count-input"
              controls-position="right"
              size="large"
            />
          </div>
          <el-button class="generate-btn" size="large" @click="generateIdcard">
            生 成
          </el-button>
          <el-button class="random-btn" size="large" @click="generateRandomIdcard">
            随机生成
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
              @click="clearHistory"
              title="清空结果"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 在生成结果卡片后添加校验卡片 -->
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
            <p>1. 本工具生成和显示的身份证号码均为虚拟数据，仅用于软件开发、功能测试等用途；</p>
            <p>2. 请勿将本工具用于生成、验证或收集真实身份证号码；</p>
            <p>3. 根据《中华人民共和国居民身份证法》，任何组织和个人不得非法收集、使用、传播公民的居民身份证信息。</p>
          </div>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Delete, CopyDocument } from '@element-plus/icons-vue'
import { generateIdNumber, validateIdNumber } from '@/utils/idcard-utils'
import { regionData, RegionOption } from '@/utils/region-data'

// 状态定义
const selectedProvince = ref('')
const selectedCity = ref('')
const selectedDistrict = ref('')
const birthday = ref('')
const gender = ref(1)
const generateCount = ref(1)
const idcardList = ref<string[]>([])
const verifyInput = ref('')
const verifyResult = ref<any>(null)

// 计算属性 - 地区数据
const provinces = computed(() => {
  return regionData.map(province => ({
    label: province.label,
    value: province.value
  }))
})

const cities = computed(() => {
  if (!selectedProvince.value) return []
  const province = regionData.find(p => p.value === selectedProvince.value)
  return province?.children?.map(city => ({
    label: city.label,
    value: city.value
  })) || []
})

const districts = computed(() => {
  if (!selectedCity.value) return []
  const province = regionData.find(p => p.value === selectedProvince.value)
  const city = province?.children?.find(c => c.value === selectedCity.value)
  return city?.children?.map(district => ({
    label: district.label,
    value: district.value
  })) || []
})

// 新增计算属性，用于显示结果
const resultText = computed(() => {
  return idcardList.value.join('\n')
})

// 方法定义
const handleProvinceChange = () => {
  selectedCity.value = ''
  selectedDistrict.value = ''
}

const handleCityChange = () => {
  selectedDistrict.value = ''
}

const disabledDate = (time: Date) => {
  return time.getTime() > Date.now()
}

const generateIdcard = () => {
  const region = selectedDistrict.value ? 
    [
      selectedProvince.value.padStart(6, '0').slice(0, 2),
      selectedCity.value.padStart(6, '0').slice(0, 4),
      selectedDistrict.value
    ] : 
    undefined

  const newIdcards = Array(generateCount.value).fill(null).map(() => 
    generateIdNumber({
      region,
      birthday: birthday.value,
      gender: gender.value
    })
  )

  idcardList.value = [...newIdcards, ...idcardList.value].slice(0, 100)
}

const generateRandomIdcard = () => {
  const newIdcards = Array(generateCount.value).fill(null).map(() => 
    generateIdNumber({})
  )
  
  idcardList.value = [...newIdcards, ...idcardList.value].slice(0, 100)
}

const copyResult = async () => {
  if (!resultText.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  try {
    await navigator.clipboard.writeText(resultText.value)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const clearHistory = () => {
  idcardList.value = []
  ElMessage.success('已清空结果')
}

const handleVerifyInput = () => {
  if (verifyInput.value.length === 18) {
    verifyIdcard()
  }
}

const verifyIdcard = () => {
  if (!verifyInput.value) {
    ElMessage.warning('请输入身份证号')
    return
  }

  const result = validateIdNumber(verifyInput.value)
  verifyResult.value = result
}
</script>

<style scoped>
/* 修改背景和布局样式 */
.idcard-tool {
  padding: 0rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 100vh;
  align-items: center; /* 让卡片居中 */
}

.tool-card {
  background: white;
  border-radius: 20px; /* 增加圆角 */
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
  width: 100%;
  max-width: 800px; /* 限制最大宽度 */
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

/* 修复嵌套语法 - result-card */
.result-card .result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.result-card .result-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.result-card .count-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.result-card .count-label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
  white-space: nowrap;
}

.result-card .count-input {
  width: 120px;
}

.result-card .result-content {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1rem;
}

.result-card .result-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
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

.float-btn :deep(.el-icon) {
  margin: 0 !important;
  font-size: 16px !important;
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
  resize: none; /* 禁用调整大小功能 */
}

:deep(.el-textarea__inner:focus) {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.1);
}

/* 暗黑模式适配 - 文本框 */
:root.dark :deep(.el-textarea__inner) {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--el-text-color-primary);
}

:root.dark :deep(.el-textarea__inner:focus) {
  border-color: #007aff;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

/* 暗黑模式适配 - 结果区域 */
:root.dark .result-card .result-content {
  background: rgba(255, 255, 255, 0.03);
}

/* 保持原有的其他样式 */
.form-group label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.region-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.region-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.region-item label {
  font-size: 0.9rem;
  color: #606266;
  font-weight: 500;
}

:root.dark .region-item label {
  color: #e0e0e0;
}

.region-select {
  width: 100%;
}

.birth-gender-group {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  align-items: start;
}

.birth-item,
.gender-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.date-picker {
  width: 100%;
}

.gender-radio {
  margin-top: 0.5rem;
}

/* 暗黑模式适配 - 选择器和表单元素 */
:root.dark .region-item label,
:root.dark .birth-item label,
:root.dark .gender-item label,
:root.dark .count-label {
  color: var(--el-text-color-regular);
}

/* 修改下拉控件样式 */
:deep(.el-select .el-input__wrapper) {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  box-shadow: none;
  transition: all 0.3s;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 下拉面板样式 */
:deep(.el-select-dropdown) {
  background: #ffffff !important;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  backdrop-filter: none;
}

:deep(.el-popper) {
  background: #ffffff !important;
  border: none !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1) !important;
}

:deep(.el-select-dropdown__item) {
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
  color: #606266;
  background: #ffffff !important;
}

:deep(.el-select-dropdown__item.hover),
:deep(.el-select-dropdown__item:hover) {
  background-color: #f5f7fa !important;
}

:deep(.el-select-dropdown__item.selected) {
  color: #409eff;
  font-weight: 600;
  background-color: #ecf5ff !important;
}

/* 暗黑模式下拉面板样式 */
:root.dark :deep(.el-select-dropdown),
:root.dark :deep(.el-popper) {
  background: #1a1a1a !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
}

:root.dark :deep(.el-select-dropdown__item) {
  color: #e0e0e0;
  background: #1a1a1a !important;
}

:root.dark :deep(.el-select-dropdown__item.hover),
:root.dark :deep(.el-select-dropdown__item:hover) {
  background-color: #2a2a2a !important;
}

:root.dark :deep(.el-select-dropdown__item.selected) {
  color: #409eff;
  background-color: #18222c !important;
}

/* 移除所有可能的透明效果 */
:deep(.el-popper__arrow::before) {
  background: #ffffff !important;
  border-color: transparent !important;
}

:root.dark :deep(.el-popper__arrow::before) {
  background: #1a1a1a !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* 确保弹出层完全不透明 */
:deep(.el-select__popper),
:deep(.el-popper) {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .idcard-tool {
    padding: 1rem;
  }

  .tool-card {
    padding: 1rem;
    border-radius: 16px; /* 移动端稍微减小圆角 */
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
    justify-content: space-between;
  }

  :deep(.el-input-number.el-input-number--large) {
    width: 200px;
  }

  .el-button {
    width: 100%;
  }

  .birth-gender-group {
    grid-template-columns: 1fr;
  }

  .floating-actions {
    opacity: 1; /* 在移动端始终显示按钮 */
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

  .region-group {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  :deep(.el-select-dropdown__item) {
    height: 44px;
    line-height: 44px;
  }
}

/* 按钮样式 */
.el-button {
  min-width: 120px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  transition: all 0.3s ease;
}

.generate-btn {
  background-color: #007aff; /* 苹果风格蓝色 */
  color: white;
}

.generate-btn:hover {
  background-color: #0056b3;
}

.random-btn {
  background-color: #28a745; /* Bootstrap 风格绿色 */
  color: white;
}

.random-btn:hover {
  background-color: #218838;
}

/* 暗黑模式适配 - 按钮 */
:root.dark .generate-btn {
  background-color: #0a84ff;
}

:root.dark .generate-btn:hover {
  background-color: #409eff;
}

:root.dark .random-btn {
  background-color: #2ecc71;
}

:root.dark .random-btn:hover {
  background-color: #27ae60;
}

/* 修复嵌套语法 - verify-card */
.verify-card .verify-content {
  padding: 1rem;
}

.verify-card :deep(.el-alert) {
  margin: 0;
  padding: 1rem;
}

.verify-card :deep(.el-alert .el-alert__title) {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.verify-card :deep(.el-alert .disclaimer-content) {
  padding: 0.5rem 0;
}

.verify-card :deep(.el-alert .disclaimer-content p) {
  margin: 0.75rem 0;
  line-height: 1.6;
  font-size: 1rem;
  color: var(--el-text-color-primary);
}

/* 暗黑模式适配 - 免责声明 */
:root.dark .verify-card :deep(.el-alert) {
  background-color: rgba(255, 229, 100, 0.15);
  border-color: rgba(255, 229, 100, 0.3);
}

:root.dark .verify-card :deep(.el-alert .el-alert__title) {
  color: #e6a23c;
}

:root.dark .verify-card :deep(.el-alert .disclaimer-content p) {
  color: var(--el-text-color-regular);
}

:root.dark .verify-card :deep(.el-alert .el-alert__icon) {
  color: #e6a23c;
}

/* 适配移动端 */
@media (max-width: 768px) {
  .verify-card .verify-input-wrapper {
    max-width: 100%;
  }
}

/* 修改校验按钮和输入框布局 */
.verify-input-wrapper {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.verify-input-wrapper .el-input {
  flex: 1;
}

.verify-btn {
  background-color: #007aff;
  color: white;
  border: none;
  min-width: 120px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.verify-btn:hover {
  background-color: #0056b3;
}

@media (max-width: 768px) {
  .verify-input-wrapper {
    flex-direction: column;
  }
  
  .verify-btn {
    width: 100%;
  }
}
</style>