<template>
  <div class="timestamp-tool">
    <!-- 工具卡片 -->
    <div class="tool-card options-card">
      <div class="editor-container">
        <el-row :gutter="20">
          <el-col :span="12">
            <div class="editor-wrapper">
              <div class="editor-label">输入时间/时间戳</div>
              <el-input
                v-model="inputContent"
                type="text"
                placeholder="请输入时间戳或日期时间..."
                class="timestamp-input"
              />
              <div class="format-hint">
                支持格式: 
                <ul>
                  <li>时间戳(秒/毫秒): 1645084800 / 1645084800000</li>
                  <li>日期时间: 2024-02-17 12:00:00</li>
                </ul>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="editor-wrapper">
              <div class="editor-label">转换结果</div>
              <el-input
                v-model="outputContent"
                type="text"
                readonly
                placeholder="转换结果..."
                class="timestamp-input"
              />
              <div v-if="outputContent" class="result-details">
                <div class="detail-item">
                  <span class="detail-label">Unix时间戳(秒):</span>
                  <span class="detail-value">{{ unixTimestamp }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Unix时间戳(毫秒):</span>
                  <span class="detail-value">{{ unixTimestampMs }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">ISO 8601:</span>
                  <span class="detail-value">{{ isoDate }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">本地时间:</span>
                  <span class="detail-value">{{ localDate }}</span>
                </div>
                <div class="timezone-section">
                  <div class="timezone-header">
                    <span class="detail-label">时区时间:</span>
                    <el-select 
                      v-model="selectedTimezone" 
                      size="small" 
                      class="timezone-select"
                    >
                      <el-option
                        v-for="tz in timezones"
                        :key="tz.value"
                        :label="tz.label"
                        :value="tz.value"
                      />
                    </el-select>
                  </div>
                  <div class="timezone-time detail-value">
                    {{ timezoneDate }}
                  </div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

    <!-- 操作按钮卡片 -->
    <div class="tool-card actions-card">
      <div class="actions-wrapper">
        <el-button-group class="action-group">
          <el-button type="primary" @click="toTimestamp" class="action-button">
            <el-icon><Timer /></el-icon>转时间戳
          </el-button>
          <el-button type="primary" @click="toDate" class="action-button">
            <el-icon><Calendar /></el-icon>转日期
          </el-button>
          <el-button @click="getCurrentTime" class="action-button blue-border">
            <el-icon><Clock /></el-icon>当前时间
          </el-button>
          <el-button @click="copyResult" class="action-button blue-border">
            <el-icon><CopyDocument /></el-icon>复制
          </el-button>
          <el-button @click="clearContent" class="action-button clear-button">
            <el-icon><Delete /></el-icon>清空
          </el-button>
        </el-button-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Timer,
  Calendar,
  AlarmClock as Clock,
  Document as CopyDocument,
  Delete 
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

// 启用插件
dayjs.extend(utc)
dayjs.extend(timezone)

// 常用时区列表
const timezones = [
  { label: '北京时间 (UTC+8)', value: 'Asia/Shanghai' },
  { label: '东京时间 (UTC+9)', value: 'Asia/Tokyo' },
  { label: '纽约时间 (UTC-4)', value: 'America/New_York' },
  { label: '伦敦时间 (UTC+1)', value: 'Europe/London' },
  { label: '悉尼时间 (UTC+10)', value: 'Australia/Sydney' },
  { label: 'UTC', value: 'UTC' }
]

const selectedTimezone = ref('Asia/Shanghai')

const inputContent = ref('')
const outputContent = ref('')

const unixTimestamp = computed(() => {
  try {
    const date = dayjs(outputContent.value)
    return date.unix()
  } catch {
    return ''
  }
})

const unixTimestampMs = computed(() => {
  try {
    const date = dayjs(outputContent.value)
    return date.valueOf()
  } catch {
    return ''
  }
})

const isoDate = computed(() => {
  try {
    const date = dayjs(outputContent.value)
    return date.toISOString()
  } catch {
    return ''
  }
})

const localDate = computed(() => {
  try {
    const date = dayjs(outputContent.value)
    return date.format('YYYY-MM-DD HH:mm:ss')
  } catch {
    return ''
  }
})

// 添加时区时间计算
const timezoneDate = computed(() => {
  try {
    if (!outputContent.value) return ''
    const date = dayjs(outputContent.value)
    return date.tz(selectedTimezone.value).format('YYYY-MM-DD HH:mm:ss')
  } catch {
    return ''
  }
})

const toTimestamp = () => {
  try {
    const date = dayjs(inputContent.value)
    if(date.isValid()) {
      outputContent.value = date.valueOf().toString()
      ElMessage.success('转换成功')
    } else {
      ElMessage.error('无效的日期格式')
    }
  } catch (error) {
    ElMessage.error('转换失败')
  }
}

const toDate = () => {
  try {
    // 判断是秒还是毫秒时间戳
    const timestamp = parseInt(inputContent.value)
    const date = timestamp > 9999999999 
      ? dayjs(timestamp) 
      : dayjs.unix(timestamp)
    
    if(date.isValid()) {
      outputContent.value = date.format('YYYY-MM-DD HH:mm:ss')
      ElMessage.success('转换成功')
    } else {
      ElMessage.error('无效的时间戳')
    }
  } catch (error) {
    ElMessage.error('转换失败')
  }
}

const getCurrentTime = () => {
  const now = dayjs()
  inputContent.value = now.format('YYYY-MM-DD HH:mm:ss')
  outputContent.value = now.valueOf().toString()
  ElMessage.success('已获取当前时间')
}

const copyResult = async () => {
  try {
    await navigator.clipboard.writeText(outputContent.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearContent = () => {
  inputContent.value = ''
  outputContent.value = ''
  ElMessage.success('已清空')
}
</script>

<style scoped>
.timestamp-tool {
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

.editor-container {
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 12px;
}

.editor-wrapper {
  position: relative;
}

.editor-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
}

.timestamp-input {
  border-radius: 8px;
}

.format-hint {
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #666666;
}

.format-hint ul {
  margin: 0.5rem 0;
  padding-left: 1.2rem;
}

.format-hint li {
  margin: 0.25rem 0;
}

.result-details {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 8px;
  font-size: 0.9rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #1a1a1a;
  font-weight: 600;
}

.detail-value {
  color: #262626;
  font-family: monospace;
}

.actions-wrapper {
  display: flex;
  justify-content: center;
}

.action-group {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  height: auto;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 主要按钮样式 */
.action-button.el-button--primary {
  background-color: #007aff !important;
  border-color: #007aff !important;
  color: white !important;
}

.action-button.el-button--primary:hover {
  background-color: #0056b3 !important;
  border-color: #0056b3 !important;
}

/* 蓝色边框按钮样式 */
.action-button.blue-border {
  border: 1px solid #007aff !important;
  color: #007aff !important;
  background-color: transparent !important;
}

.action-button.blue-border:hover {
  background-color: rgba(0, 122, 255, 0.1) !important;
}

/* 清空按钮样式 */
.action-button.clear-button {
  border: 1px solid #ff4d4f !important;
  color: #ff4d4f !important;
  background-color: transparent !important;
}

.action-button.clear-button:hover {
  background-color: rgba(255, 77, 79, 0.1) !important;
}

.action-button:active {
  transform: scale(0.98);
}

.timezone-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.timezone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.timezone-select {
  width: 200px;
}

.timezone-time {
  font-size: 1.1rem;
  margin-top: 0.5rem;
  color: #262626;
}

/* 暗色模式适配 */
:root.dark .editor-label,
:root.dark .detail-label {
  color: #ffffff;
}

:root.dark .format-hint {
  color: #a6a6a6;
}

:root.dark .detail-value,
:root.dark .timezone-time {
  color: #e6e6e6;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .timestamp-tool {
    padding: 1rem;
  }

  .tool-card {
    padding: 1rem;
    border-radius: 16px;
  }

  .editor-container {
    padding: 1rem;
  }

  .action-group {
    flex-direction: column;
    width: 100%;
  }

  .action-button {
    width: 100%;
    justify-content: center;
  }

  .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .el-col {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .el-col-12 {
    width: 100%;
    margin-bottom: 1.5rem;
  }

  .el-col-12:last-child {
    margin-bottom: 0;
  }

  .timezone-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .timezone-select {
    width: 100%;
  }
}
</style> 