<template>
  <div class="idcard-tool">
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

          <!-- 修改出生日期、性别和生成数量的布局 -->
          <div class="form-group">
            <div class="birth-gender-count-group">
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
              <div class="count-item">
                <label>生成数量</label>
                <el-input-number 
                  v-model="generateCount" 
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
        <div class="generate-section">
          <el-button class="generate-btn" size="large" @click="generateIdcard">
            生 成
          </el-button>
          <el-button class="random-btn" size="large" @click="generateRandomIdcard">
            随机生成
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
          <div class="result-actions-bar" v-if="idcardList.length > 0">
            <div class="actions-info">
              <span class="result-count">已生成 {{ idcardList.length }} 个身份证号</span>
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
                @click="clearHistory"
                title="清空结果"
              >
                <el-icon><Delete /></el-icon>
                清空结果
              </el-button>
            </div>
          </div>

          <div class="result-list" v-if="idcardList.length > 0">
            <div 
              v-for="(idcard, index) in idcardList" 
              :key="index"
              class="result-item"
              @click="copyIdcard(idcard)"
              :title="`点击复制: ${idcard}`"
            >
              <span class="idcard-text">{{ idcard }}</span>
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
    </div>

    <!-- 校验页面 -->
    <div v-show="activeTab === 'verify'" class="tab-content">
      <div class="tool-card verify-input-card">
        <h3 class="card-title">身份证号码校验</h3>
        <div class="verify-form">
          <div class="form-group">
            <el-input
              v-model="verifyInput"
              placeholder="请输入18位身份证号码"
              size="large"
              clearable
              @keyup.enter="verifyIdcard"
              @input="handleVerifyInput"
            />
          </div>
          <div class="verify-section">
            <el-button 
              class="verify-btn" 
              size="large" 
              @click="verifyIdcard"
              :disabled="!verifyInput.trim()"
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
                该身份证号码格式正确，校验位验证通过。
              </p>
              <p v-else class="error-message">
                {{ verifyResult.message }}
              </p>
              <div v-if="verifyResult.details" class="idcard-details">
                <h4>身份证信息解析：</h4>
                <ul>
                  <li><strong>地区：</strong>{{ verifyResult.details.region }}</li>
                  <li><strong>出生日期：</strong>{{ verifyResult.details.birthday }}</li>
                  <li><strong>性别：</strong>{{ verifyResult.details.gender }}</li>
                  <li><strong>年龄：</strong>{{ verifyResult.details.age }}岁</li>
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
        <h3 class="card-title">身份证号码说明</h3>
        <div class="help-content">
          <div class="help-section">
            <h4>什么是身份证号码？</h4>
            <p>中华人民共和国居民身份证号码是中华人民共和国为每个公民从出生之日起编定的唯一的、终身不变的身份代码，是证明持有人身份的唯一证件。</p>
          </div>
          
          <div class="help-section">
            <h4>号码结构</h4>
            <div class="code-structure">
              <div class="structure-item">
                <span class="structure-label">第1-6位</span>
                <span class="structure-desc">地址码（省市区）</span>
              </div>
              <div class="structure-item">
                <span class="structure-label">第7-14位</span>
                <span class="structure-desc">出生日期码（YYYYMMDD）</span>
              </div>
              <div class="structure-item">
                <span class="structure-label">第15-17位</span>
                <span class="structure-desc">顺序码（同地区同日期出生的人的顺序）</span>
              </div>
              <div class="structure-item">
                <span class="structure-label">第18位</span>
                <span class="structure-desc">校验码（根据前17位计算得出）</span>
              </div>
            </div>
          </div>

          <div class="help-section">
            <h4>校验规则</h4>
            <p>身份证号码采用加权因子法计算校验位，确保号码的准确性和唯一性。校验位通过特定的算法计算得出，用于验证号码的完整性。</p>
            <p>校验算法：</p>
            <ol>
              <li>将前17位数字分别乘以对应的加权因子：7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2</li>
              <li>将乘积相加得到总和</li>
              <li>用总和除以11得到余数</li>
              <li>根据余数查表得到校验码：0→1, 1→0, 2→X, 3→9, 4→8, 5→7, 6→6, 7→5, 8→4, 9→3, 10→2</li>
            </ol>
          </div>

          <div class="help-section">
            <h4>性别判断</h4>
            <p>身份证号码第17位数字表示性别：奇数表示男性，偶数表示女性。</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 免责声明卡片 -->
    <div v-show="activeTab === 'generate'" class="tool-card disclaimer-card">
      <h3 class="card-title">免责声明</h3>
      <div class="disclaimer-content">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
        >
          <div class="disclaimer-text">
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
import { 
  Delete, 
  CopyDocument, 
  Key, 
  Check, 
  InfoFilled 
} from '@element-plus/icons-vue'
import { generateIdNumber, validateIdNumber } from '@/utils/idcard-utils'
import { regionData, RegionOption } from '@/utils/region-data'

// Tab相关
const tabs = [
  { key: 'generate', label: '生成', icon: Key },
  { key: 'verify', label: '校验', icon: Check },
  { key: 'help', label: '说明', icon: InfoFilled }
]
const activeTab = ref('generate')

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

  console.log('生成参数:', { region, birthday: birthday.value, gender: gender.value })

  const newIdcards = Array(generateCount.value).fill(null).map(() => {
    const idcard = generateIdNumber({
      region,
      birthday: birthday.value,
      gender: gender.value
    })
    console.log('生成的身份证号码:', idcard)
    return idcard
  })

  idcardList.value = [...newIdcards, ...idcardList.value].slice(0, 100)
}

const generateRandomIdcard = () => {
  const newIdcards = Array(generateCount.value).fill(null).map(() => {
    const idcard = generateIdNumber({})
    console.log('随机生成的身份证号码:', idcard)
    return idcard
  })
  
  idcardList.value = [...newIdcards, ...idcardList.value].slice(0, 100)
}

const copyIdcard = async (idcard: string) => {
  try {
    await navigator.clipboard.writeText(idcard)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
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

  console.log('开始校验身份证号码:', verifyInput.value)
  const result = validateIdNumber(verifyInput.value)
  console.log('校验结果:', result)
  
  if (result.isValid) {
    // 解析身份证信息
    const idcard = verifyInput.value
    const regionCode = idcard.substring(0, 6)
    const birthDate = idcard.substring(6, 14)
    const genderCode = parseInt(idcard.substring(16, 17))
    
    // 计算年龄
    const birthYear = parseInt(birthDate.substring(0, 4))
    const birthMonth = parseInt(birthDate.substring(4, 6))
    const birthDay = parseInt(birthDate.substring(6, 8))
    const today = new Date()
    const birthDateObj = new Date(birthYear, birthMonth - 1, birthDay)
    let age = today.getFullYear() - birthDateObj.getFullYear()
    const monthDiff = today.getMonth() - birthDateObj.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--
    }
    
    // 查找地区信息
    let regionName = '未知地区'
    for (const province of regionData) {
      if (province.value.startsWith(regionCode.substring(0, 2))) {
        for (const city of province.children || []) {
          if (city.value.startsWith(regionCode.substring(0, 4))) {
            for (const district of city.children || []) {
              if (district.value === regionCode) {
                regionName = `${province.label} ${city.label} ${district.label}`
                break
              }
            }
            if (regionName !== '未知地区') break
          }
        }
        if (regionName !== '未知地区') break
      }
    }
    
    verifyResult.value = {
      ...result,
      details: {
        region: regionName,
        birthday: `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`,
        gender: genderCode % 2 === 1 ? '男' : '女',
        age: age
      }
    }
  } else {
    verifyResult.value = result
  }
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
  margin-bottom: 2rem;
}

.generate-section {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

/* 暗色模式适配 */
:root.dark .generate-section {
  border-top-color: rgba(255, 255, 255, 0.1);
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

.count-input {
  width: 100%;
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

.idcard-text {
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

:root.dark .idcard-text {
  color: var(--text-primary);
}

:root.dark .copy-hint {
  color: var(--text-secondary);
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

.birth-gender-count-group {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  align-items: start;
}

.birth-item,
.gender-item,
.count-item {
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
    border-radius: 16px; /* 移动端稍微减小圆角 */
  }

  .result-header {
    flex-direction: column;
    gap: 1rem;
  }

  .generate-section {
    flex-direction: column;
    gap: 1rem;
  }

  .generate-btn,
  .random-btn {
    width: 100%;
  }

  .count-input {
    width: 100%;
  }

  .birth-gender-count-group {
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

  .result-item {
    padding: 0.75rem;
    font-size: 1rem;
  }

  .idcard-text {
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

  .verify-btn {
    width: 100%;
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

.idcard-details {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 122, 255, 0.05);
  border-radius: 8px;
}

.idcard-details h4 {
  margin: 0 0 0.75rem 0;
  color: var(--text-primary);
  font-size: 1rem;
}

.idcard-details ul {
  margin: 0;
  padding-left: 1.5rem;
}

.idcard-details li {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.idcard-details li strong {
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

.help-section ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.help-section ol li {
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