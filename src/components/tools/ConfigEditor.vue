<template>
  <div class="config-editor">
    <!-- 顶部工具栏 -->
    <div class="actions-bar">
      <el-button-group class="action-group">
        <el-button type="primary" @click="openFiles" class="action-button">
          <el-icon><FolderOpened /></el-icon>打开文件
        </el-button>
        <el-button @click="showPathDialog" class="action-button">
          <el-icon><FolderAdd /></el-icon>扫描目录
        </el-button>
        <el-button @click="loadSample" class="action-button">
          <el-icon><Document /></el-icon>示例
        </el-button>
        <el-button @click="showHelp" class="action-button">
          <el-icon><QuestionFilled /></el-icon>帮助
        </el-button>
      </el-button-group>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="searchQuery"
          placeholder="搜索配置项..."
          clearable
          @input="handleSearch"
          @clear="clearSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
          <template #suffix>
            <el-tag v-if="searchResults.length" size="small" type="info">
              {{ searchResults.reduce((sum, result) => sum + result.configs.length, 0) }} 个结果
            </el-tag>
          </template>
        </el-input>
      </div>

      <!-- 编码选择 -->
      <el-select v-model="encoding" size="default" style="width: 120px">
        <el-option label="UTF-8" value="utf-8" />
        <el-option label="ISO-8859-1" value="iso-8859-1" />
      </el-select>
    </div>

    <!-- 警告提示 -->
    <div class="warning-banner">
      <el-alert
        type="warning"
        :closable="false"
      >
        <template #title>
          <div class="warning-content">
            <p class="warning-title">重要提示</p>
            <div class="warning-details">
              <p>1. 配置文件对系统运行至关重要，修改前请务必仔细确认。</p>
              <p>2. 建议修改前先备份原配置文件。</p>
              <p>3. 本工具不会直接修改您的配置文件，所有修改操作均需要您手动确认并执行。</p>
              <p>4. 配置文件的修改结果及其可能带来的影响由用户自行负责。</p>
            </div>
          </div>
        </template>
      </el-alert>
    </div>

    <!-- 编辑区域 -->
    <div class="editor-area">
      <!-- 空状态提示 -->
      <div v-if="!openedTabs.length && !isSearching" class="empty-state">
        <el-empty
          description="暂无打开的配置文件"
          :image-size="160"
        >
          <template #image>
            <img src="@/assets/icons/config.svg" class="empty-icon" alt="配置文件">
          </template>
          <template #description>
            <div class="empty-description">
              <p class="empty-title">开始编辑配置文件</p>
              <p class="empty-text">点击"打开文件"按钮或拖拽文件到此处</p>
            </div>
          </template>
          <el-button type="primary" @click="openFiles">
            <el-icon><FolderOpened /></el-icon>打开文件
          </el-button>
          <el-button @click="loadSample">
            <el-icon><Document /></el-icon>加载示例
          </el-button>
        </el-empty>
      </div>
      
      <!-- 搜索结果视图 -->
      <div v-else-if="isSearching" class="search-results-view">
        <template v-if="searchResults.length">
          <div v-for="result in searchResults" :key="result.tabPath" class="search-result-group">
            <div class="result-group-header">
              <el-icon><Document /></el-icon>
              <span>{{ result.tabName }}</span>
              <el-tag size="small" type="info">{{ result.configs.length }} 个匹配</el-tag>
            </div>
            <div class="config-list">
              <div 
                v-for="item in result.configs" 
                :key="item.key"
                class="config-item"
                :class="{ 'is-commented': item.isCommented }"
              >
                <div class="item-header">
                  <el-switch
                    v-model="item.enabled"
                    @update:model-value="(val) => toggleComment(item, val)"
                    size="small"
                    :active-value="true"
                    :inactive-value="false"
                  />
                  <div class="item-info">
                    <div class="item-key-row">
                      <span class="item-key">{{ item.key }}</span>
                      <el-tag 
                        size="small" 
                        :type="item.type === 'password' ? 'danger' : 'info'"
                      >
                        {{ item.type }}
                      </el-tag>
                    </div>
                    <div v-if="item.description" class="item-description">
                      {{ item.description }}
                    </div>
                  </div>
                </div>
                <div class="item-value">
                  <!-- 布尔值 -->
                  <template v-if="item.type === 'boolean'">
                    <el-switch
                      v-model="item.value"
                      active-text="true"
                      inactive-text="false"
                      :disabled="item.isCommented"
                    />
                  </template>

                  <!-- 数值 -->
                  <template v-else-if="item.type === 'number'">
                    <el-input-number
                      v-model="item.value"
                      :disabled="item.isCommented"
                      controls-position="right"
                    />
                  </template>

                  <!-- 枚举值 -->
                  <template v-else-if="item.type === 'enum'">
                    <el-select
                      v-model="item.value"
                      :disabled="item.isCommented"
                      style="width: 100%"
                    >
                      <el-option
                        v-for="opt in item.options"
                        :key="opt"
                        :label="opt"
                        :value="opt"
                      />
                    </el-select>
                  </template>

                  <!-- 密码 -->
                  <template v-else-if="item.type === 'password'">
                    <el-input
                      v-model="item.value"
                      :disabled="item.isCommented"
                      type="password"
                      show-password
                    />
                  </template>

                  <!-- 多行文本 -->
                  <template v-else-if="item.multiline">
                    <el-input
                      v-model="item.value"
                      :disabled="item.isCommented"
                      type="textarea"
                      :rows="3"
                      show-word-limit
                    />
                  </template>

                  <!-- 普通文本 -->
                  <template v-else>
                    <el-input
                      v-model="item.value"
                      :disabled="item.isCommented"
                      show-word-limit
                    />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </template>
        <el-empty 
          v-else 
          description="未找到匹配的配置项"
          :image-size="120"
        >
          <template #extra>
            <el-button @click="clearSearch">清除搜索</el-button>
          </template>
        </el-empty>
      </div>

      <!-- 正常视图 -->
      <el-tabs 
        v-else-if="openedTabs.length"
        v-model="activeTab" 
        type="card" 
        closable 
        @tab-remove="removeTab"
      >
        <el-tab-pane
          v-for="tab in openedTabs"
          :key="tab.path"
          :label="tab.name"
          :name="tab.path"
        >
          <div class="file-actions">
            <el-button-group>
              <el-button size="small" @click="showOriginalContent(tab)">
                <el-icon><Document /></el-icon>查看原文
              </el-button>
              <el-button size="small" @click="generateNewConfig(tab)">
                <el-icon><Download /></el-icon>生成配置
              </el-button>
            </el-button-group>
            <span class="file-path">{{ tab.path }}</span>
          </div>

          <div class="config-list">
            <div 
              v-for="item in tab.configs" 
              :key="item.key"
              class="config-item"
              :class="{ 'is-commented': item.isCommented }"
            >
              <div class="item-header">
                <el-switch
                  v-model="item.enabled"
                  @update:model-value="(val) => toggleComment(item, val)"
                  size="small"
                  :active-value="true"
                  :inactive-value="false"
                />
                <div class="item-info">
                  <div class="item-key-row">
                    <span class="item-key">{{ item.key }}</span>
                    <el-tag 
                      size="small" 
                      :type="item.type === 'password' ? 'danger' : 'info'"
                    >
                      {{ item.type }}
                    </el-tag>
                  </div>
                  <div v-if="item.description" class="item-description">
                    {{ item.description }}
                  </div>
                </div>
              </div>

              <div class="item-value">
                <!-- 布尔值 -->
                <template v-if="item.type === 'boolean'">
                  <el-switch
                    v-model="item.value"
                    active-text="true"
                    inactive-text="false"
                    :disabled="item.isCommented"
                  />
                </template>

                <!-- 数值 -->
                <template v-else-if="item.type === 'number'">
                  <el-input-number
                    v-model="item.value"
                    :disabled="item.isCommented"
                    controls-position="right"
                  />
                </template>

                <!-- 枚举值 -->
                <template v-else-if="item.type === 'enum'">
                  <el-select
                    v-model="item.value"
                    :disabled="item.isCommented"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="opt in item.options"
                      :key="opt"
                      :label="opt"
                      :value="opt"
                    />
                  </el-select>
                </template>

                <!-- 密码 -->
                <template v-else-if="item.type === 'password'">
                  <el-input
                    v-model="item.value"
                    :disabled="item.isCommented"
                    type="password"
                    show-password
                  />
                </template>

                <!-- 多行文本 -->
                <template v-else-if="item.multiline">
                  <el-input
                    v-model="item.value"
                    :disabled="item.isCommented"
                    type="textarea"
                    :rows="3"
                    show-word-limit
                  />
                </template>

                <!-- 普通文本 -->
                <template v-else>
                  <el-input
                    v-model="item.value"
                    :disabled="item.isCommented"
                    show-word-limit
                  />
                </template>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 帮助对话框 -->
    <el-dialog
      v-model="showHelpDialog"
      title="使用帮助"
      width="600px"
      class="help-dialog"
    >
      <div class="help-content">
        <h3>功能特点</h3>
        <ul>
          <li>🔍 支持多文件管理与搜索</li>
          <li>📝 智能识别配置项类型</li>
          <li>🎨 直观的可视化编辑界面</li>
          <li>💾 多种编码格式支持</li>
          <li>📋 注释与描述管理</li>
        </ul>

        <h3>快速开始</h3>
        <ol>
          <li>点击"打开文件"选择 .properties 文件</li>
          <li>系统自动解析配置项并显示</li>
          <li>使用可视化控件编辑配置值</li>
          <li>点击开关可启用/禁用配置项</li>
          <li>编辑完成后点击"保存"</li>
        </ol>

        <h3>快捷键</h3>
        <div class="shortcut-list">
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>O</kbd>
            <span>打开文件</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>S</kbd>
            <span>保存更改</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>F</kbd>
            <span>搜索配置</span>
          </div>
          <div class="shortcut-item">
            <kbd>Ctrl</kbd> + <kbd>R</kbd>
            <span>刷新文件</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 添加路径扫描对话框 -->
    <el-dialog
      v-model="showPathDialogVisible"
      title="扫描目录"
      width="500px"
    >
      <div class="path-scan-dialog">
        <div class="path-input">
          <el-input
            v-model="scanPath"
            placeholder="请输入要扫描的目录路径"
            clearable
            @keyup.enter="handlePathInput"
          >
            <template #prepend>
              <el-icon><Folder /></el-icon>
            </template>
            <template #append>
              <el-button @click="selectDirectory">
                <el-icon><FolderOpened /></el-icon>
              </el-button>
            </template>
          </el-input>
        </div>
        
        <div class="scan-options">
          <el-checkbox v-model="scanOptions.recursive">递归扫描子目录</el-checkbox>
          <el-checkbox v-model="scanOptions.includeHidden">包含隐藏文件</el-checkbox>
        </div>

        <div class="file-patterns">
          <p class="section-label">文件匹配模式：</p>
          <el-tag
            v-for="pattern in filePatterns"
            :key="pattern"
            closable
            @close="removePattern(pattern)"
          >
            {{ pattern }}
          </el-tag>
          <el-input
            v-if="isAddingPattern"
            ref="patternInput"
            v-model="newPattern"
            size="small"
            @blur="addPattern"
            @keyup.enter="addPattern"
            style="width: 100px"
          />
          <el-button v-else size="small" @click="startAddPattern">
            <el-icon><Plus /></el-icon>添加模式
          </el-button>
        </div>

        <div v-if="scanResults.length" class="scan-results">
          <p class="section-label">扫描结果：</p>
          <el-tree
            :data="scanResults"
            :props="{ label: 'name' }"
            show-checkbox
            node-key="path"
            ref="scanResultsTree"
          >
            <template #default="{ node, data }">
              <span class="scan-result-node">
                <el-icon><Document v-if="!data.isDirectory" /><Folder v-else /></el-icon>
                <span>{{ node.label }}</span>
                <el-tag size="small" type="info" v-if="data.count">
                  {{ data.count }} 个文件
                </el-tag>
              </span>
            </template>
          </el-tree>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showPathDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="startScan" :loading="isScanning">
            {{ isScanning ? '扫描中...' : '开始扫描' }}
          </el-button>
          <el-button type="primary" @click="importSelected" :disabled="!hasSelectedFiles">
            导入选中文件
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 添加查看原文的对话框 -->
    <el-dialog
      v-model="showOriginalDialog"
      title="配置文件原文"
      width="800px"
      class="original-content-dialog"
    >
      <div class="original-content">
        <pre><code>{{ currentOriginalContent }}</code></pre>
      </div>
      <template #footer>
        <el-button @click="showOriginalDialog = false">关闭</el-button>
        <el-button type="primary" @click="copyOriginalContent">
          复制内容
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  FolderOpened,
  Document,
  Folder,
  Download,
  Refresh,
  Search,
  InfoFilled,
  QuestionFilled,
  ArrowDown,
  ArrowUp,
  FolderAdd,
  Plus
} from '@element-plus/icons-vue'
import { parseProperties, stringifyProperties } from '@/utils/propertiesParser'

// 状态定义
const activeTab = ref('')
const searchQuery = ref('')
const searchResults = ref<{
  tabPath: string;
  configs: any[];
}[]>([])
const searchScope = ref('all')
const encoding = ref('utf-8')
const showHelpDialog = ref(false)
const fileTree = ref()
const fileTreeData = ref([])
const openedTabs = ref([])
const showPathDialogVisible = ref(false)
const scanPath = ref('')
const scanOptions = ref({
  recursive: true,
  includeHidden: false
})
const filePatterns = ref(['*.properties', '*.yml', '*.yaml', '*.conf', '*.ini'])
const isAddingPattern = ref(false)
const newPattern = ref('')
const scanResults = ref([])
const isScanning = ref(false)
const scanResultsTree = ref()
const currentDirHandle = ref<any>(null)
const patternInput = ref<any>(null)
const isSearching = ref(false)
const showOriginalDialog = ref(false)
const currentOriginalContent = ref('')

// 示例数据
const sampleConfig = `
# 数据库配置
db.url=jdbc:mysql://localhost:3306/mydb
db.username=root
db.password=123456

# 应用配置
app.name=My Application
app.version=1.0.0
app.debug=true
app.port=8080

# 缓存配置
cache.enabled=true
cache.type=redis
cache.host=localhost
cache.port=6379

# 日志配置
logging.level=INFO
logging.path=/var/logs
logging.pattern=%d{yyyy-MM-dd HH:mm:ss} %-5level %logger{36} - %msg%n
`

// 方法定义
const loadSample = () => {
  const configs = loadConfigs(sampleConfig)
  openedTabs.value = [{
    path: 'sample.properties',
    name: 'sample.properties',
    configs,
    fileHandle: null
  }]
  activeTab.value = 'sample.properties'
  ElMessage.success('示例配置已加载')
}

const showHelp = () => {
  showHelpDialog.value = true
}

// 文件处理方法
const openFiles = async () => {
  try {
    const files = await window.showOpenFilePicker({
      multiple: true,
      types: [
        {
          description: 'Properties Files',
          accept: {
            'text/plain': ['.properties']
          }
        }
      ]
    })
    
    for (const fileHandle of files) {
      const file = await fileHandle.getFile()
      const content = await file.text()
      const configs = loadConfigs(content)
      
      openedTabs.value.push({
        path: file.path,
        name: file.name,
        configs,
        fileHandle
      })
    }
    
    if (files.length > 0) {
      activeTab.value = files[0].path
    }
  } catch (err) {
    ElMessage.error('打开文件失败')
  }
}

// 配置项分组
const getGroupedConfigs = (configs) => {
  const groups = {}
  
  configs.forEach(config => {
    const parts = config.key.split('.')
    const groupName = parts[0]
    
    if (!groups[groupName]) {
      groups[groupName] = {
        name: groupName,
        items: []
      }
    }
    
    groups[groupName].items.push(config)
  })
  
  return Object.values(groups)
}

// 配置项类型检测
const detectConfigType = (value) => {
  if (/^(true|false)$/i.test(value)) return 'boolean'
  if (/^\d+(\.\d+)?$/.test(value)) return 'number'
  if (/password|secret|key/i.test(value)) return 'password'
  if (value.includes('\n')) return 'text-multiline'
  return 'text'
}

// 保存更改
const saveChanges = async () => {
  try {
    for (const tab of openedTabs.value) {
      const content = stringifyProperties(tab.configs)
      const writable = await tab.fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
    }
    ElMessage.success('保存成功')
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

// 搜索处理
const handleSearch = () => {
  const query = searchQuery.value.toLowerCase().trim()
  isSearching.value = !!query

  if (!query) {
    searchResults.value = []
    return
  }

  // 在所有打开的标签页中搜索
  searchResults.value = openedTabs.value.flatMap(tab => {
    const matchedConfigs = tab.configs.filter(config => {
      const keyMatch = config.key.toLowerCase().includes(query)
      const valueMatch = config.value.toString().toLowerCase().includes(query)
      const descMatch = config.description?.toLowerCase().includes(query)
      return keyMatch || valueMatch || descMatch
    })

    if (matchedConfigs.length > 0) {
      return [{
        tabPath: tab.path,
        tabName: tab.name,
        configs: matchedConfigs
      }]
    }
    return []
  })
}

// 清除搜索
const clearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  isSearching.value = false
}

// 注释切换
const toggleComment = (item: any, value: boolean) => {
  item.isCommented = !value
  item.enabled = value
}

// 移除标签页
const removeTab = (targetPath: string) => {
  const tabs = openedTabs.value
  let activePath = activeTab.value
  
  if (activePath === targetPath) {
    tabs.forEach((tab, index) => {
      if (tab.path === targetPath) {
        const nextTab = tabs[index + 1] || tabs[index - 1]
        if (nextTab) {
          activePath = nextTab.path
        }
      }
    })
  }
  
  openedTabs.value = tabs.filter(tab => tab.path !== targetPath)
  activeTab.value = activePath
}

// 重新加载文件
const reloadFiles = async () => {
  try {
    const currentTabs = [...openedTabs.value]
    openedTabs.value = []
    
    for (const tab of currentTabs) {
      const file = await tab.fileHandle.getFile()
      const content = await file.text()
      const configs = parseProperties(content, encoding.value)
      
      openedTabs.value.push({
        path: tab.path,
        name: tab.name,
        configs,
        fileHandle: tab.fileHandle
      })
    }
    
    ElMessage.success('刷新成功')
  } catch (err) {
    ElMessage.error('刷新失败')
  }
}

// 显示路径扫描对话框
const showPathDialog = () => {
  showPathDialogVisible.value = true
  scanResults.value = []
}

// 选择目录
const selectDirectory = async () => {
  try {
    // 检查 API 是否可用
    if (!('showDirectoryPicker' in window)) {
      ElMessage.error('您的浏览器不支持目录选择功能')
      return
    }

    const dirHandle = await window.showDirectoryPicker({
      mode: 'read'
    })
    
    currentDirHandle.value = dirHandle
    scanPath.value = dirHandle.name
    
    // 自动开始扫描
    startScan()
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      // 用户取消了选择，不显示错误
      return
    }
    console.error('选择目录失败:', err)
    ElMessage.error('选择目录失败，请确保您已授予权限')
  }
}

// 模式管理
const startAddPattern = () => {
  isAddingPattern.value = true
  nextTick(() => {
    patternInput.value?.focus()
  })
}

const addPattern = () => {
  if (newPattern.value && !filePatterns.value.includes(newPattern.value)) {
    filePatterns.value.push(newPattern.value)
  }
  newPattern.value = ''
  isAddingPattern.value = false
}

const removePattern = (pattern: string) => {
  filePatterns.value = filePatterns.value.filter(p => p !== pattern)
}

// 扫描文件
const startScan = async () => {
  if (!currentDirHandle.value) {
    ElMessage.warning('请先选择目录')
    return
  }

  isScanning.value = true
  scanResults.value = []
  
  try {
    const results = await scanDirectory(currentDirHandle.value, scanOptions.value)
    scanResults.value = results
    const fileCount = countFiles(results)
    if (fileCount > 0) {
      ElMessage.success(`扫描完成，找到 ${fileCount} 个配置文件`)
    } else {
      ElMessage.warning('未找到匹配的配置文件')
    }
  } catch (err) {
    console.error('扫描错误:', err)
    ElMessage.error('扫描失败，请检查目录权限')
  } finally {
    isScanning.value = false
  }
}

// 递归扫描目录
const scanDirectory = async (dirHandle: any, options: any, path = '') => {
  const entries = []
  
  try {
    for await (const entry of dirHandle.values()) {
      const entryPath = path ? `${path}/${entry.name}` : entry.name
      
      if (entry.kind === 'directory') {
        if (options.recursive) {
          const subEntries = await scanDirectory(entry, options, entryPath)
          if (subEntries.length > 0) {
            entries.push({
              name: entry.name,
              path: entryPath,
              isDirectory: true,
              children: subEntries,
              count: countFiles(subEntries)
            })
          }
        }
      } else if (entry.kind === 'file') {
        if (matchesPattern(entry.name) && (options.includeHidden || !entry.name.startsWith('.'))) {
          entries.push({
            name: entry.name,
            path: entryPath,
            isDirectory: false,
            handle: entry
          })
        }
      }
    }
  } catch (err) {
    console.error('扫描错误:', err)
  }
  
  return entries
}

// 检查文件是否匹配模式
const matchesPattern = (filename: string) => {
  return filePatterns.value.some(pattern => {
    const regex = new RegExp('^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$')
    return regex.test(filename)
  })
}

// 计算文件数量
const countFiles = (entries: any[]) => {
  return entries.reduce((count, entry) => {
    if (entry.isDirectory) {
      return count + countFiles(entry.children)
    }
    return count + 1
  }, 0)
}

// 导入选中的文件
const importSelected = async () => {
  const selectedKeys = scanResultsTree.value?.getCheckedKeys() || []
  if (selectedKeys.length === 0) {
    ElMessage.warning('请选择要导入的文件')
    return
  }

  try {
    for (const path of selectedKeys) {
      const fileEntry = findFileByPath(scanResults.value, path)
      if (fileEntry && fileEntry.handle) {
        const file = await fileEntry.handle.getFile()
        const content = await file.text()
        const configs = parseProperties(content, encoding.value)
        
        openedTabs.value.push({
          path: fileEntry.path,
          name: fileEntry.name,
          configs,
          fileHandle: fileEntry.handle
        })
      }
    }
    
    showPathDialogVisible.value = false
    ElMessage.success('文件导入成功')
  } catch (err) {
    ElMessage.error('文件导入失败')
  }
}

// 根据路径查找文件
const findFileByPath = (entries: any[], targetPath: string): any => {
  for (const entry of entries) {
    if (entry.path === targetPath) return entry
    if (entry.children) {
      const found = findFileByPath(entry.children, targetPath)
      if (found) return found
    }
  }
  return null
}

// 计算属性
const hasSelectedFiles = computed(() => {
  return (scanResultsTree.value?.getCheckedKeys() || []).length > 0
})

// 手动输入路径的处理
const handlePathInput = async () => {
  try {
    if (!scanPath.value) return
    
    // 尝试通过 path 获取目录句柄
    const handle = await window.showDirectoryPicker({
      startIn: scanPath.value
    })
    
    currentDirHandle.value = handle
    startScan()
  } catch (err) {
    ElMessage.error('无效的目录路径')
  }
}

// 查看原文功能
const showOriginalContent = async (tab: any) => {
  try {
    const file = await tab.fileHandle.getFile()
    const content = await file.text()
    currentOriginalContent.value = content
    showOriginalDialog.value = true
  } catch (err) {
    ElMessage.error('无法读取文件内容')
  }
}

// 复制原文内容
const copyOriginalContent = async () => {
  try {
    await navigator.clipboard.writeText(currentOriginalContent.value)
    ElMessage.success('已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

// 生成新配置
const generateNewConfig = async (tab: any) => {
  try {
    // 生成新的配置内容
    const content = stringifyProperties(tab.configs)
    
    // 复制到剪贴板
    await navigator.clipboard.writeText(content)
    
    // 显示提示对话框
    ElMessageBox.alert(
      `<div style="word-break: break-all;">
        <p>新的配置文件内容已生成并复制到剪贴板。</p>
        <p>请按以下步骤操作：</p>
        <ol style="margin: 16px 0; padding-left: 24px;">
          <li>打开原配置文件</li>
          <li>全选并删除原有内容</li>
          <li>粘贴新的配置内容</li>
          <li>保存文件</li>
        </ol>
        <div style="background: var(--el-bg-color-page); padding: 12px; border-radius: 8px; margin-top: 16px;">
          <p style="margin: 0 0 8px 0; font-weight: 500;">新配置文件预览：</p>
          <pre style="margin: 0; max-height: 200px; overflow-y: auto;"><code>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
        </div>
      </div>`,
      '生成配置文件',
      {
        confirmButtonText: '确定',
        dangerouslyUseHTMLString: true,
        customClass: 'config-preview-dialog'
      }
    )
  } catch (err) {
    console.error('生成配置文件失败:', err)
    ElMessage.error('生成配置文件失败')
  }
}

// 修改文件加载逻辑，添加 enabled 属性
const loadConfigs = (content: string) => {
  const configs = parseProperties(content, encoding.value)
  // 为每个配置项添加 enabled 属性
  configs.forEach(config => {
    config.enabled = !config.isCommented
  })
  return configs
}

// 生命周期钩子
onMounted(() => {
  // 初始化逻辑
})
</script>

<style scoped>
.config-editor {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: var(--el-box-shadow-light);
}

.actions-bar {
  padding: 12px 16px;
  display: flex;
  gap: 12px;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-light);
  background-color: var(--el-bg-color-overlay);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.editor-area {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.config-list {
  padding: 16px;
  overflow-y: auto;
}

.config-item {
  background: var(--el-bg-color-overlay);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-lighter);
  position: relative;
  overflow: hidden;
}

.config-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--el-box-shadow-light);
}

.config-item.is-commented {
  opacity: 0.6;
  background: var(--el-bg-color-page);
}

.item-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
}

.item-info {
  flex: 1;
}

.item-key-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.item-key {
  font-weight: 500;
  color: var(--el-text-color-primary);
  flex: 1;
}

.item-description {
  margin-top: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  padding: 8px;
  background: var(--el-bg-color-page);
  border-radius: 6px;
  border-left: 3px solid var(--el-color-primary-light-5);
}

.item-value {
  margin-left: 36px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

.help-content {
  color: var(--el-text-color-primary);
}

.help-content h3 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 500;
}

.help-content ul,
.help-content ol {
  padding-left: 24px;
  margin-bottom: 16px;
}

.help-content li {
  margin-bottom: 8px;
  line-height: 1.6;
}

.shortcut-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

kbd {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: monospace;
  font-size: 12px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.config-item {
  animation: slideIn 0.3s ease-out;
}

.path-scan-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.scan-options {
  display: flex;
  gap: 24px;
}

.section-label {
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
}

.file-patterns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.scan-results {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 8px;
}

.scan-result-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 添加搜索相关样式 */
.search-results-view {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.search-result-group {
  margin-bottom: 24px;
}

.result-group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--el-bg-color-page);
  border-radius: 12px;
  margin-bottom: 16px;
}

.result-group-header .el-icon {
  color: var(--el-text-color-secondary);
}

.result-group-header span {
  flex: 1;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* 搜索结果高亮 */
.config-item.search-highlight {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary-light-5);
}

/* 搜索框样式优化 */
.search-box :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding-right: 8px;
}

.search-box :deep(.el-input__suffix) {
  display: flex;
  align-items: center;
}

/* 按钮组样式优化 */
.action-group :deep(.el-button) {
  border-radius: 10px;
}

.action-group :deep(.el-button:not(:last-child)) {
  margin-right: 4px;
}

/* 下拉选择框样式优化 */
.el-select :deep(.el-input__wrapper) {
  border-radius: 12px;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  background: var(--el-bg-color-page);
  border-radius: 8px;
  margin-bottom: 16px;
}

.file-path {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.original-content {
  background: var(--el-bg-color-page);
  border-radius: 8px;
  padding: 16px;
  max-height: 60vh;
  overflow-y: auto;
}

.original-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--el-text-color-primary);
}

/* 优化按钮组样式 */
.file-actions .el-button-group .el-button {
  border-radius: 6px;
  margin-right: 4px;
}

.file-actions .el-button-group .el-button:last-child {
  margin-right: 0;
}

/* 对话框内容样式优化 */
.original-content-dialog :deep(.el-dialog__body) {
  padding: 16px;
}

/* 文件路径对话框样式 */
:deep(.file-path-dialog) .el-message-box__content {
  padding: 20px;
  max-width: 500px;
}

:deep(.file-path-dialog) code {
  font-family: monospace;
  font-size: 13px;
  color: var(--el-text-color-regular);
  word-break: break-all;
}

/* 配置预览对话框样式 */
:deep(.config-preview-dialog) .el-message-box__content {
  padding: 20px;
  max-width: 600px;
}

:deep(.config-preview-dialog) pre {
  font-family: monospace;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
  background: var(--el-bg-color);
  padding: 12px;
  border-radius: 6px;
  border: 1px solid var(--el-border-color-lighter);
}

:deep(.config-preview-dialog) ol li {
  margin-bottom: 8px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

/* 警告横幅样式 */
.warning-banner {
  padding: 16px;
  background: var(--el-bg-color-overlay);
  border-bottom: 1px solid var(--el-border-color-light);
}

.warning-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.warning-title {
  font-weight: 600;
  font-size: 14px;
  margin: 0;
  color: var(--el-color-warning-dark);
}

.warning-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.warning-details p {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-regular);
}

/* 空状态提示样式 */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.empty-icon {
  width: 120px;
  height: 120px;
  opacity: 0.6;
}

.empty-description {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.empty-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin: 0;
}

.empty-text {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

:deep(.el-empty__description) {
  margin-top: 0;
}

:deep(.el-empty__bottom) {
  display: flex;
  gap: 12px;
}
</style> 