<template>
  <div class="cron-tool">
    <!-- 主操作区 -->
    <div class="main-content">
      <!-- 功能选项卡 -->
      <el-tabs v-model="activeTab" class="function-tabs">
        <!-- 生成器标签页 -->
        <el-tab-pane label="生成表达式" name="generator">
          <div class="tab-content">
            <!-- 快速场景选择 -->
            <div class="quick-scenarios">
              <div class="section-header">
                <h3>常用场景</h3>
                <el-button-group>
                  <el-button @click="clearSelection">
                    <el-icon><Delete /></el-icon>清除选择
                  </el-button>
                </el-button-group>
              </div>
              <div class="scenario-grid">
                <el-card 
                  v-for="scenario in commonScenarios" 
                  :key="scenario.name"
                  class="scenario-card"
                  :class="{ active: currentScenario === scenario.expression }"
                  @click="selectScenario(scenario)"
                >
                  <div class="scenario-content">
                    <el-icon class="scenario-icon" :size="24">
                      <component :is="scenario.icon" />
                    </el-icon>
                    <div class="scenario-info">
                      <h4>{{ scenario.name }}</h4>
                      <p>{{ scenario.description }}</p>
                      <code>{{ scenario.expression }}</code>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>

            <!-- 自定义配置区域 -->
            <div class="custom-config">
              <div class="section-header">
                <h3>自定义配置</h3>
              </div>
              <el-card class="config-card">
                <div class="config-grid">
                  <div class="config-section">
                    <h4>执行频率</h4>
                    <el-radio-group v-model="frequency" @change="updateExpression" size="large">
                      <el-radio-button label="once">一次</el-radio-button>
                      <el-radio-button label="minutely">每分钟</el-radio-button>
                      <el-radio-button label="hourly">每小时</el-radio-button>
                      <el-radio-button label="daily">每天</el-radio-button>
                      <el-radio-button label="weekly">每周</el-radio-button>
                      <el-radio-button label="monthly">每月</el-radio-button>
                      <el-radio-button label="yearly">每年</el-radio-button>
                      <el-radio-button label="custom">自定义</el-radio-button>
                    </el-radio-group>
                  </div>

                  <!-- 时间选择 -->
                  <div v-if="showTimeSelect" class="config-section">
                    <h4>执行时间</h4>
                    <el-time-picker 
                      v-model="executionTime"
                      format="HH:mm:ss"
                      placeholder="选择时间"
                      @change="updateExpression"
                    />
                  </div>

                  <!-- 日期选择 -->
                  <div v-if="showDateSelect" class="config-section">
                    <h4>执行日期</h4>
                    <el-date-picker
                      v-model="executionDate"
                      type="date"
                      placeholder="选择日期"
                      @change="updateExpression"
                    />
                  </div>

                  <!-- 周几选择 -->
                  <div v-if="frequency === 'weekly'" class="config-section">
                    <h4>选择星期</h4>
                    <el-checkbox-group v-model="selectedDays" @change="updateExpression">
                      <el-checkbox-button 
                        v-for="day in weekDays" 
                        :key="day.value" 
                        :label="day.value"
                      >
                        {{ day.label }}
                      </el-checkbox-button>
                    </el-checkbox-group>
                  </div>

                  <!-- 月份日期选择 -->
                  <div v-if="frequency === 'monthly'" class="config-section">
                    <h4>选择日期</h4>
                    <el-select v-model="selectedMonthDay" @change="updateExpression">
                      <el-option
                        v-for="i in 31"
                        :key="i"
                        :label="`每月${i}号`"
                        :value="i"
                      />
                      <el-option label="每月最后一天" value="L" />
                      <el-option label="每月最后一个工作日" value="LW" />
                    </el-select>
                  </div>
                </div>
              </el-card>
            </div>

            <!-- 表达式结果展示 -->
            <div class="result-section">
              <el-card class="result-card">
                <div class="result-header">
                  <h3>Cron 表达式</h3>
                  <el-button-group>
                    <el-button type="primary" @click="copyCron">
                      <el-icon><CopyDocument /></el-icon>复制
                    </el-button>
                    <el-button @click="validateExpression">
                      <el-icon><Check /></el-icon>验证
                    </el-button>
                  </el-button-group>
                </div>
                <div class="expression-content">
                  <el-input v-model="cronExpression" readonly>
                    <template #prepend>
                      <el-tooltip 
                        content="秒 分 时 日 月 周" 
                        placement="top"
                      >
                        <el-icon><InfoFilled /></el-icon>
                      </el-tooltip>
                    </template>
                  </el-input>
                  <div class="expression-description">
                    {{ expressionDescription }}
                  </div>
                </div>

                <div class="preview-section">
                  <h4>执行预览</h4>
                  <div class="next-runs">
                    <div class="next-run-item" v-for="(time, index) in nextRunTimes" :key="index">
                      <el-icon><Timer /></el-icon>
                      <span>{{ formatDateTime(time) }}</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- 解析器标签页 -->
        <el-tab-pane label="解析表达式" name="parser">
          <div class="parser-section">
            <el-row :gutter="20">
              <el-col :span="24">
                <el-card class="parser-input-card">
                  <template #header>
                    <div class="card-header">
                      <h3>输入 Cron 表达式</h3>
                      <el-button-group>
                        <el-button type="primary" @click="parseExpression">
                          <el-icon><Connection /></el-icon>解析
                        </el-button>
                        <el-button @click="clearParser">
                          <el-icon><Delete /></el-icon>清空
                        </el-button>
                      </el-button-group>
                    </div>
                  </template>

                  <div class="input-section">
                    <el-input
                      v-model="inputExpression"
                      placeholder="例如: 0 0 12 * * ?"
                      size="large"
                      clearable
                    >
                      <template #prepend>
                        <el-tooltip content="秒 分 时 日 月 周" placement="top">
                          <el-icon><InfoFilled /></el-icon>
                        </el-tooltip>
                      </template>
                      <template #append>
                        <el-popover
                          placement="bottom"
                          title="格式说明"
                          :width="300"
                          trigger="hover"
                        >
                          <template #reference>
                            <el-button><el-icon><QuestionFilled /></el-icon></el-button>
                          </template>
                          <div class="format-help">
                            <div class="format-visual">
                              <pre>* * * * * *</pre>
                              <div class="format-labels">
                                <span>秒</span>
                                <span>分</span>
                                <span>时</span>
                                <span>日</span>
                                <span>月</span>
                                <span>周</span>
                              </div>
                            </div>
                          </div>
                        </el-popover>
                      </template>
                    </el-input>
                  </div>
                </el-card>
              </el-col>
            </el-row>

            <!-- 解析结果展示 -->
            <el-row :gutter="20" v-if="parseResult" class="result-row">
              <el-col :span="24">
                <el-card class="result-card" :class="{ 'error': !parseResult.isValid }">
                  <template #header>
                    <div class="card-header">
                      <h3>解析结果</h3>
                      <el-tag :type="parseResult.isValid ? 'success' : 'danger'">
                        {{ parseResult.isValid ? '有效表达式' : '无效表达式' }}
                      </el-tag>
                    </div>
                  </template>

                  <template v-if="parseResult.isValid">
                    <div class="result-description">
                      <el-alert
                        :title="parseResult.description"
                        type="success"
                        :closable="false"
                        show-icon
                      />
                    </div>

                    <div class="parts-grid">
                      <el-descriptions :column="3" border>
                        <el-descriptions-item label="秒">
                          <el-tag size="small">{{ parseResult.parts.seconds }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="分">
                          <el-tag size="small">{{ parseResult.parts.minutes }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="时">
                          <el-tag size="small">{{ parseResult.parts.hours }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="日">
                          <el-tag size="small">{{ parseResult.parts.dayOfMonth }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="月">
                          <el-tag size="small">{{ parseResult.parts.month }}</el-tag>
                        </el-descriptions-item>
                        <el-descriptions-item label="周">
                          <el-tag size="small">{{ parseResult.parts.dayOfWeek }}</el-tag>
                        </el-descriptions-item>
                      </el-descriptions>
                    </div>

                    <div class="next-executions">
                      <h4>
                        <el-icon><Timer /></el-icon>
                        未来执行时间预览
                      </h4>
                      <div class="time-preview">
                        <div 
                          v-for="(time, index) in parseResult.nextRuns" 
                          :key="index"
                          class="time-item"
                        >
                          <span class="time-index">#{{ index + 1 }}</span>
                          <span class="time-value">{{ formatDateTime(time) }}</span>
                        </div>
                      </div>
                    </div>
                  </template>

                  <template v-else>
                    <el-alert
                      :title="parseResult.error"
                      type="error"
                      :closable="false"
                      show-icon
                    />
                  </template>
                </el-card>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- 帮助说明标签页 -->
        <el-tab-pane label="使用帮助" name="help">
          <div class="help-section">
            <!-- 概述卡片 -->
            <el-card class="help-card">
              <template #header>
                <div class="help-card-header">
                  <el-icon><InfoFilled /></el-icon>
                  <span>Cron 表达式简介</span>
                </div>
              </template>
              <div class="help-content">
                <p class="help-desc">Cron 表达式是一种时间表达式，用于设置任务的执行时间。它由6个字段组成，每个字段代表不同的时间单位。</p>
                
                <div class="cron-format-box">
                  <div class="format-header">
                    <el-icon><Timer /></el-icon>
                    <span>表达式格式</span>
                  </div>
                  <div class="format-content">
                    <div class="format-visual">
                      <div class="format-example">* * * * * *</div>
                      <div class="format-labels">
                        <span>秒</span>
                        <span>分</span>
                        <span>时</span>
                        <span>日</span>
                        <span>月</span>
                        <span>周</span>
                      </div>
                    </div>
                    <div class="format-ranges">
                      <div class="range-item">
                        <div class="range-label">秒</div>
                        <div class="range-value">0-59</div>
                      </div>
                      <div class="range-item">
                        <div class="range-label">分钟</div>
                        <div class="range-value">0-59</div>
                      </div>
                      <div class="range-item">
                        <div class="range-label">小时</div>
                        <div class="range-value">0-23</div>
                      </div>
                      <div class="range-item">
                        <div class="range-label">日期</div>
                        <div class="range-value">1-31</div>
                      </div>
                      <div class="range-item">
                        <div class="range-label">月份</div>
                        <div class="range-value">1-12</div>
                      </div>
                      <div class="range-item">
                        <div class="range-label">星期</div>
                        <div class="range-value">0-7</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 特殊字符说明卡片 -->
            <el-card class="help-card">
              <template #header>
                <div class="help-card-header">
                  <el-icon><Edit /></el-icon>
                  <span>特殊字符说明</span>
                </div>
              </template>
              <div class="special-chars-grid">
                <div v-for="char in specialChars" :key="char.symbol" class="special-char-item">
                  <div class="char-symbol">{{ char.symbol }}</div>
                  <div class="char-content">
                    <div class="char-name">{{ char.name }}</div>
                    <div class="char-desc">{{ char.description }}</div>
                    <code v-if="char.example" class="char-example">{{ char.example }}</code>
                  </div>
                </div>
              </div>
            </el-card>

            <!-- 常见示例卡片 -->
            <el-card class="help-card">
              <template #header>
                <div class="help-card-header">
                  <el-icon><Document /></el-icon>
                  <span>常见示例</span>
                </div>
              </template>
              <div class="examples-grid">
                <el-card 
                  v-for="example in commonExamples" 
                  :key="example.expression" 
                  class="example-card"
                  shadow="hover"
                >
                  <div class="example-content">
                    <code class="example-expression">{{ example.expression }}</code>
                    <p class="example-desc">{{ example.description }}</p>
                    <el-button 
                      type="primary" 
                      link 
                      @click="useExample(example.expression)"
                    >
                      使用此表达式
                    </el-button>
                  </div>
                </el-card>
              </div>
            </el-card>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Document as CopyDocument,
  Timer,
  Check,
  Delete,
  Connection,
  InfoFilled,
  QuestionFilled,
  Sunrise,
  Sunset,
  Clock,
  Calendar,
  AlarmClock,
  Moon,
  Star,
  Edit,
  Document
} from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import cronstrue from 'cronstrue/i18n'
import parser from 'cron-parser'

// 常用场景配置
const commonScenarios = [
  {
    name: '每天早上8点',
    description: '适用于每日晨会等固定时间的任务',
    expression: '0 0 8 * * ?',
    icon: 'Sunrise'
  },
  {
    name: '工作日中午12点',
    description: '适用于工作日提醒吃饭等任务',
    expression: '0 0 12 ? * MON-FRI',
    icon: 'Clock'
  },
  {
    name: '每周一早上9点',
    description: '适用于周例会等周期性任务',
    expression: '0 0 9 ? * MON',
    icon: 'Calendar'
  },
  {
    name: '每月1号凌晨',
    description: '适用于月度统计等任务',
    expression: '0 0 0 1 * ?',
    icon: 'Moon'
  },
  {
    name: '每隔5分钟',
    description: '适用于定期检查等高频任务',
    expression: '0 */5 * * * ?',
    icon: 'AlarmClock'
  },
  {
    name: '每天晚上11点',
    description: '适用于数据备份等夜间任务',
    expression: '0 0 23 * * ?',
    icon: 'Star'
  },
  {
    name: '工作日每小时',
    description: '工作日每小时执行一次',
    expression: '0 0 * ? * MON-FRI',
    icon: 'Timer'
  },
  {
    name: '每15分钟',
    description: '每15分钟执行一次的高频任务',
    expression: '0 */15 * * * ?',
    icon: 'Timer'
  },
  {
    name: '每周末早上10点',
    description: '适用于周末特定任务',
    expression: '0 0 10 ? * SAT,SUN',
    icon: 'Calendar'
  },
  {
    name: '每月最后一天',
    description: '月末统计或清理任务',
    expression: '0 0 0 L * ?',
    icon: 'Calendar'
  },
  {
    name: '工作日早9晚6',
    description: '工作时间段的定时任务',
    expression: '0 0 9,18 ? * MON-FRI',
    icon: 'Clock'
  },
  {
    name: '每月第一个周一',
    description: '月度例会等周期性任务',
    expression: '0 0 9 ? * MON#1',
    icon: 'Calendar'
  }
]

// 周几选项
const weekDays = [
  { label: '周日', value: 'SUN' },
  { label: '周一', value: 'MON' },
  { label: '周二', value: 'TUE' },
  { label: '周三', value: 'WED' },
  { label: '周四', value: 'THU' },
  { label: '周五', value: 'FRI' },
  { label: '周六', value: 'SAT' }
]

// 特殊字符说明数据
const specialChars = [
  {
    symbol: '*',
    name: '所有值',
    description: '表示一个字段的所有可能值',
    example: '* * * * * * = 每秒执行'
  },
  {
    symbol: '?',
    name: '不指定值',
    description: '用于日期和星期字段，表示不指定具体值',
    example: '0 0 12 * * ? = 每天12点执行'
  },
  {
    symbol: '-',
    name: '范围',
    description: '表示一个包含的范围',
    example: '0 0 9-17 * * ? = 每天9点到17点整点执行'
  },
  {
    symbol: ',',
    name: '列举',
    description: '表示多个值',
    example: '0 0 9,13,18 * * ? = 每天9点、13点和18点执行'
  },
  {
    symbol: '/',
    name: '间隔',
    description: '表示起始时间开始，每隔固定时间执行',
    example: '0 */30 * * * ? = 每30分钟执行一次'
  },
  {
    symbol: 'L',
    name: '最后',
    description: '用于日期和星期字段，表示最后的时间',
    example: '0 0 0 L * ? = 每月最后一天零点执行'
  },
  {
    symbol: 'W',
    name: '工作日',
    description: '用于日期字段，表示最近的工作日',
    example: '0 0 0 15W * ? = 每月15日最近的工作日零点执行'
  },
  {
    symbol: '#',
    name: '第几个星期几',
    description: '用于星期字段，表示第几个星期几',
    example: '0 0 0 ? * 2#1 = 每月第一个星期一零点执行'
  }
]

// 常见示例数据
const commonExamples = [
  {
    expression: '0 0 12 * * ?',
    description: '每天中午12点执行'
  },
  {
    expression: '0 */5 * * * ?',
    description: '每5分钟执行一次'
  },
  {
    expression: '0 0 9-18 * * ?',
    description: '每天朝九晚六整点执行'
  },
  {
    expression: '0 0 0 1 * ?',
    description: '每月1号零点执行'
  },
  {
    expression: '0 0 12 ? * MON-FRI',
    description: '工作日中午12点执行'
  },
  {
    expression: '0 0 0 L * ?',
    description: '每月最后一天零点执行'
  }
]

const activeTab = ref('generator')
const frequency = ref('daily')
const executionTime = ref(new Date())
const executionDate = ref(new Date())
const selectedDays = ref(['MON'])
const selectedMonthDay = ref(1)
const cronExpression = ref('0 0 12 * * ?')
const currentScenario = ref('')
const inputExpression = ref('')
const parseResult = ref(null)
const nextRunTimes = ref([])

// 计算属性
const showTimeSelect = computed(() => {
  return ['once', 'daily', 'weekly', 'monthly', 'yearly', 'custom'].includes(frequency.value)
})

const showDateSelect = computed(() => {
  return ['once', 'yearly'].includes(frequency.value)
})

const expressionDescription = computed(() => {
  try {
    return cronstrue.toString(cronExpression.value, { locale: 'zh_CN' })
  } catch {
    return '无效的表达式'
  }
})

// 方法
const selectScenario = (scenario) => {
  currentScenario.value = scenario.expression
  cronExpression.value = scenario.expression
  calculateNextRuns()
}

const updateExpression = () => {
  // 根据不同频率生成表达式
  let expr = '0 0 12 * * ?' // 默认值
  
  switch (frequency.value) {
    case 'minutely':
      expr = '0 * * * * ?'
      break
    case 'hourly':
      expr = '0 0 * * * ?'
      break
    case 'daily':
      const time = dayjs(executionTime.value)
      expr = `${time.second()} ${time.minute()} ${time.hour()} * * ?`
      break
    // ... 其他频率的处理
  }
  
  cronExpression.value = expr
  calculateNextRuns()
}

// 计算下次运行时间
const calculateNextRuns = () => {
  try {
    const interval = parser.parseExpression(cronExpression.value)
    nextRunTimes.value = []
    for (let i = 0; i < 5; i++) {
      nextRunTimes.value.push(interval.next().toDate())
    }
  } catch (error) {
    ElMessage.error('无效的 Cron 表达式')
    nextRunTimes.value = []
  }
}

// 复制 cron 表达式
const copyCron = async () => {
  try {
    await navigator.clipboard.writeText(cronExpression.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 解析输入的 cron 表达式
const parseExpression = () => {
  if (!inputExpression.value) {
    ElMessage.warning('请输入 Cron 表达式')
    return
  }

  try {
    // 解析表达式描述
    const description = cronstrue.toString(inputExpression.value, { locale: 'zh_CN' })
    
    // 计算未来执行时间
    const interval = parser.parseExpression(inputExpression.value)
    const nextRuns = []
    for (let i = 0; i < 5; i++) {
      nextRuns.push(interval.next().toDate())
    }

    // 解析各部分值
    const parts = inputExpression.value.split(' ')
    
    parseResult.value = {
      description,
      nextRuns,
      parts: {
        seconds: parts[0],
        minutes: parts[1], 
        hours: parts[2],
        dayOfMonth: parts[3],
        month: parts[4],
        dayOfWeek: parts[5]
      },
      isValid: true
    }

    ElMessage.success('解析成功')
  } catch (error) {
    parseResult.value = {
      isValid: false,
      error: error.toString()
    }
    ElMessage.error('无效的 Cron 表达式')
  }
}

// 清空解析结果
const clearParser = () => {
  parseResult.value = null
  inputExpression.value = ''
}

// 使用示例表达式
const useExample = (expression) => {
  cronExpression.value = expression
  calculateNextRuns()
}

// 格式化日期时间
const formatDateTime = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

// 验证表达式
const validateExpression = () => {
  try {
    const interval = parser.parseExpression(cronExpression.value)
    // 尝试获取下一次执行时间来验证表达式
    interval.next().toDate()
    ElMessage.success('Cron 表达式格式正确')
    return true
  } catch (error) {
    ElMessage.error('无效的 Cron 表达式')
    return false
  }
}

const clearSelection = () => {
  currentScenario.value = ''
  cronExpression.value = '0 0 12 * * ?'
  calculateNextRuns()
}
</script>

<style lang="scss" scoped>
.cron-tool {
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
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.scenario-card {
  cursor: pointer;
  transition: all 0.2s ease;
  
  :deep(.el-card__body) {
    padding: 0.75rem;
  }

  &.active {
    border-color: var(--el-color-primary);
    transform: translateY(-2px);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--el-box-shadow-light);
  }
}

.scenario-content {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.scenario-icon {
  color: var(--el-color-primary);
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.scenario-info {
  flex: 1;
  min-width: 0;

  h4 {
    margin: 0 0 0.25rem;
    font-size: 0.95rem;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 0 0 0.25rem;
    font-size: 0.85rem;
    color: var(--el-text-color-secondary);
    line-height: 1.3;
  }

  code {
    display: block;
    font-size: 0.85rem;
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.config-card {
  background: var(--bg-primary);
}

.config-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.config-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.config-section h4 {
  margin: 0;
  font-size: 0.95rem;
  color: var(--el-text-color-primary);
}

.result-card {
  background: var(--bg-primary);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.result-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.expression-content {
  margin-bottom: 1.5rem;
}

.expression-description {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
}

.preview-section {
  border-top: 1px solid var(--el-border-color-light);
  padding-top: 1rem;
}

.preview-section h4 {
  margin: 0 0 1rem;
  font-size: 0.95rem;
  color: var(--el-text-color-primary);
}

.next-runs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.next-run-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
}

/* 暗色模式适配 */
:root.dark .scenario-card {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color-darker);
}

:root.dark .next-run-item {
  background: var(--el-bg-color-overlay);
}

/* 添加新的样式 */
.parser-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.parser-input-card {
  background: var(--bg-primary);
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.input-section {
  padding: 0.5rem 0;
}

.result-row {
  margin-top: 1rem;
}

.result-card {
  background: var(--bg-primary);
  border-radius: 8px;
}

.result-card.error {
  border: 1px solid var(--el-color-danger);
}

.result-description {
  margin-bottom: 1.5rem;
}

.parts-grid {
  margin: 1.5rem 0;
}

.next-executions {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--el-border-color-light);
}

.next-executions h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
  font-size: 1rem;
  color: var(--el-text-color-primary);
}

.time-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.time-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.time-index {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.time-value {
  font-family: monospace;
  color: var(--el-text-color-regular);
}

.format-help {
  padding: 0.5rem;
}

.format-visual {
  text-align: center;
}

.format-visual pre {
  margin: 0;
  font-size: 1.2rem;
  color: var(--el-color-primary);
}

.format-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
}

/* 暗色模式适配 */
:root.dark .time-item {
  background: var(--el-bg-color-overlay);
}

:root.dark .time-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

/* 添加帮助页面相关样式 */
.help-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
}

.help-card {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.help-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  color: var(--el-text-color-primary);
}

.help-desc {
  font-size: 1rem;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.cron-format-box {
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 1.5rem;
}

.format-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.format-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.format-visual {
  text-align: center;
  padding: 1rem;
  background: var(--el-bg-color);
  border-radius: 6px;
}

.format-example {
  font-family: monospace;
  font-size: 1.5rem;
  color: var(--el-color-primary);
  margin-bottom: 0.5rem;
}

.format-labels {
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
  color: var(--el-text-color-secondary);
}

.format-ranges {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.range-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--el-bg-color);
  border-radius: 6px;
  transition: all 0.2s ease;
}

.range-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.range-label {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.range-value {
  font-family: monospace;
  color: var(--el-color-success);
}

.special-chars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.special-char-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.special-char-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.char-symbol {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
  flex-shrink: 0;
}

.char-content {
  flex: 1;
}

.char-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 0.25rem;
}

.char-desc {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  margin-bottom: 0.5rem;
}

.char-example {
  display: inline-block;
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.example-card {
  border: 1px solid var(--el-border-color-light);
}

.example-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.example-expression {
  font-family: monospace;
  font-size: 1rem;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 0.5rem;
  border-radius: 4px;
}

.example-desc {
  font-size: 0.9rem;
  color: var(--el-text-color-regular);
  margin: 0;
}

/* 暗色模式适配 */
:root.dark .special-char-item {
  background: var(--el-bg-color-overlay);
}

:root.dark .range-item {
  background: var(--el-bg-color-overlay);
}

:root.dark .special-char-item:hover,
:root.dark .range-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}
</style>