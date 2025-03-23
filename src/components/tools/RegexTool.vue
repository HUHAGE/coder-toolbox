<template>
  <div class="regex-tool">
    <div class="main-content">
      <!-- 功能选项卡 -->
      <el-tabs v-model="activeTab" class="function-tabs">
        <!-- 正则生成器 -->
        <el-tab-pane label="正则生成器" name="generator">
          <div class="tab-content">
            <!-- 常用场景 -->
            <div class="quick-scenarios">
              <div class="section-header">
                <h3>常用正则场景</h3>
                <el-button-group>
                  <el-button @click="clearSelection">
                    <el-icon><Delete /></el-icon>清除选择
                  </el-button>
                </el-button-group>
              </div>
              <div class="scenario-grid">
                <el-card 
                  v-for="pattern in commonPatterns" 
                  :key="pattern.name"
                  class="scenario-card"
                  :class="{ active: currentPattern === pattern.regex }"
                  @click="selectPattern(pattern)"
                >
                  <div class="scenario-content">
                    <el-icon class="scenario-icon" :size="20">
                      <component :is="pattern.icon" />
                    </el-icon>
                    <div class="scenario-info">
                      <h4>{{ pattern.name }}</h4>
                      <p>{{ pattern.description }}</p>
                      <code>{{ pattern.regex }}</code>
                    </div>
                  </div>
                </el-card>
              </div>
            </div>

            <!-- 测试区域 -->
            <div class="test-section">
              <el-card class="test-card">
                <div class="test-header">
                  <h3>正则表达式测试</h3>
                  <el-button-group>
                    <el-button type="primary" @click="testRegex">
                      <el-icon><Check /></el-icon>测试
                    </el-button>
                    <el-button @click="copyPattern">
                      <el-icon><CopyDocument /></el-icon>复制
                    </el-button>
                  </el-button-group>
                </div>

                <div class="pattern-input">
                  <div class="input-header">
                    <h4>正则表达式</h4>
                    <div class="pattern-options">
                      <el-checkbox v-model="options.global">全局匹配 (g)</el-checkbox>
                      <el-checkbox v-model="options.ignoreCase">忽略大小写 (i)</el-checkbox>
                      <el-checkbox v-model="options.multiline">多行匹配 (m)</el-checkbox>
                    </div>
                  </div>
                  <el-input
                    v-model="pattern"
                    placeholder="输入正则表达式..."
                    :prefix-icon="Search"
                  />
                </div>

                <div class="test-content">
                  <h4>测试文本</h4>
                  <el-input
                    v-model="testText"
                    type="textarea"
                    :rows="6"
                    placeholder="输入要测试的文本..."
                  />
                </div>

                <!-- 匹配统计信息 -->
                <div class="match-stats" v-if="pattern">
                  <div class="stats-content" :class="{ 'has-matches': isMatched }">
                    <el-icon :size="20" class="stats-icon">
                      <component :is="isMatched ? 'CircleCheck' : 'CircleClose'" />
                    </el-icon>
                    <span class="stats-text">
                      {{ getMatchStats }}
                    </span>
                  </div>
                </div>

                <!-- 匹配结果列表 -->
                <div v-if="testResults.length" class="test-results">
                  <h4>匹配结果</h4>
                  <div class="results-list">
                    <div 
                      v-for="(result, index) in testResults" 
                      :key="index"
                      class="result-item"
                    >
                      <span class="result-index">#{{ index + 1 }}</span>
                      <span class="result-match">{{ result.match }}</span>
                      <span class="result-position">位置: {{ result.index }}</span>
                    </div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </el-tab-pane>

        <!-- 正则参考 -->
        <el-tab-pane label="正则参考" name="reference">
          <div class="reference-section">
            <el-card v-for="category in referenceData" 
              :key="category.title" 
              class="reference-card"
            >
              <template #header>
                <div class="reference-header">
                  <h3>{{ category.title }}</h3>
                </div>
              </template>
              <div class="reference-items">
                <div v-for="item in category.items" 
                  :key="item.symbol" 
                  class="reference-item"
                >
                  <code class="symbol">{{ item.symbol }}</code>
                  <div class="item-info">
                    <div class="item-name">{{ item.name }}</div>
                    <div class="item-desc">{{ item.description }}</div>
                    <code v-if="item.example" class="item-example">{{ item.example }}</code>
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
  InfoFilled, 
  CircleCheck,
  CircleClose,
  Delete,
  Check,
  CopyDocument,
  Search,
  Message,
  Mobile,
  Document,
  Link,
  Monitor,
  Connection,
  Calendar,
  Timer,
  Money,
  Edit,
  User,
  Lock,
  Passport
} from '@element-plus/icons-vue'

// 添加 Element Plus 的配置
const radioGroupConfig = {
  modelValue: ref(''), // 使用 modelValue 代替 v-model
  onChange: (val: string) => {
    radioGroupConfig.modelValue.value = val
  }
}

// 修改 testResults 的类型定义
interface MatchResult {
  match: string
  index: number
  groups?: { [key: string]: string }
}

// 扩展常用正则模式
const commonPatterns = [
  {
    name: '电子邮箱',
    description: '匹配标准电子邮箱地址',
    regex: '^[\\w-]+(\\.[\\w-]+)*@[\\w-]+(\\.[\\w-]+)+$',
    category: '常用验证',
    icon: 'Message'
  },
  {
    name: '手机号码',
    description: '匹配中国大陆手机号',
    regex: '^1[3-9]\\d{9}$',
    category: '常用验证',
    icon: 'Mobile'
  },
  {
    name: '身份证号',
    description: '匹配中国身份证号',
    regex: '^[1-9]\\d{5}(19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[0-9Xx]$',
    category: '常用验证',
    icon: 'Document'
  },
  {
    name: '网址URL',
    description: '匹配标准URL地址',
    regex: '^(https?:\\/\\/)?[\\w-]+(\\.[\\w-]+)+([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?$',
    category: '网络相关'
  },
  {
    name: 'IPv4地址',
    description: '匹配IPv4地址',
    regex: '^((25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',
    category: '网络相关'
  },
  {
    name: 'MAC地址',
    description: '匹配MAC地址',
    regex: '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$',
    category: '网络相关'
  },
  {
    name: '日期(YYYY-MM-DD)',
    description: '匹配YYYY-MM-DD格式日期',
    regex: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$',
    category: '日期时间'
  },
  {
    name: '时间(HH:mm:ss)',
    description: '匹配HH:mm:ss格式时间',
    regex: '^([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$',
    category: '日期时间'
  },
  {
    name: '整数',
    description: '匹配整数(包括负数)',
    regex: '^-?\\d+$',
    category: '数字相关'
  },
  {
    name: '小数',
    description: '匹配小数(包括负数)',
    regex: '^-?\\d+\\.\\d+$',
    category: '数字相关'
  },
  {
    name: '金额',
    description: '匹配金额(最多两位小数)',
    regex: '^\\d+(\\.\\d{1,2})?$',
    category: '数字相关'
  },
  {
    name: '中文字符',
    description: '匹配中文字符',
    regex: '[\\u4e00-\\u9fa5]',
    category: '字符相关'
  },
  {
    name: '用户名',
    description: '字母开头，允许字母数字下划线',
    regex: '^[a-zA-Z]\\w{5,15}$',
    category: '常用验证'
  },
  {
    name: '强密码',
    description: '至少8位，包含大小写字母和数字',
    regex: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d]{8,}$',
    category: '常用验证'
  },
  {
    name: '护照号码',
    description: '匹配中国护照号码',
    regex: '^[A-Z]\\d{8}$',
    category: '常用验证'
  }
]

// 元字符说明
const metacharacters = [
  { char: '.', desc: '匹配除换行符外的任意字符', example: 'a.c 匹配 abc' },
  { char: '^', desc: '匹配字符串开始位置', example: '^abc 匹配以abc开头' },
  { char: '$', desc: '匹配字符串结束位置', example: 'abc$ 匹配以abc结尾' },
  { char: '*', desc: '匹配前面的子表达式零次或多次', example: 'ab* 匹配a,ab,abb' },
  { char: '+', desc: '匹配前面的子表达式一次或多次', example: 'ab+ 匹配ab,abb' },
  { char: '?', desc: '匹配前面的子表达式零次或一次', example: 'ab? 匹配a,ab' }
]

// 常用限定符
const quantifiers = [
  { char: '{n}', desc: '匹配确定的n次', example: 'a{3} 匹配aaa' },
  { char: '{n,}', desc: '匹配至少n次', example: 'a{3,} 匹配aaa,aaaa' },
  { char: '{n,m}', desc: '匹配n到m次', example: 'a{3,5} 匹配aaa,aaaa,aaaaa' }
]

// 字符类
const characterClasses = [
  { char: '\\d', desc: '匹配数字字符', example: '\\d 等价于 [0-9]' },
  { char: '\\w', desc: '匹配字母、数字、下划线', example: '\\w 等价于 [A-Za-z0-9_]' },
  { char: '\\s', desc: '匹配空白字符', example: '\\s 匹配空格、制表符等' }
]

// 响应式状态
const activeTab = ref('generator')
const pattern = ref('')
const testText = ref('')
const currentPattern = ref('')
const testResults = ref<MatchResult[]>([])

// 添加 options 响应式对象
const options = ref({
  global: true,      // 全局匹配
  ignoreCase: false, // 忽略大小写
  multiline: false   // 多行匹配
})

// 计算属性：根据选项生成正则表达式的标志
const flags = computed(() => {
  const result = []
  if (options.value.global) result.push('g')
  if (options.value.ignoreCase) result.push('i')
  if (options.value.multiline) result.push('m')
  return result
})

// 添加新的响应式状态
const isMatched = ref(false)
const matchCount = ref(0)
const matchPositions = ref<Array<{ start: number; end: number }>>([])

// 高亮显示匹配文本
const highlightedText = computed(() => {
  if (!testText.value || !pattern.value) return ''
  
  try {
    const regex = new RegExp(pattern.value, flags.value.join(''))
    return testText.value.replace(regex, match => 
      `<span class="highlight">${match}</span>`
    )
  } catch {
    return testText.value
  }
})

// 选择预设模式
const selectPattern = (patternObj: typeof commonPatterns[0]) => {
  pattern.value = patternObj.regex
  currentPattern.value = patternObj.regex
  if (testText.value) {
    testPattern()
  }
}

// 更新正则表达式
const updatePattern = () => {
  if (!pattern.value) return
  
  try {
    const regex = new RegExp(pattern.value, flags.value.join(''))
    testPattern()
  } catch (error) {
    ElMessage.error('正则表达式语法错误')
  }
}

// 添加匹配统计信息的计算属性
const getMatchStats = computed(() => {
  if (!pattern.value || !testText.value) {
    return '请输入正则表达式和测试文本'
  }
  if (isMatched.value) {
    return `共找到 ${matchCount.value} 个匹配`
  }
  return '未找到匹配'
})

// 修改 testPattern 方法，移除消息提示
const testPattern = () => {
  if (!pattern.value || !testText.value) {
    testResults.value = []
    isMatched.value = false
    matchCount.value = 0
    matchPositions.value = []
    return
  }

  try {
    const regex = new RegExp(pattern.value, flags.value.join(''))
    const matches: MatchResult[] = []
    let match: RegExpExecArray | null
    
    regex.lastIndex = 0
    
    while ((match = regex.exec(testText.value)) !== null) {
      matches.push({
        match: match[0],
        index: match.index,
        groups: match.groups
      })
      
      if (!options.value.global) break
      
      if (match.index === regex.lastIndex) {
        regex.lastIndex++
      }
    }

    testResults.value = matches
    matchPositions.value = matches.map(m => ({
      start: m.index,
      end: m.index + m.match.length
    }))
    matchCount.value = matches.length
    isMatched.value = matches.length > 0

  } catch (error) {
    testResults.value = []
    isMatched.value = false
    matchCount.value = 0
    matchPositions.value = []
    ElMessage.error('正则表达式语法错误：' + (error as Error).message)
  }
}

// 添加到 script 部分的新方法
const getTagType = (category: string) => {
  const types: { [key: string]: string } = {
    '常用验证': '',
    '网络相关': 'success',
    '日期时间': 'warning',
    '数字相关': 'danger',
    '字符相关': 'info'
  }
  return types[category] || ''
}

// 实现之前未实现的方法
const clearSelection = () => {
  pattern.value = ''
  currentPattern.value = ''
  testResults.value = []
  isMatched.value = false
  matchCount.value = 0
  matchPositions.value = []
}

const copyPattern = async () => {
  try {
    await navigator.clipboard.writeText(pattern.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const testRegex = () => {
  testPattern()
}

// 添加实时校验功能
const validatePattern = (value: string) => {
  if (!value) return true
  
  try {
    new RegExp(value)
    return true
  } catch {
    return false
  }
}

// 修改 pattern 的 watch 效果
watch(pattern, (newValue) => {
  if (validatePattern(newValue)) {
    updatePattern()
  }
})

// 修改 testText 的 watch 效果
watch(testText, () => {
  if (pattern.value && validatePattern(pattern.value)) {
    testPattern()
  }
})

// 修改 options 的 watch 效果
watch(options, () => {
  if (pattern.value && validatePattern(pattern.value)) {
    testPattern()
  }
}, { deep: true })

// 在 script 部分添加参考数据
const referenceData = [
  {
    title: '基础元字符',
    items: [
      { symbol: '.', name: '任意字符', description: '匹配除换行符外的任意单个字符', example: 'a.c → abc, adc, a1c' },
      { symbol: '^', name: '开始标记', description: '匹配字符串的开始位置', example: '^abc → abc123' },
      { symbol: '$', name: '结束标记', description: '匹配字符串的结束位置', example: 'abc$ → 123abc' },
      { symbol: '*', name: '零或多次', description: '匹配前面的子表达式零次或多次', example: 'ab* → a, ab, abb' },
      { symbol: '+', name: '一或多次', description: '匹配前面的子表达式一次或多次', example: 'ab+ → ab, abb' },
      { symbol: '?', name: '零或一次', description: '匹配前面的子表达式零次或一次', example: 'ab? → a, ab' },
      { symbol: '\\', name: '转义字符', description: '将特殊字符转义为普通字符', example: '\\. → 匹配点号' }
    ]
  },
  {
    title: '限定符',
    items: [
      { symbol: '{n}', name: '重复n次', description: '精确匹配n次', example: 'a{3} → aaa' },
      { symbol: '{n,}', name: '至少n次', description: '匹配至少n次', example: 'a{2,} → aa, aaa, aaaa' },
      { symbol: '{n,m}', name: 'n到m次', description: '匹配n到m次', example: 'a{2,4} → aa, aaa, aaaa' },
      { symbol: '*?', name: '非贪婪零或多次', description: '尽可能少的匹配', example: 'a.*?b → aab 而不是 aabab' },
      { symbol: '+?', name: '非贪婪一或多次', description: '尽可能少的匹配', example: 'a.+?b → aab 而不是 aabab' },
      { symbol: '??', name: '非贪婪零或一次', description: '尽可能少的匹配', example: 'a??b → b 而不是 ab' }
    ]
  },
  {
    title: '字符类',
    items: [
      { symbol: '[abc]', name: '字符集', description: '匹配方括号中的任意字符', example: '[abc] → a, b, c' },
      { symbol: '[^abc]', name: '否定字符集', description: '匹配除了方括号中字符的任意字符', example: '[^abc] → d, e, f' },
      { symbol: '[a-z]', name: '字符范围', description: '匹配指定范围内的任意字符', example: '[a-z] → 任意小写字母' },
      { symbol: '\\d', name: '数字', description: '匹配任意数字，等价于[0-9]', example: '\\d → 0-9任意数字' },
      { symbol: '\\D', name: '非数字', description: '匹配任意非数字字符', example: '\\D → 任意非数字字符' },
      { symbol: '\\w', name: '单词字符', description: '匹配字母、数字、下划线', example: '\\w → 字母、数字、下划线' },
      { symbol: '\\W', name: '非单词字符', description: '匹配非单词字符', example: '\\W → 标点符号等' },
      { symbol: '\\s', name: '空白字符', description: '匹配任意空白字符', example: '\\s → 空格、制表符等' },
      { symbol: '\\S', name: '非空白字符', description: '匹配任意非空白字符', example: '\\S → 任意可见字符' }
    ]
  },
  {
    title: '分组和引用',
    items: [
      { symbol: '(abc)', name: '捕获组', description: '将括号内的表达式作为一个分组', example: '(abc){2} → abcabc' },
      { symbol: '(?:abc)', name: '非捕获组', description: '不保存分组的匹配结果', example: '(?:abc){2} → abcabc' },
      { symbol: '\\1', name: '反向引用', description: '引用第一个捕获组的内容', example: '(\\d)\\1 → 11, 22, 33' },
      { symbol: '(?=abc)', name: '正向预查', description: '匹配后面是abc的位置', example: 'a(?=b) → a在ab中的a' },
      { symbol: '(?!abc)', name: '负向预查', description: '匹配后面不是abc的位置', example: 'a(?!b) → a在ac中的a' }
    ]
  },
  {
    title: '常见问题',
    items: [
      {
        symbol: '.*',
        name: '贪婪匹配',
        description: '贪婪模式会尽可能多地匹配字符，可能导致匹配结果过长',
        example: '解决方案：使用非贪婪模式 .*?'
      },
      {
        symbol: '[\\u4e00-\\u9fa5]',
        name: '中文字符',
        description: '匹配中文字符的Unicode范围',
        example: '匹配任意中文字符'
      },
      {
        symbol: '\\b',
        name: '单词边界',
        description: '匹配单词的开始或结束位置',
        example: '\\bword\\b → 精确匹配word单词'
      }
    ]
  },
  {
    title: '最佳实践',
    items: [
      {
        symbol: '性能优化',
        name: '避免回溯',
        description: '使用非贪婪匹配和适当的边界限制来提高性能',
        example: '优先使用 .*? 而不是 .*'
      },
      {
        symbol: '可读性',
        name: '合理分组',
        description: '使用命名分组和注释来提高正则表达式的可读性',
        example: '(?<year>\\d{4})-(?<month>\\d{2})'
      },
      {
        symbol: '验证',
        name: '完整性检查',
        description: '使用 ^ 和 $ 确保完整匹配，避免部分匹配',
        example: '使用 ^pattern$ 进行完整匹配'
      }
    ]
  }
]
</script>

<style scoped>
.regex-tool {
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
}

.scenario-card {
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  overflow: hidden;
}

.scenario-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.scenario-content {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.5rem 0.75rem;
}

.scenario-icon {
  color: var(--el-color-primary);
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.scenario-info {
  flex: 1;
  min-width: 0;
}

.scenario-info h4 {
  margin: 0 0 0.125rem;
  font-size: 0.9rem;
  line-height: 1.2;
}

.scenario-info p {
  margin: 0 0 0.25rem;
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.scenario-info code {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 0.15rem 0.4rem;
  border-radius: 12px;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.test-card {
  background: var(--bg-primary);
  border-radius: 16px;
}

.test-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.test-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.pattern-input {
  margin-bottom: 1.5rem;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.input-header h4 {
  margin: 0;
  font-size: 0.95rem;
}

.pattern-options {
  display: flex;
  gap: 1rem;
}

.test-content {
  margin-bottom: 1.5rem;
}

.test-content h4 {
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
}

.test-results {
  border-top: none;
  padding-top: 0;
}

.test-results h4 {
  margin: 0 0 1rem;
  font-size: 0.95rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: var(--el-fill-color-light);
  border-radius: 8px;
}

.result-index {
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
  min-width: 2rem;
}

.result-match {
  font-family: monospace;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

.result-position {
  font-size: 0.8rem;
  color: var(--el-text-color-secondary);
}

.reference-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.reference-card {
  border-radius: 16px;
}

.reference-header {
  margin-bottom: 1rem;
}

.reference-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.reference-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.reference-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.reference-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.symbol {
  font-family: monospace;
  font-size: 1rem;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 0.5rem;
  border-radius: 8px;
  height: fit-content;
  min-width: 60px;
  text-align: center;
}

.item-info {
  flex: 1;
}

.item-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: var(--el-text-color-primary);
}

.item-desc {
  font-size: 0.9rem;
  color: var(--el-text-color-secondary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.item-example {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
}

/* 暗色模式适配 */
:root.dark .scenario-card {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color-darker);
}

:root.dark .result-item,
:root.dark .reference-item {
  background: var(--el-bg-color-overlay);
}

.match-stats {
  border-top: 1px solid var(--el-border-color-light);
  padding-top: 1rem;
  margin-bottom: 1rem;
}

.stats-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  color: var(--el-text-color-secondary);
}

.stats-content.has-matches {
  color: var(--el-color-success);
  background: var(--el-color-success-light-9);
}

/* 添加未匹配状态的样式 */
.stats-content:not(.has-matches) {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}

.stats-icon {
  flex-shrink: 0;
}

.stats-text {
  font-size: 0.9rem;
  font-weight: 500;
}
</style> 