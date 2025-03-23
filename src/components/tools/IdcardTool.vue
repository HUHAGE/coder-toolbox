<template>
  <div class="idcard-tool">
    <!-- 主容器 -->
    <div class="tool-container">
      <!-- 生成选项区域 -->
      <div class="options-card">
        <h3 class="section-title">
          <el-icon><Setting /></el-icon>
          生成选项
        </h3>
        
        <div class="options-grid">
          <!-- 地区选择 -->
          <div class="option-group">
            <label class="option-label">地区选择</label>
            <el-cascader
              v-model="selectedRegion"
              :options="regionData"
              :props="{ 
                expandTrigger: 'hover',
                value: 'value',
                label: 'label'
              }"
              placeholder="选择地区（可选）"
              clearable
              class="region-select"
              @change="handleRegionChange"
            />
          </div>

          <!-- 出生日期 -->
          <div class="option-group">
            <label class="option-label">出生日期</label>
            <el-date-picker
              v-model="options.birthday"
              type="date"
              placeholder="选择出生日期（可选）"
              :picker-options="birthdayOptions"
              class="date-picker"
            />
          </div>

          <!-- 性别选择 -->
          <div class="option-group">
            <label class="option-label">性别选择</label>
            <el-radio-group v-model="options.gender" class="gender-group">
              <el-radio-button label="1">男</el-radio-button>
              <el-radio-button label="2">女</el-radio-button>
              <el-radio-button label="0">随机</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 生成数量 -->
          <div class="option-group">
            <label class="option-label">生成数量</label>
            <el-input-number 
              v-model="options.count" 
              :min="1" 
              :max="100" 
              :step="1"
              class="count-input"
              controls-position="right"
            />
          </div>
        </div>
      </div>

      <!-- 操作按钮区域 -->
      <div class="actions-card">
        <div class="actions-group">
          <div class="button-row">
            <el-button type="primary" @click="generateIdcard" class="action-button">
              <el-icon><Key /></el-icon>生成
            </el-button>
            <el-button @click="copyResult" class="action-button">
              <el-icon><CopyDocument /></el-icon>复制
            </el-button>
            <el-button @click="clearContent" class="action-button">
              <el-icon><Delete /></el-icon>清空
            </el-button>
          </div>
        </div>
      </div>

      <!-- 生成结果展示 -->
      <div class="result-card">
        <h3 class="section-title">
          <el-icon><List /></el-icon>
          生成结果
        </h3>
        <div class="result-list">
          <TransitionGroup 
            name="list" 
            tag="div"
            class="idcard-list"
          >
            <div 
              v-for="idcard in idcardList" 
              :key="idcard"
              class="idcard-item"
              @click="copyIdcard(idcard)"
            >
              <span class="idcard-number">{{ idcard }}</span>
              <div class="item-actions">
                <el-icon class="copy-icon"><CopyDocument /></el-icon>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- 校验工具 -->
      <div class="validate-card">
        <h3 class="section-title">
          <el-icon><Check /></el-icon>
          身份证号校验
        </h3>
        <div class="validate-content">
          <el-input
            v-model="validateInput"
            placeholder="请输入要校验的身份证号..."
            clearable
            class="validate-input"
            @keyup.enter="validateIdcard"
          >
            <template #append>
              <el-button @click="validateIdcard">校验</el-button>
            </template>
          </el-input>

          <TransitionGroup 
            name="fade"
            tag="div"
            class="validation-results"
          >
            <div 
              v-if="validationResult" 
              :key="validateInput"
              class="validation-result" 
              :class="{ 'is-valid': validationResult.isValid }"
            >
              <el-icon class="result-icon">
                <component :is="validationResult.isValid ? 'CircleCheckFilled' : 'CircleCloseFilled'" />
              </el-icon>
              <div class="result-messages">
                <div 
                  v-for="(message, index) in validationResult.messages" 
                  :key="index" 
                  class="result-message"
                >
                  {{ message }}
                </div>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>

      <!-- 底部免责声明 -->
      <div class="disclaimer">
        <el-alert
          title="免责声明"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            本工具生成的身份证号仅用于软件测试、开发调试等合法用途，请勿用于非法用途。
          </template>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Key,
  Document as CopyDocument,
  Delete,
  Setting,
  Operation,
  List,
  Check,
  Warning,
  CircleCheckFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue'
import { regionData } from '@/utils/region-data-full'
import { generateIdNumber, validateIdNumber, type ValidationResult } from '@/utils/idcard-utils'

const idcardList = ref<string[]>([])
const selectedRegion = ref([])

const options = reactive({
  birthday: '', // 出生日期
  gender: 0, // 性别：0随机，1男，2女
  count: 1 // 生成数量
})

const birthdayOptions = {
  disabledDate(time: Date) {
    return time.getTime() > Date.now()
  }
}

const validateInput = ref('')
const validationResult = ref<ValidationResult | null>(null)

// 生成身份证号
const generateIdcard = () => {
  idcardList.value = []
  for (let i = 0; i < options.count; i++) {
    const idNumber = generateIdNumber({
      region: selectedRegion.value as string[],
      birthday: options.birthday,
      gender: options.gender
    })
    idcardList.value.push(idNumber)
  }
}

// 复制单个身份证号
const copyIdcard = async (idcard: string) => {
  try {
    await navigator.clipboard.writeText(idcard)
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 复制所有结果
const copyResult = async () => {
  if (idcardList.value.length === 0) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  try {
    await navigator.clipboard.writeText(idcardList.value.join('\n'))
    ElMessage.success('复制成功')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 清空结果
const clearContent = () => {
  idcardList.value = []
  options.birthday = ''
  options.gender = 0
  options.count = 1
  selectedRegion.value = []
}

// 校验身份证号
const validateIdcard = () => {
  if (!validateInput.value) {
    ElMessage.warning('请输入要校验的身份证号')
    return
  }
  validationResult.value = validateIdNumber(validateInput.value)
}

const handleRegionChange = (value: string[]) => {
  selectedRegion.value = value
}
</script>

<style scoped>
.idcard-tool {
  min-height: 100vh;
  background: var(--bg-secondary);
  padding: 1.25rem;
}

.tool-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.options-card,
.actions-card,
.result-card,
.validate-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.button-row {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
}

.idcard-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.idcard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.idcard-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.validate-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.validation-result {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  background: var(--bg-secondary);
}

.disclaimer {
  margin-top: 0.5rem;
}

.disclaimer :deep(.el-alert) {
  border-radius: 8px;
}

/* 动画效果 */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: 1fr;
  }
  
  .button-row {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
  }
}
</style> 