<template>
  <tool-layout
    title="Linux命令手册"
    :docs="docs"
  >
    <div class="linux-manual">
      <div class="content-container">
        <!-- 命令展示区域 -->
        <div class="commands-container">
          <el-tabs v-model="activeTab" class="command-tabs">

             <!-- 添加常用场景标签页 -->
             <el-tab-pane label="常用场景" name="scenarios">
              <div class="scenarios-container">
                <!-- 日志查看场景 -->
                <div class="scenario-section">
                  <h3 class="scenario-title">
                    <el-icon><Document /></el-icon>
                    日志查看常用命令
                  </h3>
                  <div class="scenario-desc">
                    本节介绍常用的日志查看命令，帮助你更高效地排查问题。这些命令可以组合使用，通过管道符 '|' 将前一个命令的输出作为后一个命令的输入。
                  </div>
                  <div class="commands-grid">
                    <div 
                      v-for="cmd in logScenarios" 
                      :key="cmd.name"
                      class="command-card"
                      @click="showCommandDetail(cmd)"
                    >
                      <div class="command-header">
                        <span class="command-name">{{ cmd.name }}</span>
                        <el-tag size="small" type="warning">日志查看</el-tag>
                      </div>
                      <p class="command-desc">{{ cmd.shortDesc }}</p>
                      <div class="command-examples" v-if="cmd.examples[0]">
                        <code class="example-code">{{ cmd.examples[0].code }}</code>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 系统监控场景 -->
                <div class="scenario-section">
                  <h3 class="scenario-title">
                    <el-icon><Monitor /></el-icon>
                    系统监控命令
                  </h3>
                  <div class="scenario-desc">
                    本节介绍系统监控相关的命令，帮助你实时掌握系统资源使用情况，包括 CPU、内存、磁盘等。
                  </div>
                  <div class="commands-grid">
                    <div 
                      v-for="cmd in monitorScenarios" 
                      :key="cmd.name"
                      class="command-card"
                      @click="showCommandDetail(cmd)"
                    >
                      <div class="command-header">
                        <span class="command-name">{{ cmd.name }}</span>
                        <el-tag size="small" type="warning">系统监控</el-tag>
                      </div>
                      <p class="command-desc">{{ cmd.shortDesc }}</p>
                      <div class="command-examples" v-if="cmd.examples[0]">
                        <code class="example-code">{{ cmd.examples[0].code }}</code>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 网络诊断场景 -->
                <div class="scenario-section">
                  <h3 class="scenario-title">
                    <el-icon><Connection /></el-icon>
                    网络诊断命令
                  </h3>
                  <div class="scenario-desc">
                    本节介绍网络诊断相关的命令，帮助你快速定位和解决网络连接问题。
                  </div>
                  <div class="commands-grid">
                    <div 
                      v-for="cmd in networkScenarios" 
                      :key="cmd.name"
                      class="command-card"
                      @click="showCommandDetail(cmd)"
                    >
                      <div class="command-header">
                        <span class="command-name">{{ cmd.name }}</span>
                        <el-tag size="small" type="danger">网络诊断</el-tag>
                      </div>
                      <p class="command-desc">{{ cmd.shortDesc }}</p>
                      <div class="command-examples" v-if="cmd.examples[0]">
                        <code class="example-code">{{ cmd.examples[0].code }}</code>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 文件操作场景 -->
                <div class="scenario-section">
                  <h3 class="scenario-title">
                    <el-icon><Folder /></el-icon>
                    文件操作命令
                  </h3>
                  <div class="scenario-desc">
                    本节介绍文件操作相关的命令组合，帮助你更高效地管理和处理文件。
                  </div>
                  <div class="commands-grid">
                    <div 
                      v-for="cmd in fileScenarios" 
                      :key="cmd.name"
                      class="command-card"
                      @click="showCommandDetail(cmd)"
                    >
                      <div class="command-header">
                        <span class="command-name">{{ cmd.name }}</span>
                        <el-tag size="small" type="success">文件操作</el-tag>
                      </div>
                      <p class="command-desc">{{ cmd.shortDesc }}</p>
                      <div class="command-examples" v-if="cmd.examples[0]">
                        <code class="example-code">{{ cmd.examples[0].code }}</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <!-- 修改常用命令标签页为全部命令 -->
            <el-tab-pane label="全部命令" name="all">
              <!-- 搜索区域移到这里 -->
              <div class="search-section">
                <el-input
                  v-model="searchQuery"
                  placeholder="搜索Linux命令..."
                  class="search-input"
                  clearable
                >
                  <template #prefix>
                    <el-icon><Search /></el-icon>
                  </template>
                </el-input>
              </div>

              <div class="commands-grid">
                <div 
                  v-for="cmd in paginatedCommands" 
                  :key="cmd.name"
                  class="command-card"
                  @click="showCommandDetail(cmd)"
                >
                  <div class="command-header">
                    <span class="command-name">{{ cmd.name }}</span>
                    <el-tag 
                      size="small" 
                      :type="getTagType(cmd.type)"
                    >
                      {{ cmd.category }}
                    </el-tag>
                  </div>
                  <p class="command-desc">{{ cmd.shortDesc }}</p>
                  <div class="command-examples" v-if="cmd.examples[0]">
                    <code class="example-code">{{ cmd.examples[0].code }}</code>
                  </div>
                </div>
              </div>

              <!-- 分页控件 -->
              <div class="pagination-container">
                <div class="pagination-wrapper">
                  <el-pagination
                    v-model:current-page="currentPage"
                    :page-size="pageSize"
                    :total="filteredCommands.length"
                    :pager-count="7"
                    layout="prev, pager, next"
                    background
                    @current-change="handlePageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 文件操作标签页 -->
            <el-tab-pane label="文件操作" name="file">
              <div class="commands-grid">
                <div 
                  v-for="cmd in getCommandsByType('file')" 
                  :key="cmd.name"
                  class="command-card"
                  @click="showCommandDetail(cmd)"
                >
                  <div class="command-header">
                    <span class="command-name">{{ cmd.name }}</span>
                    <el-tag size="small" type="success">{{ cmd.category }}</el-tag>
                  </div>
                  <p class="command-desc">{{ cmd.shortDesc }}</p>
                  <div class="command-examples" v-if="cmd.examples[0]">
                    <code class="example-code">{{ cmd.examples[0].code }}</code>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 进程管理标签页 -->
            <el-tab-pane label="进程管理" name="process">
              <div class="commands-grid">
                <div 
                  v-for="cmd in getCommandsByType('process')" 
                  :key="cmd.name"
                  class="command-card"
                  @click="showCommandDetail(cmd)"
                >
                  <div class="command-header">
                    <span class="command-name">{{ cmd.name }}</span>
                    <el-tag size="small" type="warning">{{ cmd.category }}</el-tag>
                  </div>
                  <p class="command-desc">{{ cmd.shortDesc }}</p>
                  <div class="command-examples" v-if="cmd.examples[0]">
                    <code class="example-code">{{ cmd.examples[0].code }}</code>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 系统管理标签页 -->
            <el-tab-pane label="系统管理" name="system">
              <div class="commands-grid">
                <div 
                  v-for="cmd in getCommandsByType('system')" 
                  :key="cmd.name"
                  class="command-card"
                  @click="showCommandDetail(cmd)"
                >
                  <div class="command-header">
                    <span class="command-name">{{ cmd.name }}</span>
                    <el-tag size="small" type="info">{{ cmd.category }}</el-tag>
                  </div>
                  <p class="command-desc">{{ cmd.shortDesc }}</p>
                  <div class="command-examples" v-if="cmd.examples[0]">
                    <code class="example-code">{{ cmd.examples[0].code }}</code>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 网络工具标签页 -->
            <el-tab-pane label="网络工具" name="network">
              <div class="commands-grid">
                <div 
                  v-for="cmd in getCommandsByType('network')" 
                  :key="cmd.name"
                  class="command-card"
                  @click="showCommandDetail(cmd)"
                >
                  <div class="command-header">
                    <span class="command-name">{{ cmd.name }}</span>
                    <el-tag size="small" type="danger">{{ cmd.category }}</el-tag>
                  </div>
                  <p class="command-desc">{{ cmd.shortDesc }}</p>
                  <div class="command-examples" v-if="cmd.examples[0]">
                    <code class="example-code">{{ cmd.examples[0].code }}</code>
                  </div>
                </div>
              </div>
            </el-tab-pane>

           
          </el-tabs>
        </div>

        <!-- 命令详情对话框 -->
        <el-dialog
          v-model="showDetail"
          :title="currentCommand?.name"
          width="800px"
          class="command-detail-dialog"
        >
          <template #header>
            <div class="dialog-header">
              <div class="command-title">
                <span class="command-name">{{ currentCommand?.name }}</span>
                <el-tag size="small">{{ currentCommand?.category }}</el-tag>
              </div>
              <div class="command-actions">
                <el-button-group>
                  <el-tooltip content="复制命令" placement="top">
                    <el-button @click="copyCommand">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="添加到收藏" placement="top">
                    <el-button @click="toggleFavorite">
                      <el-icon><Star /></el-icon>
                    </el-button>
                  </el-tooltip>
                </el-button-group>
              </div>
            </div>
          </template>

          <div class="command-detail-content">
            <!-- 命令说明 -->
            <section class="detail-section">
              <h3>命令说明</h3>
              <p>{{ currentCommand?.description }}</p>
            </section>

            <!-- 语法格式 -->
            <section class="detail-section">
              <h3>语法格式</h3>
              <div class="syntax-box">
                <code>{{ currentCommand?.syntax }}</code>
              </div>
            </section>

            <!-- 参数说明 -->
            <section class="detail-section">
              <h3>参数说明</h3>
              <el-table :data="currentCommand?.options" stripe>
                <el-table-column prop="option" label="参数" width="180" />
                <el-table-column prop="description" label="说明" />
              </el-table>
            </section>

            <!-- 使用示例 -->
            <section class="detail-section">
              <h3>使用示例</h3>
              <div 
                v-for="(example, index) in currentCommand?.examples" 
                :key="index"
                class="example-box"
              >
                <div class="example-desc">{{ example.desc }}</div>
                <div class="example-code-box">
                  <code>{{ example.code }}</code>
                  <el-button 
                    size="small"
                    class="copy-btn"
                    @click="copyExample(example.code)"
                  >
                    复制
                  </el-button>
                </div>
              </div>
            </section>

            <!-- 注意事项 -->
            <section class="detail-section" v-if="currentCommand?.notes">
              <h3>注意事项</h3>
              <ul class="notes-list">
                <li v-for="(note, index) in currentCommand.notes" :key="index">
                  {{ note }}
                </li>
              </ul>
            </section>
          </div>
        </el-dialog>
      </div>
    </div>
  </tool-layout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ToolLayout from '../ToolLayout.vue'
import linuxIcon from '@/assets/icons/linux.svg'
import { Search, CopyDocument, Star, Document, Monitor, Connection, Folder } from '@element-plus/icons-vue'
import { useClipboard } from '@vueuse/core'
import { linuxCommands } from '@/data/linux-commands'

// 状态定义
const activeTab = ref('scenarios')
const searchQuery = ref('')
const showDetail = ref(false)
const currentCommand = ref<any>(null)
const { copy } = useClipboard()

// 修改分页相关的配置
const pageSize = ref(12) // 每页显示12个命令
const currentPage = ref(1)

// 文档内容
const docs = `
# Linux命令手册使用指南

这是一个优雅且全面的Linux命令查询工具，具有以下特点：

- 🔍 智能搜索：快速查找所需命令
- 📑 分类展示：清晰的命令分类
- 📝 详细说明：完整的参数和示例
- ⭐ 收藏功能：保存常用命令
- 📋 一键复制：快速复制命令和示例

## 使用方法

1. 使用顶部搜索框搜索命令
2. 点击分类标签查看不同类别的命令
3. 点击命令卡片查看详细信息
4. 可以收藏常用命令
5. 支持复制命令和示例代码
`

// 根据命令类型获取标签类型
const getTagType = (type: string) => {
  switch (type) {
    case 'file': return 'success'
    case 'process': return 'warning'
    case 'system': return 'info'
    case 'network': return 'danger'
    default: return ''
  }
}

// 修改 getCommandsByType 函数，使其支持分页
const getCommandsByType = (type: string) => {
  const commands = linuxCommands.filter(cmd => cmd.type === type)
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return commands.slice(start, end)
}

// 添加日志查看场景的命令数据
const logScenarios = [
  {
    name: '实时查看日志',
    shortDesc: '查看日志文件尾部，并实时动态输出新内容',
    description: '使用 tail -f 命令可以实时监控日志文件的变化，常用于查看应用运行日志。',
    category: '日志查看',
    type: 'log',
    syntax: 'tail -f [文件名]',
    examples: [
      {
        desc: '实时查看日志',
        code: 'tail -f wrapper.log'
      },
      {
        desc: '查看最后100行并持续监控',
        code: 'tail -f wrapper.log -n 100'
      }
    ]
  },
  {
    name: '搜索日志内容',
    shortDesc: '在日志文件中搜索特定内容',
    description: '使用 grep 命令可以在日志文件中搜索特定的文本内容，支持正则表达式。',
    category: '日志查看',
    type: 'log',
    syntax: 'cat [文件名] | grep [搜索内容] [-C 行数]',
    examples: [
      {
        desc: '搜索包含error的行',
        code: "cat wrapper.log | grep 'error'"
      },
      {
        desc: '显示匹配行及其上下5行',
        code: "cat wrapper.log | grep 'error' -C 5"
      }
    ]
  },
  {
    name: '日志内容提取',
    shortDesc: '提取特定时间段或内容的日志',
    description: '使用 sed 命令可以提取日志中的特定部分，常用于分析特定时间段的日志。',
    category: '日志查看',
    type: 'log',
    syntax: 'sed -n /开始时间/,/结束时间/p [文件名] > [新文件名]',
    examples: [
      {
        desc: '提取特定时间段的日志',
        code: "sed -n '/2021-05-12T00/,/2021-05-13T00:00/p' slow.log > slow20210512.log"
      }
    ]
  },
  {
    name: '分页查看日志',
    shortDesc: '以分页方式查看大量日志内容',
    description: '使用 more 或 less 命令可以分页查看日志内容，避免日志内容刷屏。',
    category: '日志查看',
    type: 'log',
    syntax: 'cat [文件名] | grep [搜索内容] | more',
    examples: [
      {
        desc: '分页查看错误日志',
        code: 'cat test.log | grep "error" | more'
      }
    ]
  }
]

// 添加系统监控场景命令
const monitorScenarios = [
  {
    name: '实时系统负载',
    shortDesc: '查看系统负载和 CPU 使用情况',
    description: '使用 top 命令可以实时监控系统进程、CPU 使用率、内存使用等情况。',
    category: '系统监控',
    type: 'monitor',
    syntax: 'top [-options]',
    examples: [
      {
        desc: '实时监控系统资源',
        code: 'top'
      },
      {
        desc: '按 CPU 使用率排序',
        code: 'top -o %CPU'
      }
    ],
    notes: [
      '按 P 键按 CPU 使用率排序',
      '按 M 键按内存使用率排序',
      '按 q 键退出'
    ]
  },
  {
    name: '内存使用分析',
    shortDesc: '查看系统内存使用详情',
    description: '使用 free 命令查看内存使用情况，包括物理内存和交换空间。',
    category: '系统监控',
    type: 'monitor',
    syntax: 'free [-h] [-s N]',
    examples: [
      {
        desc: '以人类可读方式显示',
        code: 'free -h'
      },
      {
        desc: '每 2 秒更新一次',
        code: 'free -h -s 2'
      }
    ]
  }
]

// 添加网络诊断场景命令
const networkScenarios = [
  {
    name: '网络连通性检测',
    shortDesc: '检查网络连接和延迟情况',
    description: '使用 ping 和 traceroute 命令检查网络连通性和路由情况。',
    category: '网络诊断',
    type: 'network',
    examples: [
      {
        desc: '检查网络连通性',
        code: 'ping -c 4 google.com'
      },
      {
        desc: '查看路由路径',
        code: 'traceroute google.com'
      }
    ]
  },
  {
    name: '端口监听检查',
    shortDesc: '查看系统端口监听状态',
    description: '使用 netstat 或 ss 命令查看网络连接和端口监听状态。',
    category: '网络诊断',
    type: 'network',
    examples: [
      {
        desc: '查看所有监听端口',
        code: 'netstat -tuln'
      },
      {
        desc: '查看特定端口',
        code: 'ss -tuln | grep ":80"'
      }
    ]
  }
]

// 添加文件操作场景命令
const fileScenarios = [
  {
    name: '文件批量处理',
    shortDesc: '批量重命名和移动文件',
    description: '使用 find 和 rename 命令批量处理文件。',
    category: '文件操作',
    type: 'file',
    examples: [
      {
        desc: '批量重命名文件',
        code: 'rename "s/.txt$/.md/" *.txt'
      },
      {
        desc: '查找并移动文件',
        code: 'find . -name "*.jpg" -exec mv {} target_dir/ \\;'
      }
    ]
  },
  {
    name: '文件同步备份',
    shortDesc: '同步文件和目录',
    description: '使用 rsync 命令进行文件同步和备份。',
    category: '文件操作',
    type: 'file',
    examples: [
      {
        desc: '同步目录',
        code: 'rsync -av source/ destination/'
      },
      {
        desc: '增量备份',
        code: 'rsync -av --delete source/ backup/'
      }
    ]
  }
]

// 修改 filteredCommands 计算属性
const filteredCommands = computed(() => {
  let commands = linuxCommands
  
  // 根据当前标签页筛选
  if (activeTab.value === 'scenarios') {
    commands = [
      ...logScenarios,
      ...monitorScenarios,
      ...networkScenarios,
      ...fileScenarios
    ]
  } else if (activeTab.value === 'all' && searchQuery.value) {
    // 在全部命令标签页中搜索
    const keyword = searchQuery.value.toLowerCase()
    commands = commands.filter(cmd => 
      cmd.name.toLowerCase().includes(keyword) ||
      cmd.shortDesc.toLowerCase().includes(keyword) ||
      cmd.description.toLowerCase().includes(keyword)
    )
  } else if (activeTab.value !== 'all') {
    // 其他分类标签页
    commands = commands.filter(cmd => cmd.type === activeTab.value)
  }
  
  return commands
})

// 修改 paginatedCommands 计算属性
const paginatedCommands = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredCommands.value.slice(start, end)
})

// 显示命令详情
const showCommandDetail = (command: any) => {
  currentCommand.value = command
  showDetail.value = true
}

// 复制命令
const copyCommand = async () => {
  if (currentCommand.value) {
    await copy(currentCommand.value.name)
    ElMessage.success('命令已复制到剪贴板')
  }
}

// 复制示例代码
const copyExample = async (code: string) => {
  await copy(code)
  ElMessage.success('示例代码已复制到剪贴板')
}

// 收藏命令
const toggleFavorite = () => {
  // 实现收藏功能
  ElMessage.success('收藏功能开发中...')
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 监听搜索和标签页变化，重置页码
watch([searchQuery, activeTab], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.linux-manual {
  padding: 1rem 2rem;
  max-width: 1400px;
  margin: -1rem auto 0;
  min-height: calc(100vh - 4rem);
}

/* 新增内容容器样式 */
.content-container {
  background: var(--el-bg-color-overlay);
  border-radius: 24px;
  padding: 1.5rem 2rem;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.05),
    0 1px 4px rgba(0, 0, 0, 0.03),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.search-section {
  margin-bottom: 1.5rem;
  padding: 0 0.75rem;
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
}

/* 优化搜索输入框样式 */
:deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 4px 12px;
  background: var(--el-bg-color);
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.03);
}

:deep(.el-input__inner) {
  height: 40px;
  font-size: 1rem;
}

/* 优化标签页容器样式 */
.commands-container {
  background: var(--el-bg-color);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.02);
}

/* 修改命令卡片网格布局，使其更紧凑 */
.commands-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* 减小最小宽度 */
  gap: 12px; /* 减小间距 */
  padding: 0.75rem;
}

/* 修改命令卡片样式 */
.command-card {
  background: #ffffff; /* 修改为纯白色背景 */
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  height: 100px;
  display: flex;
  flex-direction: column;
}

.command-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 24px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.04);
  border-color: var(--el-border-color);
  background: #ffffff;
}

.command-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem; /* 减小标题下方间距 */
}

.command-name {
  font-size: 0.95rem; /* 稍微减小字号 */
  font-weight: 600;
  color: var(--el-color-primary);
}

.command-desc {
  font-size: 0.85rem; /* 减小描述文字大小 */
  color: var(--el-text-color-secondary);
  margin: 0.25rem 0;
  line-height: 1.4;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.command-examples {
  background: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  margin-top: auto;
}

.example-code {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--el-text-color-primary);
}

.command-detail-dialog {
  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.detail-section {
  margin-bottom: 2rem;

  h3 {
    margin-bottom: 1rem;
    color: var(--el-text-color-primary);
  }
}

.syntax-box {
  background: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  
  code {
    font-family: monospace;
    color: var(--el-text-color-primary);
  }
}

.example-box {
  margin-bottom: 1.5rem;
  
  .example-desc {
    margin-bottom: 0.5rem;
    color: var(--el-text-color-regular);
  }
  
  .example-code-box {
    background: var(--el-fill-color-light);
    border-radius: 4px;
    padding: 1rem;
    position: relative;
    
    code {
      font-family: monospace;
      color: var(--el-text-color-primary);
    }
    
    .copy-btn {
      position: absolute;
      right: 0.5rem;
      top: 0.5rem;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    &:hover .copy-btn {
      opacity: 1;
    }
  }
}

.notes-list {
  list-style: disc;
  padding-left: 1.5rem;
  color: var(--el-text-color-regular);
  
  li {
    margin-bottom: 0.5rem;
  }
}

/* 添加分页控件样式 */
.pagination-container {
  margin-top: 1.5rem;
  padding: 1rem 0;
  display: flex;
  justify-content: center;
}

.pagination-wrapper {
  background: var(--el-bg-color-overlay);
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(8px);
}

:deep(.el-pagination.is-background) {
  --el-pagination-bg-color: transparent;
  --el-pagination-hover-color: var(--el-color-primary);
  --el-pagination-button-bg-color: transparent;
}

:deep(.el-pagination.is-background .el-pager li) {
  border-radius: 6px;
  margin: 0 2px;
  min-width: 32px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: var(--el-color-primary);
}

/* 修改暗色模式下的卡片样式 */
:root.dark {
  .content-container {
    background: rgba(255, 255, 255, 0.04);
    box-shadow: 
      0 4px 16px rgba(0, 0, 0, 0.2),
      0 1px 4px rgba(0, 0, 0, 0.1),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  .commands-container {
    background: rgba(255, 255, 255, 0.02);
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.03);
  }

  .command-card {
    background: rgba(30, 30, 30, 0.95); /* 暗色模式下的深色背景 */
    border-color: rgba(255, 255, 255, 0.08);
  }

  .command-card:hover {
    background: rgba(40, 40, 40, 0.95); /* hover 时稍微亮一点 */
    border-color: rgba(255, 255, 255, 0.12);
  }

  .command-examples {
    background: rgba(255, 255, 255, 0.04);  /* 暗色模式下的示例背景 */
  }

  :deep(.el-input__wrapper) {
    background: rgba(255, 255, 255, 0.03);
    box-shadow: 
      0 2px 8px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  .pagination-wrapper {
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .linux-manual {
    padding: 0.5rem 1rem;
    margin-top: -0.5rem;
  }

  .content-container {
    padding: 1rem 1.5rem;
    border-radius: 20px;
  }

  .commands-container {
    padding: 1rem;
  }

  .commands-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 0.75rem;
  }
}

/* 添加场景相关样式 */
.scenarios-container {
  padding: 1rem;
}

.scenario-section {
  margin-bottom: 2rem;
}

.scenario-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.2rem;
  margin: 2rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--el-border-color-light);
  color: var(--el-text-color-primary);
  
  .el-icon {
    font-size: 1.4rem;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    padding: 0.5rem;
    border-radius: 8px;
  }
}

.scenario-desc {
  color: var(--el-text-color-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  padding: 1rem 1.25rem;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border-left: 4px solid var(--el-color-primary);
}
</style> 