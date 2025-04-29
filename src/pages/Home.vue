<template>
  <div class="home-container">
    <ParticleSnow />
    <!-- 顶部搜索区域 -->
    <div class="search-section">
      <div class="brand">
        <div class="brand-content">
          <img :src="toolLogo" alt="logo" class="toollogo" />
          <h1 class="title">{{ t.title }}</h1>
        </div>
        
        <!-- 添加操作按钮组 -->
        <div class="header-actions">
          <el-tooltip :content="t.tooltips.aboutProject" placement="bottom">
            <el-button class="action-btn" @click="showAboutProject">
              <el-icon><InfoFilled /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip :content="t.tooltips.aboutAuthor" placement="bottom">
            <el-button class="action-btn" @click="showAboutAuthor">
              <el-icon><User /></el-icon>
            </el-button>
          </el-tooltip>
          
          <el-tooltip :content="t.tooltips.github" placement="bottom">
            <el-button class="action-btn" @click="openGitHub">
              <svg class="github-icon" viewBox="0 0 16 16" width="1em" height="1em">
                <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
            </el-button>
          </el-tooltip>

          <div class="divider"></div>

          <!-- 修改主题切换按钮 -->
          <el-tooltip :content="t.tooltips.toggleTheme" placement="bottom">
            <button class="theme-toggle" @click="toggleTheme" :class="{ 'is-dark': isDarkMode }">
              <div class="toggle-icon">
                <el-icon>
                  <Moon v-if="!isDarkMode" />
                  <Sunny v-else />
                </el-icon>
              </div>
            </button>
          </el-tooltip>

          <!-- 添加语言切换按钮 -->
          <el-tooltip :content="isEnglish ? '切换为中文' : 'Switch to English'" placement="bottom">
            <button class="lang-toggle" @click="toggleLanguage" :class="{ 'is-english': isEnglish }">
              <div class="toggle-icon">
                <span class="lang-text">{{ isEnglish ? '中' : 'En' }}</span>
              </div>
            </button>
          </el-tooltip>
        </div>
      </div>

      <!-- 搜索区域重新设计 -->
      <div class="search-container">
        <div class="search-wrapper" :class="{ 'is-focused': isSearchFocused }">
          <div class="search-box">
            <el-icon class="search-icon">
              <Search />
            </el-icon>
            <input 
              v-model="searchText" 
              type="text" 
              class="search-input" 
              :placeholder="t.searchPlaceholder"
              @focus="isSearchFocused = true" 
              @blur="handleSearchBlur" 
              @keyup.enter="handleSearch" 
            />
            <div class="search-divider"></div>
            <div class="engine-selector" @click.stop="showEngineDropdown = true">
              <span class="engine-name">{{ currentEngine.name }}</span>
              <el-icon class="arrow-icon" :class="{ 'is-active': showEngineDropdown }">
                <ArrowDown />
              </el-icon>
            </div>
          </div>

          <!-- 搜索引擎下拉菜单 -->
          <transition name="fade">
            <div v-if="showEngineDropdown" class="engine-dropdown">
              <div class="engine-list">
                <div v-for="engine in searchEngines" :key="engine.key" class="engine-item"
                  :class="{ active: currentEngine.key === engine.key }" @click="selectEngine(engine)">
                  <el-icon class="engine-icon">
                    <component :is="engine.icon" />
                  </el-icon>
                  <span class="engine-label">{{ engine.name }}</span>
                  <el-icon v-if="currentEngine.key === engine.key" class="check-icon">
                    <Check />
                  </el-icon>
                </div>
              </div>
            </div>
          </transition>
        </div>

        <!-- 背景遮罩 -->
        <div class="search-backdrop" :class="{ 'is-visible': isSearchFocused || showEngineDropdown }"
          @click="handleBackdropClick"></div>
      </div>
    </div>

    <!-- 添加一个新的滚动容器 -->
    <div 
      class="tools-scroll-container" 
      :class="{ 'has-minimized-tools': minimizedTools.length > 0 }"
    >
      <!-- 添加分类标签区域 -->
      <div class="category-tags">
        <el-radio-group v-model="currentCategory" size="large">
          <el-radio-button value="all">
            <el-icon>
              <Grid />
            </el-icon>
            {{ t.allTools }}
          </el-radio-button>
          <el-radio-button v-for="category in categories" :key="category.key" :value="category.key">
            <el-icon>
              <component :is="getCategoryIcon(category.key)" />
            </el-icon>
            {{ t.categories[category.key] }}
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- 工具卡片区域 -->
      <div class="tools-section">
        <transition-group 
          name="fade" 
          tag="div" 
          class="tools-grid"
          :css="false"
        >
          <div 
            v-for="(tool, index) in paginatedTools" 
            :key="tool.code" 
            :data-index="index"
            class="tool-card" 
            @click="navigateToTool(tool)"
          >
            <div class="tool-icon">
              <img :src="tool.icon" :alt="getToolTranslation(tool).name" class="tool-icon-image"/>
            </div>
            <div class="tool-content">
              <h3 class="tool-title">{{ getToolTranslation(tool).name }}</h3>
              <p class="tool-desc">{{ getToolTranslation(tool).description }}</p>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- 添加统计信息模块 -->
    <div class="stats-placeholder"></div>
    <div class="stats-section">
      <div class="stats-container">
        <div class="stats-content">
          <div class="stats-numbers">
            <div class="stat-item">
              <span class="stat-value">{{ toolsCount }}</span>
              <span class="stat-label">{{ t.stats.tools }}</span>
            </div>
            <div class="separator"></div>
            <div class="stat-item">
              <span class="stat-value">{{ categoriesCount }}</span>
              <span class="stat-label">{{ t.stats.categories }}</span>
            </div>
            <div class="separator"></div>
            <div class="stat-item">
              <span class="stat-value">v2.0</span>
              <span class="stat-label">{{ t.stats.version }}</span>
            </div>
          </div>
          
          <div class="stats-divider"></div>
          
          <div class="stats-links">
            <a href="#" @click.prevent="openSourceLink">
              {{ t.links.sourceCode }}
            </a>
            <span class="dot">·</span>
            <a href="#" @click.prevent="openAuthorBlog">
              {{ t.links.aboutAuthor }}
            </a>
            <span class="dot">·</span>
            <a href="#" @click.prevent="showAboutProject">
              {{ t.links.aboutProject }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加对话框组件 -->
    <el-dialog
      v-model="showProjectDialog"
      title="关于项目"
      width="500px"
      class="about-dialog"
    >
      <div class="about-content">
        <h3>呼哈开发者工具箱</h3>
        <p>一个集成了常用开发工具的在线工具箱，包含以下特性：</p>
        <ul>
          <li>🛠️ 丰富的工具集合</li>
          <li>🎨 优雅的用户界面</li>
          <li>🌙 支持深色模式</li>
          <li>📱 响应式设计</li>
          <li>⚡ 快速的本地运行</li>
        </ul>
        <p class="version">当前版本：v1.0.0</p>
        <p>
          本工具由Cursor AI辅助开发。
        </p>
      </div>
    </el-dialog>


    <el-dialog
      v-model="showAuthorDialog"
      title="关于作者"
      width="500px"
      class="about-dialog"
    >
      <div class="about-content">
        <div class="author-info">
          <img :src="authorAvatar" alt="author" class="author-avatar" />
          <div class="author-details">
            <h3>HUHA</h3>
            <p>菜鸟开发者 / 江湖迷途小书童</p>
          </div>
        </div>
        <div class="contact-info">
          <p>联系方式：</p>
          <ul>
            <li>
              <el-icon><Message /></el-icon>
              <span>Email: wsyhok@126.com</span>
            </li>
            <li>
              <el-icon><Link /></el-icon>
              <a 
                href="https://huhage.github.io/huhawebsite" 
                target="_blank"
                class="blog-link"
                @click.stop="openBlog"
              >
                Blog: https://huhage.github.io/huhawebsite
              </a>
            </li>
          </ul>
        </div>
      </div>
    </el-dialog>

    <!-- 使用新组件替换原有的最小化工具栏 -->
    <MinimizedToolsBar :has-stats="showStats" />

    <!-- 添加使用说明对话框 -->
    <el-dialog
      v-model="showManualDialog"
      title="使用说明"
      width="800px"
      class="manual-dialog"
    >
      <div v-if="manualLoadError" class="manual-error">
        <div class="error-icon">
          <el-icon><WarningFilled /></el-icon>
        </div>
        <h3>加载失败</h3>
        <p>很抱歉，使用说明文档加载失败。您可以：</p>
        <ul>
          <li>检查网络连接后重试</li>
          <li>访问在线文档</li>
          <li>联系技术支持</li>
        </ul>
        <el-button type="primary" @click="retryLoadManual">重新加载</el-button>
      </div>
      <div v-else class="manual-content" v-html="manualContent"></div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, inject, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { keepAliveComponents } from '@/stores/keepAliveStore'
import {
  Search,
  ArrowDown,
  Document,
  Edit,
  Timer,
  Key,
  Grid,
  Histogram,
  Connection,
  Clock,
  Collection,
  Check,
  Sunny,
  Moon,
  InfoFilled,
  User,
  Message,
  Link,
  Tools,
  Platform,
  Close,
  Delete,
  ArrowRight,
  ArrowLeft,
  WarningFilled
} from '@element-plus/icons-vue'
import toolLogo from '@/assets/logo/tool_logo.png'
import jsonIcon from '@/assets/icons/json.svg'
import xmlIcon from '@/assets/icons/xml.svg'
import timestampIcon from '@/assets/icons/timestamp.svg'
import base64Icon from '@/assets/icons/base64.svg'
import urlIcon from '@/assets/icons/url.svg'
import uuidIcon from '@/assets/icons/uuid.svg'
import qrcodeIcon from '@/assets/icons/qrcode.svg'
import md5Icon from '@/assets/icons/md5.svg'
import unicodeIcon from '@/assets/icons/unicode.svg'
import httpIcon from '@/assets/icons/http.svg'
import idcardIcon from '@/assets/icons/idcard.svg'
import sqlIcon from '@/assets/icons/sql.svg'
import cronIcon from '@/assets/icons/cron.svg'
import regexIcon from '@/assets/icons/regex.svg'
import diffIcon from '@/assets/icons/diff.svg'
import sqlParamsIcon from '@/assets/icons/sql-params.svg'
import authorAvatar from '@/assets/avatar.png'
import creditIcon from '@/assets/icons/credit.svg'
import sqlFormatIcon from '@/assets/icons/sql-format.svg'
import configEditorIcon from '@/assets/icons/config.svg'
import linuxIcon from '@/assets/icons/linux.svg'
import aesIcon from '@/assets/icons/aes.svg'
import rsaIcon from '@/assets/icons/rsa.svg'
import sqlZHIcon from '@/assets/icons/sql-zh.svg'
import sqlTruncateIcon from '@/assets/icons/sql-truncate.svg'
import sqlAddIcon from '@/assets/icons/sql-add.svg'
import wordToHtmlIcon from '@/assets/icons/word-to-html.svg'
import hanBao from '@/assets/icons/汉堡.svg'
import lanQiu from '@/assets/icons/篮球.svg'
import lotteryIcon from '@/assets/icons/抽奖.svg'
import pixelBreakoutIcon from '@/assets/icons/pixel-breakout.svg' // 添加这一行
import tanchisheIcon from '@/assets/icons/贪吃蛇.svg'
import fanyinliIcon from '@/assets/icons/反应力.svg'
import twoIcon from '@/assets/icons/2048.svg'
import paopaoIcon from '@/assets/icons/paopao.svg'
import mdIcon from '@/assets/icons/markdown.svg'
import pushboxIcon from '@/assets/icons/box.svg'

import { minimizeTools } from '@/stores/minimizeTools'
import { MinimizeTools } from '@/stores/minimizeTools'
import { ElMessageBox, ElMessage } from 'element-plus'
import { marked } from 'marked'
import axios from 'axios'
import MinimizedToolsBar from '@/components/MinimizedToolsBar.vue'
import { tools } from '@/config/tools'
import { track } from '@vercel/analytics'
import { translations } from '@/config/i18n'
import { toolsTranslations } from '@/config/tools.i18n'
import ParticleSnow from '@/components/ParticleSnow.vue'

const isSearchFocused = ref(false)
const showEngineDropdown = ref(false)
const isDarkMode = ref(false)

// 搜索引擎配置
const searchEngines = [
  { key: 'local', name: '站内搜索', url: '', icon: Document },
  { key: 'google', name: 'Google', url: 'https://www.google.com/search?q=', icon: Search },
  { key: 'bing', name: 'Bing', url: 'https://www.bing.com/search?q=', icon: Search },
  { key: 'baidu', name: '百度', url: 'https://www.baidu.com/s?wd=', icon: Search }
]

const currentEngine = ref(searchEngines[0])
const searchText = ref('')
const router = useRouter()

// 工具分类配置
const categories = [
  { key: 'format', name: '格式化', icon: Document },
  { key: 'encode', name: '编解码', icon: Connection },
  { key: 'convert', name: '转换', icon: Histogram },
  { key: 'generate', name: '生成', icon: Collection },
  { key: 'sql', name: 'SQL工具', icon: Connection }, // 添加 SQL 工具分类
  { key: 'other', name: '其他', icon: Grid },
  { key: 'fun', name: '趣味', icon: Grid },
]

const currentCategory = ref('all')

// 工具列表
const tools = [
  {
    code: 'json',
    name: 'JSON 格式化',
    description: 'JSON 数据格式化、验证、压缩',
    icon: jsonIcon,
    path: '/tools/json',
    category: 'format'
  },
  {
    code: 'xml',
    name: 'XML 格式化',
    description: 'XML 数据格式化、验证、压缩',
    icon: xmlIcon,
    path: '/tools/xml',
    category: 'format'
  },
  {
    code: 'timestamp',
    name: '时间戳转换',
    description: '时间戳与日期格式互转',
    icon: timestampIcon,
    path: '/tools/timestamp',
    category: 'convert'
  },
  {
    code: 'base64',
    name: 'Base64',
    description: 'Base64 编码解码转换',
    icon: base64Icon,
    path: '/tools/base64',
    category: 'encode'
  },
  {
    code: 'url',
    name: 'URL编码',
    description: 'URL 编码解码转换',
    icon: urlIcon,
    path: '/tools/url',
    category: 'encode'
  },
  {
    code: 'uuid',
    name: 'UUID生成',
    description: '生成UUID/GUID',
    icon: uuidIcon,
    path: '/tools/uuid',
    category: 'generate'
  },
  {
    code: 'qrcode',
    name: '二维码生成',
    description: '生成二维码',
    icon: qrcodeIcon,
    path: '/tools/qrcode',
    category: 'generate'
  },
  {
    code: 'md5',
    name: 'MD5 加密',
    description: 'MD5 加密与校验',
    icon: md5Icon,
    path: '/tools/md5',
    category: 'encode'
  },
  {
    code: 'unicode',
    name: 'Unicode编码',
    description: 'Unicode 中文编码解码转换',
    icon: unicodeIcon,
    path: '/tools/unicode',
    category: 'encode'
  },
  {
    code: 'http-status',
    name: 'HTTP状态码',
    description: 'HTTP状态码速查手册',
    icon: httpIcon,
    path: '/tools/http-status',
    category: 'other'
  },
  {
    code: 'idcard',
    name: '身份证号生成',
    description: '生成虚拟身份证号码',
    icon: idcardIcon,
    path: '/tools/idcard',
    category: 'generate'
  },
  {
  code: 'idcard-new',
  name: '身份证号生成(新版)',
  description: '生成虚拟身份证号码',
  icon: idcardIcon,
  path: '/tools/idcard-new',
  category: 'generate'
},
  {
    code: 'sql-in',
    name: 'SQL IN生成',
    description: '生成 SQL IN 语句',
    icon: sqlIcon,
    path: '/tools/sql-in',
    category: ['sql', 'generate'] // 支持多分类
  },
  
  {
    code: 'cron',
    name: 'Cron 表达式',
    description: 'Cron 表达式生成与解析工具',
    icon: cronIcon,
    path: '/tools/cron',
    category: 'other'
  },
  {
    code: 'regex',
    name: '正则表达式',
    description: '正则表达式生成器与测试工具',
    icon: regexIcon,
    path: '/tools/regex',
    category: 'format'
  },
  {
    code: 'diff',
    name: '代码对比器',
    description: '优雅的代码差异对比工具',
    icon: diffIcon,
    path: '/tools/diff',
    category: 'format'
  },
  {
    code: 'sql-params',
    name: 'SQL参数填充',
    description: '智能填充SQL语句中的参数占位符',
    icon: sqlParamsIcon,
    path: '/tools/sql-params',
    category: ['sql', 'generate']
  },
  {
    code: 'credit-code',
    name: '统一社会信用代码',
    description: '生成统一社会信用代码',
    icon: creditIcon,
    path: '/tools/credit-code',
    category: 'generate'
  },
  {
    code: 'sql-format',
    name: 'SQL 格式化',
    description: '智能格式化SQL语句，支持多种格式化选项',
    icon: sqlFormatIcon,
    path: '/tools/sql-format',
    category: ['sql', 'format']
  },
  {
    code: 'config-editor',
    name: '配置文件编辑器',
    description: '智能可视化的配置文件编辑工具',
    icon: configEditorIcon,
    path: '/tools/config-editor',
    category: 'other'
  },
  {
    code: 'linux-manual',
    name: 'Linux命令手册',
    description: '优雅且全面的Linux命令查询工具',
    icon: linuxIcon,
    path: '/tools/linux-manual',
    category: 'other'
  },
  {
    code: 'aes',
    name: 'AES 加解密',
    description: '支持多种模式的 AES 加密解密工具',
    icon: aesIcon,
    path: '/tools/aes',
    category: 'encode'
  },
  {
    code: 'rsa',
    name: 'RSA 加解密',
    description: 'RSA 非对称加密解密工具',
    icon: rsaIcon,
    path: '/tools/rsa',
    category: 'encode'
  },
  {
    code: 'sql-convert',
    name: 'SQL 语法转换',
    description: 'SQL 语法转换工具',
    icon: sqlZHIcon,
    path: '/tools/sql-convert',
    category: ['sql', 'convert']
  },
  {
    code: 'sql-truncate',
    name: 'SQL 截断检测',
    description: '智能检测 SQL 语句中的字段截断风险',
    icon: sqlTruncateIcon,
    path: '/tools/sql-truncate',
    category: ['sql', 'other']
  },
  {
    code: 'sql-parser',
    name: 'SQL 插入语句解析器',
    description: '智能解析SQL INSERT语句的字段与值',
    icon: sqlAddIcon,
    path: '/tools/sql-parser',
    category: ['sql', 'format']
  },
  {
    code: 'word-to-html',
    name: 'word转html',
    description: 'word转html',
    icon: wordToHtmlIcon,
    path: '/tools/word-to-html',
    category: ['convert', 'format']
  },
  {
    code: 'fun',
    name: '今天吃什么',
    description: '帮你决定今天吃什么',
    icon: hanBao,
    path: 'https://www.soutzz.top/', // 直接使用部署好的网站链接
    category: 'fun'
  },
  {
    code: 'basketball-group',
    name: '篮球分组',
    description: '智能篮球队员分组工具',
    icon: lanQiu,
    path: '/tools/basketball-group',
    category: 'fun'
  },
  {
    code: 'lottery',
    name: '年会抽奖工具',
    description: '公平公正的随机抽奖工具',
    icon: lotteryIcon, 
    path: 'https://lucky-draw-lottery-alpha.vercel.app/', // 直接使用部署好的网站链接
    category: 'fun'
  },
  {
    code: 'pixel-breakout',
    name: '像素弹球大师',
    description: '红白机风格的经典弹球游戏',
    icon: pixelBreakoutIcon,
    path: '/games/pixel-breakout-master',
    category: 'fun'
  },
  {
    code: 'tanchishe',
    name: '超级贪吃蛇',
    description: '不一样的贪吃蛇游戏',
    icon: tanchisheIcon,
    path: '/games/tanchishe',
    category: 'fun'
  },
  {
    code: 'fanyinli',
    name: '反应力测试',
    description: '测试你的反应力', 
    icon: fanyinliIcon,
    path: '/games/fanyingli',
    category: 'fun'
  },
  {
    code: '2048',
    name: '2048',
    description: '2048游戏',
    icon: twoIcon,
    path: '/games/2048',
    category: 'fun'
  },
  {
    code: 'paopao',
    name: '泡泡的魔法世界',
    description: '泡泡的魔法世界',
    icon: paopaoIcon,
    path: '/games/paopao',
    category: 'fun'
  },
  {
    code: 'mdtoimg',
    name: 'markdown转图片',
    description: 'markdown转精美的图片',
    icon: mdIcon,
    path: 'https://markly-style-craft.netlify.app/',
    category: ['convert', 'format']
  },
  {
    code: 'pushbox',
    name: '推箱子',
    description: '推箱子游戏',
    icon: pushboxIcon,
    path: '/games/pushbox',
    category: 'fun'
  }
]

// 修改过滤工具的计算属性
const filteredTools = computed(() => {
  let filtered = tools

  // 按分类筛选
  if (currentCategory.value !== 'all') {
    filtered = filtered.filter(tool => 
      Array.isArray(tool.category) 
        ? tool.category.includes(currentCategory.value)
        : tool.category === currentCategory.value
    )
  }

  // 按搜索关键词筛选
  if (searchText.value) {
    const keyword = searchText.value.toLowerCase()
    filtered = filtered.filter(tool =>
      tool.name.toLowerCase().includes(keyword) ||
      tool.description.toLowerCase().includes(keyword)
    )
  }

  return filtered
})

// 获取分类名称
const getCategoryName = (categoryKey: string) => {
  const category = categories.find(c => c.key === categoryKey)
  return category ? category.name : ''
}

// 获取分类图标
const getCategoryIcon = (categoryKey: string) => {
  const category = categories.find(c => c.key === categoryKey)
  return category ? category.icon : Document
}

// 处理搜索引擎切换
const handleSearchEngine = (engineKey: string) => {
  currentEngine.value = searchEngines.find(engine => engine.key === engineKey) || searchEngines[0]
}

// 处理搜索
const handleSearch = () => {
  if (!searchText.value) return

  if (currentEngine.value.key === 'local') {
    // 站内搜索逻辑
    return
  }

  // 使用外部搜索引擎
  window.utools.shellOpenExternal(currentEngine.value.url + encodeURIComponent(searchText.value))
}

// 导航到工具页面
const navigateToTool = (tool: typeof tools[0]) => {
  if (tool.path.startsWith('http')) {
    // 对于外部链接，使用新窗口打开
    if (window.utools) {
      window.utools.shellOpenExternal(tool.path)
    } else {
      window.open(tool.path, '_blank')
    }
  } else {
    // 内部路由导航保持不变
    router.push(tool.path)
  }
}

const handleSearchBlur = () => {
  // 延迟关闭焦点状态，以便点击下拉菜单时不会立即关闭
  setTimeout(() => {
    if (!showEngineDropdown.value) {
      isSearchFocused.value = false
    }
  }, 100)
}

const selectEngine = (engine: typeof searchEngines[0]) => {
  currentEngine.value = engine
  showEngineDropdown.value = false
}

const handleBackdropClick = () => {
  isSearchFocused.value = false
  showEngineDropdown.value = false
}

// 切换主题
const toggleTheme = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark', isDarkMode.value)
  localStorage.setItem('theme', isDarkMode.value ? 'dark' : 'light')
}

// 初始化主题
onMounted(() => {
  // 优先使用存储的主题设置
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDarkMode.value = savedTheme === 'dark'
  } else {
    // 否则使用系统主题
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  document.documentElement.classList.toggle('dark', isDarkMode.value)

  // 监听系统主题变化
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      isDarkMode.value = e.matches
      document.documentElement.classList.toggle('dark', isDarkMode.value)
    }
  })

  // 初始化语言设置
  const savedLanguage = localStorage.getItem('language')
  if (savedLanguage) {
    isEnglish.value = savedLanguage === 'en'
  }
})

// 对话框控制
const showProjectDialog = ref(false)
const showAuthorDialog = ref(false)

// 按钮事件处理
const showAboutProject = () => {
  showProjectDialog.value = true
}

const showAboutAuthor = () => {
  showAuthorDialog.value = true
}

const openGitHub = () => {
  const url = 'https://gitee.com/huhage/programmers-assistant-utools/tree/master'
  
  // 判断是否在 uTools 环境中
  if (window.utools) {
    window.utools.shellOpenExternal(url)
  } else {
    // 在普通浏览器环境中使用 window.open
    window.open(url, '_blank')
  }
}

const openBlog = (e: MouseEvent) => {
  e.preventDefault()
  const url = 'https://huhage.github.io/huhawebsite'
  
  if (window.utools) {
    window.utools.shellOpenExternal(url)
  } else {
    window.open(url, '_blank')
  }
}

// 在 tools-section 后面添加新的统计模块
const toolsCount = computed(() => tools.length)
const categoriesCount = computed(() => categories.length)

// 移除分页相关的计算属性,直接使用过滤后的工具列表
const paginatedTools = computed(() => {
  return filteredTools.value
})

// 监听筛选条件变化，重置页码
watch([searchText, currentCategory], () => {
  // 移除分页相关的状态和方法
  // 删除:
  // currentPage.value = 1
  // pageSize.value = 12
  // handlePageChange = (page: number) => {
  //   currentPage.value = page
  // }
})

const minimizeTools = inject('minimizeTools') as MinimizeTools

// 添加一个计算属性来获取排序后的最小化工具列表
const minimizedTools = computed(() => {
  return minimizeTools.tools
})

const openMinimizedTool = (tool: MinimizedTool) => {
  // 确保目标组件被包含在 keep-alive 中
  if (!keepAliveComponents.value.includes(tool.component)) {
    keepAliveComponents.value.push(tool.component)
  }
  // 等待 DOM 更新后再导航
  nextTick(() => {
    router.push(tool.path)
  })
}

const closeMinimizedTool = (tool: MinimizedTool) => {
  minimizeTools.remove(tool.path)
}

// 添加一个计算属性来判断是否显示统计区域
const showStats = computed(() => {
  // 这里可以根据实际需求添加条件
  // 例如：是否在主页、是否有统计数据等
  return true
})

// 修改清空所有最小化工具的方法
const clearAllMinimizedTools = () => {
  ElMessageBox.confirm(
    '<div class="clear-dialog-content">' +
    '<div class="clear-dialog-icon">' +
    '</div>' +
    '<div class="clear-dialog-message">' +
    '<h3>清空工具标签</h3><br>' +
    '<p>是否清空所有最小化的工具标签？请注意，对应工具的数据也会同步清空。</p>' +
    '</div>' +
    '</div>',
    {
      title: '',
      dangerouslyUseHTMLString: true,
      showClose: true,
      customClass: 'clear-confirm-dialog',
      confirmButtonText: '清空',
      cancelButtonText: '保留',
      confirmButtonClass: 'confirm-button',
      cancelButtonClass: 'cancel-button',
      closeOnClickModal: true,
      beforeClose: (action, instance, done) => {
        if (action === 'confirm') {
          instance.confirmButtonLoading = true
          setTimeout(() => {
            minimizeTools.clear()
            instance.confirmButtonLoading = false
            ElMessage({
              type: 'success',
              message: '已清空全部工具标签',
              customClass: 'clear-success-message'
            })
            done()
          }, 300)
        } else {
          done()
        }
      }
    }
  ).catch(() => {})
}

const toolsContentRef = ref<HTMLElement | null>(null)

// 滚动到右侧
const scrollToRight = () => {
  if (toolsContentRef.value) {
    toolsContentRef.value.scrollBy({
      left: 300,
      behavior: 'smooth'
    })
  }
}

// 滚动到左侧
const scrollToLeft = () => {
  if (toolsContentRef.value) {
    toolsContentRef.value.scrollBy({
      left: -300,
      behavior: 'smooth'
    })
  }
}

// 处理滚轮事件，只允许通过按钮滚动
const handleWheel = (e: WheelEvent) => {
  e.preventDefault() // 阻止默认的滚轮行为
}

// 添加使用说明对话框
const showManualDialog = ref(false)
const manualContent = ref('')

// 添加错误状态
const manualLoadError = ref(false)

// 修改加载方法
const showUserManual = async () => {
  showManualDialog.value = true
  await loadManual()
}

// 分离加载逻辑
const loadManual = async () => {
  try {
    manualLoadError.value = false
    const response = await axios.get('/manual.md')
    manualContent.value = marked(response.data)
  } catch (error) {
    console.error('Failed to load manual:', error)
    manualLoadError.value = true
    manualContent.value = ''
  }
}

// 添加重试方法
const retryLoadManual = () => {
  loadManual()
}

// 添加打开链接的方法
const openSourceLink = () => {
  if (window.utools) {
    window.utools.shellOpenExternal('https://gitee.com/huhage/programmers-assistant-utools')
  } else {
    window.open('https://gitee.com/huhage/programmers-assistant-utools', '_blank')
  }
}

const openAuthorBlog = () => {
  if (window.utools) {
    window.utools.shellOpenExternal('https://huhage.github.io/huhawebsite')
  } else {
    window.open('https://huhage.github.io/huhawebsite', '_blank')
  }
}

// 工具点击处理
const handleToolClick = (tool: any) => {
  // 添加工具点击统计
  track('tool_click', {
    tool: tool.name,
    code: tool.code,
    path: tool.path,
    category: tool.category,
    timestamp: new Date().toISOString()
  })
  
  router.push(tool.path)
}

// 添加语言切换相关的状态
const isEnglish = ref(false)

// 添加语言切换方法
const toggleLanguage = () => {
  isEnglish.value = !isEnglish.value
  // 保存语言偏好
  localStorage.setItem('language', isEnglish.value ? 'en' : 'zh')
  // 这里可以触发语言切换事件
}

// 添加翻译相关的计算属性
const t = computed(() => translations[isEnglish.value ? 'en' : 'zh'])

// 修改工具卡片的显示逻辑
const getToolTranslation = (tool: any) => {
  const lang = isEnglish.value ? 'en' : 'zh'
  return toolsTranslations[lang][tool.code] || {
    name: tool.name,
    description: tool.description
  }
}

</script>

<style scoped>
.home-container {
  padding-top: 240px; /* 增加顶部内边距，为固定定位的搜索区域和分类标签预留空间 */
  padding-left: 2rem;
  padding-right: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-gradient);
}

.search-section {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--bg-primary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: 100;
  padding: 1rem 0;
}

.brand {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 改为左对齐 */
  margin-bottom: 2rem;
  max-width: 1200px; /* 限制最大宽度 */
  margin: 0 auto 2rem; /* 居中显示 */
  padding: 0 2rem; /* 添加两侧内边距 */
}

.brand-content {
  display: flex;
  align-items: center;
}

.logo {
  width: 48px;
  height: 48px;
  margin-right: 1rem;
  border-radius: var(--radius-md);
}

.toollogo {
  width: 98px;
  height: 48px;
  margin-right: 1rem;
  border-radius: var(--radius-md);
}

.title {
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0;
  background-image: linear-gradient(45deg, #2b5876, #7c3aed);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  letter-spacing: -0.5px;
  display: inline-block;
}

.search-container {
  position: relative;
  max-width: 680px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.search-wrapper {
  position: relative;
  z-index: 100;
  transition: all 0.3s ease;
}

.search-wrapper.is-focused {
  /* 移除 transform scale 效果 */
}

.search-box {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 14px;
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
}

.is-focused .search-box {
  background: var(--bg-overlay);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.03);
}

.search-icon {
  font-size: 20px;
  color: var(--text-secondary);
  margin: 0 8px;
}

.search-input {
  flex: 1;
  border: none;
  background: none;
  height: 100%;
  padding: 0 8px;
  font-size: 17px;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 8px;
}

.engine-selector {
  display: flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.engine-selector:hover {
  background: var(--bg-tertiary);
}

.engine-name {
  font-size: 15px;
  color: var(--text-primary);
  margin-right: 6px;
}

.arrow-icon {
  font-size: 12px;
  color: var(--text-secondary);
  transition: transform 0.2s ease;
}

.arrow-icon.is-active {
  transform: rotate(180deg);
}

.engine-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--bg-overlay-hover);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 14px;
  box-shadow: 0 8px 20px var(--shadow-color),
    0 0 0 1px var(--border-color);
  padding: 6px;
  min-width: 240px;
}

.engine-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.engine-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  color: var(--text-primary);
}

.engine-item:hover {
  background: var(--bg-tertiary);
}

.engine-item.active {
  color: var(--primary-color);
  font-weight: 500;
}

.engine-icon {
  font-size: 18px;
  margin-right: 10px;
}

.engine-label {
  font-size: 15px;
  letter-spacing: -0.2px;
}

.check-icon {
  position: absolute;
  right: 12px;
  color: var(--primary-color);
  font-size: 16px;
}

.search-backdrop {
  display: none;
  /* 完全移除遮罩 */
}

/* 暗色模式适配 */
@media (prefers-color-scheme: dark) {
  .title {
    background-image: linear-gradient(120deg, #00c6ff, #9333ea);
    -webkit-background-clip: text;
  }

  .search-box {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  .is-focused .search-box {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15),
      0 0 0 1px rgba(255, 255, 255, 0.05);
  }

  .search-input {
    color: var(--text-primary);
  }

  .search-input::placeholder {
    color: var(--text-secondary);
  }

  .search-divider {
    background: var(--border-color);
  }

  .engine-name {
    color: var(--text-primary);
  }

  .engine-selector:hover {
    background: var(--bg-tertiary);
  }

  .engine-dropdown {
    background: var(--bg-overlay-hover);
    box-shadow: 0 8px 20px var(--shadow-color),
      0 0 0 1px var(--border-color);
  }

  .engine-item {
    color: var(--text-primary);
  }

  .engine-item:hover {
    background: var(--bg-tertiary);
  }

  .engine-item.active {
    color: var(--primary-color);
  }

  .check-icon {
    color: var(--primary-color);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .search-container {
    padding: 0 1rem;
  }

  .search-box {
    height: 44px;
  }

  .search-input {
    font-size: 15px;
  }

  .engine-name {
    font-size: 14px;
  }

  .engine-dropdown {
    min-width: 200px;
  }

  .engine-item {
    padding: 8px 10px;
  }
}

/* 分类标签区域的基础样式 */
.category-tags {
  position: fixed;
  top: 160px;
  left: 0;
  right: 0;
  z-index: 99;
  background: var(--bg-primary);
  padding: 1rem 0;
  text-align: center;
}

/* Radio 按钮组的基础样式 */
:deep(.el-radio-group) {
  background: var(--bg-secondary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 0.375rem;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}

/* Radio 按钮的基础样式 */
:deep(.el-radio-button__inner) {
  border: none !important;
  height: 36px;
  line-height: 36px;
  padding: 0 1.25rem;
  border-radius: 12px !important;
  font-size: 0.9rem;
  font-weight: 500;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
}

/* 选中状态的样式 */
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--primary-color);
  color: #ffffff;
  box-shadow: none;
}

/* 暗色模式的样式覆盖 */
:root.dark {
  /* Radio 按钮组暗色模式 */
  :deep(.el-radio-group) {
    background: rgba(35, 35, 38, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.1);
  }

  /* Radio 按钮暗色模式 */
  :deep(.el-radio-button__inner) {
    background-color: rgba(35, 35, 38, 0.6);
    color: var(--text-secondary);
    border: none !important;
  }

  /* 暗色模式悬停状态 */
  :deep(.el-radio-button__inner:hover) {
    background-color: rgba(45, 45, 48, 0.8);
    color: var(--text-primary);
  }

  /* 暗色模式选中状态 */
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background-color: var(--primary-color);
    color: #ffffff;
    box-shadow: none;
  }

  /* 移除按钮间的边框 */
  :deep(.el-radio-button:not(:first-child) .el-radio-button__inner) {
    border-left: none;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .home-container {
    padding-top: 220px; /* 移动端减小顶部内边距 */
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .category-tags {
    top: 140px; /* 移动端调整分类标签位置 */
  }
}

@media (max-width: 480px) {
  .home-container {
    padding-top: 200px;
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }
  
  .category-tags {
    top: 130px;
  }
}

/* 添加一个新的滚动容器 */
.tools-scroll-container {
  position: fixed;
  top: 240px; /* 与 home-container 的 padding-top 相同 */
  left: 0;
  right: 0;
  bottom: 70px; /* 为统计栏预留空间 */
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 1;
  padding: 0 2rem;
  /* 添加平滑滚动效果 */
  scroll-behavior: smooth;
  /* 优化滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: var(--el-border-color-lighter) transparent;
  
  /* 添加底部内边距，确保最后一行卡片完全可见 */
  padding-bottom: calc(70px + 2rem); /* 统计栏高度 + 额外间距 */
}

/* 当存在最小化工具栏时，调整底部空间 */
.tools-scroll-container.has-minimized-tools {
  bottom: 140px; /* 为统计栏和最小化工具栏预留空间 */
  padding-bottom: calc(140px + 2rem);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .tools-scroll-container {
    bottom: 90px;
    padding-bottom: calc(90px + 2rem);
  }
  
  .tools-scroll-container.has-minimized-tools {
    bottom: 160px;
    padding-bottom: calc(160px + 2rem);
  }
}

@media (max-width: 480px) {
  .tools-scroll-container {
    bottom: 110px;
    padding-bottom: calc(110px + 2rem);
  }
  
  .tools-scroll-container.has-minimized-tools {
    bottom: 180px;
    padding-bottom: calc(180px + 2rem);
  }
}

/* 自定义滚动条样式 */
.tools-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.tools-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.tools-scroll-container::-webkit-scrollbar-thumb {
  background-color: var(--el-border-color-lighter);
  border-radius: 4px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.tools-scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: var(--el-border-color);
}

/* 修改工具区域样式 */
.tools-section {
  padding-top: 1rem;
  padding-bottom: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  background-color: #f5f5f7;
}

/* 暗色模式下的工具区域背景 */
:root.dark .tools-section {
  background-color: var(--bg-primary); /* 使用暗色主题的背景色 */
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(4, 300px);
  gap: 24px; /* 减小纵向间距，从48px改为24px */
  justify-content: center;
  margin: 0 auto;
  padding: 0 48px;
  position: relative;
}

/* 最简单的淡入淡出效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 修改工具卡片的过渡效果,只保留简单的透明度变化 */
.tool-card {
  width: 270px; /* 固定宽度 */
  height: 68px;
  margin: 0 auto;
  background: #ffffff; /* 修改为白色背景 */
  border-radius: 12px;
  padding: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(0, 0, 0, 0.1); /* 添加浅色边框 */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.03);
  transition: background 0.3s ease, box-shadow 0.3s ease; /* 只保留背景和阴影的过渡 */
  will-change: background, box-shadow; /* 更新will-change属性 */
}

/* 工具图标 */
.tool-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  transition: transform 0.3s ease;
}

.tool-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* 卡片悬停时图标容器的效果 */
.tool-card:hover {
  background: #ffffff; /* 保持白色背景 */
  transform: translateY(-2px);
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.05);
}

/* 确保图标在暗色模式下也能正确显示 */
:root.dark .tool-icon-image {
  filter: brightness(0.9);
}

:root.dark .tool-card:hover .tool-icon-image {
  filter: brightness(1);
}

/* 工具内容 */
.tool-content {
  flex: 1;
  min-width: 0;
  padding-right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 工具标题 */
.tool-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.3;
}

/* 工具描述 */
.tool-desc {
  margin: 2px 0 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 暗色模式适配 */
:root.dark .tool-card {
  background: rgba(35, 35, 38, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.2),
    0 1px 2px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

:root.dark .tool-card:hover {
  background: rgba(40, 40, 44, 0.95);
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.3),
    0 4px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.08);
}

/* 响应式调整 */
@media (max-width: 1600px) {
  .tools-grid {
    grid-template-columns: repeat(3, 300px);
    gap: 20px; /* 从40px改为20px */
    padding: 0 40px;
  }
}

@media (max-width: 1200px) {
  .tools-grid {
    grid-template-columns: repeat(2, 300px);
    gap: 16px; /* 从32px改为16px */
    padding: 0 32px;
  }
}

@media (max-width: 768px) {
  .tools-grid {
    grid-template-columns: repeat(1, 300px);
    gap: 12px; /* 从24px改为12px */
    padding: 0 24px;
  }
  
  .tool-card {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .tools-grid {
    grid-template-columns: repeat(1, 100%);
    gap: 10px; /* 从20px改为10px */
    padding: 0 20px;
  }
  
  .tool-card {
    width: 100%;
  }
}

.theme-toggle {
  width: 32px;
  height: 32px;
  padding: 6px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 122, 255, 0.9); /* 使用 #007aff 并添加透明度 */
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.2);
}

.theme-toggle:hover {
  background: rgba(0, 122, 255, 1); /* 悬停时移除透明度 */
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.theme-toggle:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.2);
}

.toggle-icon {
  font-size: 16px;
  transition: all 0.3s ease;
}

/* 亮色模式样式 */
.theme-toggle:not(.is-dark) .toggle-icon {
  color: white;
}

/* 暗色模式样式 */
.theme-toggle.is-dark {
  background: rgba(0, 122, 255, 0.8); /* 暗色模式下降低亮度 */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.theme-toggle.is-dark:hover {
  background: rgba(0, 122, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.theme-toggle.is-dark .toggle-icon {
  color: #ffd700;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-actions {
    right: 1rem;
    gap: 6px;
  }

  .action-btn,
  .theme-toggle {
    width: 28px;
    height: 28px;
    padding: 5px;
  }

  .divider {
    height: 20px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* 添加 CSS 变量用于主题色 RGB 值 */
:root {
  --primary-color-rgb: 0, 102, 204;
  /* #06c 的 RGB 值 */
}

:root.dark {
  --primary-color-rgb: 41, 151, 255;
  /* #2997ff 的 RGB 值 */
}

/* 暗色模式下的背景 */
:root.dark .home-container {
  background: var(--bg-gradient);
}

/* 调整搜索框的背景，使其与新背景更好地融合 */
.search-box {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

:root.dark .search-box {
  background: rgba(35, 35, 38, 0.9);
}

/* 修改分类标签组的暗色模式样式 */
:deep(.el-radio-group) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: 0.375rem;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(0, 0, 0, 0.03);
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  position: relative;
  transition: all 0.3s ease;
}

/* 添加暗色模式下的样式 */
:root.dark :deep(.el-radio-group) {
  background: rgba(35, 35, 38, 0.9);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

/* 调整暗色模式下按钮的样式 */
:root.dark :deep(.el-radio-button__inner) {
  background-color: rgba(35, 35, 38, 0.6);
  color: var(--text-secondary);
  border: none;
}

/* 暗色模式下未选中按钮的悬停状态 */
:root.dark :deep(.el-radio-button__inner:hover) {
  background-color: rgba(45, 45, 48, 0.8);
  color: var(--text-primary);
}

/* 暗色模式下选中按钮的样式 */
:root.dark :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: var(--primary-color);
  color: #ffffff;
  box-shadow: none;
}

/* 移除按钮之间的边框 */
:root.dark :deep(.el-radio-button:not(:first-child) .el-radio-button__inner) {
  border-left: none;
}

.brand {
  position: relative;
}

.header-actions {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  padding: 6px;
  border: none;
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
  transform: translateY(-1px);
}

.action-btn:active {
  transform: translateY(0);
}

.github-icon {
  width: 1.2em;
  height: 1.2em;
}

.about-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid var(--border-color);
    margin-right: 0;
    padding-bottom: 16px;
  }
  
  :deep(.el-dialog__body) {
    padding: 24px;
  }
}

.about-content {
  h3 {
    margin: 0 0 16px;
    background-image: linear-gradient(45deg, #2b5876, #7c3aed);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    display: inline-block;
    font-weight: 600;
  }
  
  p {
    margin: 8px 0;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  
  ul {
    margin: 16px 0;
    padding-left: 20px;
    
    li {
      margin: 8px 0;
      color: var(--text-secondary);
    }
  }
}

.author-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.author-avatar {
  width: 80px;
  height: 80px;
  border-radius: 40px;
  object-fit: cover;
}

.author-details {
  h3 {
    margin: 0 0 8px;
  }
  
  p {
    margin: 0;
    color: var(--text-secondary);
  }
}

.contact-info {
  ul {
    list-style: none;
    padding: 0;
    
    li {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0;
      
      .el-icon {
        color: var(--primary-color);
      }
    }
  }
}

.version {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.9em;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-actions {
    right: 1rem;
    gap: 6px;
  }
  
  .action-btn,
  .theme-toggle {
    width: 28px;
    height: 28px;
    padding: 5px;
  }
  
  .about-dialog {
    width: 90% !important;
  }
}

.blog-link {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.3s ease;
}

.blog-link:hover {
  color: var(--primary-color);
}

/* 确保图标颜色保持不变 */
.contact-info li .el-icon {
  color: var(--primary-color);
  flex-shrink: 0;
}

/* 修改统计信息模块的结构 */
.stats-placeholder {
  height: 70px; /* 从100px改为70px */
}

/* 修改统计信息模块的样式 */
.stats-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 99;
  background: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 1rem 0;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 在移动端隐藏统计区域 */
@media (max-width: 768px) {
  .stats-section {
    display: none;
  }
  
  .stats-placeholder {
    display: none;
  }

  /* 调整工具滚动容器的底部间距 */
  .tools-scroll-container {
    bottom: 0;
    padding-bottom: 1rem;
  }

  /* 当有最小化工具时的底部间距 */
  .tools-scroll-container.has-minimized-tools {
    bottom: 70px;
    padding-bottom: calc(70px + 1rem);
  }
}

/* 保持其他样式不变 */
.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.stats-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3rem;
}

.stats-numbers {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.separator {
  width: 1px;
  height: 1.5rem; /* 从2rem改为1.5rem */
  background: var(--border-color);
}

.stats-divider {
  width: 1px;
  height: 1.5rem; /* 从2rem改为1.5rem */
  background: var(--border-color);
}

.stat-value {
  font-size: 1.25rem; /* 从1.5rem改为1.25rem */
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: 0.75rem; /* 从0.875rem改为0.75rem */
  color: var(--text-secondary);
}

.stats-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem; /* 从0.875rem改为0.75rem */
}

.stats-links a {
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease;
}

.stats-links a:hover {
  color: var(--primary-color);
}

.dot {
  color: var(--text-secondary);
  opacity: 0.5;
}

/* 暗色模式适配 */
:root.dark .stats-section {
  background: var(--bg-primary);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.1);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .stats-content {
    flex-direction: column;
    gap: 1rem;
  }

  .stats-section {
    padding: 1rem 0;
  }

  .stats-divider {
    display: none;
  }

  .stats-numbers {
    gap: 1.5rem;
  }

  .separator {
    height: 1.5rem;
  }

  .stats-placeholder {
    height: 90px; /* 从120px改为90px */
  }
}

@media (max-width: 480px) {
  .stats-container {
    padding: 0 1rem;
  }

  .stats-numbers {
    gap: 1rem;
  }

  .stats-links {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .dot {
    display: none;
  }

  .stats-placeholder {
    height: 110px; /* 从150px改为110px */
  }
}

.minimized-tools {
  position: fixed;
  bottom: 70px;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  padding: 8px 16px;
  z-index: 100;
  padding-top: 10px; /* 增加顶部内边距 */
  padding-bottom: 10px; /* 增加底部内边距 */
}

/* 添加一个计算属性来动态调整 minimized-tools 的位置 */
.minimized-tools:not(.has-stats) {
  bottom: 0;
}

.minimized-tools-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  align-items: center;
  position: relative;
  /* 禁用触控板滚动 */
  touch-action: none;
}

/* 隐藏 Webkit 浏览器的滚动条 */
.minimized-tools-content::-webkit-scrollbar {
  display: none;
}

.minimized-tool {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 120px;
  max-width: 200px;
  border: 1px solid transparent;
  position: relative;
  top: 2px; /* 向下移动一点点 */
}

.minimized-tool:hover {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
  transform: translateY(-2px); /* 增加悬停时的上移距离 */
  box-shadow: 0 2px 8px rgba(var(--el-color-primary-rgb), 0.1);
}

.minimized-tool:hover .tool-icon,
.minimized-tool:hover .tool-icon-img {
  color: var(--el-color-primary);
}

.minimized-tool:hover .tool-title {
  color: var(--el-color-primary);
}

/* 暗色模式适配 */
:root.dark .minimized-tool:hover {
  background: rgba(var(--el-color-primary-rgb), 0.15);
  border-color: rgba(var(--el-color-primary-rgb), 0.3);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .minimized-tools {
    bottom: 90px; /* 移动端统计区域的高度 */
  }
  
  .minimized-tools:not(.has-stats) {
    bottom: 0;
  }
}

@media (max-width: 480px) {
  .minimized-tools {
    bottom: 110px; /* 小屏幕统计区域的高度 */
  }
}

.clear-all-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--el-color-primary-light-9);
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: 8px;
  position: sticky;
  left: 0;
  z-index: 1;
}

.clear-all-button .el-icon {
  font-size: 16px;
}

/* 修改悬停效果，只改变颜色 */
.clear-all-button:hover {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}

/* 给清空按钮添加背景，避免滚动时内容透过 */
.clear-all-button {
  background: var(--bg-secondary);
}

/* 暗色模式下保持背景色 */
:root.dark .clear-all-button {
  background: rgba(var(--el-color-primary-rgb), 0.15);
}

.scroll-buttons {
  position: sticky;
  right: 0;
  display: flex;
  gap: 4px;
  margin-left: 8px;
  z-index: 1;
  background: var(--el-color-primary-light-9);
  padding-left: 8px;
  padding: 0 8px;
  border-radius: 6px;
}

.scroll-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;
}

.scroll-button:hover {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-8);
}

/* 暗色模式下的滚动按钮容器 */
:root.dark .scroll-buttons {
  background: rgba(var(--el-color-primary-rgb), 0.15);
}

/* 暗色模式下的滚动按钮悬停效果 */
:root.dark .scroll-button:hover {
  background: rgba(var(--el-color-primary-rgb), 0.25);
}

/* 清空确认对话框样式 */
:deep(.clear-confirm-dialog) {
  border-radius: 28px;  /* 增加圆角弧度 */
  overflow: hidden;
  width: 400px;
  max-width: 90vw;
  padding: 0;
  background: var(--bg-primary);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15),
              0 0 0 1px rgba(0, 0, 0, 0.05);
  animation: dialog-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

:deep(.clear-confirm-dialog .el-message-box__header) {
  padding: 20px 20px 0;
  border: none;
}

:deep(.clear-confirm-dialog .el-message-box__headerbtn) {
  top: 20px;
  right: 20px;
}

:deep(.clear-confirm-dialog .el-message-box__content) {
  padding: 16px 20px 20px;
}

:deep(.clear-confirm-dialog .el-message-box__btns) {
  padding: 0 20px 20px;
  justify-content: flex-end;
  gap: 12px;
}

.clear-dialog-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.clear-dialog-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 20px;  /* 使用更大的圆角 */
  background: var(--el-color-primary-light-9);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.clear-icon {
  width: 20px;
  height: 20px;
  fill: var(--el-color-primary);
  transition: all 0.3s ease;
}

.clear-dialog-message {
  flex: 1;
  padding-top: 2px;
}

.clear-dialog-message h3 {
  margin: 0 0 6px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.clear-dialog-message p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-secondary);
}

/* 按钮样式 */
:deep(.clear-confirm-dialog .confirm-button) {
  min-width: 80px;
  height: 32px;
  padding: 0 20px;  /* 增加水平内边距 */
  border-radius: 32px;  /* 增加圆角使其成为椭圆形 */
  font-size: 14px;
  font-weight: 500;
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  transition: all 0.3s ease;
}

:deep(.clear-confirm-dialog .confirm-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.2);
}

:deep(.clear-confirm-dialog .cancel-button) {
  min-width: 80px;
  height: 32px;
  padding: 0 20px;  /* 增加水平内边距 */
  border-radius: 32px;  /* 增加圆角使其成为椭圆形 */
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  transition: all 0.3s ease;
}

:deep(.clear-confirm-dialog .cancel-button:hover) {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-color: var(--border-color);
  transform: translateY(-1px);
}

/* 响应式调整 */
@media (max-width: 480px) {
  :deep(.clear-confirm-dialog) {
    width: 90%;
  }

  .clear-dialog-icon {
    width: 36px;
    height: 36px;
    border-radius: 18px;  /* 保持圆形 */
  }

  .clear-icon {
    width: 18px;
    height: 18px;
  }

  .clear-dialog-message h3 {
    font-size: 15px;
  }

  .clear-dialog-message p {
    font-size: 13px;
  }

  :deep(.clear-confirm-dialog .confirm-button),
  :deep(.clear-confirm-dialog .cancel-button) {
    min-width: 72px;
    height: 30px;
    padding: 0 18px;  /* 调整移动端按钮的内边距 */
    border-radius: 30px;  /* 保持椭圆形 */
    font-size: 13px;
  }
}

/* 成功提示消息样式 */
:deep(.clear-success-message) {
  border-radius: 24px;  /* 增加圆角 */
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: none;
  background: var(--el-color-success);
  padding: 12px 28px;  /* 增加水平内边距 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  animation: message-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes message-enter {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.clear-success-message .el-message__content) {
  color: white;
  font-weight: 500;
  font-size: 14px;
}

/* 暗色模式适配 */
:root.dark {
  :deep(.clear-confirm-dialog) {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  }

  .clear-dialog-icon {
    background: rgba(var(--el-color-primary-rgb), 0.15);
  }

  :deep(.clear-confirm-dialog .cancel-button) {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.1);
  }

  :deep(.clear-confirm-dialog .cancel-button:hover) {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
  }

  :deep(.clear-success-message) {
    background: var(--el-color-success);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}

.manual-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid var(--border-color);
    margin-right: 0;
    padding-bottom: 16px;
  }
  
  :deep(.el-dialog__body) {
    padding: 20px 24px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.manual-content {
  h3 {
    margin: 0 0 16px;
    color: var(--text-primary);
  }
  
  p {
    margin: 8px 0;
    color: var(--text-secondary);
    line-height: 1.6;
  }
  
  ul {
    margin: 16px 0;
    padding-left: 20px;
    
    li {
      margin: 8px 0;
      color: var(--text-secondary);
    }
  }
}

.manual-content :deep(h1) {
  font-size: 24px;
  margin-bottom: 16px;
}

.manual-content :deep(h2) {
  font-size: 20px;
  margin: 24px 0 16px;
}

.manual-content :deep(h3) {
  font-size: 18px;
  margin: 20px 0 12px;
}

.manual-content :deep(ul),
.manual-content :deep(ol) {
  padding-left: 24px;
  margin: 12px 0;
}

.manual-content :deep(li) {
  margin: 8px 0;
}

.manual-content :deep(code) {
  background: var(--bg-secondary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}

.manual-content :deep(p) {
  margin: 12px 0;
}

/* 暗色模式适配 */
:root.dark .manual-content :deep(code) {
  background: rgba(255, 255, 255, 0.1);
}

.manual-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  color: var(--text-primary);
}

.error-icon {
  font-size: 48px;
  color: var(--el-color-warning);
  margin-bottom: 1rem;
}

.manual-error h3 {
  font-size: 20px;
  margin: 0 0 1rem;
}

.manual-error p {
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.manual-error ul {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
  color: var(--text-secondary);
}

.manual-error li {
  margin: 0.5rem 0;
}

.manual-error .el-button {
  min-width: 120px;
}

/* 暗色模式适配 */
:root.dark .manual-error {
  .error-icon {
    color: var(--el-color-warning-dark);
  }
}

/* 添加分隔线 */
.divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 4px;
}

/* 修改最小化工具标签的删除按钮样式 */
.minimized-tools .minimized-tool .close-btn {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  opacity: 0.6;
  border: none;
  padding: 0;
  margin-left: 4px;
}

.minimized-tools .minimized-tool .close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--text-primary);
  opacity: 1;
}

/* 暗色模式下的删除按钮样式 */
:root.dark .minimized-tools .minimized-tool .close-btn {
  color: rgba(255, 255, 255, 0.6);
}

:root.dark .minimized-tools .minimized-tool .close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
}

/* 当鼠标悬停在工具标签上时显示删除按钮 */
.minimized-tools .minimized-tool:hover .close-btn {
  opacity: 1;
}

/* 删除按钮中的图标样式 */
.minimized-tools .minimized-tool .close-btn .el-icon {
  font-size: 14px;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 语言切换按钮样式 */
.lang-toggle {
  width: 32px;
  height: 32px;
  padding: 6px;
  border: none;
  border-radius: 6px;
  background: rgba(0, 122, 255, 0.9);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.2);
  margin-left: 8px;
}

.lang-toggle:hover {
  background: rgba(0, 122, 255, 1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.lang-toggle:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(0, 122, 255, 0.2);
}

.lang-text {
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* 暗色模式样式 */
:root.dark .lang-toggle {
  background: rgba(0, 122, 255, 0.8);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

:root.dark .lang-toggle:hover {
  background: rgba(0, 122, 255, 0.9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .lang-toggle {
    width: 28px;
    height: 28px;
    padding: 5px;
    margin-left: 6px;
  }

  .lang-text {
    font-size: 12px;
  }
}

/* 移动端优化 */
@media (max-width: 768px) {
  /* 标题区域优化 */
  .brand {
    flex-direction: row;
    justify-content: space-between;
    padding: 0 1rem;
    margin-bottom: 1rem;
  }

  .brand-content {
    display: flex;
    align-items: center;
  }

  .toollogo {
    width: 40px;
    height: 24px;
    margin-right: 0.5rem;
  }

  .title {
    font-size: 1.2rem;
    white-space: nowrap;
  }

  /* 操作按钮组优化 */
  .header-actions {
    position: relative;
    right: 0;
    transform: none;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .action-btn,
  .theme-toggle,
  .lang-toggle {
    width: 28px;
    height: 28px;
    padding: 4px;
  }

  .divider {
    height: 20px;
    margin: 0 2px;
  }

  /* 搜索框优化 */
  .search-container {
    padding: 0 1rem;
  }

  .search-box {
    height: 40px;
    flex-direction: row;
    align-items: center;
  }

  .search-input {
    font-size: 14px;
  }

  .engine-selector {
    white-space: nowrap;
    padding: 4px 8px;
  }

  .engine-name {
    font-size: 13px;
  }

  /* 导航标签优化 */
  .category-tags {
    position: fixed;
    top: 120px;
    left: 0;
    right: 0;
    padding: 0.5rem 1rem;
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .category-tags::-webkit-scrollbar {
    display: none;
  }

  :deep(.el-radio-group) {
    display: inline-flex;
    flex-wrap: nowrap;
    padding: 0.25rem;
    gap: 0.25rem;
  }

  :deep(.el-radio-button__inner) {
    height: 32px;
    line-height: 32px;
    padding: 0 0.75rem;
    font-size: 0.8rem;
    white-space: nowrap;
  }

  /* 调整内容区域的上边距 */
  .tools-scroll-container {
    top: 180px;
  }

  /* 调整搜索区域的样式 */
  .search-section {
    padding: 0.5rem 0;
  }

  /* 优化搜索引擎下拉菜单 */
  .engine-dropdown {
    right: 1rem;
    left: 1rem;
    min-width: auto;
  }

  .engine-item {
    padding: 8px;
  }

  .engine-label {
    font-size: 14px;
  }
}

/* 更小屏幕的优化 */
@media (max-width: 360px) {
  .title {
    font-size: 1rem;
  }

  .action-btn,
  .theme-toggle,
  .lang-toggle {
    width: 24px;
    height: 24px;
    padding: 3px;
  }

  .divider {
    height: 16px;
  }

  :deep(.el-radio-button__inner) {
    padding: 0 0.5rem;
    font-size: 0.75rem;
  }
}

/* 添加滑动指示器 */
.category-tags::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 24px;
  height: 100%;
  background: linear-gradient(to left, var(--bg-primary) 0%, transparent 100%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
}

.category-tags.has-overflow::after {
  opacity: 1;
}

/* 优化搜索框在不同尺寸下的布局 */
.search-box {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: 8px;
}

@media (max-width: 768px) {
  .search-box {
    gap: 4px;
  }

  .search-divider {
    margin: 0;
  }
}
</style>